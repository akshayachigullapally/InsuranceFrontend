import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface ArchivedItem {
  id: number;
  name: string;
  detail?: string | null;
}

/** Collapsible list of archived records with a Restore button for each. */
@Component({
  selector: 'app-archived-items',
  standalone: true,
  templateUrl: './archived-items.component.html',
})
export class ArchivedItemsComponent {
  /** e.g. "perils"; used in the button and empty text. */
  @Input({ required: true }) label!: string;
  @Input() items: ArchivedItem[] = [];
  @Input() open = false;
  @Input() loading = false;
  @Input() restoringId: number | null = null;

  @Output() toggled = new EventEmitter<void>();
  @Output() restore = new EventEmitter<number>();
}
