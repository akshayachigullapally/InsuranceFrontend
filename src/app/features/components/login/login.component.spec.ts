import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoginComponent } from './login.component';
import { clearAuthError, login } from '../../state/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../state/auth/auth.selectors';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
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
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  function typeInto(id: string, value: string): void {
    const input = element.querySelector(`#${id}`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function submit(): void {
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('clears any previous auth error on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(clearAuthError());
  });

  it('starts with an invalid, empty form', () => {
    expect(component.loginForm.valid).toBe(false);
    expect(component.loginForm.value).toEqual({ email: '', password: '' });
  });

  it('shows validation messages and does not log in when submitted empty', () => {
    submit();

    expect(element.textContent).toContain('A valid email is required.');
    expect(element.textContent).toContain('Password is required.');
    expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: login.type }));
  });

  it('rejects an invalid email address', () => {
    typeInto('email', 'not-an-email');
    typeInto('password', 'secret123');

    expect(component.loginForm.get('email')?.hasError('email')).toBe(true);
    expect(component.loginForm.valid).toBe(false);
  });

  it('dispatches login with the form values when valid', () => {
    typeInto('email', 'asha@example.com');
    typeInto('password', 'secret123');

    submit();

    expect(store.dispatch).toHaveBeenCalledWith(
      login({ request: { email: 'asha@example.com', password: 'secret123' } }),
    );
  });

  it('shows the auth error from the store', () => {
    store.overrideSelector(selectAuthError, 'Invalid credentials');
    store.refreshState();
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Invalid credentials');
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
