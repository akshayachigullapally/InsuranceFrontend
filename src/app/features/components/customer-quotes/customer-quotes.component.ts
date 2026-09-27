import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import {
  CreateQuoteRequest,
  QuoteResponse,
} from '../../dtos/financial/quote-response.dto';
import { ProductResponse } from '../../dtos/products/product-response.dto';
import { ZoneResponse } from '../../dtos/zones/zone-response.dto';
import { ZoneService } from '../../services/zone.service';
import {
  acceptQuote,
  cancelQuote,
  clearQuotesError,
  createQuote,
  loadQuotes,
} from '../../state/quotes/quotes.actions';
import {
  selectQuotes,
  selectQuotesError,
  selectQuotesLoading,
  selectQuotesSaving,
} from '../../state/quotes/quotes.selectors';
import { loadProducts } from '../../state/products/products.actions';
import { selectProducts } from '../../state/products/products.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface QuoteForm {
  productId: FormControl<number | null>;
  locationZoneId: FormControl<number | null>;
  sumInsured: FormControl<number | null>;
  termMonths: FormControl<number | null>;
}

@Component({
  selector: 'app-customer-quotes',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './customer-quotes.component.html',
  styleUrl: './customer-quotes.component.css',
})
export class CustomerQuotesComponent implements OnInit, OnDestroy {
  readonly quotes$: Observable<QuoteResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly saving$: Observable<boolean>;
  readonly error$: Observable<string | null>;
  readonly products$: Observable<ProductResponse[]>;

  protected zones: ZoneResponse[] = [];
  protected zonesLoading = false;
  protected zonesError: string | null = null;
  protected formOpen = false;
  protected processingQuoteId: number | null = null;

  readonly form = new FormGroup<QuoteForm>({
    productId: new FormControl<number | null>(null, Validators.required),
    locationZoneId: new FormControl<number | null>(null, Validators.required),
    sumInsured: new FormControl<number | null>(
      null,
      [Validators.required, Validators.min(1)],
    ),
    termMonths: new FormControl<number | null>(
      null,
      [Validators.required, Validators.min(1), Validators.max(60)],
    ),
  });

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly store: Store,
    private readonly zoneService: ZoneService,
  ) {
    this.quotes$ = this.store.select(selectQuotes);
    this.loading$ = this.store.select(selectQuotesLoading);
    this.saving$ = this.store.select(selectQuotesSaving);
    this.error$ = this.store.select(selectQuotesError);
    this.products$ = this.store.select(selectProducts);
  }

  ngOnInit(): void {
    this.store.dispatch(clearQuotesError());
    this.store.dispatch(loadQuotes());
    this.store.dispatch(loadProducts());
    this.loadZones();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(clearQuotesError());
  }

  protected openCreate(): void {
    this.store.dispatch(clearQuotesError());
    this.form.reset({
      productId: null,
      locationZoneId: null,
      sumInsured: null,
      termMonths: null,
    });
    this.formOpen = true;
  }

  protected closeForm(): void {
    this.formOpen = false;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (
      raw.productId === null ||
      raw.locationZoneId === null ||
      raw.sumInsured === null ||
      raw.termMonths === null
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const request: CreateQuoteRequest = {
      productId: raw.productId,
      locationZoneId: raw.locationZoneId,
      sumInsured: raw.sumInsured,
      termMonths: raw.termMonths,
    };

    this.store.dispatch(createQuote({ request }));
    this.formOpen = false;
  }

  protected accept(quote: QuoteResponse): void {
    this.processingQuoteId = quote.id;
    this.store.dispatch(acceptQuote({ quoteId: quote.id }));
  }

  protected cancel(quote: QuoteResponse): void {
    const confirmed = window.confirm(
      `Cancel quote ${quote.quoteReference}?`,
    );

    if (confirmed) {
      this.processingQuoteId = quote.id;
      this.store.dispatch(cancelQuote({ quoteId: quote.id }));
    }
  }

  protected productName(products: ProductResponse[], productId: number): string {
    return products.find(product => product.id === productId)?.name
      ?? `Product #${productId}`;
  }

  protected zoneName(zoneId: number): string {
    return this.zones.find(zone => zone.id === zoneId)?.zoneName
      ?? `Zone #${zoneId}`;
  }

  protected isExpired(quote: QuoteResponse): boolean {
    return (
      quote.status === 'CREATED' &&
      !!quote.expiresAt &&
      new Date(quote.expiresAt).getTime() < Date.now()
    );
  }

  private loadZones(): void {
    this.zonesLoading = true;
    this.zonesError = null;
    this.form.controls.locationZoneId.disable();

    this.zoneService
      .getActiveZones()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: zones => {
          this.zones = zones;
          this.zonesLoading = false;
          this.form.controls.locationZoneId.enable();
        },
        error: () => {
          this.zones = [];
          this.zonesLoading = false;
          this.form.controls.locationZoneId.disable();
          this.zonesError = 'Location zones could not be loaded.';
        },
      });
  }

  /**
   * How the premium was calculated from the pricing rule:
   * sum insured x annual rate x (months / 12) x term factor x zone factor,
   * raised to the rule's minimum premium when lower.
   */
  protected breakdown(quote: QuoteResponse): PremiumBreakdown {
    const years = quote.termMonths / 12;
    const calculated = round2(
      quote.sumInsured * quote.annualRate * years * quote.termFactor * quote.locationFactor,
    );
    return {
      ratePercent: +(quote.annualRate * 100).toFixed(4),
      years,
      termFactor: quote.termFactor,
      locationFactor: quote.locationFactor,
      calculated,
      minimumApplied: quote.premiumAmount > calculated + 0.01,
    };
  }
}

export interface PremiumBreakdown {
  ratePercent: number;
  years: number;
  termFactor: number;
  locationFactor: number;
  calculated: number;
  minimumApplied: boolean;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
