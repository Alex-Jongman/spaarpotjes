import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { NewContractInput } from '../types';

@customElement('contract-form')
export class ContractForm extends LitElement {
  static styles = css`
    form { display: grid; gap: 0.5rem; max-width: 480px; }
    label { display: grid; gap: 0.25rem; font-weight: 600; }
    input, textarea { padding: 0.5rem; font: inherit; }
    button { padding: 0.6rem 1rem; font: inherit; cursor: pointer; }
    .row { display: flex; gap: 0.5rem; }
    .row > * { flex: 1; }
  `;

  @state() private name = '';
  @state() private accountNumber = '';
  @state() private description = '';

  private onSubmit(e: Event) {
    e.preventDefault();
    const input: NewContractInput = {
      name: this.name.trim(),
      accountNumber: this.accountNumber.trim(),
      description: this.description.trim() || undefined,
    };
    if (!input.name || !input.accountNumber) {
      // Basic validation
      this.dispatchEvent(new CustomEvent('form-error', { detail: 'Naam en rekeningnummer zijn verplicht.' }));
      return;
    }
    this.dispatchEvent(new CustomEvent<NewContractInput>('contract-submit', { detail: input, bubbles: true, composed: true }));
    // Clear state
    this.name = '';
    this.accountNumber = '';
    this.description = '';
    // Clear input elements synchronously so tests that read value immediately after submit see empty strings
    const nameEl = this.shadowRoot?.querySelector('input[name="name"]') as HTMLInputElement | null;
    const accEl = this.shadowRoot?.querySelector('input[name="accountNumber"]') as HTMLInputElement | null;
    const descEl = this.shadowRoot?.querySelector('textarea[name="description"]') as HTMLTextAreaElement | null;
    if (nameEl) nameEl.value = '';
    if (accEl) accEl.value = '';
    if (descEl) descEl.value = '';
  }

  render() {
    return html`
      <form @submit=${this.onSubmit} novalidate>
        <label>
          Naam
          <input name="name" .value=${this.name} @input=${(e: InputEvent) => (this.name = (e.target as HTMLInputElement).value)} placeholder="Bijv. Huur" required />
        </label>
        <div class="row">
          <label>
            Rekeningnummer
            <input name="accountNumber" .value=${this.accountNumber} @input=${(e: InputEvent) => (this.accountNumber = (e.target as HTMLInputElement).value)} placeholder="IBAN" required />
          </label>
        </div>
        <label>
          Omschrijving
          <textarea name="description" .value=${this.description} @input=${(e: InputEvent) => (this.description = (e.target as HTMLTextAreaElement).value)} rows="3" placeholder="Optioneel"></textarea>
        </label>
        <div>
          <button type="submit">Contract toevoegen</button>
        </div>
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'contract-form': ContractForm;
  }
}
