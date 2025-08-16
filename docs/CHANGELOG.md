# Changelog

2025-07-13 - Project boilerplate initialized with frontend, backend, tests, and documentation structure.

2025-08-16 - Contracten toevoegen en bewerken

- Feature: Contract toevoegen (issue #2) met formulier, IndexedDB-opslag, en lijstweergave.
- Feature: Contract bewerken (issue #3) met bewerk-dialoog en opslag via repository.update.
- Tests: Vitest unit/integratie tests toegevoegd voor opslag, formulier, bewerken en app flow.
- Tooling: ESLint flat config verbeterd, decorators ingeschakeld, build en lint in CI-klaar staat.

2025-08-16 - Documentatie: component-links

- Docs: In `docs/frontend-components.md` per component een link toegevoegd naar het bijbehorende bronbestand. Markdown-indents gecorrigeerd.

2025-08-16 - Kosten van contract aanpassen (User Story #8)

- Feature: Bedrag (amount) veld toegevoegd aan contracten (types, repository, UI).
- UI: Formulier en bewerk-dialoog ondersteunen bedrag invoeren/wijzigen; lijst toont bedrag in euro's.
- Opslag: Memory en IndexedDB repository slaan amount op en werken het bij.
- Tests: Unit tests uitgebreid voor form submit (amount) en repository update.

2025-08-16 - Frequentie per verplichting (issue #5) en mobile-first UI

- Feature: PaymentFrequency toegevoegd aan PaymentRate (types) met opties daily/weekly/biweekly/monthly/quarterly/yearly.
- UI: Contract-formulier en bewerk-dialoog hebben een 'Frequentie' selectie; bedragen zijn niet langer per maand hardcoded.
- Styles: Bewerk-dialoog responsive gemaakt (grid, max-width, padding) met mobile-first layout.
- Tests: Bestaande tests blijven groen; dekking ongewijzigd. Nieuwe UI is backward-compatible.

2025-08-16 - Bewerk-dialoog UI en toegankelijkheid verbeterd

- UI: Bewerk-dialoog herontworpen met duidelijke header, sticky acties, betere spacing en schaduwen.
- Toegankelijkheid: role="dialog", aria-modal, titel-koppeling en toetsenbord-navigatie (Esc om te sluiten, focus trap).
- Codekwaliteit: Geen geneste labels meer; semantische fieldsets en labels toegevoegd.
- Tests: Extra unit test toegevoegd voor ARIA-structuur.
