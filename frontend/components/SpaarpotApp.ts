
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import '../components/contract-add-form/ContractAddForm';
import '../components/contract-overview/ContractOverview';

/**
 * Main application component for Spaarpot
 */
@customElement('spaarpot-app')
export class SpaarpotApp extends LitElement {
  static styles = css`
    :host { display: block; padding: 2rem; font-family: sans-serif; }
  `;
  render() {
    return html`
      <h1>Welkom bij Spaarpot</h1>
      <contract-add-form></contract-add-form>
      <contract-overview></contract-overview>
    `;
  }
}
