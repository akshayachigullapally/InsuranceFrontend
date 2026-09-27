import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginatorComponent } from './paginator.component';

describe('PaginatorComponent', () => {
  let fixture: ComponentFixture<PaginatorComponent>;
  let component: PaginatorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginatorComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(PaginatorComponent);
    component = fixture.componentInstance;
  });

  function buttons(): { previous: HTMLButtonElement; next: HTMLButtonElement } {
    const [previous, next] = fixture.nativeElement.querySelectorAll('button');
    return { previous, next };
  }

  it('shows the current page', () => {
    fixture.componentRef.setInput('page', 3);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Showing page 3');
  });

  it('disables Previous on the first page', () => {
    fixture.detectChanges();

    expect(buttons().previous.disabled).toBe(true);
    expect(buttons().next.disabled).toBe(false);
  });

  it('disables Next when disableNext is true', () => {
    fixture.componentRef.setInput('page', 2);
    fixture.componentRef.setInput('disableNext', true);
    fixture.detectChanges();

    expect(buttons().previous.disabled).toBe(false);
    expect(buttons().next.disabled).toBe(true);
  });

  it('emits next and previous when the buttons are clicked', () => {
    const nextSpy = vi.fn();
    const previousSpy = vi.fn();
    component.next.subscribe(nextSpy);
    component.previous.subscribe(previousSpy);
    fixture.componentRef.setInput('page', 2);
    fixture.detectChanges();

    buttons().next.click();
    buttons().previous.click();

    expect(nextSpy).toHaveBeenCalledTimes(1);
    expect(previousSpy).toHaveBeenCalledTimes(1);
  });
});
