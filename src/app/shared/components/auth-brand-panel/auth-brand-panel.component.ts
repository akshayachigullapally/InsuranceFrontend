import { Component, computed, input } from '@angular/core';

interface PanelCopy {
  eyebrow: string;
  headline: string;
  highlight: string;
  body: string;
}

const COPY: Record<'login' | 'register', PanelCopy> = {
  login: {
    eyebrow: 'Welcome back',
    headline: 'Cover that keeps',
    highlight: 'watching the sky',
    body: 'Your policies, live weather triggers and claim payouts are waiting for you.',
  },
  register: {
    eyebrow: 'Parametric insurance',
    headline: 'Protection that pays when',
    highlight: 'the weather crosses the line',
    body: 'Pick a threshold, get approved, and let real measurements open your claim.',
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

  protected readonly sensors = [
    { icon: '🌧️', label: 'Rainfall' },
    { icon: '🌊', label: 'River level' },
    { icon: '🌡️', label: 'Temperature' },
    { icon: '💨', label: 'Wind' },
  ];

  protected readonly steps = ['Measure', 'Match', 'Pay'];
}
