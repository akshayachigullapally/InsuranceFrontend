import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, computed, input, output, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
  PaymentRequest,
  PaymentResponse,
} from '../../dtos/financial/payment-response.dto';
import { PolicyResponse } from '../../dtos/policies/policy-response.dto';

export type CheckoutTab = 'card' | 'upi' | 'netbanking';

const TAB_METHOD: Record<CheckoutTab, PaymentMethod> = {
  card: 'MOCK_CARD',
  upi: 'MOCK_UPI',
  netbanking: 'MOCK_BANK_TRANSFER',
};

/** Simulated time the "bank" takes to authorise a payment. */
const PROCESSING_MS = 1200;

/** Test cards that decline in the browser, like a real gateway's test mode. */
const DECLINED_CARDS: Record<string, string> = {
  '4000000000000002': 'Your card was declined. Try a different card.',
  '4000000000009995': 'Your card has insufficient funds. Try a different card.',
};

export const BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
] as const;

function digits(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

function passesLuhn(number: string): boolean {
  let sum = 0;
  for (let i = 0; i < number.length; i++) {
    let digit = Number(number[number.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

function cardNumberValidator(control: AbstractControl): ValidationErrors | null {
  const number = digits(control.value);
  if (!number) return null;
  return number.length >= 13 && number.length <= 19 && passesLuhn(number)
    ? null
    : { cardNumber: true };
}

function expiryValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '');
  if (!value) return null;
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  if (!match) return { expiry: true };
  // A card is valid until the last day of its expiry month.
  const expiresAt = new Date(2000 + Number(match[2]), Number(match[1]), 1);
  return expiresAt > new Date() ? null : { expired: true };
}

export function cardBrand(number: string): string {
  const n = digits(number);
  if (/^4/.test(n)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'AMEX';
  if (/^(60|65|81|82|508)/.test(n)) return 'RuPay';
  return '';
}

/**
 * A Stripe-style checkout that only looks real: card, UPI and bank details are
 * validated in the browser and then dropped. Only the policy and the chosen
 * method are sent to the server.
 */
@Component({
  selector: 'app-payment-checkout',
  standalone: true,
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule],
  templateUrl: './payment-checkout.component.html',
})
export class PaymentCheckoutComponent implements OnDestroy {
  readonly policies = input<PolicyResponse[]>([]);
  readonly initialPolicyId = input<number | null>(null);
  /** True while the server records the payment. */
  readonly busy = input(false);
  readonly error = input<string | null>(null);
  readonly paidPayment = input<PaymentResponse | null>(null);

  readonly pay = output<PaymentRequest>();
  readonly closed = output<void>();

  protected readonly banks = BANKS;
  protected readonly methodLabels = PAYMENT_METHOD_LABELS;
  protected readonly tab = signal<CheckoutTab>('card');
  protected readonly processing = signal(false);
  protected readonly declineMessage = signal<string | null>(null);
  /** The customer's own pick from the policy list, if they made one. */
  private readonly chosenPolicyId = signal<number | null>(null);

  /** Chosen policy, else the one checkout was opened for, else the only one. */
  protected readonly selectedPolicy = computed(() => {
    const policies = this.policies();
    const id = this.chosenPolicyId() ?? this.initialPolicyId();
    return (
      policies.find((policy) => policy.id === id) ??
      (policies.length === 1 ? policies[0] : null)
    );
  });

  readonly card = new FormGroup({
    number: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, cardNumberValidator],
    }),
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    expiry: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, expiryValidator],
    }),
    cvv: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{3,4}$/)],
    }),
  });

  readonly upi = new FormGroup({
    vpa: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/)],
    }),
  });

  readonly netbanking = new FormGroup({
    bank: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  private timer: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
    // Never keep dummy card details around once the checkout closes.
    this.card.reset();
  }

  protected get working(): boolean {
    return this.processing() || this.busy();
  }

  protected get brand(): string {
    return cardBrand(this.card.controls.number.value);
  }

  protected get maskedNumber(): string {
    const number = digits(this.card.controls.number.value).padEnd(16, '•');
    return number.replace(/(.{4})/g, '$1 ').trim();
  }

  protected selectPolicy(value: string): void {
    this.chosenPolicyId.set(value ? Number(value) : null);
  }

  protected selectTab(tab: CheckoutTab): void {
    if (this.working) return;
    this.tab.set(tab);
    this.declineMessage.set(null);
  }

  protected formatCardNumber(): void {
    const value = digits(this.card.controls.number.value).slice(0, 19);
    this.card.controls.number.setValue(value.replace(/(\d{4})(?=\d)/g, '$1 '));
  }

  protected formatExpiry(): void {
    const value = digits(this.card.controls.expiry.value).slice(0, 4);
    this.card.controls.expiry.setValue(
      value.length > 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value,
    );
  }

  protected formatCvv(): void {
    this.card.controls.cvv.setValue(digits(this.card.controls.cvv.value).slice(0, 4));
  }

  protected useTestCard(): void {
    this.card.setValue({
      number: '4242 4242 4242 4242',
      name: 'Test Customer',
      expiry: '12/30',
      cvv: '123',
    });
    this.declineMessage.set(null);
  }

  protected submit(): void {
    const form = this.activeForm();
    const policy = this.selectedPolicy();

    if (!policy || form.invalid) {
      form.markAllAsTouched();
      return;
    }
    if (this.working) return;

    this.declineMessage.set(null);
    this.processing.set(true);

    this.timer = setTimeout(() => {
      this.timer = null;
      this.processing.set(false);

      const decline =
        this.tab() === 'card' ? DECLINED_CARDS[digits(this.card.controls.number.value)] : undefined;
      if (decline) {
        this.declineMessage.set(decline);
        return;
      }

      this.pay.emit({ policyId: policy.id, method: TAB_METHOD[this.tab()] });
    }, PROCESSING_MS);
  }

  protected close(): void {
    if (this.working) return;
    this.closed.emit();
  }

  protected invalid(control: AbstractControl): boolean {
    return control.invalid && control.touched;
  }

  private activeForm(): FormGroup {
    switch (this.tab()) {
      case 'upi':
        return this.upi;
      case 'netbanking':
        return this.netbanking;
      default:
        return this.card;
    }
  }
}
