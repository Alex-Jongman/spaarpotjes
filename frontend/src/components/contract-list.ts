import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Contract } from '../types';

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
                ${Array.isArray(c.obligations) && c.obligations.length ? html`<div class="meta">Totaal verplichtingen: € ${c.obligations.reduce((sum, ob) => {
                  const now = Date.now();
                  const current = (ob.rates ?? []).filter(r => (!r.validFrom || Date.parse(r.validFrom) <= now) && (!r.validTo || Date.parse(r.validTo) >= now)).slice(-1)[0];
                  if (!current) return sum;
                  return sum + (current.amount || 0);
                }, 0).toFixed(2)} ${(() => {
                  // If all current rates share the same schedule recurring frequency, display it; else omit for mixed or installments.
                  const now = Date.now();
                  const freqs = new Set((c.obligations ?? []).map(ob => {
                    const cur = (ob.rates ?? []).filter(r => (!r.validFrom || Date.parse(r.validFrom) <= now) && (!r.validTo || Date.parse(r.validTo) >= now)).slice(-1)[0];
                    if (cur?.schedule?.type === 'recurring') return cur.schedule.frequency;
                    if (!cur?.schedule && cur?.frequency) return cur.frequency;
                    return undefined;
                  }).filter(Boolean) as string[]);
                  return freqs.size === 1 ? `(${[...freqs][0]})` : '';
                })()}</div>` : null}
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
