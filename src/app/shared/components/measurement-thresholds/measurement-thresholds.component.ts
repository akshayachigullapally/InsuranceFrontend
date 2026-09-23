import {
  AsyncPipe,
} from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import {
  Observable,
  Subject,
  map,
  take,
  takeUntil,
} from 'rxjs';
import { ROLES } from '../../../core/constants/roles';
import { ProductResponse } from '../../../features/dtos/products/product-response.dto';
import { selectAuthUser } from '../../../features/state/auth/auth.selectors';
import {
  clearProductsError,
  loadAdminProducts,
  loadProducts,
} from '../../../features/state/products/products.actions';
import {
  selectAdminProducts,
  selectProducts,
  selectProductsError,
  selectProductsLoading,
} from '../../../features/state/products/products.selectors';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { ErrorMessageComponent } from '../error-message/error-message.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { MeasurementStatusPanelComponent } from '../measurement-status-panel/measurement-status-panel.component';

@Component({
  selector: 'app-measurement-thresholds',
  standalone: true,
  imports: [
    AsyncPipe,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    EmptyStateComponent,
    MeasurementStatusPanelComponent,
  ],
  templateUrl: './measurement-thresholds.component.html',
  styleUrl: './measurement-thresholds.component.css',
})
export class MeasurementThresholdsComponent
  implements OnChanges, OnDestroy
{
  @Input() open = false;
  @Output() readonly closed = new EventEmitter<void>();

  readonly isAdmin$: Observable<boolean> = this.store
    .select(selectAuthUser)
    .pipe(map(user => user?.role === ROLES.ADMIN));

  readonly publicProducts$: Observable<ProductResponse[]> =
    this.store.select(selectProducts);

  readonly adminProducts$: Observable<ProductResponse[]> =
    this.store.select(selectAdminProducts);

  readonly loading$: Observable<boolean> =
    this.store.select(selectProductsLoading);

  readonly error$: Observable<string | null> =
    this.store.select(selectProductsError);

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly store: Store) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open']?.currentValue) {
      return;
    }

    this.store.dispatch(clearProductsError());

    this.store
      .select(selectAuthUser)
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(user => {
        if (user?.role === ROLES.ADMIN) {
          this.store.dispatch(loadAdminProducts());
        } else {
          this.store.dispatch(loadProducts());
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected close(): void {
    this.closed.emit();
  }

  protected onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}