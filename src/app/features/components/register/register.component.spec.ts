import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { RegisterComponent } from './register.component';
import { clearAuthError, register } from '../../state/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../state/auth/auth.selectors';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
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
    element = fixture.nativeElement;
    fixture.detectChanges();
  });


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
    expect(store.dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: register.type }),
    );
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
