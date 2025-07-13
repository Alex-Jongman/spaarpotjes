import { LitElement, html, css } from 'lit';

/**
 * Main application component for Spaarpot
 */
export class SpaarpotApp extends LitElement {
  static styles = css`
    :host { display: block; padding: 2rem; font-family: sans-serif; }
  `;
  render() {
    return html`<h1>Welkom bij Spaarpot</h1>`;
  }
}
customElements.define('spaarpot-app', SpaarpotApp);
