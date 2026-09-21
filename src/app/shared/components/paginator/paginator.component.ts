import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  standalone: true,
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.css',
})
export class PaginatorComponent {
  readonly page = input<number>(1);
  readonly disableNext = input<boolean>(false);
  readonly next = output<void>();
  readonly previous = output<void>();
}