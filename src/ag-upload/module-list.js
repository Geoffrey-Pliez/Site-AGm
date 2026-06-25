import { arrayRemove, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { css, html, LitElement } from 'lit';
import { app } from './Core/App';
import { requireAuthenticatedUser } from './Core/auth';
import { createElem } from './Core/general';
import './Firebase/firebase-init';
import './popups/modifymodule-popup';
import { updateModules } from './Requests/moduleRequest';
import { updateThemes } from './Requests/themeRequest';

class ModuleList extends LitElement {
  static get properties() {
    return {
      modulesDisplayed: { type: Array },
      moduleThemeToShow: { type: String }
    };
  }

  constructor() {
    super();
    this.modulesDisplayed = app.modules;
    window.addEventListener('modules-changed', () => this.modulesDisplayed = app.modules);

    this.moduleThemeToShow = app.moduleThemeToShow;
    window.addEventListener('moduleThemeToShow-changed', () => this.moduleThemeToShow = app.moduleThemeToShow);
  }

  static get styles() {
    return css`
      .table-wrap {
        overflow-x: auto;
        margin: 1rem 0;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 8px;
        overflow: hidden;
        box-shadow: var(--shadow);
      }

      thead {
        position: sticky;
        top: 0;
        z-index: 5;
      }

      thead th {
        background: var(--ink);
        color: white;
        font-weight: 800;
        text-align: left;
        padding: 0.75rem 1rem;
        font-size: 0.85rem;
        letter-spacing: 0.03em;
        text-transform: uppercase;
      }

      tbody tr {
        border-bottom: 1px solid var(--line);
        transition: background 0.12s;
      }

      tbody tr:hover {
        background: var(--paper);
      }

      tbody td {
        padding: 0.65rem 1rem;
        vertical-align: middle;
      }

      .action-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.1rem;
        padding: 0.25rem 0.4rem;
        border-radius: 4px;
        transition: background 0.12s;
      }

      .action-btn:hover {
        background: var(--paper);
      }

      .files-list {
        font-size: 0.85rem;
        color: var(--ink-soft);
        max-width: 320px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      @media (max-width: 768px) {
        table, thead, tbody, th, td, tr {
          display: block;
        }

        thead {
          display: none;
        }

        tbody tr {
          margin-bottom: 0.75rem;
          border: 1px solid var(--line);
          border-radius: 8px;
          background: var(--surface);
          padding: 0.5rem 0;
        }

        tbody tr:hover {
          background: var(--surface);
        }

        tbody td {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.4rem 1rem;
          border-bottom: 1px solid var(--line);
        }

        tbody td:last-child {
          border-bottom: none;
        }

        tbody td::before {
          content: attr(data-label);
          font-weight: 700;
          font-size: 0.82rem;
          color: var(--ink-soft);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .files-list {
          max-width: none;
          white-space: normal;
        }
      }
    `
  }

  openModifyModulePopup(moduleName, themeName) {
    if (!requireAuthenticatedUser()) {
      return;
    }
    let elem = createElem('modifymodule-popup');
    elem.moduleToModify = moduleName;
    elem.oldThemeName = themeName;
  }

  async deleteModuleFromTheme(moduleDoc, themeName) {
    updateDoc(doc(app.db, "themes", themeName), {
      modules: arrayRemove(moduleDoc)
    });
  }

  async checkModuleForDelete(moduleName, themeName) {
    if (!requireAuthenticatedUser()) {
      return;
    }
    const moduleDoc = doc(app.db, "modules", moduleName);
    const q = query(collection(app.db, "files"), where("module", "==", moduleDoc));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.size == 0) {
      if (confirm('Êtes-vous sûr de vouloir supprimer le module ' + moduleName + ' ?')) {
        deleteDoc(moduleDoc);
        this.deleteModuleFromTheme(moduleDoc, themeName);
        updateModules();
        updateThemes();
      }
    } else {
      alert('Le module à supprimer contient des fichiers, veuillez les supprimer en premier.');
    }
  }

  render() {
    return html`
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nom du module</th>
              <th>Thème</th>
              <th>Fichiers</th>
              <th>Modifier</th>
              <th>Supprimer</th>
            </tr>
          </thead>
          <tbody>
            ${this.modulesDisplayed
              .filter(moduleDisplayed => this.moduleThemeToShow == 'Tous les thèmes' || moduleDisplayed.theme.id == this.moduleThemeToShow)
              .map(moduleDisplayed => html`
              <tr>
                <td data-label="Module">${moduleDisplayed.id}</td>
                <td data-label="Thème">${moduleDisplayed.theme.id}</td>
                <td data-label="Fichiers"><span class="files-list">${moduleDisplayed.files.sort((file1, file2) => file1.id > file2.id ? 1 : -1).map(file => file.id).join(', ')}</span></td>
                <td data-label="Modifier">
                  <button class="action-btn" @click="${() => this.openModifyModulePopup(moduleDisplayed.id, moduleDisplayed.theme.id)}" title="Modifier">✏️</button>
                </td>
                <td data-label="Supprimer">
                  <button class="action-btn" @click="${() => this.checkModuleForDelete(moduleDisplayed.id, moduleDisplayed.theme.id)}" title="Supprimer">🗑️</button>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    `
  }

}
customElements.define('module-list', ModuleList);
