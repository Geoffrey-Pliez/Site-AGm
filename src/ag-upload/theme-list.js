import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { css, html, LitElement } from 'lit';
import { app } from './Core/App';
import { requireAuthenticatedUser } from './Core/auth';
import { createElem } from './Core/general';
import './Firebase/firebase-init';
import './popups/modifytheme-popup';
import { updateThemes } from './Requests/themeRequest';

class ThemeList extends LitElement {
  static get properties() {
    return {
      themesDisplayed: { type: Array },
    };
  }

  constructor() {
    super();
    this.themesDisplayed = app.themes;
    window.addEventListener('themes-changed', () => this.themesDisplayed = app.themes);
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

      .modules-list {
        font-size: 0.85rem;
        color: var(--ink-soft);
        max-width: 400px;
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

        .modules-list {
          max-width: none;
          white-space: normal;
        }
      }
    `
  }

  openModifyThemePopup(themeName) {
    if (!requireAuthenticatedUser()) {
      return;
    }
    let elem = createElem('modifytheme-popup');
    elem.themeToModify = themeName;
  }

  async checkThemeForDelete(themeName) {
    if (!requireAuthenticatedUser()) {
      return;
    }
    const themeDoc = doc(app.db, "themes", themeName);
    const q = query(collection(app.db, "modules"), where("theme", "==", themeDoc));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.size == 0) {
      if (confirm('Êtes-vous sûr de vouloir supprimer le thème ' + themeName + ' ?')) {
        deleteDoc(themeDoc);
        updateThemes();
      }
    } else {
      alert('Le thème à supprimer contient des modules, veuillez les supprimer en premier.');
    }
  }

  render() {
    return html`
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nom du thème</th>
              <th>Modules</th>
              <th>Modifier</th>
              <th>Supprimer</th>
            </tr>
          </thead>
          <tbody>
            ${this.themesDisplayed
              .map(themeDisplayed => html`
              <tr>
                <td data-label="Thème">${themeDisplayed.id}</td>
                <td data-label="Modules"><span class="modules-list">${themeDisplayed.modules.map(module => module.id).join(', ')}</span></td>
                <td data-label="Modifier">
                  <button class="action-btn" @click="${() => this.openModifyThemePopup(themeDisplayed.id)}" title="Modifier">✏️</button>
                </td>
                <td data-label="Supprimer">
                  <button class="action-btn" @click="${() => this.checkThemeForDelete(themeDisplayed.id)}" title="Supprimer">🗑️</button>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    `
  }

}
customElements.define('theme-list', ThemeList);
