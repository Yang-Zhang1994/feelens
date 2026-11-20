import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'funds' },
  { path: 'funds', title: 'Funds · FeeLens', loadComponent: () => import('./funds/fund-list').then((m) => m.FundList) },
  { path: 'compare', title: 'Compare · FeeLens', loadComponent: () => import('./compare/compare').then((m) => m.Compare) },
  { path: '**', redirectTo: 'funds' },
];
