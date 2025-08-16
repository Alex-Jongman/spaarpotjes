import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Contract, NewContractInput } from '../types';

@customElement('contract-edit')
export class ContractEdit extends LitElement {
  static styles = css`
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.3); display: grid; place-items: center; }
    .card { background: white; padding: 1rem; border-radius: 12px; min-width: 320px; max-width: 520px; }
    form { display: grid; gap: .5rem; }
    label { display: grid; gap: .25rem; }
    .row { display: flex; gap: .5rem; }
    .row > * { flex: 1; }
    button { padding: 0.6rem 1rem; }
  `;

  @property({ type: Object }) contract?: Contract;
  @property({ type: Boolean, reflect: true }) open = false;

  @state() private name = '';
  @state() private accountNumber = '';
  @state() private description = '';

  updated(changed: Map<string, unknown>) {
    if (changed.has('contract') && this.contract) {
      this.name = this.contract.name;
      this.accountNumber = this.contract.accountNumber;
      this.description = this.contract.description ?? '';
    }
  }

  private close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('edit-close'));
  }

  private submit(e: Event) {
    e.preventDefault();
    if (!this.contract) return;
    const input: NewContractInput = {
      name: this.name.trim(),
      accountNumber: this.accountNumber.trim(),
      description: this.description.trim() || undefined,
    };
    if (!input.name || !input.accountNumber) return;
    this.dispatchEvent(new CustomEvent('contract-save', { detail: { id: this.contract.id, input }, bubbles: true, composed: true }));
    this.close();
  }

  render() {
    if (!this.open || !this.contract) return null;
    return html`
      <div class="backdrop" @click=${this.close}>
        <div class="card" @click=${(e: Event) => e.stopPropagation()}>
          <h3>Contract bewerken</h3>
          <form @submit=${this.submit}>
            <label>
              Naam
              <input name="name" .value=${this.name} @input=${(e: InputEvent) => (this.name = (e.target as HTMLInputElement).value)} />
            </label>
            <div class="row">
              <label>
                Rekeningnummer
                <input name="accountNumber" .value=${this.accountNumber} @input=${(e: InputEvent) => (this.accountNumber = (e.target as HTMLInputElement).value)} />
              </label>
            </div>
            <label>
              Omschrijving
              <textarea name="description" .value=${this.description} @input=${(e: InputEvent) => (this.description = (e.target as HTMLTextAreaElement).value)} rows="3"></textarea>
            </label>
            <div class="row">
              <button type="button" @click=${this.close}>Annuleren</button>
              <button type="submit">Opslaan</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'contract-edit': ContractEdit;
  }
}
