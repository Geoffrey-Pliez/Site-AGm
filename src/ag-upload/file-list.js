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
      nameSorted: { type: String },
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

    this.nameSorted = 'notSorted';

    this.clipboardText = 'Copier le lien';
  }

  static get styles() {
    return css`
      #table-container {
        height: calc(100% - 150px);
        overflow: auto;
        margin: auto;
        // margin-top: 10px;
      }

      table
      {
        border-collapse: collapse;
        // border: 1px solid #333;
        margin: auto;
        // margin-top: 10px;
        // margin-bottom: 10px;
        border-spacing: 0px;
        width: 1400px;
        max-width: 90%;
        box-shadow: 0px 0px 5px grey;
        // border-radius:  7px;
      }

      thead {
        position: sticky;
        top: 0px;
        z-index: 10;
      }

      td, th {
        border-collapse: collapse;
        padding: 5px 20px;
      }

      tr {
        background-color: #bbb;
      }

      img.table-item-image {
        cursor: pointer;
        height: 1em;
      }

      [sorted="notSorted"] {
        background:url(data:image/gif;base64,R0lGODlhCwALAJEAAAAAAP///xUVFf///yH5BAEAAAMALAAAAAALAAsAAAIUnC2nKLnT4or00PvyrQwrPzUZshQAOw==) no-repeat center right !important;
      }

      [sorted="ascending"] {
        background:url(data:image/gif;base64,R0lGODlhCwALAJEAAAAAAP///xUVFf///yH5BAEAAAMALAAAAAALAAsAAAIRnC2nKLnT4or00Puy3rx7VQAAOw==) no-repeat center right !important;
      }

      [sorted="descending"] {
        background:url(data:image/gif;base64,R0lGODlhCwALAJEAAAAAAP///xUVFf///yH5BAEAAAMALAAAAAALAAsAAAIPnI+py+0/hJzz0IruwjsVADs=) no-repeat center right !important;
      }

      .clipboardContainer {
        float: right;
        position: relative;
        display: inline-block;
      }

      .clipboardContainer .clipboardTooltip {
        visibility: hidden;
        width: 140px;
        background-color: #555;
        color: #fff;
        text-align: center;
        border-radius: 6px;
        padding: 5px;
        position: absolute;
        z-index: 11;
        bottom: 150%;
        left: 50%;
        margin-left: -75px;
        opacity: 0;
        transition: opacity 0.3s;
      }

      .clipboardContainer .clipboardTooltip::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #555 transparent transparent transparent;
      }

      .clipboardContainer:hover .clipboardTooltip {
        visibility: visible;
        opacity: 1;
      }

      a {
        color: blue;
      }

      a:visited {
        color: blue;
      }
    `
  }

  copyToClipboard(event) {
    this.clipboardText = 'Lien copié !';
    navigator.clipboard.writeText(event.target.parentNode.parentNode.querySelector("a").href);
  }

  openModifyFilePopup(fileName, moduleName) {
    if (!requireAuthenticatedUser()) {
      return;
    }
    let elem = createElem('modifyfile-popup');
    elem.fileToModify = fileName;
    elem.oldModuleName = moduleName;
  }

  // sortByName() {
  //   if (this.nameSorted != 'ascending') {
  //     this.nameSorted = 'ascending';
  //     this.filesDisplayed.sort((file1, file2) => {
  //       return file1.id.localeCompare(file2.id)
  //     });
  //   } else {
  //     this.nameSorted = 'descending';
  //     this.filesDisplayed.sort((file1, file2) => {
  //       return file2.id.localeCompare(file1.id)
  //     });
  //   }
  // }

  async deleteFileFromModule(fileDoc, moduleName) {
    updateDoc(doc(app.db, "modules", moduleName), {
      files: arrayRemove(fileDoc)
    });
  }

  async checkFileForDelete(fileName, moduleName) {
    if (!requireAuthenticatedUser()) {
      return;
    }
    if (confirm('Etes-vous sûr de vouloir supprimer le fichier ' + fileName + ' ?')) {
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
    return [
      html`
        <div id="table-container">
          <table>
            <thead>
              <tr>
                <th>
                  <!-- @click="${this.sortByName}"
                  id="title" class="noselect sortable" sorted="${this.nameSorted}"> -->
                  Nom du fichier
                </th>
                <th>
                  Lien
                </th>
                <th>
                  Environnement
                </th>
                <th>
                  Module
                </th>
                <th>
                  Modifier
                </th>
                <th>
                  Supprimer
                </th>
              </tr>
            </thead>
            <tbody>
              ${this.filesDisplayed
                .filter(fileDisplayed => this.fileEnvironmentToShow == 'Tous les environnements' || fileDisplayed.environment == this.fileEnvironmentToShow)
                .filter(fileDisplayed => this.fileModuleToShow == 'Tous les modules' || fileDisplayed.module.id == this.fileModuleToShow)
                .map((fileDisplayed, idx) => html`
                <tr style="background-color: ${idx % 2 ? '#ddd' : '#fff'}">
                  <td>
                    ${fileDisplayed.id}
                  </td>
                  <td>
                    <a target="_blank" href="${'https://ag.crem.be/?activityName=' + fileDisplayed.id}">
                      ${'ag.crem.be/?activityName=' + fileDisplayed.id}
                    </a>
                    <div class="clipboardContainer">
                      <span class="clipboardTooltip">${this.clipboardText}</span>
                      <img class="table-item-image" style="float: right; z-index: 1;" src="images/copyToClipboard.png" @click="${this.copyToClipboard}" @mouseout="${() => this.clipboardText = 'Copier le lien'}" />
                    </div>
                  </td>
                  <td>
                    ${fileDisplayed.environment}
                  </td>
                  <td>
                    ${fileDisplayed.module.id}
                  </td>
                  <td>
                    <img class="table-item-image" src='images/modify.png' @click="${() => this.openModifyFilePopup(fileDisplayed.id, fileDisplayed.module.id)}"/>
                  </td>
                  <td>
                    <img class="table-item-image" src='images/delete.png' @click="${() => this.checkFileForDelete(fileDisplayed.id, fileDisplayed.module.id)}"/>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      `
    ]
  }

}
customElements.define('file-list', FileList);
