import { describe, it, expect } from 'vitest';
import '../src/app-root';

function nextFrame() { return new Promise((r) => requestAnimationFrame(() => r(null))); }

describe('app-root integration', () => {
  it('adds contract and shows in list', async () => {
    document.body.innerHTML = '<app-root></app-root>';
    const app = document.querySelector('app-root')!;
    await nextFrame();

    const form = app.shadowRoot!.querySelector('contract-form')!;
    const formRoot = (form.shadowRoot!);

    const name = formRoot.querySelector('input[name="name"]') as HTMLInputElement;
    const acc = formRoot.querySelector('input[name="accountNumber"]') as HTMLInputElement;

    name.value = 'Internet'; name.dispatchEvent(new Event('input'));
    acc.value = 'NL22BANK0000000002'; acc.dispatchEvent(new Event('input'));

    (formRoot.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    await nextFrame();
    await nextFrame();

    const list = app.shadowRoot!.querySelector('contract-list')!;
    const items = list.shadowRoot!.querySelectorAll('li');
    expect(items.length).toBeGreaterThanOrEqual(1);
  });
});
