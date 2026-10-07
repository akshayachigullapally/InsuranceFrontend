import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { AdminPaymentsComponent } from './admin-payments.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import {
  clearPaymentsError,
  loadPayments,
} from '../../state/payments/payments.actions';


describe('AdminPaymentsComponent', () => {
  let fixture: ComponentFixture<AdminPaymentsComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPaymentsComponent],
      providers: pageTestProviders(),
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(AdminPaymentsComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads all payments on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(clearPaymentsError());
    expect(store.dispatch).toHaveBeenCalledWith(loadPayments());
  });
});
