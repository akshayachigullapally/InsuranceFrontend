import { TestBed } from '@angular/core/testing';
import { ArchivedItemsComponent } from './archived-items.component';

describe('ArchivedItemsComponent', () => {
  it('stays collapsed until opened, then lists items with a Restore button each', () => {
    const fixture = TestBed.createComponent(ArchivedItemsComponent);
    fixture.componentRef.setInput('label', 'perils');
    fixture.componentRef.setInput('items', [{ id: 7, name: 'Cyclone', detail: 'CYCLONE' }]);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Show archived');
    expect(el.querySelector('li')).toBeNull();

    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(el.textContent).toContain('Archived perils (1)');
    expect(el.querySelector('li')?.textContent).toContain('Cyclone');

    const restored: number[] = [];
    fixture.componentInstance.restore.subscribe((id: number) => restored.push(id));
    (el.querySelector('li button') as HTMLButtonElement).click();
    expect(restored).toEqual([7]);
  });

  it('disables the button of the item being restored and shows an empty message', () => {
    const fixture = TestBed.createComponent(ArchivedItemsComponent);
    fixture.componentRef.setInput('label', 'zones');
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('items', [{ id: 3, name: 'Pune Central Zone' }]);
    fixture.componentRef.setInput('restoringId', 3);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('li button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Restoring');

    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No archived zones.');
  });
});
