import { describe, it, expect } from 'vitest';
import '../src/components/contract-form';

function nextFrame() {
  return new Promise((r) => requestAnimationFrame(() => r(null)));
}

describe('contract-form', () => {
  it('emits contract-submit with filled values and clears inputs', async () => {
    const el = document.createElement('contract-form');
    document.body.appendChild(el);
    await nextFrame();

    const name = el.shadowRoot!.querySelector('input[name="name"]') as HTMLInputElement;
    const acc = el.shadowRoot!.querySelector('input[name="accountNumber"]') as HTMLInputElement;
  const desc = el.shadowRoot!.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
  const amount = el.shadowRoot!.querySelector('input[name="amount"]') as HTMLInputElement;
  const olab = el.shadowRoot!.querySelector('input[name="obligationLabel"]') as HTMLInputElement;

    name.value = 'Verzekering'; name.dispatchEvent(new Event('input'));
    acc.value = 'NL11BANK0000000001'; acc.dispatchEvent(new Event('input'));
    desc.value = 'WA autoverzekering'; desc.dispatchEvent(new Event('input'));
  amount.value = '89.95'; amount.dispatchEvent(new Event('input'));
  olab.value = 'Autoverzekering per maand'; olab.dispatchEvent(new Event('input'));

    const evPromise = new Promise<CustomEvent>((resolve) => {
      el.addEventListener('contract-submit', (e) => resolve(e as CustomEvent));
    });

    (el.shadowRoot!.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    const ev = await evPromise;

    expect(ev.detail.name).toBe('Verzekering');
    expect(ev.detail.accountNumber).toBe('NL11BANK0000000001');
    expect(ev.detail.description).toBe('WA autoverzekering');
  expect(Array.isArray(ev.detail.obligations)).toBe(true);
  expect(ev.detail.obligations![0].rate!.amount).toBeCloseTo(89.95, 2);
  expect(ev.detail.obligations![0].label).toBe('Autoverzekering per maand');

    expect(name.value).toBe('');
    expect(acc.value).toBe('');
  expect(desc.value).toBe('');
  expect(amount.value).toBe('');
  expect(olab.value).toBe('');
  });
});
