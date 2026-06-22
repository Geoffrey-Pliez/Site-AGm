import { css, html, LitElement } from 'lit';
import { app } from '../Core/App';
import { requireAuthenticatedUser } from '../Core/auth';
import { addModule, updateModules } from '../Requests/moduleRequest';
import { updateThemes } from '../Requests/themeRequest';
import { TemplatePopup } from './template-popup';

class AddModulePopup extends LitElement {
  static get properties() {
    return {
      allThemes: { type: Array },
    };
  }

  constructor() {
    super();

    this.allThemes = app.themes;
    window.addEventListener('themes-changed', () => this.allThemes = app.themes);

    window.addEventListener('close-popup', () => this.close());
  }

  static get styles() {
    return [
      TemplatePopup.template_popup_styles(),
      css`
      `,
    ];
  }

  updated() {
  }

  changeThemeSelected(e) {
    this.themeName = e.target.value;
  }

  changeModuleWritten(e) {
    this.moduleName = e.target.value;
  }

  render() {
    return html`
      <template-popup>
        <h2 slot="title">Ajouter un module</h2>
        <div id="" slot="body">
          <label for="module">Nom du module</label>
          <input @input="${this.changeModuleWritten}" type="text" id="module" name="module" />

          <label for="theme">Thème</label>
          <select @change="${this.changeThemeSelected}" id="theme" name="theme">
            ${this.allThemes.map(theme => html`<option value="${theme.id}">${theme.id}</option>`)}
          </select>
        </div>
        <div slot="footer">
          <button id="focus" @click="${() => this.sendModule()}">Ajouter</button>
        </div>
      </template-popup>
    `;
  }

  async sendModule() {
    if (!requireAuthenticatedUser()) {
      return;
    }
    if (this.moduleName && this.moduleName != "") {
      if (!this.themeName) {
        this.themeName = this.allThemes[0].id;
      }
      addModule(this.moduleName, this.themeName);
      updateModules();
      updateThemes();
    } else {
      alert("remplir le champ nom du module");
      return;
    }

    this.close();
  }

  close() {
    this.remove();
  }
}
customElements.define('addmodule-popup', AddModulePopup);
