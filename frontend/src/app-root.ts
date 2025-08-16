import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './components/contract-form';
import './components/contract-list';
import './components/contract-edit';
import type { Contract, NewContractInput } from './types';
import { contractsRepo } from './storage/contractsRepository';

@customElement('app-root')
export class AppRoot extends LitElement {
  static styles = css`
    :host { display: block; padding: 1rem; font-family: system-ui, sans-serif; }
    header { margin-bottom: 1rem; }
    h1 { font-size: 1.5rem; margin: 0 0 0.25rem; }
    .grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }
    @media (min-width: 720px) { .grid { grid-template-columns: 1fr 1fr; } }
    section { border: 1px solid #eee; padding: 1rem; border-radius: 12px; }
  `;

  @state() private contracts: Contract[] = [];
  @state() private message: string | null = null;
  @state() private editing: Contract | null = null;

  private readonly submitHandler: EventListener = (e: Event) => this.onSubmit(e as CustomEvent<NewContractInput>);
  private readonly editRequestHandler: EventListener = (e: Event) => this.onEditRequest(e as CustomEvent<string>);
  private readonly saveHandler: EventListener = (e: Event) => this.onSave(e as CustomEvent<{ id: string; input: NewContractInput }>);

  connectedCallback(): void {
    super.connectedCallback();
    this.refresh();
  this.addEventListener('contract-submit', this.submitHandler);
  this.addEventListener('edit-request', this.editRequestHandler);
  this.addEventListener('contract-save', this.saveHandler);
  }

  disconnectedCallback(): void {
  this.removeEventListener('contract-submit', this.submitHandler);
  this.removeEventListener('edit-request', this.editRequestHandler);
  this.removeEventListener('contract-save', this.saveHandler);
    super.disconnectedCallback();
  }

  private async refresh() {
    this.contracts = await contractsRepo.list();
  }

  private async onSubmit(e: CustomEvent<NewContractInput>) {
    try {
      await contractsRepo.add(e.detail);
      this.message = 'Contract toegevoegd';
      await this.refresh();
      setTimeout(() => (this.message = null), 1500);
  } catch {
      this.message = 'Kon contract niet opslaan';
    }
  }

  private onEditRequest = async (e: CustomEvent<string>) => {
    const id = e.detail;
    const found = await contractsRepo.get(id);
    if (found) this.editing = found;
  };

  private onSave = async (e: CustomEvent<{ id: string; input: NewContractInput }>) => {
    try {
      const { id, input } = e.detail;
      await contractsRepo.update(id, input);
      this.message = 'Contract opgeslagen';
      this.editing = null;
      await this.refresh();
      setTimeout(() => (this.message = null), 1500);
    } catch {
      this.message = 'Opslaan mislukt';
    }
  };

  render() {
    return html`
      <header>
        <h1>Spaarpotjes</h1>
        <p>Beheer je contracten</p>
        ${this.message ? html`<p role="status">${this.message}</p>` : null}
      </header>
      <div class="grid">
        <section>
          <h2>Nieuw contract</h2>
          <contract-form></contract-form>
        </section>
        <section>
          <h2>Contracten</h2>
          <contract-list .contracts=${this.contracts}></contract-list>
        </section>
      </div>
  <contract-edit .open=${!!this.editing} .contract=${this.editing ?? undefined}></contract-edit>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-root': AppRoot;
  }
}
