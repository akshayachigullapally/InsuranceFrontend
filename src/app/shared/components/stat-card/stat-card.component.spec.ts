import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatCardComponent } from './stat-card.component';

describe('StatCardComponent', () => {
  let fixture: ComponentFixture<StatCardComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCardComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(StatCardComponent);
    element = fixture.nativeElement;
  });

  it('renders the label, value and hint', () => {
    fixture.componentRef.setInput('label', 'Active policies');
    fixture.componentRef.setInput('value', 12);
    fixture.componentRef.setInput('hint', 'Currently in force');
    fixture.detectChanges();

    expect(element.textContent).toContain('Active policies');
    expect(element.textContent).toContain('12');
    expect(element.textContent).toContain('Currently in force');
  });

  it('hides the hint and trend when they are not set', () => {
    fixture.detectChanges();

    expect(element.querySelector('.text-gray-400')).toBeNull();
    expect(element.textContent).not.toContain('▲');
  });

  it('shows an up arrow with a success colour for an upward trend', () => {
    fixture.componentRef.setInput('trend', 'up');
    fixture.detectChanges();

    const badge = element.querySelector('span.rounded-full') as HTMLElement;
    expect(badge.textContent?.trim()).toBe('▲');
    expect(badge.className).toContain('bg-success-50');
  });

  it('shows a down arrow for a downward trend', () => {
    fixture.componentRef.setInput('trend', 'down');
    fixture.detectChanges();

    expect(element.textContent).toContain('▼');
  });

  it('applies the icon colour class for the chosen colour', () => {
    fixture.componentRef.setInput('color', 'red');
    fixture.detectChanges();

    const icon = element.querySelector('.size-11') as HTMLElement;
    expect(icon.className).toContain('bg-danger-50');
  });
});
