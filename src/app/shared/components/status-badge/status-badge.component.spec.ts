import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent, humanizeStatus } from './status-badge.component';

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

  it('shows a readable version of the status by default', () => {
    expect(render('ACTIVE').textContent?.trim()).toBe('Active');
    expect(render('UNDER_REVIEW').textContent?.trim()).toBe('Under review');
  });

  it('prefers a custom label when provided', () => {
    expect(render('UNDER_REVIEW', 'In assessment').textContent?.trim()).toBe('In assessment');
  });

  it('shows a coloured dot that matches the badge', () => {
    const badge = render('REJECTED');
    expect(badge.querySelector('span')!.className).toContain('bg-red-500');
  });

  it.each([
    ['ACTIVE', 'bg-green-50'],
    ['approved', 'bg-green-50'],
    ['SETTLED', 'bg-green-50'],
    ['PENDING', 'bg-blue-50'],
    ['UNDER_REVIEW', 'bg-amber-50'],
    ['PROCESSING', 'bg-amber-50'],
    ['REJECTED', 'bg-red-50'],
    ['REFUNDED', 'bg-violet-50'],
    ['CANCELLED', 'bg-gray-100'],
    ['SOMETHING_ELSE', 'text-gray-700'],
  ])('uses the right colour for %s', (status, expectedClass) => {
    expect(render(status).className).toContain(expectedClass);
  });

  it('humanizes status codes', () => {
    expect(humanizeStatus('INSUFFICIENT_OBSERVATIONS')).toBe('Insufficient observations');
  });
});
