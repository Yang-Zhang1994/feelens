import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FundService } from '../lib/fund.service';
import { FUNDS } from '../testing';
import { Compare } from './compare';

async function setup(ids: string) {
  TestBed.configureTestingModule({
    imports: [Compare],
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  });
  const fixture = TestBed.createComponent(Compare);
  fixture.componentRef.setInput('ids', ids);
  TestBed.inject(HttpTestingController).expectOne('funds.json').flush(FUNDS);
  await fixture.whenStable();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

async function type(fixture: { whenStable(): Promise<unknown> }, input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event('input'));
  await fixture.whenStable();
}

describe('Compare', () => {
  it('ranks funds by fee and states the cost of the dearer one', async () => {
    const { el } = await setup('dear,cheap');
    const names = [...el.querySelectorAll('tbody th')].map((th) => th.textContent?.trim());
    expect(names).toEqual(['Equity Index ETF', 'Equity Fund, Series A']);
    expect(el.querySelector('[data-testid=insight]')?.textContent).toMatch(
      /^Over 25 years, Equity Fund, Series A \(2\.10%\) would leave you \$[\d,]+ less than Equity Index ETF \(0\.06%\)\.$/,
    );
    expect(el.querySelectorAll('app-growth-chart polyline')).toHaveLength(2);
  });

  it('hides results and explains invalid input', async () => {
    const { fixture, el } = await setup('dear,cheap');
    await type(fixture, el.querySelector('#years')!, '0');
    expect(el.querySelector('#years-error')?.textContent).toContain('from 1 to 50');
    expect(el.querySelector('[data-testid=insight]')).toBeNull();
    expect(el.querySelector('[role=alert]')?.textContent).toContain('Fix the highlighted fields');

    await type(fixture, el.querySelector('#years')!, '10');
    expect(el.querySelector('[data-testid=insight]')?.textContent).toContain('Over 10 years');
  });

  it('asks for more funds when the link names fewer than two', async () => {
    const { el } = await setup('cheap,unknown');
    expect(el.textContent).toContain('Pick at least two funds');
  });

  it('remembers a shared link as the current selection', async () => {
    await setup('bond,cash');
    expect(TestBed.inject(FundService).selected()).toEqual(['bond', 'cash']);
  });
});
