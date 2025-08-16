# Frontend Components

This app uses Lit web components. Below are the key components, their public API, events, and accessibility notes.

## app-root

Source: [app-root.ts](../frontend/src/app-root.ts)

- Purpose: Shell component. Renders the create form, contracts list, and edit dialog. Orchestrates storage operations.
- Children: `contract-form`, `contract-list`, `contract-edit`
- Messages:
	- Listens: `contract-submit`, `edit-request`, `contract-save`
	- Announces status via a `<p role="status">` region.

## contract-form

Source: [contract-form.ts](../frontend/src/components/contract-form.ts)

- Purpose: Add a new contract.
- Inputs (internal state mirrored to form fields):
	- name: string (required)
	- accountNumber: string (required)
	- description: string (optional)
	- obligations: array (optional) — minimal UI ondersteunt één verplichting (label) met nieuwe rate. Twee schema's:
		- Terugkerend: `{ amount, frequency, schedule: { type: 'recurring', frequency } }`
		- Termijnen: `{ amount: som van termijnen, schedule: { type: 'installments', installments: [{ date, amount }] } }`
- Events:
	- `contract-submit` — detail: `{ name, accountNumber, description?, obligations?: [{ label?, rate?: { amount, frequency?, schedule?, validFrom? } }] }`
	- `form-error` — detail: string (validation message)
- A11y:
	- Semantic labels per field.
	- Client-side validation ensures required fields.

## contract-list

Source: [contract-list.ts](../frontend/src/components/contract-list.ts)

- Purpose: Show a list of contracts.
- Properties:
	- `contracts: Contract[]` — array of items to display
- Events:
	- `edit-request` — detail: `id: string` when the user clicks “Bewerken”.
- A11y:
	- Buttons include `aria-label` with contract name.
 - Display logic:
 	- Recurring obligations are shown as a total per frequency when all share the same frequency; otherwise a normalized per-month total is shown ("Terugkerend (per maand): € …/mnd").
 	- Installment schedules show the total sum and the number of terms ("Termijnen: € … (n termijnen)").

## contract-edit

Source: [contract-edit.ts](../frontend/src/components/contract-edit.ts)

- Purpose: Edit an existing contract inside a lightweight modal overlay.
- Properties:
	- `open: boolean` — controls visibility
	- `contract?: Contract` — current contract
- Events:
	- `contract-save` — detail: `{ id, input: { name, accountNumber, description?, obligations?: [{ id?, label?, rate?: { amount, frequency?, schedule?, validFrom?, validTo? } }] } }`
	- `edit-close` — emitted when dialog closes without saving
- A11y:
	- Accessible modal with role="dialog", aria-modal, labeled by title.
	- Keyboard: Esc closes, focus is trapped within the dialog, and initial focus is set on open.

## Types

Source: [types.ts](../frontend/src/types.ts)

Contract shape (see `frontend/src/types.ts`):

```ts
interface Contract {
	id: string;
	name: string;
	accountNumber: string;
	description?: string;
	obligations?: { id: string; label?: string; createdAt: string; rates: { id: string; amount: number; frequency?: 'daily'|'weekly'|'biweekly'|'monthly'|'quarterly'|'yearly'; schedule?: { type: 'recurring', frequency: 'daily'|'weekly'|'biweekly'|'monthly'|'quarterly'|'yearly' } | { type: 'installments', installments: { date: string; amount: number }[] }; validFrom: string; validTo?: string; createdAt: string }[] }[];
	createdAt: string; // ISO
}
```

## Internationalization (i18n)

- Current copy is in Dutch. For i18n, externalize strings to locale files (e.g., `frontend/locales/nl.json`) in a follow-up.

## Testing

- Unit/integration tests in `frontend/tests` cover form submission, editing, repository, and app integration (jsdom + Vitest).
