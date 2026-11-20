import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { FUNDS } from '../testing';
import { FundList } from './fund-list';

async function setup(respond: 'ok' | 'fail' = 'ok') {
  TestBed.configureTestingModule({
    imports: [FundList],
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  });
  const fixture = TestBed.createComponent(FundList);
  const req = TestBed.inject(HttpTestingController).expectOne('funds.json');
  if (respond === 'ok') req.flush(FUNDS);
  else req.flush('down', { status: 500, statusText: 'Server Error' });
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, el, rows: () => [...el.querySelectorAll('tbody tr')].map((r) => r.querySelector('label')?.textContent?.trim()) };
}

describe('FundList', () => {
  it('lists funds cheapest first', async () => {
    const { rows } = await setup();
    expect(rows()).toEqual(['Equity Index ETF', 'Bond Index ETF', 'Money Market Fund', 'Equity Fund, Series A']);
  });

  it('filters by category', async () => {
    const { fixture, el, rows } = await setup();
    const select = el.querySelector<HTMLSelectElement>('#category')!;
    select.value = 'Equity';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(rows()).toEqual(['Equity Index ETF', 'Equity Fund, Series A']);
  });

  it('allows at most three picks and navigates with their ids', async () => {
    const { fixture, el } = await setup();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const boxes = () => [...el.querySelectorAll<HTMLInputElement>('tbody input[type=checkbox]')];
    for (const i of [0, 1, 2]) {
      boxes()[i].click();
      await fixture.whenStable();
    }
    expect(boxes()[3].disabled).toBe(true);
    el.querySelector<HTMLButtonElement>('.bar button')!.click();
    expect(navigate).toHaveBeenCalledWith(['/compare'], { queryParams: { ids: 'cheap,bond,cash' } });
  });

  it('shows an error if the fund list fails to load', async () => {
    const { el } = await setup('fail');
    expect(el.querySelector('[role=alert]')?.textContent).toContain('Could not load');
  });
});
