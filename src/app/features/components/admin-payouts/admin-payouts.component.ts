import { PayoutService } from '../../services/payout.service';
import { blobErrorMessage, saveBlob } from '../../utils/file-download.util';
import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PayoutResponse } from '../../dtos/financial/payout-response.dto';
import {
  clearPayoutsError,
  loadPayouts,
  retryPayout,
} from '../../state/payouts/payouts.actions';
import {
  selectPayouts,
  selectPayoutsError,
  selectPayoutsLoading,
  selectPayoutsSaving,
} from '../../state/payouts/payouts.selectors';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-admin-payouts',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './admin-payouts.component.html',
})
export class AdminPayoutsComponent implements OnInit, OnDestroy {
  readonly payouts$: Observable<PayoutResponse[]>;
  readonly loading$: Observable<boolean>;
  readonly saving$: Observable<boolean>;
  readonly error$: Observable<string | null>;

  constructor(
    private readonly store: Store,
    private readonly payoutService: PayoutService,
  ) {
    this.payouts$ = this.store.select(selectPayouts);
    this.loading$ = this.store.select(selectPayoutsLoading);
    this.saving$ = this.store.select(selectPayoutsSaving);
    this.error$ = this.store.select(selectPayoutsError);
  }

  ngOnInit(): void {
    this.store.dispatch(clearPayoutsError());
    this.store.dispatch(loadPayouts());
  }

  ngOnDestroy(): void {
    this.store.dispatch(clearPayoutsError());
  }

  protected retry(payout: PayoutResponse): void {
    this.store.dispatch(
      retryPayout({
        payoutId: payout.id,
        request: { externalReference: '' },
      }),
    );
  }

  protected receiptBusyId: number | null = null;
  protected receiptError: string | null = null;

  protected downloadReceipt(payout: PayoutResponse): void {
    this.receiptBusyId = payout.id;
    this.receiptError = null;
    this.payoutService.downloadAdminReceipt(payout.id).subscribe({
      next: (blob) => {
        this.receiptBusyId = null;
        saveBlob(blob, `${payout.payoutReference}-receipt.pdf`);
      },
      error: async (error: unknown) => {
        this.receiptBusyId = null;
        this.receiptError = await blobErrorMessage(error, 'Could not download the receipt.');
      },
    });
  }
}
