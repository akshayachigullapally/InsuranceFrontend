import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let fixture: ComponentFixture<SidebarComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(SidebarComponent);
    element = fixture.nativeElement;
  });

  it('renders no links by default', () => {
    fixture.detectChanges();

    expect(element.querySelectorAll('nav a').length).toBe(0);
  });

  it('renders one link per entry with label, icon and href', () => {
    fixture.componentRef.setInput('links', [
      { label: 'Dashboard', routerLink: '/admin/dashboard', icon: '🏠' },
      { label: 'Zones', routerLink: '/admin/zones', icon: '📍' },
    ]);
    fixture.detectChanges();

    const links = element.querySelectorAll('nav a');
    expect(links.length).toBe(2);
    expect(links[1].textContent).toContain('Zones');
    expect(links[1].textContent).toContain('📍');
    expect(links[1].getAttribute('href')).toBe('/admin/zones');
  });
});
