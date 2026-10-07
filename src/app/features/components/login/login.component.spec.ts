import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoginComponent } from './login.component';
import { clearAuthError } from '../../state/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../state/auth/auth.selectors';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let store: MockStore;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideMockStore({
          selectors: [
            { selector: selectAuthLoading, value: false },
            { selector: selectAuthError, value: null },
          ],
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(LoginComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });



  it('clears any previous auth error on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(clearAuthError());
  });

  it('disables the submit button while loading', () => {
    store.overrideSelector(selectAuthLoading, true);
    store.refreshState();
    fixture.detectChanges();

    const button = element.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Please wait');
  });

  it('toggles password visibility with the eye button', () => {
    const input = element.querySelector('#password') as HTMLInputElement;
    const toggle = element.querySelector('button[aria-label="Show password"]') as HTMLButtonElement;

    expect(input.type).toBe('password');
    expect(toggle.type).toBe('button');

    toggle.click();
    fixture.detectChanges();

    expect(input.type).toBe('text');
    expect(element.querySelector('button[aria-label="Hide password"]')).not.toBeNull();

    (element.querySelector('button[aria-label="Hide password"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(input.type).toBe('password');
  });
});
