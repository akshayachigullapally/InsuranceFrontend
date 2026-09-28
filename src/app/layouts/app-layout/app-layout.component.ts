import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';

// Shared shell for every signed-in area (customer, underwriter, claims officer, admin).
@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header />
    <main class="min-h-[calc(100vh-4rem)]">
      <router-outlet />
    </main>
  `,
})
export class AppLayoutComponent {}
