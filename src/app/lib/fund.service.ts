import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith } from 'rxjs';
import { Fund, MAX_COMPARE } from './fund';

export type FundsState =
  | { status: 'loading' }
  | { status: 'ready'; funds: Fund[] }
  | { status: 'error' };

@Injectable({ providedIn: 'root' })
export class FundService {
  private readonly http = inject(HttpClient);

  /** Relative URL so it resolves against <base href> on GitHub Pages too. */
  readonly state = toSignal(
    this.http.get<Fund[]>('funds.json').pipe(
      map((funds): FundsState => ({ status: 'ready', funds })),
      catchError(() => of<FundsState>({ status: 'error' })),
      startWith<FundsState>({ status: 'loading' }),
    ),
    { requireSync: true },
  );

  /** Funds ticked on the list page; kept here so going back from Compare keeps them. */
  readonly selected = signal<string[]>([]);

  toggle(id: string): void {
    this.selected.update((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : ids.length < MAX_COMPARE ? [...ids, id] : ids,
    );
  }
}
