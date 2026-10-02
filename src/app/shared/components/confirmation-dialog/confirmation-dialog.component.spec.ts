import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmationDialogComponent>;
  let component: ConfirmationDialogComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
  });

  function buttons(): { cancel: HTMLButtonElement; confirm: HTMLButtonElement } {
    const [cancel, confirm] = fixture.nativeElement.querySelectorAll('button');
    return { cancel, confirm };
  }

  it('renders the default title and button labels', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h2').textContent).toContain('Are you sure?');
    expect(buttons().cancel.textContent?.trim()).toBe('Cancel');
    expect(buttons().confirm.textContent?.trim()).toBe('Confirm');
  });

  it('renders custom title, message and labels', () => {
    fixture.componentRef.setInput('title', 'Cancel policy?');
    fixture.componentRef.setInput('message', 'This cannot be undone.');
    fixture.componentRef.setInput('confirmLabel', 'Yes, cancel');
    fixture.componentRef.setInput('cancelLabel', 'Keep it');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Cancel policy?');
    expect(text).toContain('This cannot be undone.');
    expect(buttons().confirm.textContent?.trim()).toBe('Yes, cancel');
    expect(buttons().cancel.textContent?.trim()).toBe('Keep it');
  });

  it('uses the danger button style when danger is set', () => {
    fixture.componentRef.setInput('danger', true);
    fixture.detectChanges();

    expect(buttons().confirm.className).toContain('btn-danger');
  });

  it('emits confirmed and dismissed from the buttons', () => {
    const confirmed = vi.fn();
    const dismissed = vi.fn();
    component.confirmed.subscribe(confirmed);
    component.dismissed.subscribe(dismissed);
    fixture.detectChanges();

    buttons().confirm.click();
    buttons().cancel.click();

    expect(confirmed).toHaveBeenCalledTimes(1);
    expect(dismissed).toHaveBeenCalledTimes(1);
  });
});
