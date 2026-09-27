import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { firstValueFrom } from 'rxjs';
import { UnderwriterDashboardComponent } from './underwriter-dashboard.component';
import { mockRootState, pageTestProviders } from '../../../../testing/test-helpers';
import { loadAdminPolicies, loadReviewPolicies } from '../../state/policies/policies.actions';

async function setup(adminPolicies: unknown[]) {
  const root = mockRootState();
  await TestBed.configureTestingModule({
    imports: [UnderwriterDashboardComponent],
    providers: pageTestProviders({ policies: { ...root.policies, adminPolicies } }),
  }).compileComponents();

  const store = TestBed.inject(MockStore);
  vi.spyOn(store, 'dispatch');
  const fixture: ComponentFixture<UnderwriterDashboardComponent> =
    TestBed.createComponent(UnderwriterDashboardComponent);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, store };
}

describe('UnderwriterDashboardComponent', () => {
  it('loads the review queue and all policies on init', async () => {
    const { store } = await setup([]);

    expect(store.dispatch).toHaveBeenCalledWith(loadReviewPolicies());
    expect(store.dispatch).toHaveBeenCalledWith(loadAdminPolicies({}));
  });

  it('computes the approval rate to one decimal place', async () => {
    const { component } = await setup([
      { id: 1, status: 'ACTIVE', premiumAmount: 100 },
      { id: 2, status: 'EXPIRED', premiumAmount: 100 },
      { id: 3, status: 'REJECTED', premiumAmount: 100 },
    ]);

    expect(await firstValueFrom(component.approvalRate$)).toBe(66.7);
  });

  it('returns a zero approval rate when nothing has been decided', async () => {
    const { component } = await setup([{ id: 1, status: 'PENDING', premiumAmount: 100 }]);

    expect(await firstValueFrom(component.approvalRate$)).toBe(0);
  });

  it('sums the premium of active policies', async () => {
    const { component } = await setup([
      { id: 1, status: 'ACTIVE', premiumAmount: 1200 },
      { id: 2, status: 'ACTIVE', premiumAmount: 800 },
    ]);

    expect(await firstValueFrom(component.activePremium$)).toBe(2000);
  });
});
