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
                  const pickDisplayRate = (rates: PaymentRate[]): PaymentRate | undefined => {
                    if (!rates?.length) return undefined;
                    const actives = rates.filter(r => (!r.validFrom || Date.parse(r.validFrom) <= now) && (!r.validTo || Date.parse(r.validTo) >= now));
                    if (actives.length) {
                      // Latest active by validFrom else createdAt
                      return actives.sort((a, b) => (Date.parse(a.validFrom ?? a.createdAt) - Date.parse(b.validFrom ?? b.createdAt)))[actives.length - 1];
                    }
                    // Fallback: most recent by validFrom or createdAt
                    return [...rates].sort((a, b) => (Date.parse(b.validFrom ?? b.createdAt) - Date.parse(a.validFrom ?? a.createdAt)))[0];
                  };
                  const entries = (c.obligations ?? []).map(ob => ({ ob, rate: pickDisplayRate(ob.rates ?? []) }));
                  const currents = (entries.map(e => e.rate).filter(Boolean) as PaymentRate[]);
                  type Rec = { amount: number; frequency: 'daily'|'weekly'|'biweekly'|'monthly'|'quarterly'|'yearly' };
                  const recurring: Rec[] = [];
                  let unknownRecurringTotalFromRates = 0;
                  for (const r of currents) {
                    if (r.schedule?.type === 'recurring') {
                      recurring.push({ amount: r.amount || 0, frequency: r.schedule.frequency });
                    } else if (!r.schedule && r.frequency) {
                      recurring.push({ amount: r.amount || 0, frequency: r.frequency });
                    } else if (!r.schedule && !r.frequency) {
                      // Legacy with no frequency: still show amount under unknown bucket
                      unknownRecurringTotalFromRates += r.amount || 0;
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
                  const inferFreqFromText = (txt?: string): Rec['frequency'] | undefined => {
                    if (!txt) return undefined;
                    const t = txt.toLowerCase();
                    if (/biweekly|twee\s*wekelijks|2\s*-?\s*weken/.test(t)) return 'biweekly';
                    if (/dag|dagelijks/.test(t)) return 'daily';
                    if (/week|wekelijks/.test(t)) return 'weekly';
                    if (/maand|maandelijks/.test(t)) return 'monthly';
                    if (/kwartaal|per\s*kwartaal/.test(t)) return 'quarterly';
                    if (/jaar|jaarlijks|per\s*jaar/.test(t)) return 'yearly';
                    return undefined;
                  };

                  const byFreq = new Map<Rec['frequency'], number>();
                  let unknownRecurringTotal = unknownRecurringTotalFromRates;
                  for (const r of recurring) {
                    byFreq.set(r.frequency, (byFreq.get(r.frequency) ?? 0) + r.amount);
                  }
                  // If rates existed but lacked frequency, try to read legacy frequency from the obligation
                  for (const { ob, rate } of entries) {
                    if (!rate) continue;
                    const hasKnown = Boolean(rate.schedule?.type === 'recurring' || rate.frequency);
                    if (hasKnown) continue;
                    const legacyFreq = (ob as unknown as { frequency?: Rec['frequency']; label?: string })?.frequency
                      ?? inferFreqFromText((ob as unknown as { label?: string })?.label);
                    if (legacyFreq) {
                      byFreq.set(legacyFreq, (byFreq.get(legacyFreq) ?? 0) + (rate.amount || 0));
                      unknownRecurringTotal -= (rate.amount || 0);
                    }
                  }
                  // Legacy fallback: only if an obligation has no selected rate
                  for (const { ob, rate } of entries) {
                    if (rate) continue;
                    const legacy = ob as unknown as { amount?: number; frequency?: Rec['frequency'] };
                    const legacyAmount = typeof legacy?.amount === 'number' && isFinite(legacy.amount) ? legacy.amount : 0;
                    if (legacyAmount > 0) {
                      if (legacy?.frequency) {
                        byFreq.set(legacy.frequency, (byFreq.get(legacy.frequency) ?? 0) + legacyAmount);
                      } else {
                        unknownRecurringTotal += legacyAmount;
                      }
                    }
                  }
                  const uniqueFreqs = [...byFreq.keys()];
                  const recurringNode = uniqueFreqs.length > 0 ? html`
                    ${uniqueFreqs.length === 1 ? html`
                      <div class="meta">Doorlopend: € ${(byFreq.get(uniqueFreqs[0]) ?? 0).toFixed(2)} per ${freqLabel(uniqueFreqs[0])}</div>
                    ` : html`
                      <div class="meta">Doorlopend: ${uniqueFreqs.map(f => `€ ${(byFreq.get(f) ?? 0).toFixed(2)} per ${freqLabel(f)}`).join(' + ')}</div>
                    `}
                    ${unknownRecurringTotal > 0 ? html`<div class="meta">Doorlopend: € ${unknownRecurringTotal.toFixed(2)}</div>` : null}
                  ` : (unknownRecurringTotal > 0 ? html`<div class="meta">Doorlopend: € ${unknownRecurringTotal.toFixed(2)}</div>` : null);

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
