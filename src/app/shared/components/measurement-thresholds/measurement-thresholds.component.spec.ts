import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore } from '@ngrx/store/testing';
import { EMPTY } from 'rxjs';
import { MeasurementThresholdsComponent } from './measurement-thresholds.component';
import { loggedInAuth, pageTestProviders } from '../../../../testing/test-helpers';
import {
  clearProductsError,
  loadAdminProducts,
  loadProducts,
} from '../../../features/state/products/products.actions';

async function setup(role: string) {
  await TestBed.configureTestingModule({
    imports: [MeasurementThresholdsComponent],
    providers: [...pageTestProviders({ auth: loggedInAuth(role) }), provideMockActions(() => EMPTY)],
  }).compileComponents();

  const store = TestBed.inject(MockStore);
  vi.spyOn(store, 'dispatch');
  const fixture: ComponentFixture<MeasurementThresholdsComponent> =
    TestBed.createComponent(MeasurementThresholdsComponent);
  return { fixture, component: fixture.componentInstance, store };
}

function open(component: MeasurementThresholdsComponent, value: boolean): void {
  component.open = value;
  component.ngOnChanges({ open: new SimpleChange(!value, value, false) });
}

describe('MeasurementThresholdsComponent', () => {
  it('does nothing while closed', async () => {
    const { component, store } = await setup('ROLE_CUSTOMER');

    open(component, false);

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('loads public products when a customer opens it', async () => {
    const { component, store } = await setup('ROLE_CUSTOMER');

    open(component, true);

    expect(store.dispatch).toHaveBeenCalledWith(clearProductsError());
    expect(store.dispatch).toHaveBeenCalledWith(loadProducts());
  });

  it('loads admin products when an admin opens it', async () => {
    const { component, store } = await setup('ROLE_ADMIN');

    open(component, true);

    expect(store.dispatch).toHaveBeenCalledWith(loadAdminProducts());
  });

  it('emits closed when the close button is clicked', async () => {
    const { fixture, component } = await setup('ROLE_CUSTOMER');
    const closed = vi.fn();
    component.closed.subscribe(closed);
    component.open = true;
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('button[aria-label="Close"]') as HTMLButtonElement).click();

    expect(closed).toHaveBeenCalled();
  });

  it('closes only when the overlay itself is clicked', async () => {
    const { component } = await setup('ROLE_CUSTOMER');
    const closed = vi.fn();
    component.closed.subscribe(closed);
    const overlay = document.createElement('div');
    const inner = document.createElement('div');

    component['onOverlayClick']({ target: inner, currentTarget: overlay } as unknown as MouseEvent);
    expect(closed).not.toHaveBeenCalled();

    component['onOverlayClick']({ target: overlay, currentTarget: overlay } as unknown as MouseEvent);
    expect(closed).toHaveBeenCalledTimes(1);
  });
});
