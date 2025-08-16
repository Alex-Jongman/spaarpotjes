import type { Contract, NewContractInput, PaymentObligation, PaymentObligationInput, PaymentRate, UUID } from '../types';

export type RepoBackend = 'auto' | 'memory' | 'idb';

export interface ContractRepository {
  add(input: NewContractInput): Promise<Contract>;
  list(): Promise<Contract[]>;
  get(id: UUID): Promise<Contract | undefined>;
  update(id: UUID, input: NewContractInput): Promise<Contract>;
}

function uuid(): UUID {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as Crypto & { randomUUID: () => string }).randomUUID();
  }
  // Fallback UUID v4-ish
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class MemoryContractRepository implements ContractRepository {
  private store = new Map<UUID, Contract>();

  private mapObligationsAppendOnly(inputs?: PaymentObligationInput[], existing?: PaymentObligation[]): PaymentObligation[] | undefined {
    if (!inputs) return existing;
    const now = new Date().toISOString();
    const byId = new Map<string, PaymentObligation>();
    existing?.forEach(o => byId.set(o.id, { ...o, rates: [...(o.rates ?? [])] }));
    const result: PaymentObligation[] = existing ? Array.from(byId.values()) : [];

    for (const input of inputs) {
      if (input.id && byId.has(input.id)) {
        const target = result.find(o => o.id === input.id)!;
        if (input.label !== undefined) target.label = input.label;
        if (input.rate) {
          const rate: PaymentRate = {
            id: uuid(),
            amount: input.rate.amount,
            validFrom: input.rate.validFrom ?? now,
            validTo: input.rate.validTo,
            createdAt: now,
            schedule: input.rate.schedule,
            frequency: input.rate.frequency,
          };
          target.rates = [...(target.rates ?? []), rate];
        }
      } else {
        const newOb: PaymentObligation = {
          id: uuid(),
          label: input.label,
          createdAt: now,
          rates: input.rate ? [{ id: uuid(), amount: input.rate.amount, validFrom: input.rate.validFrom ?? now, validTo: input.rate.validTo, createdAt: now, schedule: input.rate.schedule, frequency: input.rate.frequency }] : [],
        };
        result.push(newOb);
      }
    }
    return result;
  }

  async add(input: NewContractInput): Promise<Contract> {
    const c: Contract = {
      id: uuid(),
      name: input.name.trim(),
      accountNumber: input.accountNumber.trim(),
      description: input.description?.trim() || undefined,
  obligations: this.mapObligationsAppendOnly(input.obligations),
      createdAt: new Date().toISOString(),
    };
    this.store.set(c.id, c);
    return c;
  }

  async list(): Promise<Contract[]> {
    return Array.from(this.store.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async get(id: UUID): Promise<Contract | undefined> {
    return this.store.get(id);
  }

  async update(id: UUID, input: NewContractInput): Promise<Contract> {
    const existing = this.store.get(id);
    if (!existing) throw new Error('Contract not found');
    const updated: Contract = {
      ...existing,
      name: input.name.trim(),
      accountNumber: input.accountNumber.trim(),
  description: input.description?.trim() || undefined,
  obligations: this.mapObligationsAppendOnly(input.obligations, existing.obligations),
    };
    this.store.set(id, updated);
    return updated;
  }
}

// Minimal IndexedDB wrapper without external deps
interface IDBContractDB {
  db: IDBDatabase;
}

async function openDB(): Promise<IDBContractDB> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('spaarpot', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('contracts')) {
        db.createObjectStore('contracts', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve({ db: req.result });
    req.onerror = () => reject(req.error);
  });
}

class IDBContractRepository implements ContractRepository {
  private ready: Promise<IDBContractDB>;

  constructor() {
    this.ready = openDB();
  }

  private async tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => void): Promise<T> {
    const { db } = await this.ready;
    return new Promise<T>((resolve, reject) => {
      const tx = db.transaction('contracts', mode);
      const store = tx.objectStore('contracts');
      let result: T;
      try {
        result = run(store) as unknown as T;
      } catch (e) {
        reject(e);
        return;
      }
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
    });
  }

  private mapObligationsAppendOnly(inputs?: PaymentObligationInput[], existing?: PaymentObligation[]): PaymentObligation[] | undefined {
    if (!inputs) return existing;
    const now = new Date().toISOString();
    const byId = new Map<string, PaymentObligation>();
    existing?.forEach(o => byId.set(o.id, { ...o, rates: [...(o.rates ?? [])] }));
    const result: PaymentObligation[] = existing ? Array.from(byId.values()) : [];

    for (const input of inputs) {
      if (input.id && byId.has(input.id)) {
        const target = result.find(o => o.id === input.id)!;
        if (input.label !== undefined) target.label = input.label;
        if (input.rate) {
          const rate: PaymentRate = {
            id: uuid(),
            amount: input.rate.amount,
            validFrom: input.rate.validFrom ?? now,
            validTo: input.rate.validTo,
            createdAt: now,
            schedule: input.rate.schedule,
            frequency: input.rate.frequency,
          };
          target.rates = [...(target.rates ?? []), rate];
        }
      } else {
        const newOb: PaymentObligation = {
          id: uuid(),
          label: input.label,
          createdAt: now,
          rates: input.rate ? [{ id: uuid(), amount: input.rate.amount, validFrom: input.rate.validFrom ?? now, validTo: input.rate.validTo, createdAt: now, schedule: input.rate.schedule, frequency: input.rate.frequency }] : [],
        };
        result.push(newOb);
      }
    }
    return result;
  }

  async add(input: NewContractInput): Promise<Contract> {
    const c: Contract = {
      id: uuid(),
      name: input.name.trim(),
      accountNumber: input.accountNumber.trim(),
      description: input.description?.trim() || undefined,
  obligations: this.mapObligationsAppendOnly(input.obligations),
      createdAt: new Date().toISOString(),
    };
    await this.tx<void>('readwrite', (store) => {
      store.put(c);
    });
    return c;
  }

  async list(): Promise<Contract[]> {
    const items: Contract[] = [];
    await this.tx<void>('readonly', (store) => {
      const req = store.openCursor();
      req.onsuccess = () => {
        const cursor = req.result as IDBCursorWithValue | null;
        if (cursor) {
          items.push(cursor.value as Contract);
          cursor.continue();
        }
      };
    });
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }

  async get(id: UUID): Promise<Contract | undefined> {
    return this.tx<Contract | undefined>('readonly', (store) => {
      const req = store.get(id);
      return new Promise<Contract | undefined>((resolve, reject) => {
        req.onsuccess = () => resolve(req.result as Contract | undefined);
        req.onerror = () => reject(req.error);
      }) as unknown as Contract | undefined;
    });
  }

  async update(id: UUID, input: NewContractInput): Promise<Contract> {
    const existing = await this.get(id);
    if (!existing) throw new Error('Contract not found');
    const updated: Contract = {
      ...existing,
      name: input.name.trim(),
      accountNumber: input.accountNumber.trim(),
  description: input.description?.trim() || undefined,
  obligations: this.mapObligationsAppendOnly(input.obligations, existing.obligations),
    };
    await this.tx<void>('readwrite', (store) => {
      store.put(updated);
    });
    return updated;
  }
}

export function createContractRepository(backend: RepoBackend = 'auto'): ContractRepository {
  const canUseIDB = typeof indexedDB !== 'undefined';
  if (backend === 'idb' || (backend === 'auto' && canUseIDB)) {
    try {
      return new IDBContractRepository();
    } catch {
      return new MemoryContractRepository();
    }
  }
  return new MemoryContractRepository();
}

export const contractsRepo: ContractRepository = createContractRepository('auto');
