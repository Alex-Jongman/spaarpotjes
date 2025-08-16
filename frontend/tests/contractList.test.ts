import { describe, it, expect } from 'vitest';
import '../src/components/contract-list';

function nextFrame() { return new Promise((r) => requestAnimationFrame(() => r(null))); }

describe('contract-list', () => {
  it('shows Doorlopend with amount and periodicity for recurring contracts', async () => {
    const el = document.createElement('contract-list') as HTMLElement & { contracts: { id: string; name: string; accountNumber: string; createdAt: string; obligations: { id: string; createdAt: string; rates: { id: string; amount: number; validFrom: string; createdAt: string; schedule: { type: 'recurring'; frequency: 'monthly' } }[] }[] }[] };
    document.body.appendChild(el);
    const nowIso = new Date().toISOString();
    el.contracts = [{
      id: 'c1',
      name: 'Internet',
      accountNumber: 'NL00TEST',
      createdAt: nowIso,
      obligations: [{
        id: 'o1',
        createdAt: nowIso,
        rates: [{ id: 'r1', amount: 50, validFrom: nowIso, createdAt: nowIso, schedule: { type: 'recurring', frequency: 'monthly' } }]
      }],
    }];
    await nextFrame();
    const root = el.shadowRoot!;
    const metas = Array.from(root.querySelectorAll('.meta')) as HTMLElement[];
    const found = metas.some(m => /Doorlopend: € 50\.00 per maand/.test(m.textContent || ''));
    expect(found).toBe(true);
  });
});
