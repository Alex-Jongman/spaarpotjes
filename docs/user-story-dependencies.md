# User Story Dependencies

Below is a visual overview of the dependencies between the sprint-ready user stories voor contractbeheer in Spaarpotjes.

```mermaid
graph TD
A[Contract toevoegen]
H[Contractmodel uitbreiden met kosten en herinneringen]
B[Contract bewerken]
C[Contract verwijderen]
D[Frequentie van betalingen instellen]
E[Betaalstatus bijhouden]
F[Herinnering instellen voor betaling]
G[Kosten van contract aanpassen]
H --> A
B --> A
C --> A
D --> H
E --> H
F --> H
G --> H
```

- Start met het realiseren van "Contract toevoegen" (#2).
- "Contractmodel uitbreiden met kosten en herinneringen" (#9) is afhankelijk van het kunnen toevoegen van contracten.
- "Contract bewerken" en "Contract verwijderen" zijn alleen afhankelijk van "Contract toevoegen".
- Alle andere stories zijn afhankelijk van het uitgebreide model.
- Deze structuur zorgt voor een logische en efficiënte workflow.

> Voor meer details, zie de individuele issues op GitHub.
