import { Component } from '@angular/core';

/**
 * The ClimateSure illustration: a city under a rain cloud, protected by a shield.
 * Decorative only, so it is hidden from screen readers.
 */
@Component({
  selector: 'app-climate-illustration',
  standalone: true,
  templateUrl: './climate-illustration.component.html',
  styleUrl: './climate-illustration.component.css',
})
export class ClimateIllustrationComponent {
  /** x positions of the rain streaks under the cloud. */
  protected readonly rain = [138, 156, 174, 192, 210, 228, 246, 264];
}
