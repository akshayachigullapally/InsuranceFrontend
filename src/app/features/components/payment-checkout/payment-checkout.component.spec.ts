import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentCheckoutComponent, cardBrand } from './payment-checkout.component';
import { PolicyResponse } from '../../dtos/policies/policy-response.dto';
import { PaymentRequest, PaymentResponse } from '../../dtos/financial/payment-response.dto';

type CheckoutInternals = {
  selectTab(tab: 'card' | 'upi' | 'netbanking'): void;
  selectPolicy(value: string): void;
  useTestCard(): void;
  submit(): void;
  formatCardNumber(): void;
  formatExpiry(): void;
  selectedPolicy(): PolicyResponse | null;
  declineMessage(): string | null;
  processing(): boolean;
};

const POLICIES = [
  { id: 3, policyNumber: 'POL-3', productName: 'Monsoon Cover', premiumAmount: 999 },
  { id: 4, policyNumber: 'POL-4', productName: 'Flood Cover', premiumAmount: 1500 },
] as PolicyResponse[];

describe('PaymentCheckoutComponent', () => {
  let fixture: ComponentFixture<PaymentCheckoutComponent>;
  let component: PaymentCheckoutComponent;
  let page: CheckoutInternals;
  let paid: PaymentRequest[];
  let element: HTMLElement;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [PaymentCheckoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentCheckoutComponent);
    component = fixture.componentInstance;
    page = component as unknown as CheckoutInternals;
    element = fixture.nativeElement;
    paid = [];
    component.pay.subscribe((request) => paid.push(request));
    fixture.componentRef.setInput('policies', POLICIES);
    fixture.componentRef.setInput('initialPolicyId', 3);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the premium of the policy it was opened for', () => {
    expect(page.selectedPolicy()?.id).toBe(3);
    expect(element.textContent).toContain('Secure Payment');
    expect(element.querySelector('button[type="submit"]')?.textContent).toContain('999.00');
  });

  it('lets the customer switch to another policy', () => {
    page.selectPolicy('4');

    expect(page.selectedPolicy()?.id).toBe(4);
  });

  it('does not pay with an invalid card', () => {
    component.card.setValue({ number: '4242 4242 4242 4241', name: 'A', expiry: '12/30', cvv: '123' });

    page.submit();
    vi.runAllTimers();

    expect(component.card.controls.number.hasError('cardNumber')).toBe(true);
    expect(paid).toEqual([]);
  });

  it('rejects an expired card', () => {
    component.card.controls.expiry.setValue('01/20');

    expect(component.card.controls.expiry.hasError('expired')).toBe(true);
  });

  it('pays by card after a short processing delay, sending only policy and method', () => {
    page.useTestCard();

    page.submit();
    expect(page.processing()).toBe(true);
    expect(paid).toEqual([]);

    vi.advanceTimersByTime(1200);

    expect(page.processing()).toBe(false);
    expect(paid).toEqual([{ policyId: 3, method: 'MOCK_CARD' }]);
  });

  it('pays when the customer clicks the Pay button', () => {
    page.useTestCard();
    fixture.detectChanges();

    (element.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    vi.advanceTimersByTime(1200);

    expect(paid).toEqual([{ policyId: 3, method: 'MOCK_CARD' }]);
  });

  it('declines the test decline card without calling the server', () => {
    component.card.setValue({
      number: '4000 0000 0000 0002',
      name: 'Test',
      expiry: '12/30',
      cvv: '123',
    });

    page.submit();
    vi.advanceTimersByTime(1200);

    expect(paid).toEqual([]);
    expect(page.declineMessage()).toContain('declined');
  });

  it('pays by UPI and by net banking with the matching methods', () => {
    page.selectTab('upi');
    component.upi.setValue({ vpa: 'asha@okbank' });
    page.submit();
    vi.advanceTimersByTime(1200);

    page.selectTab('netbanking');
    component.netbanking.setValue({ bank: 'HDFC Bank' });
    page.submit();
    vi.advanceTimersByTime(1200);

    expect(paid).toEqual([
      { policyId: 3, method: 'MOCK_UPI' },
      { policyId: 3, method: 'MOCK_BANK_TRANSFER' },
    ]);
  });

  it('formats card number and expiry as the customer types', () => {
    component.card.controls.number.setValue('4242424242424242');
    page.formatCardNumber();
    component.card.controls.expiry.setValue('1230');
    page.formatExpiry();

    expect(component.card.controls.number.value).toBe('4242 4242 4242 4242');
    expect(component.card.controls.expiry.value).toBe('12/30');
  });

  it('detects the card brand', () => {
    expect(cardBrand('4242')).toBe('VISA');
    expect(cardBrand('5555')).toBe('Mastercard');
    expect(cardBrand('6071')).toBe('RuPay');
  });

  it('shows a receipt once the payment is recorded', () => {
    fixture.componentRef.setInput('paidPayment', {
      id: 9,
      paymentReference: 'PAY-9',
      externalReference: 'TXN-ABC',
      policyNumber: 'POL-3',
      amount: 999,
      method: 'MOCK_CARD',
      status: 'SUCCESS',
      createdAt: '2026-09-28T10:00:00',
      completedAt: '2026-09-28T10:00:01',
    } as PaymentResponse);
    fixture.detectChanges();

    expect(element.textContent).toContain('Payment successful');
    expect(element.textContent).toContain('TXN-ABC');
  });

  it('clears the dummy card details when closed', () => {
    page.useTestCard();

    fixture.destroy();

    expect(component.card.controls.number.value).toBe('');
  });
});
