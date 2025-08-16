// Domain types for Spaarpotjes

export type UUID = string;

export interface Contract {
  id: UUID;
  name: string;
  accountNumber: string; // IBAN or other
  description?: string;
  createdAt: string; // ISO string
}

export interface NewContractInput {
  name: string;
  accountNumber: string;
  description?: string;
}
