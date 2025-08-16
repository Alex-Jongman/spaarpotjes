# Database Schema

All data is stored in the browser using IndexedDB. No server-side database is used.

## Object Stores

```mermaid
classDiagram
  class Contract {
    +string id
    +string name
    +string accountNumber
    +string description
    +string createdAt
    +PaymentObligation[] obligations
  }

  class PaymentObligation {
    +string id
    +string label
    +string createdAt
    +PaymentRate[] rates
  }

  class PaymentRate {
    +string id
    +number amount
    +string validFrom
    +string validTo
    +string createdAt
  }
```

- `contracts` (keyPath: `id`) stores `Contract` objects. Read/write via `contractsRepository`.

## Example Structure

```mermaid
classDiagram
  class Spaarpotje {
    +string id
    +string name
    +number balance
    +Date createdAt
    +Date updatedAt
  }
```

- Each `Spaarpotje` is a savings jar with a unique id, name, balance, and timestamps.
- Each `Contract` represents a recurring cost or income, with basic identity and metadata.
