import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { HttpTestingController } from '@angular/common/http/testing';
import { MockStore } from '@ngrx/store/testing';
import { CustomerProfileComponent } from './customer-profile.component';
import { loggedInAuth, pageTestProviders } from '../../../../testing/test-helpers';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { updateProfileSuccess } from '../../state/auth/auth.actions';
import { UserResponse } from '../../dtos/auth/user-response.dto';

type ProfileInternals = {
  profileForm: FormGroup;
  activeTab: 'profile' | 'policies' | 'claims';
  loading: boolean;
  saving: boolean;
  saveSuccess: boolean;
  saveError: string | null;
  onSave(): void;
  onTabChange(tab: 'profile' | 'policies' | 'claims'): void;
  segmentLabel(segment: string): string;
  getInitials(name: string): string;
  formatCurrency(amount: number): string;
  getStatusClass(status: string): string;
  roleLabel(role: string | null | undefined): string;
};

const savedProfile: UserResponse = {
  id: 1,
  fullName: 'Asha Rao',
  email: 'asha@example.com',
  role: 'ROLE_CUSTOMER',
  phoneNumber: '9876543210',
  dateOfBirth: '1990-04-12',
  customerSegment: 'FARMER',
  addresses: [
    {
      addressLineOne: 'Plot 12, Abids Road',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500001',
      country: 'India',
      primaryAddress: true,
    },
  ],
};

describe('CustomerProfileComponent', () => {
  let fixture: ComponentFixture<CustomerProfileComponent>;
  let page: ProfileInternals;
  let store: MockStore;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerProfileComponent],
      providers: pageTestProviders({ auth: loggedInAuth('ROLE_CUSTOMER') }),
    }).compileComponents();

    store = TestBed.inject(MockStore);
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(CustomerProfileComponent);
    page = fixture.componentInstance as unknown as ProfileInternals;
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  function loadSavedProfile(): void {
    http.expectOne(API_ENDPOINTS.users.me).flush(savedProfile);
  }

  it('loads the saved profile, including the customer segment', () => {
    expect(page.loading).toBe(true);

    loadSavedProfile();

    expect(page.loading).toBe(false);
    expect(page.profileForm.getRawValue()).toEqual(
      expect.objectContaining({
        fullName: 'Asha Rao',
        email: 'asha@example.com',
        phoneNumber: '9876543210',
        dateOfBirth: '1990-04-12',
        customerSegment: 'FARMER',
        addressLineOne: 'Plot 12, Abids Road',
        city: 'Hyderabad',
        postalCode: '500001',
        country: 'India',
      }),
    );
  });

  it('keeps the signed-in name and default segment when no profile is saved yet', () => {
    http
      .expectOne(API_ENDPOINTS.users.me)
      .flush(
        { message: 'User profile is not completed' },
        { status: 404, statusText: 'Not Found' },
      );

    expect(page.loading).toBe(false);
    expect(page.profileForm.getRawValue().fullName).toBe('Asha Rao');
    expect(page.profileForm.getRawValue().customerSegment).toBe('INDIVIDUAL');
  });

  it('rejects an invalid postal code, phone number and future date of birth', () => {
    loadSavedProfile();
    page.profileForm.patchValue({
      postalCode: '12',
      phoneNumber: '12345',
      dateOfBirth: '2999-01-01',
    });

    expect(page.profileForm.get('postalCode')?.hasError('pattern')).toBe(true);
    expect(page.profileForm.get('phoneNumber')?.hasError('pattern')).toBe(true);
    expect(page.profileForm.get('dateOfBirth')?.hasError('pastDate')).toBe(true);
  });

  it('does not send an invalid form', () => {
    loadSavedProfile();
    page.profileForm.patchValue({ city: '' });

    page.onSave();

    http.expectNone((req) => req.method === 'PUT');
    expect(page.saving).toBe(false);
  });

  it('saves the profile with PUT /api/users/me and updates the header name', () => {
    vi.useFakeTimers();
    loadSavedProfile();
    page.profileForm.patchValue({ fullName: 'Asha R', customerSegment: 'SMALL_BUSINESS' });

    page.onSave();

    const req = http.expectOne((r) => r.method === 'PUT' && r.url === API_ENDPOINTS.users.me);
    expect(req.request.body).toEqual({
      fullName: 'Asha R',
      phoneNumber: '9876543210',
      dateOfBirth: '1990-04-12',
      customerSegment: 'SMALL_BUSINESS',
      address: {
        addressLineOne: 'Plot 12, Abids Road',
        addressLineTwo: undefined,
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500001',
        country: 'India',
      },
    });
    expect(page.saving).toBe(true);

    req.flush({ ...savedProfile, fullName: 'Asha R', customerSegment: 'SMALL_BUSINESS' });

    expect(page.saving).toBe(false);
    expect(page.saveSuccess).toBe(true);
    expect(store.dispatch).toHaveBeenCalledWith(
      updateProfileSuccess({ user: expect.objectContaining({ fullName: 'Asha R' }) }),
    );

    vi.advanceTimersByTime(3000);
    expect(page.saveSuccess).toBe(false);
  });

  it('shows the server message when saving fails', () => {
    loadSavedProfile();

    page.onSave();
    http
      .expectOne((r) => r.method === 'PUT')
      .flush(
        { messages: ['Phone number must contain 10 valid digits'] },
        { status: 400, statusText: 'Bad Request' },
      );

    expect(page.saving).toBe(false);
    expect(page.saveError).toContain('Phone number must contain 10 valid digits');
  });

  it('switches tabs', () => {
    loadSavedProfile();
    page.onTabChange('claims');

    expect(page.activeTab).toBe('claims');
  });

  it('formats helpers', () => {
    loadSavedProfile();
    expect(page.segmentLabel('SMALL_BUSINESS')).toBe('Small business');
    expect(page.getInitials('asha rao')).toBe('AR');
    expect(page.getInitials('')).toBe('U');
    expect(page.getStatusClass('UNDER_REVIEW')).toBe('status-under-review');
    expect(page.getStatusClass('UNKNOWN')).toBe('status-default');
    expect(page.roleLabel('ROLE_CUSTOMER')).toBe('Customer');
    expect(page.formatCurrency(150000)).toContain('1,50,000');
  });
});
