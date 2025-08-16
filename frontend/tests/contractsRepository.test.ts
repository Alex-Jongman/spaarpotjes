import { describe, it, expect } from 'vitest';
import { createContractRepository } from '../src/storage/contractsRepository';

describe('contracts repository (memory)', () => {
  it('adds and lists contracts', async () => {
    const repo = createContractRepository('memory');
    const created = await repo.add({ name: 'Huur', accountNumber: 'NL00BANK0123456789' });
    expect(created.id).toBeDefined();

    const list = await repo.list();
    expect(list.length).toBe(1);
    expect(list[0].name).toBe('Huur');
  });
});
