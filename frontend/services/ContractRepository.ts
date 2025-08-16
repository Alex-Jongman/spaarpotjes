/**
 * ContractRepository - handles CRUD operations for contracts in IndexedDB
 * Follows SRP and is decoupled from UI logic.
 * @see /docs/object-storage.md
 */
import { Contract } from '../models/Contract';
import { contracts$ } from './ContractStore';

const DB_NAME = 'spaarpotjes-db';
const STORE_NAME = 'contracts';
const DB_VERSION = 1;

export class ContractRepository {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.openDb();
  }

  private openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Add a new contract to IndexedDB
   */
  async add(contract: Contract): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.add(contract);
      tx.oncomplete = async () => {
        // After adding, update observable
        const all = await this.getAll();
        contracts$.next(all);
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Get all contracts from IndexedDB
   */
  async getAll(): Promise<Contract[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as Contract[]);
      request.onerror = () => reject(request.error);
    });
  }
}
