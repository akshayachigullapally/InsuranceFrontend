import { Component, computed, input } from '@angular/core';

interface PanelCopy {
  headline: string;
  highlight: string;
  body: string;
}

const COPY: Record<'login' | 'register', PanelCopy> = {
  login: {
    headline: 'Weather cover that',
    highlight: 'pays automatically',
    body: 'Sign in to see your policies and claims.',
  },
  register: {
    headline: 'Weather cover that',
    highlight: 'pays automatically',
    body: 'Create an account to get started.',
  },
};

/** Left-hand brand panel shared by the sign-in and sign-up pages. Purely decorative. */
@Component({
  selector: 'app-auth-brand-panel',
  standalone: true,
  templateUrl: './auth-brand-panel.component.html',
  styleUrl: './auth-brand-panel.component.css',
})
export class AuthBrandPanelComponent {
  readonly mode = input<'login' | 'register'>('login');
  protected readonly copy = computed(() => COPY[this.mode()]);
}
