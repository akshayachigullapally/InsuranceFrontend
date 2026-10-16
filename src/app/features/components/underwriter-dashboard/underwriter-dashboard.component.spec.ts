import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';
import { UnderwriterDashboardComponent } from './underwriter-dashboard.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import { PolicyService } from '../../services/policy.service';
import { loadReviewPolicies } from '../../state/policies/policies.actions';

async function setup(history: Observable<unknown> = of([])) {
  await TestBed.configureTestingModule({
    imports: [UnderwriterDashboardComponent],
    providers: [
      ...pageTestProviders(),
      { provide: PolicyService, useValue: { getReviewHistory: vi.fn().mockReturnValue(history) } },
    ],
  }).compileComponents();

  const store = TestBed.inject(MockStore);
  vi.spyOn(store, 'dispatch');
  const fixture: ComponentFixture<UnderwriterDashboardComponent> =
    TestBed.createComponent(UnderwriterDashboardComponent);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, store };
}

describe('UnderwriterDashboardComponent', () => {
  it('loads the review queue on init', async () => {
    const { store } = await setup();

    expect(store.dispatch).toHaveBeenCalledWith(loadReviewPolicies());
  });

  it('computes the decision cards from the underwriter\'s own review history', async () => {
    const { component } = await setup(
      of([
        { decision: 'APPROVED', sumInsured: 100000 },
        { decision: 'APPROVED', sumInsured: 50000 },
        { decision: 'REJECTED', sumInsured: 80000 },
      ]),
    );

    expect(await firstValueFrom(component.approvedCount$)).toBe(2);
    expect(await firstValueFrom(component.approvedCover$)).toBe(150000);
    expect(await firstValueFrom(component.approvalRate$)).toBe(66.7);
  });

  it('shows zeros when the review history cannot be loaded', async () => {
    const { component } = await setup(throwError(() => new Error('down')));

    expect(await firstValueFrom(component.approvedCount$)).toBe(0);
    expect(await firstValueFrom(component.approvalRate$)).toBe(0);
  });
});
