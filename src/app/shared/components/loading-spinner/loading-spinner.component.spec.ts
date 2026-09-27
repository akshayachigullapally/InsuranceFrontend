import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(LoadingSpinnerComponent);
  });

  it('creates the spinner', () => {
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the given label', () => {
    fixture.componentRef.setInput('label', 'Loading claims...');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading claims...');
  });
});
