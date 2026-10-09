import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { StaffProfileComponent } from './staff-profile.component';
import { AuthService } from '../../services/auth.service';

describe('StaffProfileComponent', () => {
  async function render(me: () => unknown) {
    await TestBed.configureTestingModule({
      imports: [StaffProfileComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: { me } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(StaffProfileComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the signed-in staff account and links back to the right dashboard', async () => {
    const page = await render(() =>
      of({ id: 2, fullName: 'Anil Rao', email: 'uw1@gmail.com', role: 'ROLE_UNDERWRITER', enabled: true }),
    );

    expect(page.textContent).toContain('Anil Rao');
    expect(page.textContent).toContain('uw1@gmail.com');
    expect(page.textContent).toContain('Underwriter');
    expect(page.textContent).toContain('AR');
    expect(page.querySelector('a')?.getAttribute('href')).toBe('/underwriter/dashboard');
  });

  it('shows a message when the profile cannot be loaded', async () => {
    const page = await render(() => throwError(() => new Error('down')));

    expect(page.querySelector('[role=alert]')?.textContent).toContain('could not be loaded');
  });
});
