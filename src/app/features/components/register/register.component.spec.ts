import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { RegisterComponent } from './register.component';
import { clearAuthError, register } from '../../state/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../state/auth/auth.selectors';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let store: MockStore;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
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
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  function fill(values: { fullName: string; email: string; password: string }): void {
    component.registerForm.setValue(values);
  }

  function submit(): void {
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('clears any previous auth error on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(clearAuthError());
  });

  it('shows all validation messages when submitted empty', () => {
    submit();

    expect(element.textContent).toContain('Full name must be at least 2 characters.');
    expect(element.textContent).toContain('A valid email is required.');
    expect(element.textContent).toContain('Password must be at least 8 characters.');
    expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: register.type }));
  });

  it('rejects a short name and short password', () => {
    fill({ fullName: 'A', email: 'asha@example.com', password: 'short' });

    expect(component.registerForm.get('fullName')?.hasError('minlength')).toBe(true);
    expect(component.registerForm.get('password')?.hasError('minlength')).toBe(true);
    expect(component.registerForm.valid).toBe(false);
  });

  it('dispatches register with the form values when valid', () => {
    const values = { fullName: 'Asha Rao', email: 'asha@example.com', password: 'secret123' };
    fill(values);

    submit();

    expect(store.dispatch).toHaveBeenCalledWith(register({ request: values }));
  });

  it('shows the auth error from the store', () => {
    store.overrideSelector(selectAuthError, 'Email already registered');
    store.refreshState();
    fixture.detectChanges();

    expect(element.textContent).toContain('Email already registered');
  });

  it('disables the submit button while loading', () => {
    store.overrideSelector(selectAuthLoading, true);
    store.refreshState();
    fixture.detectChanges();

    expect((element.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(true);
  });
});
