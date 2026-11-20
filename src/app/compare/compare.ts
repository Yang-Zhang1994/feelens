import { Component, computed, effect, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { GrowthChart, Series } from '../chart/growth-chart';
import { balances, formatMoney, outcome } from '../lib/fees';
import { Fund, parseIds } from '../lib/fund';
import { FundService } from '../lib/fund.service';

type Field = 'initial' | 'monthly' | 'years' | 'grossReturn';

const LIMITS: Record<Field, { min: number; max: number }> = {
  initial: { min: 0, max: 10_000_000 },
  monthly: { min: 0, max: 100_000 },
  years: { min: 1, max: 50 },
  grossReturn: { min: -5, max: 15 },
};

function rules(field: Field) {
  return [Validators.required, Validators.min(LIMITS[field].min), Validators.max(LIMITS[field].max)];
}

@Component({
  selector: 'app-compare',
  imports: [ReactiveFormsModule, RouterLink, GrowthChart],
  templateUrl: './compare.html',
  styleUrl: './compare.css',
})
export class Compare {
  private readonly service = inject(FundService);

  /** Bound from the ?ids= query parameter, so a comparison can be shared as a link. */
  readonly ids = input<string>();

  protected readonly state = this.service.state;
  protected readonly money = formatMoney;

  protected readonly form = inject(NonNullableFormBuilder).group({
    initial: [10_000, rules('initial')],
    monthly: [300, [...rules('monthly')]],
    years: [25, [...rules('years'), Validators.pattern(/^\d+$/)]],
    grossReturn: [6, rules('grossReturn')],
  });
  private readonly plan = toSignal(
    this.form.valueChanges.pipe(map(() => (this.form.valid ? this.form.getRawValue() : null))),
    { initialValue: this.form.getRawValue() },
  );

  protected readonly chosen = computed<Fund[]>(() => {
    const state = this.state();
    if (state.status !== 'ready') return [];
    const ids = parseIds(this.ids() ?? null, state.funds);
    return ids.map((id) => state.funds.find((f) => f.id === id)!);
  });

  protected readonly rows = computed(() => {
    const plan = this.plan();
    if (!plan) return [];
    const rows = [...this.chosen()].sort((a, b) => a.mer - b.mer).map((fund) => ({ fund, ...outcome(plan, fund.mer) }));
    return rows.map((row) => ({ ...row, behindCheapest: rows[0].endValue - row.endValue }));
  });

  protected readonly series = computed<Series[]>(() => {
    const plan = this.plan();
    return plan ? this.rows().map((r) => ({ label: `${r.fund.name} (${r.fund.mer.toFixed(2)}%)`, values: balances(plan, r.fund.mer) })) : [];
  });

  protected readonly insight = computed(() => {
    const rows = this.rows();
    const plan = this.plan();
    if (rows.length < 2 || !plan) return '';
    const cheap = rows[0];
    const dear = rows.at(-1)!;
    return (
      `Over ${plan.years} years, ${dear.fund.name} (${dear.fund.mer.toFixed(2)}%) would leave you ` +
      `${formatMoney(dear.behindCheapest)} less than ${cheap.fund.name} (${cheap.fund.mer.toFixed(2)}%).`
    );
  });

  constructor() {
    // A shared link should show the same funds ticked when the user goes back to edit the selection.
    effect(() => {
      const ids = this.chosen().map((f) => f.id);
      if (ids.length) this.service.selected.set(ids);
    });
  }

  protected error(field: Field): string | null {
    const control = this.form.controls[field];
    if (control.valid) return null;
    const { min, max } = LIMITS[field];
    if (control.hasError('required')) return 'Required.';
    if (control.hasError('pattern')) return 'Use whole years.';
    return `Enter a value from ${min.toLocaleString('en-CA')} to ${max.toLocaleString('en-CA')}.`;
  }
}
