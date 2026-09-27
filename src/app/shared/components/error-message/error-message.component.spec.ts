import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  let fixture: ComponentFixture<ErrorMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorMessageComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ErrorMessageComponent);
  });

  it('renders nothing when there is no error', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('renders the error text in an alert', () => {
    fixture.componentRef.setInput('error', 'Invalid email or password');
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement;
    expect(alert).not.toBeNull();
    expect(alert.textContent?.trim()).toBe('Invalid email or password');
  });

  it('hides the alert again when the error is cleared', () => {
    fixture.componentRef.setInput('error', 'Oops');
    fixture.detectChanges();
    fixture.componentRef.setInput('error', null);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });
});
