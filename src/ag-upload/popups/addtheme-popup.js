import { css, html, LitElement } from 'lit';
import { requireAuthenticatedUser } from '../Core/auth';
import { addTheme, updateThemes } from '../Requests/themeRequest';
import { TemplatePopup } from './template-popup';

class AddThemePopup extends LitElement {
  static get properties() {
    return {
    };
  }

  constructor() {
    super();

    window.addEventListener('close-popup', () => this.close());
  }

  static get styles() {
    return [
      TemplatePopup.template_popup_styles(),
      css``,
    ];
  }

  render() {
    return html`
      <template-popup>
        <h2 slot="title">Ajouter un thème</h2>
        <div slot="body">
          <div class="field-row">
            <label for="theme">Nom du thème</label>
            <input type="text" id="theme" name="theme" />
          </div>
        </div>
        <div slot="footer">
          <button class="btn-primary" id="focus" @click="${() => this.sendTheme()}">Ajouter</button>
        </div>
      </template-popup>
    `;
  }

  async sendTheme() {
    if (!requireAuthenticatedUser()) {
      return;
    }
    let themeName = this.shadowRoot.querySelector('#theme').value;

    if (themeName && themeName != "") {
      addTheme(themeName);
      updateThemes();
    } else {
      alert("Remplissez le champ nom du thème");
      return;
    }

    this.close();
  }

  close() {
    this.remove();
  }
}
customElements.define('addtheme-popup', AddThemePopup);
