# Project Structure

```text
spaarpot/
├─ frontend/
│  ├─ index.html
│  ├─ main.ts                  # bootstraps <app-root>
│  ├─ src/
│  │  ├─ app-root.ts           # app shell (form, list, editor)
│  │  ├─ types.ts              # domain types (Contract, NewContractInput)
│  │  ├─ storage/
│  │  │  └─ contractsRepository.ts  # IndexedDB + memory repo
│  │  └─ components/
│  │     ├─ contract-form.ts   # add contract form
│  │     ├─ contract-list.ts   # list with edit buttons
│  │     └─ contract-edit.ts   # edit dialog
│  ├─ tests/                   # Vitest unit/integration tests
│  ├─ vite.config.ts
│  ├─ vitest.config.ts
│  └─ eslint.config.js
├─ docs/                       # project documentation
└─ tests/                      # reserved for e2e/perf structures
```

Notes:

- Backend folder is reserved; current data is client-side IndexedDB only.
- Playwright config exists in frontend; add E2E specs as the UI grows.
