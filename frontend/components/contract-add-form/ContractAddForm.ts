import { LitElement, html, css, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ContractRepository } from '../../services/ContractRepository';
import type { Contract } from '../../models/Contract';

/**
 * <contract-add-form> - Formulier voor het toevoegen van een contract
 * @see /docs/frontend-components.md
 */
@customElement('contract-add-form')
export class ContractAddForm extends LitElement {
  static styles = css`
    form {
      display: grid;
      gap: 1rem;
      max-width: 400px;
    }
    label {
      font-weight: bold;
    }
    input, textarea {
      width: 100%;
      padding: 0.5rem;
      font-size: 1rem;
    }
    button {
      background: #4caf50;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      cursor: pointer;
      border-radius: 4px;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .error {
      color: #b71c1c;
      font-size: 0.95rem;
    }
    .success {
      color: #388e3c;
      font-size: 0.95rem;
    }
  `;

  private repo = new ContractRepository();

  public name = '';
  public accountNumber = '';
  public description = '';
  public error: string | null = null;
  public success: string | null = null;
  public submitting = false;

  /**
   * Validate IBAN (basic check, not exhaustive)
   * @param iban The IBAN string
   */
  private isValidIban(iban: string): boolean {
    // Remove spaces and to upper case
    iban = iban.replace(/\s+/g, '').toUpperCase();
    // Basic IBAN regex (NL, BE, DE, FR, etc.)
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
    if (!ibanRegex.test(iban)) return false;
    // Rearrange
    const rearranged = iban.slice(4) + iban.slice(0, 4);
    // Replace letters with numbers (A=10, B=11, ... Z=35)
    const expanded = rearranged.replace(/[A-Z]/g, (ch: string) => (ch.charCodeAt(0) - 55).toString());
    // Modulo 97
    let remainder = expanded;
    while (remainder.length > 2) {
      const block = remainder.slice(0, 9);
      remainder = (parseInt(block, 10) % 97).toString() + remainder.slice(block.length);
    }
    return parseInt(remainder, 10) % 97 === 1;
  }

  render() {
    return html`
      <form @submit=${this.handleSubmit} aria-label="Contract toevoegen">
        <div>
          <label for="name">Naam contract <span aria-hidden="true">*</span></label>
          <input id="name" name="name" type="text" .value=${this.name} required autocomplete="off"
            @input=${(e: Event) => this.name = (e.target as HTMLInputElement).value}
            aria-required="true"
            aria-label="Naam contract"
          />
        </div>
        <div>
          <label for="accountNumber">Rekeningnummer <span aria-hidden="true">*</span></label>
          <input id="accountNumber" name="accountNumber" type="text" .value=${this.accountNumber} required autocomplete="off"
            @input=${(e: Event) => this.accountNumber = (e.target as HTMLInputElement).value}
            aria-required="true"
            aria-label="Rekeningnummer (IBAN)"
            aria-invalid=${this.error && this.error.includes('IBAN') ? 'true' : 'false'}
            pattern="[A-Za-z]{2}[0-9]{2}[A-Za-z0-9]{1,30}"
            placeholder="NL00BANK0123456789"
          />
        </div>
        <div>
          <label for="description">Omschrijving</label>
          <textarea id="description" name="description" .value=${this.description}
            @input=${(e: Event) => this.description = (e.target as HTMLTextAreaElement).value}
            aria-label="Omschrijving (optioneel)"></textarea>
        </div>
        ${this.error ? html`<div class="error" role="alert">${this.error}</div>` : nothing}
        ${this.success ? html`<div class="success" role="status">${this.success}</div>` : nothing}
        <button type="submit" ?disabled=${this.submitting}>Toevoegen</button>
      </form>
    `;
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    this.error = null;
    this.success = null;
    if (!this.name.trim() || !this.accountNumber.trim()) {
      this.error = 'Naam en IBAN zijn verplicht.';
      return;
    }
    if (!this.isValidIban(this.accountNumber.trim())) {
      this.error = 'Voer een geldig IBAN nummer in.';
      return;
    }
    this.submitting = true;
    try {
      // Log presence of IndexedDB for E2E diagnostics
      console.log('DEBUG: window.indexedDB is', typeof window.indexedDB !== 'undefined' ? 'available' : 'NOT available');
      // Use crypto.randomUUID if available, otherwise fallback
      const uuid = typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
      const contract: Contract = {
        id: uuid,
        name: this.name.trim(),
        accountNumber: this.accountNumber.trim(),
        description: this.description.trim() || undefined,
      };
      console.log('DEBUG: contract to add', contract);
      await this.repo.add(contract);
      console.log('DEBUG: contract added successfully');
      this.success = 'Contract succesvol toegevoegd!';
      await this.requestUpdate(); // Ensure DOM updates before timer starts
      this.dispatchEvent(new CustomEvent('contract-added', { detail: contract, bubbles: true, composed: true }));
      // Keep the success message visible for 2 seconds before clearing the form
      setTimeout(() => {
        this.name = '';
        this.accountNumber = '';
        this.description = '';
        this.success = null;
      }, 2000);
    } catch (err) {
      this.error = 'Er is een fout opgetreden bij het opslaan.';
      // Optionally log technical details for debugging
      console.error(err);
    } finally {
      this.submitting = false;
    }
  }
}
