# Project Structure

```mermaid
graph TD
  A[frontend] -->|Lit, Vite| B[web components]
  A --> C[tests]
  D[backend] --> E[IndexedDB]
  F[docs] --> G[specs, changelog]
  H[possible-features]
  I[assets]
```

- `/frontend` - Frontend code (Lit, Vite, TypeScript)
- `/backend` - (Reserved, all data in browser IndexedDB)
- `/tests` - Unit, integration, e2e, performance, benchmark tests
- `/docs` - Documentation, specs, changelog
- `/possible-features` - Feature ideas
- `/assets` - Static assets
