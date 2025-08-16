import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Contract, PaymentRate } from '../types';

@customElement('contract-list')
export class ContractList extends LitElement {
  static styles = css`
    ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.5rem; }
    li { border: 1px solid #ddd; border-radius: 8px; padding: 0.75rem; }
    .name { font-weight: 700; }
    .meta { color: #555; font-size: 0.9rem; }
  .row { display: flex; justify-content: space-between; align-items: center; gap: .5rem; }
  button { padding: .3rem .6rem; }
  `;

  @property({ type: Array }) contracts: Contract[] = [];

  render() {
    if (!this.contracts?.length) {
      return html`<p>Geen contracten toegevoegd.</p>`;
    }
    return html`
      <ul>
        ${this.contracts.map(c => html`
          <li>
            <div class="row">
              <div>
                <div class="name">${c.name}</div>
                <div class="meta">Rekening: ${c.accountNumber}</div>
                ${Array.isArray(c.obligations) && c.obligations.length ? (() => {
                  const now = Date.now();
                  const currents = ((c.obligations ?? []).map(ob => (ob.rates ?? []).filter(r => (!r.validFrom || Date.parse(r.validFrom) <= now) && (!r.validTo || Date.parse(r.validTo) >= now)).slice(-1)[0]).filter(Boolean) as PaymentRate[]);
                  type Rec = { amount: number; frequency: 'daily'|'weekly'|'biweekly'|'monthly'|'quarterly'|'yearly' };
                  const recurring: Rec[] = [];
                  for (const r of currents) {
                    if (r.schedule?.type === 'recurring') {
                      recurring.push({ amount: r.amount || 0, frequency: r.schedule.frequency });
                    } else if (!r.schedule && r.frequency) {
                      recurring.push({ amount: r.amount || 0, frequency: r.frequency });
                    }
                  }
                  const installments = currents.flatMap(r => r.schedule?.type === 'installments' ? [{ amount: r.amount || 0, count: r.schedule.installments.length }] : []);

                  const freqLabel = (f: Rec['frequency']) => ({
                    daily: 'dag',
                    weekly: 'week',
                    biweekly: '2 weken',
                    monthly: 'maand',
                    quarterly: 'kwartaal',
                    yearly: 'jaar',
                  } as const)[f];

                  const byFreq = new Map<Rec['frequency'], number>();
                  for (const r of recurring) {
                    byFreq.set(r.frequency, (byFreq.get(r.frequency) ?? 0) + r.amount);
                  }
                  const uniqueFreqs = [...byFreq.keys()];
                  const recurringNode = uniqueFreqs.length > 0 ? html`
                    ${uniqueFreqs.length === 1 ? html`
                      <div class="meta">Doorlopend: € ${(byFreq.get(uniqueFreqs[0]) ?? 0).toFixed(2)} per ${freqLabel(uniqueFreqs[0])}</div>
                    ` : html`
                      <div class="meta">Doorlopend: ${uniqueFreqs.map(f => `€ ${(byFreq.get(f) ?? 0).toFixed(2)} per ${freqLabel(f)}`).join(' + ')}</div>
                    `}
                  ` : null;

                  const installmentsNode = installments.length > 0 ? html`
                    <div class="meta">Termijnen: € ${installments.reduce((s, i) => s + i.amount, 0).toFixed(2)} (${installments.reduce((s, i) => s + i.count, 0)} termijnen)</div>
                  ` : null;

                  return html`${recurringNode}${installmentsNode}`;
                })() : null}
              </div>
              <div>
                <button @click=${() => this.dispatchEvent(new CustomEvent('edit-request', { detail: c.id, bubbles: true, composed: true }))} aria-label="Bewerk ${c.name}">Bewerken</button>
              </div>
            </div>
            ${c.description ? html`<div>${c.description}</div>` : null}
          </li>
        `)}
      </ul>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'contract-list': ContractList;
  }
}
