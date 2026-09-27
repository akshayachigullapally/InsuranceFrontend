import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { EMPTY } from 'rxjs';
import { PublicLayoutComponent } from './public-layout.component';
import { pageTestProviders } from '../../../testing/test-helpers';

describe('PublicLayoutComponent', () => {
  let fixture: ComponentFixture<PublicLayoutComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicLayoutComponent],
      providers: [...pageTestProviders(), provideMockActions(() => EMPTY)],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicLayoutComponent);
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

  it('renders the footer', () => {
    expect(element.querySelector('app-footer')).not.toBeNull();
  });
});
