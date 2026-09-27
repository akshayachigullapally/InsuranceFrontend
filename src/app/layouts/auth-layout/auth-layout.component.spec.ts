import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { EMPTY } from 'rxjs';
import { AuthLayoutComponent } from './auth-layout.component';
import { pageTestProviders } from '../../../testing/test-helpers';

describe('AuthLayoutComponent', () => {
  let fixture: ComponentFixture<AuthLayoutComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLayoutComponent],
      providers: [...pageTestProviders(), provideMockActions(() => EMPTY)],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthLayoutComponent);
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
