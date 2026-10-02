import { DialogService } from '../../../shared/services/dialog.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { CustomerQuotesComponent } from './customer-quotes.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import { ZoneService } from '../../services/zone.service';
import {
  acceptQuote,
  cancelQuote,
  clearQuotesError,
  createQuote,
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

  it('disables the zone field when zones fail to load', async () => {
    await setup(throwError(() => new Error('down')));

    expect(page.zonesError).toBe('Location zones could not be loaded.');
    expect(component.form.controls.locationZoneId.disabled).toBe(true);
  });

  it('does not submit an incomplete quote', async () => {
    await setup();
    page.openCreate();
    vi.mocked(store.dispatch).mockClear();

    page.submit();

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('rejects a term longer than 60 months', async () => {
    await setup();

    component.form.controls.termMonths.setValue(61);

    expect(component.form.controls.termMonths.hasError('max')).toBe(true);
  });

  it('creates a quote from valid input', async () => {
    await setup();
    page.openCreate();
    component.form.setValue({ productId: 1, locationZoneId: 1, sumInsured: 100000, termMonths: 12 });

    page.submit();

    expect(store.dispatch).toHaveBeenCalledWith(
      createQuote({ request: { productId: 1, locationZoneId: 1, sumInsured: 100000, termMonths: 12 } }),
    );
    expect(page.formOpen).toBe(false);
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

  it('resolves product and zone names with fallbacks', async () => {
    await setup();

    expect(page.productName([{ id: 1, name: 'Rain Cover' } as ProductResponse], 1)).toBe('Rain Cover');
    expect(page.productName([], 5)).toBe('Product #5');
    expect(page.zoneName(1)).toBe('Hyderabad Central Zone');
    expect(page.zoneName(7)).toBe('Zone #7');
  });

  it('marks created quotes past their expiry as expired', async () => {
    await setup();

    expect(page.isExpired({ ...quote, expiresAt: '2000-01-01T00:00:00Z' } as QuoteResponse)).toBe(true);
    expect(page.isExpired({ ...quote, expiresAt: '2999-01-01T00:00:00Z' } as QuoteResponse)).toBe(false);
    expect(page.isExpired({ ...quote, status: 'ACCEPTED', expiresAt: '2000-01-01T00:00:00Z' } as QuoteResponse)).toBe(false);
  });
});
