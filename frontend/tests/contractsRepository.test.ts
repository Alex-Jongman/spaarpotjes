import { describe, it, expect } from 'vitest';
import { createContractRepository } from '../src/storage/contractsRepository';

describe('contracts repository (memory)', () => {
  it('adds and lists contracts', async () => {
    const repo = createContractRepository('memory');
  const created = await repo.add({ name: 'Huur', accountNumber: 'NL00BANK0123456789', obligations: [{ rate: { amount: 1200 }, label: 'Huur' }] });
    expect(created.id).toBeDefined();

    const list = await repo.list();
    expect(list.length).toBe(1);
    expect(list[0].name).toBe('Huur');
  expect(list[0].obligations?.[0].rates?.[0].amount).toBe(1200);
  });

  it('updates amount when provided', async () => {
    const repo = createContractRepository('memory');
  const created = await repo.add({ name: 'Internet', accountNumber: 'NL00BANK0000000002', obligations: [{ rate: { amount: 50 }, label: 'Abonnement' }] });
  const firstId = created.obligations![0].id;
  const updated = await repo.update(created.id, { name: 'Internet', accountNumber: 'NL00BANK0000000002', obligations: [{ id: firstId, rate: { amount: 55 }, label: 'Abonnement' }] });
  expect(updated.obligations?.[0].rates?.slice(-1)[0].amount).toBe(55);
    const list = await repo.list();
  expect(list.find(c => c.id === created.id)!.obligations?.[0].rates?.slice(-1)[0].amount).toBe(55);
  });
});
