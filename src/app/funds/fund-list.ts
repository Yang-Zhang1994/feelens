import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { FundFilter, MAX_COMPARE, filterFunds } from '../lib/fund';
import { FundService } from '../lib/fund.service';

@Component({
  selector: 'app-fund-list',
  imports: [ReactiveFormsModule],
  templateUrl: './fund-list.html',
  styleUrl: './fund-list.css',
})
export class FundList {
  private readonly service = inject(FundService);
  private readonly router = inject(Router);

  protected readonly max = MAX_COMPARE;
  protected readonly state = this.service.state;
  protected readonly selected = this.service.selected;

  protected readonly filter = inject(NonNullableFormBuilder).group({
    search: '',
    category: 'All' as FundFilter['category'],
    sort: 'mer-asc' as FundFilter['sort'],
  });
  private readonly filterValue = toSignal(this.filter.valueChanges.pipe(map(() => this.filter.getRawValue())), {
    initialValue: this.filter.getRawValue(),
  });

  protected readonly visible = computed(() => {
    const state = this.state();
    return state.status === 'ready' ? filterFunds(state.funds, this.filterValue()) : [];
  });

  protected isSelected(id: string): boolean {
    return this.selected().includes(id);
  }

  protected toggle(id: string): void {
    this.service.toggle(id);
  }

  protected compare(): void {
    this.router.navigate(['/compare'], { queryParams: { ids: this.selected().join(',') } });
  }
}
