import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { EMPTY } from 'rxjs';
import { UnderwriterLayoutComponent } from './underwriter-layout.component';
import { pageTestProviders } from '../../../testing/test-helpers';

describe('UnderwriterLayoutComponent', () => {
  let fixture: ComponentFixture<UnderwriterLayoutComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnderwriterLayoutComponent],
      providers: [...pageTestProviders(), provideMockActions(() => EMPTY)],
    }).compileComponents();

    fixture = TestBed.createComponent(UnderwriterLayoutComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('creates the layout', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the header', () => {
    expect(element.querySelector('app-header')).not.toBeNull();
  });

  it('renders a router outlet inside main for the child page', () => {
    expect(element.querySelector('main router-outlet')).not.toBeNull();
  });
});
