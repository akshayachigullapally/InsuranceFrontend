import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { parseLocalDateOnly } from '../../utils/local-date.util';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  CLAIM_STATUSES,
  ClaimResponse,
  ClaimStatus,
} from '../../dtos/claims/claim-response.dto';
import {
  clearClaimsError,
  loadAdminClaims,
} from '../../state/claims/claims.actions';
import {
  selectAdminClaims,
  selectClaimsError,
  selectClaimsLoading,
} from '../../state/claims/claims.selectors';
import { ZoneService } from '../../services/zone.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface StatusFilter {
  label: string;
  value: ClaimStatus | null;
}

@Component({
  selector: 'app-admin-claims',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    RouterLink,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
  ],
  providers: [DatePipe],
  templateUrl: './admin-claims.component.html',
  styleUrl: './admin-claims.component.css',
})
export class AdminClaimsComponent implements OnInit {
  readonly claims$: Observable<ClaimResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  protected readonly filters: StatusFilter[] = [
    { label: 'All', value: null },
    ...CLAIM_STATUSES.map(status => ({
      label: this.statusLabel(status),
      value: status,
    })),
  ];

  protected selectedStatus: ClaimStatus | null = null;

  private zoneNamesById: Record<number, string> = {};

  constructor(
    private readonly store: Store,
    private readonly zoneService: ZoneService,
    private readonly datePipe: DatePipe,
  ) {
    this.claims$ = this.store.select(selectAdminClaims);
    this.loading$ = this.store.select(selectClaimsLoading);
    this.error$ = this.store.select(selectClaimsError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearClaimsError());
    this.store.dispatch(loadAdminClaims({}));

    this.zoneService.getAllZones().subscribe(zones => {
      this.zoneNamesById = zones.reduce(
        (map, zone) => ({ ...map, [zone.id]: zone.zoneName }),
        {} as Record<number, string>,
      );
    });
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

  protected applyFilter(status: ClaimStatus | null): void {
    this.selectedStatus = status;
    this.store.dispatch(loadAdminClaims({
      status: status ?? undefined,
    }));
  }

  protected statusLabel(status: ClaimStatus): string {
    return status
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, character => character.toUpperCase());
  }
}