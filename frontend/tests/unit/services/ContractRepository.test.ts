/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ContractRepository } from '../../../services/ContractRepository';
import type { Contract } from '../../../models/Contract';

function clearContractsStore(): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase('spaarpotjes-db');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}

describe('ContractRepository', () => {
  let repo: ContractRepository;

  beforeEach(async () => {
    await clearContractsStore();
    repo = new ContractRepository();
  });

  it('should add and retrieve a contract', async () => {
    const contract: Contract = {
      id: '1',
      name: 'Test Contract',
      accountNumber: 'NL00BANK0123456789',
      description: 'Test description',
    };
    await repo.add(contract);
    const all = await repo.getAll();
    expect(all.length).toBe(1);
    expect(all[0]).toMatchObject(contract);
  });

  it('should return an empty array if no contracts exist', async () => {
    const all = await repo.getAll();
    expect(all).toEqual([]);
  });
});
