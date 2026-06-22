import { css, html, LitElement } from 'lit';
import { app, setState } from './Core/App';
import { requireAuthenticatedUser } from './Core/auth';
import { createElem } from './Core/general';
import './file-list';
import './Firebase/firebase-init';
import { signOutUser } from './Firebase/firebase-init';
import './module-list';
import './popups/addfile-popup';
import './popups/addmodule-popup';
import './popups/addtheme-popup';
import { updateFiles } from './Requests/fileRequest';
import { updateModules } from './Requests/moduleRequest';
import { updateThemes } from './Requests/themeRequest';
import './sign-in';
import './theme-list';

class AguApp extends LitElement {
  static get properties() {
    return {
      allModules: { type: Array },
      elementTypeToShow: { type: String },
      user: { type: Object },
    };
  }

  constructor() {
    super();

    this.allModules = [{ id: 'Tous les modules' }, ...app.modules];
    window.addEventListener('modules-changed', () => this.allModules = [{ id: 'Tous les modules' }, ...app.modules]);

    this.allThemes = [{ id: 'Tous les thèmes' }, ...app.themes];
    window.addEventListener('themes-changed', () => this.allThemes = [{ id: 'Tous les thèmes' }, ...app.themes]);

    this.allEnvironments = ['Tous les environnements', 'Grandeurs', 'Tangram', 'Cubes', 'Geometrie'];

    this.elementTypeToShow = null;

    this.user = app.user;
    window.addEventListener('user-changed', () => {
      this.user = app.user;
      if (this.user) {
        this.refreshData();
      } else {
        setState({ themes: [], modules: [], files: [] });
      }
    });
  }

  static get styles() {
    return css`
      .not-table-elements {
        height: 150px;
        width: 1400px;
        max-width: 90%;
        margin: auto;
      }

      .element-choice-container {
        display: flex;
      }

      .element-choice {
        width: 33.3333%;
        border: none;
        border-radius: 5px;
        box-shadow: 0px 0px 2px grey;
      }

      legend {
        border-radius: 5px;
        background-color: rgba(255, 255, 255, 0.5);
      }

      .element-choice-selected {
        background-color: #e9e9e9;
        box-shadow: inset 0px 0px 3px grey;
      }

      button {
        cursor: pointer;
      }

      a {
        color: blue;
        cursor: pointer;
      }

      a:visited {
        color: blue;
      }
    `
  }

  changeEnvironmentShown(event) {
    setState({ fileEnvironmentToShow: event.target.options[event.target.selectedIndex].value });
  }

  changeModuleShown(event) {
    setState({ fileModuleToShow: event.target.options[event.target.selectedIndex].value });
  }

  changeThemeShown(event) {
    setState({ moduleThemeToShow: event.target.options[event.target.selectedIndex].value });
  }

  async firstUpdated() {
    if (!this.user) {
      return;
    }
    await this.refreshData();
  }

  async refreshData() {
    updateThemes();
    updateModules();
    updateFiles();
  }

  changeElementTypeToShow(e) {
    this.elementTypeToShow = e.target.value;
  }

  openAddFilePopup() {
    if (!requireAuthenticatedUser()) {
      return;
    }
    createElem('addfile-popup');
  }

  openAddModulePopup() {
    if (!requireAuthenticatedUser()) {
      return;
    }
    createElem('addmodule-popup');
  }

  openAddThemePopup() {
    if (!requireAuthenticatedUser()) {
      return;
    }
    createElem('addtheme-popup');
  }

  showElement() {
    if (!this.user) {
      return html`<p>Connectez-vous pour gérer les thèmes, modules et fichiers.</p>`;
    }

    switch (this.elementTypeToShow) {
      case 'themes':
        return html`<theme-list></theme-list>`;
      case 'modules':
        return html`<module-list></module-list>`;
      case 'files':
        return html`<file-list></file-list>`;
      default:
        return html``;
    }
  }

  render() {
    return [
      html`
        <div class="not-table-elements">
          ${this.user ? html`<a @click="${() => this.signOut()}">Se déconnecter</a> (${this.user.email})` : html`<a @click="${() => createElem('sign-in')}">Se connecter</a>`}

          <div class="element-choice-container">
            <fieldset class="element-choice ${this.elementTypeToShow == 'themes' ? 'element-choice-selected' : ''}">
              <legend>Thèmes</legend>
              <input ?disabled="${!this.user}" type="radio" name="elementTypeToShow" id="themes" value="themes" @change="${this.changeElementTypeToShow}">
              <label for="themes">Afficher les thèmes</label>
              <button ?disabled="${!this.user}" @click="${this.openAddThemePopup}">
                Ajouter un thème
              </button>
            </fieldset>
            <fieldset class="element-choice ${this.elementTypeToShow == 'modules' ? 'element-choice-selected' : ''}">
              <legend>Modules</legend>
              <input ?disabled="${!this.user}" type="radio" name="elementTypeToShow" id="modules" value="modules" @change="${this.changeElementTypeToShow}">
              <label for="modules">Afficher les modules</label>
              <button ?disabled="${!this.user}" @click="${this.openAddModulePopup}">
                Ajouter un module
              </button>

              <br>

              Filtrer par

              <br>

              <select ?disabled="${!this.user}" style="width:49%" name="themeToShow" id="themeToShow" @change="${this.changeThemeShown}">
                ${this.allThemes.map(theme => html`<option value="${theme.id}">${theme.id}</option>`)}
              </select>
            </fieldset>
            <fieldset class="element-choice ${this.elementTypeToShow == 'files' ? 'element-choice-selected' : ''}">
              <legend>Fichiers</legend>
              <input ?disabled="${!this.user}" type="radio" name="elementTypeToShow" id="files" value="files" @change="${this.changeElementTypeToShow}">
              <label for="files">Afficher les fichiers</label>
              <button ?disabled="${!this.user}" @click="${this.openAddFilePopup}">
                Ajouter un fichier
              </button>

              <br>

              Filtrer par

              <br>

              <select ?disabled="${!this.user}" style="width:49%" name="environmentToShow" id="environmentToShow" @change="${this.changeEnvironmentShown}">
                ${this.allEnvironments.map(environment => html`<option value="${environment}">${environment}</option>`)}
              </select>

              <select ?disabled="${!this.user}" style="width: 49%; float: right;" @change="${this.changeModuleShown}">
                ${this.allModules.map(module => html`<option value="${module.id}">${module.id}</option>`)}
              </select>
            </fieldset>
          </div>
        </div>
      `,
      this.showElement()
    ];
  }

  signOut() {
    signOutUser();
  }
}
customElements.define('agu-app', AguApp);
