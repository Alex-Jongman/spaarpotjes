import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Contract, NewContractInput, PaymentFrequency, PaymentScheduleInput } from '../types';

@customElement('contract-edit')
export class ContractEdit extends LitElement {
  static styles = css`
  .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.3); display: grid; place-items: center; padding: 1rem; }
  .card { background: white; padding: 1rem; border-radius: 12px; width: 100%; max-width: 560px; }
  form { display: grid; gap: .75rem; }
    label { display: grid; gap: .25rem; }
  .row { display: grid; grid-template-columns: 1fr; gap: .5rem; }
  @media (min-width: 640px) { .row { grid-template-columns: 1fr 1fr; } }
  button { padding: 0.7rem 1rem; }
  `;

  @property({ type: Object }) contract?: Contract;
  @property({ type: Boolean, reflect: true }) open = false;

  @state() private name = '';
  @state() private accountNumber = '';
  @state() private description = '';
  @state() private amount: string = '';
  @state() private frequency: PaymentFrequency = 'monthly';
  @state() private scheduleType: 'recurring' | 'installments' = 'recurring';
  @state() private termsCount: string = '0';
  @state() private installments: { date: string; amount: string }[] = [];
  @state() private obligationLabel: string = '';

  updated(changed: Map<string, unknown>) {
    if (changed.has('contract') && this.contract) {
      this.name = this.contract.name;
      this.accountNumber = this.contract.accountNumber;
      this.description = this.contract.description ?? '';
  const first = this.contract.obligations?.[0];
  const now = Date.now();
  const current = first?.rates?.filter(r => (!r.validFrom || Date.parse(r.validFrom) <= now) && (!r.validTo || Date.parse(r.validTo) >= now)).slice(-1)[0];
  this.amount = current ? String(current.amount) : '';
  if (current?.schedule?.type === 'installments') {
    this.scheduleType = 'installments';
    const ins = current.schedule.installments ?? [];
    this.termsCount = String(ins.length);
    this.installments = ins.map(i => ({ date: i.date, amount: String(i.amount) }));
  } else {
    this.scheduleType = 'recurring';
    this.frequency = (current?.schedule?.type === 'recurring' ? current.schedule.frequency : (current?.frequency ?? 'monthly')) as PaymentFrequency;
  }
  this.obligationLabel = first?.label ?? '';
    }
  }

  private close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('edit-close'));
  }

  private submit(e: Event) {
    e.preventDefault();
    if (!this.contract) return;
    // Build rate from UI state
    let rate: { amount: number; frequency?: PaymentFrequency; schedule?: PaymentScheduleInput } | undefined;
    if (this.scheduleType === 'recurring' && this.amount.trim() !== '') {
      rate = { amount: Number(this.amount), frequency: this.frequency, schedule: { type: 'recurring', frequency: this.frequency } };
    } else if (this.scheduleType === 'installments') {
      const count = Number(this.termsCount) || 0;
      const filled = this.installments.slice(0, count).filter(t => t.date && t.amount.trim() !== '');
      const installments = filled.map(t => ({ date: t.date, amount: Number(t.amount) }));
      const total = installments.reduce((s, i) => s + (isFinite(i.amount) ? i.amount : 0), 0);
      if (count > 0 && filled.length === count) {
        rate = { amount: total, schedule: { type: 'installments', installments } };
      }
    }

    const input: NewContractInput = {
      name: this.name.trim(),
      accountNumber: this.accountNumber.trim(),
      description: this.description.trim() || undefined,
      obligations: rate ? [{
        id: this.contract.obligations?.[0]?.id, // append rate to first obligation if exists
        label: this.obligationLabel.trim() || undefined,
        rate,
      }] : [],
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
              <label>
                Schema
                <select name="scheduleType" .value=${this.scheduleType} @change=${(e: Event) => (this.scheduleType = (e.target as HTMLSelectElement).value as 'recurring' | 'installments')}>
                  <option value="recurring">Terugkerend</option>
                  <option value="installments">Termijnen</option>
                </select>
              </label>
              <label>
            ${this.scheduleType === 'recurring' ? html`
              <div class="row">
                <label>
                  Bedrag (€)
                  <input name="amount" type="number" min="0" step="0.01" .value=${this.amount} @input=${(e: InputEvent) => (this.amount = (e.target as HTMLInputElement).value)} />
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
              </div>
            ` : html`
              <div class="row">
                <label>
                  Aantal termijnen
                  <input name="termsCount" type="number" min="0" step="1" .value=${this.termsCount} @input=${(e: InputEvent) => {
                    const v = (e.target as HTMLInputElement).value;
                    this.termsCount = v;
                    const n = Math.max(0, Number(v) || 0);
                    if (n > this.installments.length) {
                      this.installments = [...this.installments, ...Array.from({ length: n - this.installments.length }, () => ({ date: '', amount: '' }))];
                    } else if (n < this.installments.length) {
                      this.installments = this.installments.slice(0, n);
                    }
                  }} />
                </label>
              </div>
              ${Number(this.termsCount) > 0 ? html`
                <div style="display: grid; gap: .5rem;">
                  ${this.installments.slice(0, Number(this.termsCount)).map((t, idx) => html`
                    <div class="row" style="align-items:end;">
                      <label>
                        Datum
                        <input type="date" .value=${t.date} @input=${(e: InputEvent) => {
                          const v = (e.target as HTMLInputElement).value; this.installments = this.installments.map((it, i) => i === idx ? { ...it, date: v } : it);
                        }} />
                      </label>
                      <label>
                        Bedrag (€)
                        <input type="number" min="0" step="0.01" .value=${t.amount} @input=${(e: InputEvent) => {
                          const v = (e.target as HTMLInputElement).value; this.installments = this.installments.map((it, i) => i === idx ? { ...it, amount: v } : it);
                        }} />
                      </label>
                    </div>
                  `)}
                </div>
              ` : null}
            `}
                Omschrijving verplichting
                <input name="obligationLabel" .value=${this.obligationLabel} @input=${(e: InputEvent) => (this.obligationLabel = (e.target as HTMLInputElement).value)} />
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
