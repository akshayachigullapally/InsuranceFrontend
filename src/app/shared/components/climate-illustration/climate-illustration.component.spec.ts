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

  it('rings the shield with the six monitored measurements, labelled', () => {
    fixture.detectChanges();

    const sensors = Array.from(element().querySelectorAll('[data-sensor]')).map((g) => g.getAttribute('data-sensor'));
    expect(sensors).toEqual(['rain', 'wind', 'temperature', 'river', 'soil', 'humidity']);
    const labels = Array.from(element().querySelectorAll('.sensor-label')).map((t) => t.textContent!.trim());
    expect(labels).toEqual(['Rainfall', 'Wind', 'Temperature', 'River level', 'Soil moisture', 'Humidity']);
  });

  it('keeps the icons but drops the labels when labels are off', () => {
    fixture.componentRef.setInput('labels', false);
    fixture.detectChanges();

    expect(element().querySelectorAll('[data-sensor]').length).toBe(6);
    expect(element().querySelectorAll('.sensor-label').length).toBe(0);
  });
});
