# Object Storage Structure

All persistent data is stored in the browser's IndexedDB. No external object storage is used.

- IndexedDB is accessed via a wrapper library (to be implemented).
- Data is organized by object store.
- Attachments (if any) are stored as blobs in IndexedDB.
