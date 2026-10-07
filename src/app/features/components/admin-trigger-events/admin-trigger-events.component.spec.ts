import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { AdminTriggerEventsComponent } from './admin-trigger-events.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import {
  clearTriggerEventFilters,
  clearTriggerEventsError,
  loadTriggerEvents,
} from '../../state/trigger-events/trigger-events.actions';

describe('AdminTriggerEventsComponent', () => {
  let fixture: ComponentFixture<AdminTriggerEventsComponent>;
  let component: AdminTriggerEventsComponent;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTriggerEventsComponent],
      providers: pageTestProviders(),
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(AdminTriggerEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('clears errors and loads events on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(clearTriggerEventsError());
    expect(store.dispatch).toHaveBeenCalledWith(loadTriggerEvents());
  });

  it('clears filters and reloads events', () => {
    component.searchControl.setValue('hyd');
    vi.mocked(store.dispatch).mockClear();

    (component as unknown as { clearFilters(): void }).clearFilters();

    expect(component.searchControl.value).toBe('');
    expect(store.dispatch).toHaveBeenCalledWith(clearTriggerEventFilters());
    expect(store.dispatch).toHaveBeenCalledWith(loadTriggerEvents());
  });
});
