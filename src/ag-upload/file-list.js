import { arrayRemove, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { css, html, LitElement } from 'lit';
import { app } from './Core/App';
import { requireAuthenticatedUser } from './Core/auth';
import { createElem } from './Core/general';
import './Firebase/firebase-init';
import './popups/modifyfile-popup';
import { updateFiles } from './Requests/fileRequest';
import { updateModules } from './Requests/moduleRequest';

class FileList extends LitElement {
  static get properties() {
    return {
      filesDisplayed: { type: Array },
      fileEnvironmentToShow: { type: String },
      fileModuleToShow: { type: String },
      clipboardText: { type: String },
    };
  }

  constructor() {
    super();
    this.filesDisplayed = app.files;
    window.addEventListener('files-changed', () => this.filesDisplayed = app.files);

    this.fileEnvironmentToShow = app.fileEnvironmentToShow;
    window.addEventListener('fileEnvironmentToShow-changed', () => this.fileEnvironmentToShow = app.fileEnvironmentToShow);
    this.fileModuleToShow = app.fileModuleToShow;
    window.addEventListener('fileModuleToShow-changed', () => this.fileModuleToShow = app.fileModuleToShow);

    this.clipboardText = 'Copier le lien';
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

      .clipboard-wrap {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
      }

      .clipboard-tip {
        visibility: hidden;
        width: 120px;
        background: var(--ink);
        color: white;
        text-align: center;
        border-radius: 6px;
        padding: 4px 8px;
        position: absolute;
        z-index: 11;
        bottom: 140%;
        left: 50%;
        transform: translateX(-50%);
        opacity: 0;
        transition: opacity 0.2s;
        font-size: 0.82rem;
        font-weight: 600;
        pointer-events: none;
      }

      .clipboard-tip::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border: 5px solid transparent;
        border-top-color: var(--ink);
      }

      .clipboard-wrap:hover .clipboard-tip {
        visibility: visible;
        opacity: 1;
      }

      a.file-link {
        color: #0f5f8c;
        font-weight: 600;
        text-decoration: none;
        font-size: 0.9rem;
      }

      a.file-link:hover {
        text-decoration: underline;
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
      }
    `
  }

  copyToClipboard(event) {
    this.clipboardText = 'Lien copié !';
    navigator.clipboard.writeText(event.currentTarget.parentNode.querySelector("a").href);
    setTimeout(() => this.clipboardText = 'Copier le lien', 2000);
  }

  openModifyFilePopup(fileName, moduleName) {
    if (!requireAuthenticatedUser()) {
      return;
    }
    let elem = createElem('modifyfile-popup');
    elem.fileToModify = fileName;
    elem.oldModuleName = moduleName;
  }

  async deleteFileFromModule(fileDoc, moduleName) {
    updateDoc(doc(app.db, "modules", moduleName), {
      files: arrayRemove(fileDoc)
    });
  }

  async checkFileForDelete(fileName, moduleName) {
    if (!requireAuthenticatedUser()) {
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer le fichier ' + fileName + ' ?')) {
      const fileDoc = doc(app.db, "files", fileName);
      deleteDoc(fileDoc);
      this.deleteFileFromModule(fileDoc, moduleName);
      const storageRef = ref(app.storage, fileName);
      deleteObject(storageRef);
      updateModules();
      updateFiles();
    }
  }

  render() {
    return html`
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nom du fichier</th>
              <th>Lien</th>
              <th>Environnement</th>
              <th>Module</th>
              <th>Modifier</th>
              <th>Supprimer</th>
            </tr>
          </thead>
          <tbody>
            ${this.filesDisplayed
              .filter(fileDisplayed => this.fileEnvironmentToShow == 'Tous les environnements' || fileDisplayed.environment == this.fileEnvironmentToShow)
              .filter(fileDisplayed => this.fileModuleToShow == 'Tous les modules' || fileDisplayed.module.id == this.fileModuleToShow)
              .map(fileDisplayed => html`
              <tr>
                <td data-label="Fichier">${fileDisplayed.id}</td>
                <td data-label="Lien">
                  <div class="clipboard-wrap">
                    <a class="file-link" target="_blank" href="${'https://ag.crem.be/?activityName=' + fileDisplayed.id}">
                      ag.crem.be/?activityName=${fileDisplayed.id}
                    </a>
                    <button class="action-btn" @click="${this.copyToClipboard}" @mouseout="${() => this.clipboardText = 'Copier le lien'}" title="Copier le lien">📋</button>
                    <span class="clipboard-tip">${this.clipboardText}</span>
                  </div>
                </td>
                <td data-label="Environnement">${fileDisplayed.environment}</td>
                <td data-label="Module">${fileDisplayed.module.id}</td>
                <td data-label="Modifier">
                  <button class="action-btn" @click="${() => this.openModifyFilePopup(fileDisplayed.id, fileDisplayed.module.id)}" title="Modifier">✏️</button>
                </td>
                <td data-label="Supprimer">
                  <button class="action-btn" @click="${() => this.checkFileForDelete(fileDisplayed.id, fileDisplayed.module.id)}" title="Supprimer">🗑️</button>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    `
  }

}
customElements.define('file-list', FileList);
