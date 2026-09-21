import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-underwriter-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header />
    <main class="min-h-[calc(100vh-4rem)]">
      <router-outlet />
    </main>
  `,
})
export class UnderwriterLayoutComponent {}
