import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { AdminPerilsComponent } from './admin-perils.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import {
  clearPerilsError,
  loadPerils,
  updatePeril,
  updatePerilStatus,
} from '../../state/perils/perils.actions';
import { PerilResponse } from '../../dtos/perils/peril-response.dto';

type PerilsInternals = {
  openCreate(): void;
  openEdit(peril: PerilResponse): void;
  closeForm(): void;
  submit(): void;
  changeStatus(peril: PerilResponse, event: Event): void;
  archive(peril: PerilResponse): void;
  formOpen: boolean;
  editingPeril: PerilResponse | null;
};

describe('AdminPerilsComponent', () => {
  let fixture: ComponentFixture<AdminPerilsComponent>;
  let component: AdminPerilsComponent;
  let page: PerilsInternals;
  let store: MockStore;
  const peril = {
    id: 2,
    perilCode: 'FLOOD',
    perilName: 'Flood',
    description: 'River level above threshold',
    status: 'ACTIVE',
  } as PerilResponse;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPerilsComponent],
      providers: pageTestProviders(),
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(AdminPerilsComponent);
    component = fixture.componentInstance;
    page = component as unknown as PerilsInternals;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads perils on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(clearPerilsError());
    expect(store.dispatch).toHaveBeenCalledWith(loadPerils());
  });

  it('prefills the form and updates when editing', () => {
    page.openEdit(peril);
    expect(component.form.getRawValue()).toEqual({
      perilCode: 'FLOOD',
      perilName: 'Flood',
      description: 'River level above threshold',
    });

    page.submit();

    expect(store.dispatch).toHaveBeenCalledWith(
      updatePeril({
        perilId: 2,
        request: { perilCode: 'FLOOD', perilName: 'Flood', description: 'River level above threshold' },
      }),
    );
  });

  it('changes status only when a different value is chosen', () => {
    page.changeStatus(peril, { target: { value: 'ACTIVE' } } as unknown as Event);
    expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: updatePerilStatus.type }));

    page.changeStatus(peril, { target: { value: 'INACTIVE' } } as unknown as Event);
    expect(store.dispatch).toHaveBeenCalledWith(updatePerilStatus({ perilId: 2, status: 'INACTIVE' as never }));
  });
});
