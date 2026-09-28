import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, take, takeUntil } from 'rxjs';
import { ROLE_LABELS, UserRole } from '../../../core/constants/roles';
import { selectAuthUser } from '../../../features/state/auth/auth.selectors';
import { updateProfileSuccess } from '../../../features/state/auth/auth.actions';
import { selectMyPolicies } from '../../../features/state/policies/policies.selectors';
import { selectMyClaims } from '../../../features/state/claims/claims.selectors';
import { httpErrorMessage } from '../../../features/state/products/products.effects';
import { UserService } from '../../services/user.service';
import {
  CUSTOMER_SEGMENTS,
  CustomerSegment,
  UserResponse,
} from '../../dtos/auth/user-response.dto';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

interface ProfileForm {
  fullName: FormControl<string>;
  email: FormControl<string>;
  phoneNumber: FormControl<string>;
  dateOfBirth: FormControl<string>;
  customerSegment: FormControl<CustomerSegment>;
  addressLineOne: FormControl<string>;
  addressLineTwo: FormControl<string>;
  city: FormControl<string>;
  state: FormControl<string>;
  postalCode: FormControl<string>;
  country: FormControl<string>;
}

/** Date of birth must be before today (the backend uses @Past). */
function pastDate(control: AbstractControl<string>): ValidationErrors | null {
  if (!control.value) return null;
  return new Date(control.value) < new Date(new Date().toDateString()) ? null : { pastDate: true };
}

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, EmptyStateComponent],
  templateUrl: './customer-profile.component.html',
  styleUrl: './customer-profile.component.css',
})
export class CustomerProfileComponent implements OnInit, OnDestroy {
  readonly user$ = this.store.select(selectAuthUser);
  readonly policies$ = this.store.select(selectMyPolicies);
  readonly claims$ = this.store.select(selectMyClaims);

  protected readonly segments = CUSTOMER_SEGMENTS;
  protected readonly today = new Date().toISOString().slice(0, 10);

  protected profileForm!: FormGroup<ProfileForm>;
  protected activeTab: 'profile' | 'policies' | 'claims' = 'profile';
  protected loading = false;
  protected saving = false;
  protected saveError: string | null = null;
  protected saveSuccess = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private readonly userService: UserService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    const nfb = this.fb.nonNullable;
    this.profileForm = nfb.group({
      fullName: nfb.control('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(150),
      ]),
      // Email is the login identity and cannot be changed here.
      email: nfb.control({ value: '', disabled: true }),
      phoneNumber: nfb.control('', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]),
      dateOfBirth: nfb.control('', [Validators.required, pastDate]),
      customerSegment: nfb.control<CustomerSegment>('INDIVIDUAL', Validators.required),
      addressLineOne: nfb.control('', [Validators.required, Validators.maxLength(255)]),
      addressLineTwo: nfb.control('', Validators.maxLength(255)),
      city: nfb.control('', [Validators.required, Validators.maxLength(100)]),
      state: nfb.control('', [Validators.required, Validators.maxLength(100)]),
      postalCode: nfb.control('', [Validators.required, Validators.pattern(/^\d{6}$/)]),
      country: nfb.control('India', [Validators.required, Validators.maxLength(100)]),
    });
  }

  /** Fills the form from GET /api/users/me; falls back to the signed-in user's name and email. */
  private loadProfile(): void {
    this.user$.pipe(take(1)).subscribe((user) => {
      if (user) {
        this.profileForm.patchValue({ fullName: user.fullName ?? '', email: user.email ?? '' });
      }
    });

    this.loading = true;
    this.userService
      .getMyProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.patchFromProfile(profile);
          this.loading = false;
        },
        // A new account may not have profile details yet; keep the defaults.
        error: () => (this.loading = false),
      });
  }

  private patchFromProfile(profile: UserResponse): void {
    const address =
      profile.addresses?.find((item) => item.primaryAddress) ?? profile.addresses?.[0];

    this.profileForm.patchValue({
      fullName: profile.fullName ?? '',
      email: profile.email ?? '',
      phoneNumber: profile.phoneNumber ?? '',
      dateOfBirth: profile.dateOfBirth ?? '',
      customerSegment: profile.customerSegment ?? 'INDIVIDUAL',
      addressLineOne: address?.addressLineOne ?? '',
      addressLineTwo: address?.addressLineTwo ?? '',
      city: address?.city ?? '',
      state: address?.state ?? '',
      postalCode: address?.postalCode ?? '',
      country: address?.country ?? 'India',
    });
  }

  protected onSave(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.saveError = null;
    this.saveSuccess = false;

    const value = this.profileForm.getRawValue();
    this.userService
      .updateMyProfile({
        fullName: value.fullName.trim(),
        phoneNumber: value.phoneNumber.trim(),
        dateOfBirth: value.dateOfBirth,
        customerSegment: value.customerSegment,
        address: {
          addressLineOne: value.addressLineOne.trim(),
          addressLineTwo: value.addressLineTwo.trim() || undefined,
          city: value.city.trim(),
          state: value.state.trim(),
          postalCode: value.postalCode.trim(),
          country: value.country.trim(),
        },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.patchFromProfile(profile);
          this.refreshHeaderName(profile.fullName);
          this.saving = false;
          this.saveSuccess = true;
          setTimeout(() => (this.saveSuccess = false), 3000);
        },
        error: (error) => {
          this.saving = false;
          this.saveError = httpErrorMessage(error);
        },
      });
  }

  /** Keeps the name shown in the header in sync with the saved profile. */
  private refreshHeaderName(fullName: string): void {
    this.user$.pipe(take(1)).subscribe((user) => {
      if (user) {
        this.store.dispatch(updateProfileSuccess({ user: { ...user, fullName } }));
      }
    });
  }

  protected segmentLabel(segment: CustomerSegment): string {
    return segment.charAt(0) + segment.slice(1).toLowerCase().replaceAll('_', ' ');
  }

  protected showError(name: keyof ProfileForm): boolean {
    const control = this.profileForm.controls[name];
    return control.invalid && control.touched;
  }

  protected onTabChange(tab: 'profile' | 'policies' | 'claims'): void {
    this.activeTab = tab;
    this.saveError = null;
    this.saveSuccess = false;
  }

  protected getInitials(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((p) => p.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  protected formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  protected getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      ACTIVE: 'status-active',
      PENDING: 'status-pending',
      EXPIRED: 'status-expired',
      CANCELLED: 'status-cancelled',
      DRAFT: 'status-draft',
      SUBMITTED: 'status-submitted',
      UNDER_REVIEW: 'status-under-review',
      APPROVED: 'status-approved',
      REJECTED: 'status-rejected',
      PAID: 'status-paid',
      SETTLED: 'status-approved',
    };
    return statusMap[status] || 'status-default';
  }

  protected roleLabel(role: string | null | undefined): string {
    return role && ROLE_LABELS[role as UserRole] ? ROLE_LABELS[role as UserRole] : 'Member';
  }
}
