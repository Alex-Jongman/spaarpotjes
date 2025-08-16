// Domain types for Spaarpotjes

export type UUID = string;

export interface Contract {
  id: UUID;
  name: string;
  accountNumber: string; // IBAN or other
  description?: string;
  // Payment obligations associated with this contract (append-only rates)
  obligations?: PaymentObligation[];
  createdAt: string; // ISO string
}

export interface NewContractInput {
  name: string;
  accountNumber: string;
  description?: string;
  // Provide zero or more obligations when creating or updating
  obligations?: PaymentObligationInput[];
}

export interface PaymentRate {
  id: UUID;
  amount: number; // EUR amount; for recurring it's per period, for installments it's the sum of all installments
  validFrom: string; // ISO timestamp
  validTo?: string; // ISO timestamp
  createdAt: string; // ISO timestamp
  // Preferred scheduling model. If omitted, legacy `frequency` may be used.
  schedule?: PaymentSchedule;
  frequency?: PaymentFrequency; // legacy: how often this amount recurs
}

export interface PaymentObligation {
  id: UUID;
  label?: string;
  createdAt: string; // ISO timestamp
  rates: PaymentRate[];
}

export interface PaymentRateInput {
  id?: UUID; // if provided, may target an existing rate (not typical in append-only)
  amount: number;
  validFrom?: string; // default: now
  validTo?: string;   // usually omitted for current rate
  // Preferred: provide a schedule. If omitted, `frequency` may be used for recurring.
  schedule?: PaymentScheduleInput;
  frequency?: PaymentFrequency;
}

export interface PaymentObligationInput {
  id?: UUID; // present when updating an existing obligation
  label?: string;
  rate?: PaymentRateInput; // provide one new rate per update/create
}

export type PaymentFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

// Scheduling
export interface RecurringSchedule {
  type: 'recurring';
  frequency: PaymentFrequency;
}

export interface InstallmentTerm {
  id?: UUID;
  date: string; // ISO date (YYYY-MM-DD) or full timestamp
  amount: number; // EUR amount for this term
}

export interface InstallmentsSchedule {
  type: 'installments';
  installments: InstallmentTerm[]; // explicit schedule
}

export type PaymentSchedule = RecurringSchedule | InstallmentsSchedule;

export type PaymentScheduleInput =
  | { type: 'recurring'; frequency: PaymentFrequency }
  | { type: 'installments'; installments: { date: string; amount: number }[] };
