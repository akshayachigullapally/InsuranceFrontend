import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { WelcomeComponent } from './welcome.component';
import { pageTestProviders } from '../../../../testing/test-helpers';
import { loadProducts } from '../../state/products/products.actions';

describe('WelcomeComponent', () => {
  let fixture: ComponentFixture<WelcomeComponent>;
  let component: WelcomeComponent;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeComponent],
      providers: pageTestProviders(),
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the public products on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(loadProducts());
  });

  it('defines the marketing content', () => {
    expect(component.features.length).toBe(6);
    expect(component.steps.map((step) => step.number)).toEqual(['1', '2', '3', '4']);
    expect(component.stats.length).toBe(4);
  });

  it('renders the feature titles', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Automatic evaluation');
    expect(text).toContain('Get paid automatically');
  });

  it('falls back to the OTHER icon for unknown categories', () => {
    const icon = component['categoryIcon'];

    expect(icon.call(component, 'SOMETHING_NEW')).toBe(icon.call(component, 'OTHER'));
  });
});
