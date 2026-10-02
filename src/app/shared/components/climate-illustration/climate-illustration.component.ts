import { Component, input } from '@angular/core';

type Sensor = 'rain' | 'wind' | 'temperature' | 'river' | 'soil' | 'humidity';

interface SensorBadge {
  kind: Sensor;
  label: string;
  x: number;
  y: number;
}

/** Centre and radius of the dotted orbit the sensor badges sit on (SVG units). */
const ORBIT = { cx: 260, cy: 205, r: 168 };

/** Angle on the orbit for each sensor, in degrees clockwise from 3 o'clock. */
const SENSORS: { kind: Sensor; label: string; angle: number }[] = [
  { kind: 'rain', label: 'Rainfall', angle: -65 },
  { kind: 'wind', label: 'Wind', angle: -20 },
  { kind: 'temperature', label: 'Temperature', angle: 25 },
  { kind: 'river', label: 'River level', angle: 108 },
  { kind: 'soil', label: 'Soil moisture', angle: 150 },
  { kind: 'humidity', label: 'Humidity', angle: 195 },
];

/**
 * The ClimateSure illustration: a city under a rain cloud, protected by a shield,
 * ringed by the six measurements the platform monitors. Labels can be turned off
 * where the artwork is shown too small to read them (dashboard banners).
 * Decorative only, so it is hidden from screen readers.
 */
@Component({
  selector: 'app-climate-illustration',
  standalone: true,
  templateUrl: './climate-illustration.component.html',
  styleUrl: './climate-illustration.component.css',
})
export class ClimateIllustrationComponent {
  readonly labels = input(true);

  /** x positions of the rain streaks under the cloud. */
  protected readonly rain = [138, 156, 174, 192, 210, 228, 246, 264];

  protected readonly sensors: SensorBadge[] = SENSORS.map(({ kind, label, angle }) => {
    const radians = (angle * Math.PI) / 180;
    return {
      kind,
      label,
      x: Math.round((ORBIT.cx + ORBIT.r * Math.cos(radians)) * 10) / 10,
      y: Math.round((ORBIT.cy + ORBIT.r * Math.sin(radians)) * 10) / 10,
    };
  });
}
