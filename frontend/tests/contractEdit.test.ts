import { describe, it, expect } from 'vitest';
import '../src/components/contract-edit';

function nextFrame() { return new Promise((r) => requestAnimationFrame(() => r(null))); }

describe('contract-edit', () => {
  it('opens with contract values and emits save with updates', async () => {
  const el = document.createElement('contract-edit') as HTMLElement & { open: boolean; contract?: { id: string; name: string; accountNumber: string; createdAt: string; description?: string; obligations?: { id: string; label?: string; rates?: { id: string; amount: number; validFrom: string }[] }[] } };
    document.body.appendChild(el);
    el.open = true;
  el.contract = { id: '1', name: 'Huur', accountNumber: 'NL00', createdAt: new Date().toISOString(), obligations: [{ id: 'o1', label: 'Huur', rates: [{ id: 'r1', amount: 1200, validFrom: new Date().toISOString() }] }] };
    await nextFrame();

    const root = el.shadowRoot!;
    const name = root.querySelector('input[name="name"]') as HTMLInputElement;
  const acc = root.querySelector('input[name="accountNumber"]') as HTMLInputElement;
  const amount = root.querySelector('input[name="amount"]') as HTMLInputElement;
  const olab = root.querySelector('input[name="obligationLabel"]') as HTMLInputElement;

    expect(name.value).toBe('Huur');
  expect(acc.value).toBe('NL00');
  expect(amount.value).toBe('1200');
  expect(olab.value).toBe('Huur');

    name.value = 'Huur nieuw'; name.dispatchEvent(new Event('input'));

  // Change frequency as part of the edit
  const freq = root.querySelector('select[name="frequency"]') as HTMLSelectElement;
  expect(freq).toBeTruthy();
  freq.value = 'weekly'; freq.dispatchEvent(new Event('change'));

  const evPromise = new Promise<CustomEvent<{ id: string; input: { name: string; obligations?: { rate?: { amount: number; frequency?: string }; label?: string }[] } }>>((resolve) => el.addEventListener('contract-save', (e) => resolve(e as CustomEvent<{ id: string; input: { name: string; obligations?: { rate?: { amount: number; frequency?: string }; label?: string }[] } }>)));
    (root.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    const ev = await evPromise;
    expect(ev.detail.input.name).toBe('Huur nieuw');
  expect(ev.detail.input.obligations?.[0].rate?.amount).toBe(1200);
  expect(ev.detail.input.obligations?.[0].rate?.frequency).toBe('weekly');
    expect(ev.detail.input.obligations?.[0].label).toBe('Huur');
  });

  it('renders an accessible dialog structure', async () => {
    const el = document.createElement('contract-edit') as HTMLElement & { open: boolean; contract?: { id: string; name: string; accountNumber: string; createdAt: string; obligations?: { id: string; label?: string; rates?: { id: string; amount: number; validFrom: string }[] }[] } };
    document.body.appendChild(el);
    el.open = true;
    el.contract = { id: '1', name: 'Huur', accountNumber: 'NL00', createdAt: new Date().toISOString(), obligations: [{ id: 'o1', label: 'Huur', rates: [{ id: 'r1', amount: 1200, validFrom: new Date().toISOString() }] }] };
    await nextFrame();

    const root = el.shadowRoot!;
    const dialog = root.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const title = root.querySelector('#edit-title');
    expect(title?.textContent).toContain('Contract bewerken');
    const closeBtn = root.querySelector('button[aria-label="Sluiten"]');
    expect(closeBtn).toBeTruthy();
  });
});
