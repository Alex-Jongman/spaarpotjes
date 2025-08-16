# Page snapshot

```yaml
- heading "Welkom bij Spaarpot" [level=1]
- form "Contract toevoegen":
  - text: Naam contract
  - textbox "Naam contract": Test Contract
  - text: Rekeningnummer
  - textbox "Rekeningnummer (IBAN)": NL00BANK0123456789
  - text: Omschrijving
  - textbox "Omschrijving (optioneel)": Test omschrijving
  - button "Toevoegen"
- region "Overzicht contracten":
  - table "Contracten":
    - caption: Contracten
    - rowgroup:
      - row "Naam Rekeningnummer Omschrijving":
        - cell "Naam"
        - cell "Rekeningnummer"
        - cell "Omschrijving"
    - rowgroup:
      - row "Nog geen contracten toegevoegd.":
        - cell "Nog geen contracten toegevoegd."
```