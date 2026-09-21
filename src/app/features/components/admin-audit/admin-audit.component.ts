import { Component } from '@angular/core';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [EmptyStateComponent],
  templateUrl: './admin-audit.component.html',
  styleUrl: './admin-audit.component.css',
})
export class AdminAuditComponent {}
