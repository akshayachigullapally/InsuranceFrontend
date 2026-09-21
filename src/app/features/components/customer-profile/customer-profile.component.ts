import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { ROLE_LABELS, UserRole } from '../../../core/constants/roles';
import { selectAuthUser } from '../../../features/state/auth/auth.selectors';
import { updateProfile } from '../../../features/state/auth/auth.actions';
import { selectMyPolicies } from '../../../features/state/policies/policies.selectors';
import { selectMyClaims } from '../../../features/state/claims/claims.selectors';
import { PolicyResponse } from '../../../features/dtos/policies/policy-response.dto';
import { ClaimResponse } from '../../../features/dtos/claims/claim-response.dto';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

interface ProfileForm {
  fullName: FormControl<string | null>;
  email: FormControl<string | null>;
  phone: FormControl<string | null>;
  address: FormControl<string | null>;
  city: FormControl<string | null>;
  state: FormControl<string | null>;
  postalCode: FormControl<string | null>;
}

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    EmptyStateComponent,
  ],
  templateUrl: './customer-profile.component.html',
  styleUrl: './customer-profile.component.css',
})
export class CustomerProfileComponent implements OnInit, OnDestroy {
  readonly user$ = this.store.select(selectAuthUser);
  readonly policies$ = this.store.select(selectMyPolicies);
  readonly claims$ = this.store.select(selectMyClaims);

  protected profileForm!: FormGroup<ProfileForm>;
  protected activeTab: 'profile' | 'policies' | 'claims' = 'profile';
  protected saving = false;
  protected saveError: string | null = null;
  protected saveSuccess = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.profileForm = this.fb.group<ProfileForm>({
      fullName: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
      email: this.fb.control('', [Validators.required, Validators.email]),
      phone: this.fb.control('', [Validators.pattern(/^[\d\s\-\+\(\)]{10,}$/)]),
      address: this.fb.control('', [Validators.maxLength(200)]),
      city: this.fb.control('', [Validators.maxLength(100)]),
      state: this.fb.control('', [Validators.maxLength(100)]),
      postalCode: this.fb.control('', [Validators.pattern(/^\d{6}$/)]),
    });
  }

  private loadUserData(): void {
    this.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        this.profileForm.patchValue({
          fullName: user.fullName || '',
          email: user.email || '',
          phone: '',
          address: '',
          city: '',
          state: '',
          postalCode: '',
        });
      }
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

    const formValue = this.profileForm.getRawValue();
    const userData = {
      id: 0,
      fullName: formValue.fullName || undefined,
      email: formValue.email || undefined,
      phone: formValue.phone || undefined,
      address: formValue.address || undefined,
      city: formValue.city || undefined,
      state: formValue.state || undefined,
      postalCode: formValue.postalCode || undefined,
    };
    this.store.dispatch(updateProfile({ user: userData }));

    setTimeout(() => {
      this.saving = false;
      this.saveSuccess = true;
      setTimeout(() => (this.saveSuccess = false), 3000);
    }, 1000);
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