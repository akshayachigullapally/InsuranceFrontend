import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(StatusBadgeComponent);
  });

  function render(status: string, label: string | null = null): HTMLElement {
    fixture.componentRef.setInput('status', status);
    fixture.componentRef.setInput('label', label);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('span');
  }

  it('shows the status as the label by default', () => {
    expect(render('ACTIVE').textContent?.trim()).toBe('ACTIVE');
  });

  it('prefers a custom label when provided', () => {
    expect(render('UNDER_REVIEW', 'Under review').textContent?.trim()).toBe('Under review');
  });

  it.each([
    ['ACTIVE', 'bg-green-100'],
    ['approved', 'bg-green-100'],
    ['PENDING', 'bg-blue-100'],
    ['UNDER_REVIEW', 'bg-amber-100'],
    ['REJECTED', 'bg-red-100'],
    ['CANCELLED', 'bg-gray-100'],
    ['SOMETHING_ELSE', 'text-gray-700'],
  ])('uses the right colour for %s', (status, expectedClass) => {
    expect(render(status).className).toContain(expectedClass);
  });
});
