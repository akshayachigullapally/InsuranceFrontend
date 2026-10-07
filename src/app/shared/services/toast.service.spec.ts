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

  it('keeps the given type and gives each toast a new id', () => {
    service.show({ title: 'One', message: '', type: 'error' });
    service.show({ title: 'Two', message: '', type: 'success' });

    expect(current.map((toast) => toast.id)).toEqual([1, 2]);
    expect(current.map((toast) => toast.type)).toEqual(['error', 'success']);
  });
});
