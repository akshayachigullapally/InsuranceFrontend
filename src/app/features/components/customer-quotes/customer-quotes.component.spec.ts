import { DialogService } from '../../../shared/services/dialog.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { Observable, of } from 'rxjs';
import { CustomerQuotesComponent } from './customer-quotes.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import { ZoneService } from '../../services/zone.service';
import {
  acceptQuote,
  cancelQuote,
  clearQuotesError,
  loadQuotes,
} from '../../state/quotes/quotes.actions';
import { loadProducts } from '../../state/products/products.actions';
import { QuoteResponse } from '../../dtos/financial/quote-response.dto';
import { ProductResponse } from '../../dtos/products/product-response.dto';

type QuotesInternals = {
  openCreate(): void;
  submit(): void;
  accept(quote: QuoteResponse): void;
  cancel(quote: QuoteResponse): void;
  productName(products: ProductResponse[], productId: number): string;
  zoneName(zoneId: number): string;
  isExpired(quote: QuoteResponse): boolean;
  formOpen: boolean;
  processingQuoteId: number | null;
  zonesError: string | null;
};

describe('CustomerQuotesComponent', () => {
  let component: CustomerQuotesComponent;
  let page: QuotesInternals;
  let store: MockStore;
  const quote = { id: 9, quoteReference: 'QTE-9', status: 'CREATED' } as QuoteResponse;

  async function setup(zones: Observable<unknown> = of([{ id: 1, zoneName: 'Hyderabad Central Zone' }])) {
    await TestBed.configureTestingModule({
      imports: [CustomerQuotesComponent],
      providers: [...pageTestProviders(), { provide: ZoneService, useValue: { getActiveZones: () => zones } }],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    const fixture: ComponentFixture<CustomerQuotesComponent> = TestBed.createComponent(CustomerQuotesComponent);
    component = fixture.componentInstance;
    page = component as unknown as QuotesInternals;
    fixture.detectChanges();
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads quotes, products and zones on init', async () => {
    await setup();

    expect(store.dispatch).toHaveBeenCalledWith(clearQuotesError());
    expect(store.dispatch).toHaveBeenCalledWith(loadQuotes());
    expect(store.dispatch).toHaveBeenCalledWith(loadProducts());
    expect(component.form.controls.locationZoneId.enabled).toBe(true);
  });

  it('accepts a quote and cancels only after confirmation', async () => {
    await setup();

    page.accept(quote);
    expect(page.processingQuoteId).toBe(9);
    expect(store.dispatch).toHaveBeenCalledWith(acceptQuote({ quoteId: 9 }));

    vi.spyOn(TestBed.inject(DialogService), 'confirm').mockResolvedValue(true);
    await page.cancel(quote);
    expect(store.dispatch).toHaveBeenCalledWith(cancelQuote({ quoteId: 9 }));
  });

  it('marks created quotes past their expiry as expired', async () => {
    await setup();

    expect(page.isExpired({ ...quote, expiresAt: '2000-01-01T00:00:00Z' } as QuoteResponse)).toBe(true);
    expect(page.isExpired({ ...quote, expiresAt: '2999-01-01T00:00:00Z' } as QuoteResponse)).toBe(false);
    expect(page.isExpired({ ...quote, status: 'ACCEPTED', expiresAt: '2000-01-01T00:00:00Z' } as QuoteResponse)).toBe(false);
  });
});
