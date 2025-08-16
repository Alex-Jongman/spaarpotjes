import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Contract, NewContractInput, PaymentFrequency, PaymentRateInput } from '../types';

@customElement('contract-edit')
export class ContractEdit extends LitElement {
  static styles = css`
  .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: grid; place-items: center; padding: 1rem; z-index: 1000; }
  .dialog { background: #fff; color: #111; border-radius: 12px; width: 100%; max-width: 640px; box-shadow: 0 10px 30px rgba(0,0,0,.25); display: grid; grid-template-rows: auto 1fr auto; max-height: min(90vh, 900px); outline: none; }
  .header { display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding: 1rem 1rem .75rem 1rem; border-bottom: 1px solid #eee; position: sticky; top: 0; background: #fff; border-top-left-radius: 12px; border-top-right-radius: 12px; }
  .title { margin: 0; font-size: 1.1rem; }
  .content { padding: 1rem; overflow: auto; display: grid; gap: 1rem; }
  form { display: grid; gap: 1rem; }
  fieldset { border: 1px solid #eee; border-radius: 8px; padding: .75rem; }
  legend { font-weight: 600; padding: 0 .35rem; }
  label { display: grid; gap: .25rem; }
  input, select, textarea { font: inherit; padding: .6rem .7rem; border-radius: 8px; border: 1px solid #cfcfcf; }
  textarea { resize: vertical; }
  .grid { display: grid; grid-template-columns: 1fr; gap: .75rem; }
  @media (min-width: 640px) { .grid.cols-2 { grid-template-columns: 1fr 1fr; } }
  .actions { display: flex; gap: .75rem; justify-content: flex-end; padding: .75rem 1rem 1rem; border-top: 1px solid #eee; position: sticky; bottom: 0; background: #fff; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; }
  .btn { padding: .65rem 1rem; border-radius: 8px; border: 1px solid #cfcfcf; background: #f7f7f7; cursor: pointer; }
  .btn.primary { background: #0d6efd; border-color: #0d6efd; color: #fff; }
  .icon { background: transparent; border: none; cursor: pointer; font-size: 1.3rem; width: 2rem; height: 2rem; border-radius: 6px; }
  .icon:hover { background: #f3f3f3; }
  `;

  @property({ type: Object }) contract?: Contract;
  @property({ type: Boolean, reflect: true }) open = false;

  @state() private name = '';
  @state() private accountNumber = '';
  @state() private description = '';
  @state() private amount: string = '';
  @state() private frequency: PaymentFrequency = 'monthly';
  @state() private validFromDate: string = '';
  @state() private scheduleType: 'recurring' | 'installments' = 'recurring';
  @state() private termsCount: string = '0';
  @state() private installments: { date: string; amount: string }[] = [];
  @state() private obligationLabel: string = '';

  private handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); this.close(); return; }
    if (e.key === 'Tab') {
      // Focus trap within dialog
      const root = this.shadowRoot!;
      const container = root.querySelector('.dialog') as HTMLElement | null;
      if (!container) return;
      const focusables = Array.from(container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = (this.getRootNode() as Document | ShadowRoot).activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !container.contains(active)) { last.focus(); e.preventDefault(); }
      } else {
        if (active === last) { first.focus(); e.preventDefault(); }
      }
    }
  };

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
    this.validFromDate = current.validFrom ? current.validFrom.slice(0, 10) : '';
  } else {
    this.scheduleType = 'recurring';
    this.frequency = (current?.schedule?.type === 'recurring' ? current.schedule.frequency : (current?.frequency ?? 'monthly')) as PaymentFrequency;
    this.validFromDate = current?.validFrom ? current.validFrom.slice(0, 10) : '';
  }
  this.obligationLabel = first?.label ?? '';
    }
    if (changed.has('open') && this.open) {
      // Move focus into dialog when opened
      const root = this.shadowRoot!;
      const dlg = root.querySelector('.dialog') as HTMLElement | null;
      if (dlg) setTimeout(() => dlg.focus(), 0);
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
  let rate: PaymentRateInput | undefined;
    if (this.scheduleType === 'recurring' && this.amount.trim() !== '') {
      const validFrom = this.validFromDate ? new Date(this.validFromDate).toISOString() : undefined;
  rate = { amount: Number(this.amount), frequency: this.frequency, schedule: { type: 'recurring', frequency: this.frequency }, validFrom };
    } else if (this.scheduleType === 'installments') {
      const count = Number(this.termsCount) || 0;
      const filled = this.installments.slice(0, count).filter(t => t.date && t.amount.trim() !== '');
      const installments = filled.map(t => ({ date: t.date, amount: Number(t.amount) }));
      const total = installments.reduce((s, i) => s + (isFinite(i.amount) ? i.amount : 0), 0);
      if (count > 0 && filled.length === count) {
        // validFrom: explicit, else earliest installment date
        const earliest = installments.length ? installments.map(i => Date.parse(i.date)).reduce((a, b) => Math.min(a, b)) : undefined;
        const validFrom = this.validFromDate ? Date.parse(this.validFromDate) : earliest;
  rate = { amount: total, schedule: { type: 'installments', installments }, validFrom: validFrom && isFinite(validFrom) ? new Date(validFrom).toISOString() : undefined };
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
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-title"
          @click=${(e: Event) => e.stopPropagation()}
          @keydown=${this.handleKeydown}
          tabindex="-1"
        >
          <div class="header">
            <h2 id="edit-title" class="title">Contract bewerken</h2>
            <button type="button" class="icon" aria-label="Sluiten" @click=${this.close}>&times;</button>
          </div>
          <div class="content">
            <form @submit=${this.submit}>
              <fieldset>
                <legend>Contract</legend>
                <div class="grid cols-2">
                  <label for="name">
                    Naam
                    <input id="name" name="name" .value=${this.name} @input=${(e: InputEvent) => (this.name = (e.target as HTMLInputElement).value)} />
                  </label>
                  <label for="accountNumber">
                    Rekeningnummer
                    <input id="accountNumber" name="accountNumber" .value=${this.accountNumber} @input=${(e: InputEvent) => (this.accountNumber = (e.target as HTMLInputElement).value)} />
                  </label>
                </div>
                <div class="grid cols-2">
                  <label for="validFrom">
                    Ingangsdatum tarief
                    <input id="validFrom" name="validFrom" type="date" .value=${this.validFromDate} @input=${(e: InputEvent) => (this.validFromDate = (e.target as HTMLInputElement).value)} />
                  </label>
                  <label for="obligationLabel">
                    Omschrijving verplichting
                    <input id="obligationLabel" name="obligationLabel" .value=${this.obligationLabel} @input=${(e: InputEvent) => (this.obligationLabel = (e.target as HTMLInputElement).value)} />
                  </label>
                </div>
                <label for="description">
                  Omschrijving
                  <textarea id="description" name="description" .value=${this.description} @input=${(e: InputEvent) => (this.description = (e.target as HTMLTextAreaElement).value)} rows="3"></textarea>
                </label>
              </fieldset>

              <fieldset>
                <legend>Betaling</legend>
                <div class="grid cols-2">
                  <label for="scheduleType">
                    Schema
                    <select id="scheduleType" name="scheduleType" .value=${this.scheduleType} @change=${(e: Event) => (this.scheduleType = (e.target as HTMLSelectElement).value as 'recurring' | 'installments')}>
                      <option value="recurring">Terugkerend</option>
                      <option value="installments">Termijnen</option>
                    </select>
                  </label>
                </div>
                ${this.scheduleType === 'recurring' ? html`
                  <div class="grid cols-2">
                    <label for="amount">
                      Bedrag (€)
                      <input id="amount" name="amount" type="number" min="0" step="0.01" .value=${this.amount} @input=${(e: InputEvent) => (this.amount = (e.target as HTMLInputElement).value)} />
                    </label>
                    <label for="frequency">
                      Frequentie
                      <select id="frequency" name="frequency" .value=${this.frequency} @change=${(e: Event) => (this.frequency = (e.target as HTMLSelectElement).value as PaymentFrequency)}>
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
                  <div class="grid cols-2">
                    <label for="termsCount">
                      Aantal termijnen
                      <input id="termsCount" name="termsCount" type="number" min="0" step="1" .value=${this.termsCount} @input=${(e: InputEvent) => {
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
                    <div class="grid">
                      ${this.installments.slice(0, Number(this.termsCount)).map((t, idx) => html`
                        <div class="grid cols-2" style="align-items:end;">
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
              </fieldset>

              <div class="actions">
                <button type="button" class="btn" @click=${this.close}>Annuleren</button>
                <button type="submit" class="btn primary">Opslaan</button>
              </div>
            </form>
          </div>
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
