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
      .admin-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
        padding: 1rem 0;
        border-bottom: 1px solid var(--line);
        margin-bottom: 1rem;
      }

      .admin-bar a {
        text-decoration: none;
        font-weight: 700;
      }

      .admin-bar a:hover {
        text-decoration: underline;
      }

      .admin-tabs {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .admin-tab {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1.25rem;
        border: 2px solid var(--ink);
        border-radius: 8px;
        background: var(--surface);
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
      }

      .admin-tab:hover {
        background: var(--paper);
      }

      .admin-tab-selected {
        background: var(--ink);
        color: white;
      }

      .admin-tab-selected:hover {
        background: var(--ink-soft);
      }

      .admin-tab label {
        font-weight: 800;
        cursor: pointer;
      }

      .admin-tab input[type="radio"] {
        appearance: none;
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        border: 2px solid var(--ink);
        border-radius: 50%;
        margin: 0;
        flex-shrink: 0;
        transition: border-color 0.15s, background 0.15s;
      }

      .admin-tab-selected input[type="radio"] {
        border-color: white;
        background: var(--mint);
      }

      .admin-tab button {
        padding: 0.35rem 0.7rem;
        border: 2px solid var(--ink);
        border-radius: 6px;
        background: var(--sun);
        color: var(--ink);
        font-weight: 800;
        font-size: 0.82rem;
        cursor: pointer;
        transition: transform 0.1s, filter 0.1s;
      }

      .admin-tab button:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
      }

      .admin-tab-selected button {
        border-color: white;
        background: var(--mint);
        color: var(--ink);
      }

      .admin-tab button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none;
        filter: none;
      }

      .filter-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }

      .filter-row label {
        font-weight: 700;
        font-size: 0.9rem;
      }

      .filter-row select {
        min-height: 38px;
        padding: 0.4rem 0.7rem;
        border: 1px solid var(--line);
        border-radius: 6px;
        color: var(--ink);
        font: inherit;
        background: var(--surface);
        cursor: pointer;
      }

      .auth-link {
        font-weight: 700;
        text-decoration: none;
        cursor: pointer;
      }

      .auth-link:hover {
        text-decoration: underline;
      }

      @media (max-width: 768px) {
        .admin-bar {
          flex-direction: column;
          align-items: stretch;
        }
        .admin-tabs {
          flex-direction: column;
        }
        .filter-row {
          flex-direction: column;
          align-items: stretch;
        }
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
      return html`<p style="padding: 2rem 0; color: var(--ink-soft);"><strong>Connectez-vous</strong> pour gérer les thèmes, modules et fichiers.</p>`;
    }

    switch (this.elementTypeToShow) {
      case 'themes':
        return html`<theme-list></theme-list>`;
      case 'modules':
        return html`<module-list></module-list>`;
      case 'files':
        return html`<file-list></file-list>`;
      default:
        return html`<p style="padding: 2rem 0; color: var(--ink-soft);">Sélectionnez une catégorie ci-dessus.</p>`;
    }
  }

  render() {
    return html`
      <div class="admin-bar">
        <div class="admin-tabs">
          <div class="admin-tab ${this.elementTypeToShow == 'themes' ? 'admin-tab-selected' : ''}">
            <input ?disabled="${!this.user}" type="radio" name="elementTypeToShow" id="themes" value="themes" @change="${this.changeElementTypeToShow}">
            <label for="themes">Thèmes</label>
            <button ?disabled="${!this.user}" @click="${this.openAddThemePopup}">+ Ajouter</button>
          </div>
          <div class="admin-tab ${this.elementTypeToShow == 'modules' ? 'admin-tab-selected' : ''}">
            <input ?disabled="${!this.user}" type="radio" name="elementTypeToShow" id="modules" value="modules" @change="${this.changeElementTypeToShow}">
            <label for="modules">Modules</label>
            <button ?disabled="${!this.user}" @click="${this.openAddModulePopup}">+ Ajouter</button>
            <div class="filter-row">
              <label for="themeToShow">Filtrer par thème</label>
              <select ?disabled="${!this.user}" name="themeToShow" id="themeToShow" @change="${this.changeThemeShown}">
                ${this.allThemes.map(theme => html`<option value="${theme.id}">${theme.id}</option>`)}
              </select>
            </div>
          </div>
          <div class="admin-tab ${this.elementTypeToShow == 'files' ? 'admin-tab-selected' : ''}">
            <input ?disabled="${!this.user}" type="radio" name="elementTypeToShow" id="files" value="files" @change="${this.changeElementTypeToShow}">
            <label for="files">Fichiers</label>
            <button ?disabled="${!this.user}" @click="${this.openAddFilePopup}">+ Ajouter</button>
            <div class="filter-row">
              <label for="environmentToShow">Filtrer par</label>
              <select ?disabled="${!this.user}" name="environmentToShow" id="environmentToShow" @change="${this.changeEnvironmentShown}">
                ${this.allEnvironments.map(environment => html`<option value="${environment}">${environment}</option>`)}
              </select>
              <select ?disabled="${!this.user}" @change="${this.changeModuleShown}">
                ${this.allModules.map(module => html`<option value="${module.id}">${module.id}</option>`)}
              </select>
            </div>
          </div>
        </div>
        <div>
          ${this.user ? html`<a class="auth-link" @click="${() => this.signOut()}">Se déconnecter</a> <span style="color: var(--ink-soft); font-size: 0.85rem;">(${this.user.email})</span>` : html`<a class="auth-link" @click="${() => createElem('sign-in')}">Se connecter</a>`}
        </div>
      </div>

      ${this.showElement()}
    `;
  }

  signOut() {
    signOutUser();
  }
}
customElements.define('agu-app', AguApp);
