import { TestBed } from '@angular/core/testing';
import { Toast, ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;
  let current: Toast[];

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
    service.toasts$.subscribe((toasts) => (current = toasts));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with no toasts', () => {
    expect(current).toEqual([]);
  });

  it('adds a toast with an id and defaults the type to info', () => {
    service.show({ title: 'Saved', message: 'Profile updated' });

    expect(current).toEqual([
      { id: 1, title: 'Saved', message: 'Profile updated', icon: undefined, type: 'info' },
    ]);
  });

  it('keeps the given type and gives each toast a new id', () => {
    service.show({ title: 'One', message: '', type: 'error' });
    service.show({ title: 'Two', message: '', type: 'success' });

    expect(current.map((toast) => toast.id)).toEqual([1, 2]);
    expect(current.map((toast) => toast.type)).toEqual(['error', 'success']);
  });

  it('dismisses a toast by id', () => {
    service.show({ title: 'One', message: '' });
    service.show({ title: 'Two', message: '' });

    service.dismiss(1);

    expect(current.map((toast) => toast.title)).toEqual(['Two']);
  });

  it('removes a toast automatically after six seconds', () => {
    service.show({ title: 'Temporary', message: '' });

    vi.advanceTimersByTime(5999);
    expect(current.length).toBe(1);

    vi.advanceTimersByTime(1);
    expect(current.length).toBe(0);
  });
});
