# Object Storage Structure

All persistent data is stored in the browser's IndexedDB. No external object storage is used.

- IndexedDB is accessed directly via a small repository wrapper (`contractsRepository`).
- Data is organized by object store.
- Attachments (if any) are stored as blobs in IndexedDB.

## Stores

- `contracts`: stores `Contract` records (`id` is the keyPath).

There is no server-side synchronization in this version; all data remains local to the browser.
