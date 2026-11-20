import { Component, computed, input } from '@angular/core';
import { formatMoney } from '../lib/fees';

export interface Series {
  label: string;
  values: number[];
}

const W = 640;
const H = 280;
const PAD = { left: 72, right: 16, top: 12, bottom: 32 };
const COLORS = ['var(--s1)', 'var(--s2)', 'var(--s3)'];
const DASHES = ['', '8 5', '2 4'];

/** Line chart of yearly balances. Fixed viewBox, so it scales with its container without measuring. */
@Component({
  selector: 'app-growth-chart',
  templateUrl: './growth-chart.html',
  styleUrl: './growth-chart.css',
})
export class GrowthChart {
  readonly series = input.required<Series[]>();
  readonly summary = input.required<string>();

  protected readonly W = W;
  protected readonly H = H;
  protected readonly PAD = PAD;

  private readonly years = computed(() => Math.max(1, (this.series()[0]?.values.length ?? 1) - 1));
  private readonly yMax = computed(() => niceCeil(Math.max(1, ...this.series().flatMap((s) => s.values))));

  private x(year: number): number {
    return PAD.left + (year / this.years()) * (W - PAD.left - PAD.right);
  }

  private y(value: number): number {
    return H - PAD.bottom - (value / this.yMax()) * (H - PAD.top - PAD.bottom);
  }

  protected readonly lines = computed(() =>
    this.series().map((s, i) => ({
      label: s.label,
      color: COLORS[i % COLORS.length],
      dash: DASHES[i % DASHES.length],
      points: s.values.map((v, year) => `${this.x(year).toFixed(1)},${this.y(v).toFixed(1)}`).join(' '),
    })),
  );

  protected readonly yTicks = computed(() =>
    [0, 0.25, 0.5, 0.75, 1].map((f) => ({ y: this.y(f * this.yMax()), label: formatMoney(f * this.yMax()) })),
  );

  protected readonly xTicks = computed(() => {
    const years = this.years();
    const step = years <= 10 ? 1 : years <= 25 ? 5 : 10;
    const ticks = [];
    for (let year = 0; year <= years; year += step) ticks.push({ x: this.x(year), label: String(year) });
    return ticks;
  });
}

/** Round up to 1, 2, 2.5 or 5 times a power of ten so axis labels stay readable. */
export function niceCeil(value: number): number {
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const step = [1, 2, 2.5, 5, 10].find((m) => m * magnitude >= value)!;
  return step * magnitude;
}
