import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClimateIllustrationComponent } from './climate-illustration.component';

describe('ClimateIllustrationComponent', () => {
  let fixture: ComponentFixture<ClimateIllustrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ClimateIllustrationComponent] }).compileComponents();
    fixture = TestBed.createComponent(ClimateIllustrationComponent);
  });

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('draws the scene with rain, and hides it from screen readers', () => {
    fixture.detectChanges();

    expect(element().querySelector('svg.art')).not.toBeNull();
    expect(element().querySelectorAll('.rain-drop').length).toBe(8);
    expect(element().querySelector('.scene')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('shows the threshold and payout story cards in the hero variant', () => {
    fixture.detectChanges();

    expect(element().textContent).toContain('150 mm threshold');
    expect(element().textContent).toContain('Trigger matched');
    expect(element().textContent).toContain('Payout sent');
  });

  it('shows only the artwork in the compact variant', () => {
    fixture.componentRef.setInput('variant', 'compact');
    fixture.detectChanges();

    expect(element().querySelector('svg.art')).not.toBeNull();
    expect(element().querySelectorAll('.float-card').length).toBe(0);
  });
});
