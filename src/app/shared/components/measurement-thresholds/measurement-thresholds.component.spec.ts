import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore } from '@ngrx/store/testing';
import { EMPTY } from 'rxjs';
import { MeasurementThresholdsComponent } from './measurement-thresholds.component';
import { loggedInAuth, pageTestProviders } from '../../../../testing/test-helpers';

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
