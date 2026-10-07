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
});
