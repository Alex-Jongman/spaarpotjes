/**
 * Contract interface for Spaarpotjes
 * Represents a recurring financial contract (e.g., subscription, rent, etc.)
 * @see /docs/database-schema.md
 */
export interface Contract {
  /** Unique identifier (UUID or timestamp-based) */
  id: string;
  /** Name of the contract (required) */
  name: string;
  /** IBAN or account number (required) */
  accountNumber: string;
  /** Optional description */
  description?: string;
}
