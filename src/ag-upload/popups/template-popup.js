import { css, html, LitElement } from 'lit';

export class TemplatePopup extends LitElement {
  static get properties() {
    return {
      title: { type: String },
    };
  }

  static template_popup_styles() {
    return css`
      [slot='body'] {
        display: grid;
        place-items: center;
        gap: 0.75rem;
        padding: 1rem 1.5rem 0.5rem;
      }

      [slot='body'] .field-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
      }

      [slot='body'] label {
        font-weight: 700;
        font-size: 0.9rem;
        white-space: nowrap;
      }

      [slot='body'] input[type="text"],
      [slot='body'] input[type="file"],
      [slot='body'] select {
        min-height: 38px;
        padding: 0.4rem 0.7rem;
        border: 1px solid var(--line);
        border-radius: 6px;
        color: var(--ink);
        font: inherit;
        background: var(--surface);
        box-sizing: border-box;
        width: 100%;
      }

      [slot='body'] input[type="checkbox"] {
        height: 20px;
        width: 20px;
      }

      [slot='body'] fieldset {
        border: 1px solid var(--line);
        border-radius: 6px;
        padding: 0.75rem 1rem;
        margin: 0;
        width: 100%;
        box-sizing: border-box;
      }

      [slot='body'] legend {
        font-weight: 700;
        font-size: 0.85rem;
        color: var(--ink-soft);
        padding: 0 0.35rem;
      }

      [slot='footer'] {
        display: flex;
        justify-content: center;
        gap: 0.75rem;
        padding: 0.75rem 1.5rem 1.25rem;
      }

      [slot='footer'] button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 40px;
        padding: 0.5rem 1.25rem;
        border: 2px solid var(--ink);
        border-radius: 6px;
        font-weight: 800;
        cursor: pointer;
        transition: background 0.12s, color 0.12s;
      }

      [slot='footer'] .btn-primary {
        background: var(--ink);
        color: white;
      }

      [slot='footer'] .btn-primary:hover {
        background: var(--ink-soft);
      }

      [slot='footer'] .btn-secondary {
        background: var(--surface);
        color: var(--ink);
      }

      [slot='footer'] .btn-secondary:hover {
        background: var(--paper);
      }
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .background {
        display: flex;
        background-color: rgba(16, 44, 70, 0.35);
        position: fixed;
        inset: 0;
        z-index: 100;
        animation: fadeIn 0.15s ease;
        align-items: center;
        justify-content: center;
      }

      .popup-box {
        background: var(--surface);
        border-radius: 8px;
        box-shadow: var(--shadow);
        border: 1px solid var(--line);
        width: min(520px, 90vw);
        max-height: 80vh;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
      }

      .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--line);
      }

      .popup-header h2 {
        margin: 0;
        font-family: Georgia, Cambria, serif;
        font-size: 1.25rem;
        color: var(--ink);
      }

      .popup-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--ink-soft);
        padding: 0.15rem 0.35rem;
        line-height: 1;
        border-radius: 4px;
        transition: background 0.12s;
      }

      .popup-close:hover {
        background: var(--paper);
      }
    `;
  }

  render() {
    return html`
      <div class="background" @click="${(e) => { if (e.target.classList.contains('background')) window.dispatchEvent(new Event('close-popup')); }}">
        <div class="popup-box">
          <div class="popup-header">
            <h2><slot name="title"></slot></h2>
            <button class="popup-close" @click="${() => window.dispatchEvent(new Event('close-popup'))}">&times;</button>
          </div>
          <slot name="body"></slot>
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}

window.addEventListener('keyup', (e) => {
  e.key === 'Escape' && window.dispatchEvent(new Event('close-popup'));
});

customElements.define('template-popup', TemplatePopup);
