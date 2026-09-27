import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { MockStore } from '@ngrx/store/testing';
import { CustomerProfileComponent } from './customer-profile.component';
import { loggedInAuth, pageTestProviders } from '../../../../testing/test-helpers';
import { updateProfile } from '../../state/auth/auth.actions';

type ProfileInternals = {
  profileForm: FormGroup;
  activeTab: 'profile' | 'policies' | 'claims';
  saving: boolean;
  saveSuccess: boolean;
  onSave(): void;
  onTabChange(tab: 'profile' | 'policies' | 'claims'): void;
  getInitials(name: string): string;
  formatCurrency(amount: number): string;
  getStatusClass(status: string): string;
  roleLabel(role: string | null | undefined): string;
};

describe('CustomerProfileComponent', () => {
  let fixture: ComponentFixture<CustomerProfileComponent>;
  let page: ProfileInternals;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerProfileComponent],
      providers: pageTestProviders({ auth: loggedInAuth('ROLE_CUSTOMER') }),
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(CustomerProfileComponent);
    page = fixture.componentInstance as unknown as ProfileInternals;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('prefills the form from the signed-in user', () => {
    expect(page.profileForm.value.fullName).toBe('Asha Rao');
    expect(page.profileForm.value.email).toBe('asha@example.com');
  });

  it('rejects an invalid postal code and phone number', () => {
    page.profileForm.patchValue({ postalCode: '12', phone: 'abc' });

    expect(page.profileForm.get('postalCode')?.hasError('pattern')).toBe(true);
    expect(page.profileForm.get('phone')?.hasError('pattern')).toBe(true);
  });

  it('does not save an invalid form', () => {
    page.profileForm.patchValue({ email: 'not-an-email' });

    page.onSave();

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('dispatches updateProfile and shows success after a second', () => {
    vi.useFakeTimers();
    page.profileForm.patchValue({ city: 'Hyderabad', postalCode: '500032' });

    page.onSave();

    expect(store.dispatch).toHaveBeenCalledWith(
      updateProfile({
        user: {
          id: 0,
          fullName: 'Asha Rao',
          email: 'asha@example.com',
          phone: undefined,
          address: undefined,
          city: 'Hyderabad',
          state: undefined,
          postalCode: '500032',
        },
      }),
    );
    expect(page.saving).toBe(true);

    vi.advanceTimersByTime(1000);
    expect(page.saving).toBe(false);
    expect(page.saveSuccess).toBe(true);

    vi.advanceTimersByTime(3000);
    expect(page.saveSuccess).toBe(false);
  });

  it('switches tabs', () => {
    page.onTabChange('claims');

    expect(page.activeTab).toBe('claims');
  });

  it('formats helpers', () => {
    expect(page.getInitials('asha rao')).toBe('AR');
    expect(page.getInitials('')).toBe('U');
    expect(page.getStatusClass('UNDER_REVIEW')).toBe('status-under-review');
    expect(page.getStatusClass('UNKNOWN')).toBe('status-default');
    expect(page.roleLabel('ROLE_CUSTOMER')).toBe('Customer');
    expect(page.formatCurrency(150000)).toContain('1,50,000');
  });
});
