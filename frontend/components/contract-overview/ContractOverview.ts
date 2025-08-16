import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { contracts$ } from '../../services/ContractStore';
import type { Contract } from '../../models/Contract';

/**
 * <contract-overview> - Overzicht van alle toegevoegde contracten
 * @see /docs/frontend-components.md
 */
@customElement('contract-overview')
export class ContractOverview extends LitElement {
  static styles = css`
    .overview {
      margin-top: 2rem;
      max-width: 600px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e0e0e0;
      text-align: left;
    }
    th {
      background: #f5f5f5;
    }
    caption {
      text-align: left;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    .empty {
      color: #757575;
      font-style: italic;
      padding: 1rem;
    }
  `;

  private _contracts: Contract[] = [];
  public get contracts(): Contract[] {
    return this._contracts;
  }
  public set contracts(value: Contract[]) {
    this._contracts = value;
    this.requestUpdate();
  }
  private subscription: any;

  connectedCallback() {
    super.connectedCallback();
    this.subscription = contracts$.subscribe(list => {
      this.contracts = list;
    });
  }

  disconnectedCallback() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    super.disconnectedCallback();
  }

  // No need for loadContracts or handleContractAdded; handled by observable

  render() {
    return html`
      <section class="overview" aria-label="Overzicht contracten">
        <table>
          <caption>Contracten</caption>
          <thead>
            <tr>
              <th>Naam</th>
              <th>Rekeningnummer</th>
              <th>Omschrijving</th>
            </tr>
          </thead>
          <tbody>
            ${this.contracts.length === 0
              ? html`<tr><td colspan="3" class="empty">Nog geen contracten toegevoegd.</td></tr>`
              : this.contracts.map(c => html`
                <tr>
                  <td>${c.name}</td>
                  <td>${c.accountNumber}</td>
                  <td>${c.description ?? nothing}</td>
                </tr>
              `)
            }
          </tbody>
        </table>
      </section>
    `;
  }
}
