import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastHostComponent } from './toast-host.component';
import { ToastService } from '../../services/toast.service';

describe('ToastHostComponent', () => {
  let fixture: ComponentFixture<ToastHostComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [ToastHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ToastHostComponent);
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function toasts(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[role="alert"]'));
  }

  it('renders nothing when there are no toasts', () => {
    expect(toasts().length).toBe(0);
  });

  it('renders a toast with its title, message and icon', () => {
    toastService.show({ title: 'Claim approved', message: 'Payout is on the way', icon: '✅', type: 'success' });
    fixture.detectChanges();

    const [toast] = toasts();
    expect(toast.textContent).toContain('Claim approved');
    expect(toast.textContent).toContain('Payout is on the way');
    expect(toast.textContent).toContain('✅');
    expect(toast.className).toContain('border-green-200');
  });

  it('removes a toast when its dismiss button is clicked', () => {
    toastService.show({ title: 'One', message: '' });
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('button[aria-label="Dismiss notification"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(toasts().length).toBe(0);
  });

  it('uses a red border for error toasts', () => {
    toastService.show({ title: 'Failed', message: 'Try again', type: 'error' });
    fixture.detectChanges();

    expect(toasts()[0].className).toContain('border-red-200');
  });
});
