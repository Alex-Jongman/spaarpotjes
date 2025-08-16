import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { NewContractInput, PaymentFrequency } from '../types';

@customElement('contract-form')
export class ContractForm extends LitElement {
  static styles = css`
  form { display: grid; gap: 0.75rem; width: 100%; max-width: 560px; }
  label { display: grid; gap: 0.25rem; font-weight: 600; }
  input, textarea, select { padding: 0.6rem; font: inherit; width: 100%; box-sizing: border-box; }
  button { padding: 0.7rem 1rem; font: inherit; cursor: pointer; width: 100%; }
  .row { display: grid; grid-template-columns: 1fr; gap: 0.5rem; }
  @media (min-width: 640px) { .row { grid-template-columns: 1fr 1fr; } }
  `;

  @state() private name = '';
  @state() private accountNumber = '';
  @state() private description = '';
  @state() private amount: string = '';
  @state() private obligationLabel: string = '';
  @state() private frequency: PaymentFrequency = 'monthly';

  private onSubmit(e: Event) {
    e.preventDefault();
    const input: NewContractInput = {
      name: this.name.trim(),
      accountNumber: this.accountNumber.trim(),
      description: this.description.trim() || undefined,
      obligations: this.amount.trim() !== '' ? [{ label: this.obligationLabel.trim() || undefined, rate: { amount: Number(this.amount), frequency: this.frequency } }] : undefined,
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
  this.amount = '';
  this.obligationLabel = '';
  this.frequency = 'monthly';
    // Clear input elements synchronously so tests that read value immediately after submit see empty strings
    const nameEl = this.shadowRoot?.querySelector('input[name="name"]') as HTMLInputElement | null;
    const accEl = this.shadowRoot?.querySelector('input[name="accountNumber"]') as HTMLInputElement | null;
    const descEl = this.shadowRoot?.querySelector('textarea[name="description"]') as HTMLTextAreaElement | null;
  const amountEl = this.shadowRoot?.querySelector('input[name="amount"]') as HTMLInputElement | null;
  const olabEl = this.shadowRoot?.querySelector('input[name="obligationLabel"]') as HTMLInputElement | null;
    if (nameEl) nameEl.value = '';
    if (accEl) accEl.value = '';
    if (descEl) descEl.value = '';
  if (amountEl) amountEl.value = '';
  if (olabEl) olabEl.value = '';
  const freqEl = this.shadowRoot?.querySelector('select[name="frequency"]') as HTMLSelectElement | null;
  if (freqEl) freqEl.value = 'monthly';
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
          <label>
            Bedrag (€)
            <input name="amount" type="number" min="0" step="0.01" .value=${this.amount} @input=${(e: InputEvent) => (this.amount = (e.target as HTMLInputElement).value)} placeholder="0,00" />
          </label>
          <label>
            Frequentie
            <select name="frequency" .value=${this.frequency} @change=${(e: Event) => (this.frequency = (e.target as HTMLSelectElement).value as PaymentFrequency)}>
              <option value="daily">Dagelijks</option>
              <option value="weekly">Wekelijks</option>
              <option value="biweekly">Tweewekelijks</option>
              <option value="monthly">Maandelijks</option>
              <option value="quarterly">Per kwartaal</option>
              <option value="yearly">Jaarlijks</option>
            </select>
          </label>
          <label>
            Omschrijving verplichting
            <input name="obligationLabel" .value=${this.obligationLabel} @input=${(e: InputEvent) => (this.obligationLabel = (e.target as HTMLInputElement).value)} placeholder="Bijv. Huur per maand" />
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
