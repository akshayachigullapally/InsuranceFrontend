import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthBrandPanelComponent } from './auth-brand-panel.component';

describe('AuthBrandPanelComponent', () => {
  let fixture: ComponentFixture<AuthBrandPanelComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthBrandPanelComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AuthBrandPanelComponent);
    element = fixture.nativeElement;
  });

  it('shows the large logo, wordmark and four orbiting sensors', () => {
    fixture.detectChanges();

    expect(element.querySelector('.logo-tile svg')).not.toBeNull();
    expect(element.querySelector('.wordmark')?.textContent).toContain('ClimateSure');
    expect(element.querySelectorAll('.sensor-chip').length).toBe(4);
  });

  it('uses sign-in copy by default', () => {
    fixture.detectChanges();

    expect(element.querySelector('.eyebrow')?.textContent).toContain('Welcome back');
  });

  it('switches to sign-up copy in register mode', () => {
    fixture.componentRef.setInput('mode', 'register');
    fixture.detectChanges();

    expect(element.querySelector('.headline')?.textContent).toContain('crosses the line');
  });
});
