import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserResponse } from '../../dtos/auth/user-response.dto';
import { PolicyResponse } from '../../dtos/policies/policy-response.dto';
import { ClaimResponse } from '../../dtos/claims/claim-response.dto';
import { UserService } from '../../services/user.service';
import { PolicyService } from '../../services/policy.service';
import { ClaimService } from '../../services/claim.service';
import { ZoneService } from '../../services/zone.service';
import { parseLocalDateOnly } from '../../utils/local-date.util';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-admin-user-detail',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
  ],
  providers: [DatePipe],
  templateUrl: './admin-user-detail.component.html',
  styleUrl: './admin-user-detail.component.css',
})
export class AdminUserDetailComponent implements OnInit, OnDestroy {
  protected invalidUserId = false;
  protected loading = false;
  protected error: string | null = null;

  protected user: UserResponse | null = null;
  protected policies: PolicyResponse[] = [];
  protected claims: ClaimResponse[] = [];

  private zoneNamesById: Record<number, string> = {};
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly datePipe: DatePipe,
    private readonly userService: UserService,
    private readonly policyService: PolicyService,
    private readonly claimService: ClaimService,
    private readonly zoneService: ZoneService,
  ) {}

  ngOnInit(): void {
    const userId = Number(
      this.route.snapshot.paramMap.get('userId'),
    );

    if (!Number.isInteger(userId) || userId <= 0) {
      this.invalidUserId = true;
      return;
    }

    this.loading = true;

    this.zoneService
      .getAllZones()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: zones => {
          this.zoneNamesById = zones.reduce(
            (map, zone) => ({ ...map, [zone.id]: zone.zoneName }),
            {} as Record<number, string>,
          );
        },
      });

    this.userService
      .getUser(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: user => {
          this.user = user;
        },
        error: () => {
          this.error = 'Failed to load user details.';
        },
      });

    this.policyService
      .getAllPolicies(undefined, userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: policies => {
          this.policies = policies;
        },
        error: () => {
          this.error = 'Failed to load policies for this user.';
        },
      });

    this.claimService
      .getAllClaims(undefined, userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: claims => {
          this.claims = claims;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load claims for this user.';
          this.loading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected zoneLabel(locationZoneId: number): string {
    const name = this.zoneNamesById[locationZoneId];

    return name
      ? `${name} (Zone #${locationZoneId})`
      : `Zone #${locationZoneId}`;
  }

  protected formatDateOnly(value?: string | null): string {
    const date = parseLocalDateOnly(value);

    return date
      ? this.datePipe.transform(date, 'mediumDate') ?? 'Not available'
      : 'Not available';
  }

  protected primaryAddress(): string {
    const addresses = this.user?.addresses ?? [];
    const address =
      addresses.find(item => item.primaryAddress === true) ?? addresses[0];

    if (!address) {
      return 'No address on file';
    }

    return [address.city, address.state, address.country]
      .filter(Boolean)
      .join(', ');
  }
}
