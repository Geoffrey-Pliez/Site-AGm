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
      // nameSorted: { type: String },
      // clipboardText: { type: String },
    };
  }

  constructor() {
    super();
    this.themesDisplayed = app.themes;
    window.addEventListener('themes-changed', () => this.themesDisplayed = app.themes);

    // this.nameSorted = 'notSorted';
    // this.clipboardText = 'Copier le lien';
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
        border-collapse:collapse;
        // border-right: solid 0.5px #333;
        // border-left: solid 0.5px #333;
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
      if (confirm('Etes-vous sûr de vouloir supprimer le thème ' + themeName + ' ?')) {
        deleteDoc(themeDoc);
        updateThemes();
      }
    } else {
      alert('Le thème à supprimer contient des modules, veuillez les supprimer en premier.');
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
                  Nom du thème
                </th>
                <th>
                  Modules
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
              ${this.themesDisplayed
                .map((themeDisplayed, idx) => html`
                <tr style="background-color: ${idx % 2 ? '#ddd' : '#fff'}">
                  <td>
                    ${themeDisplayed.id}
                  </td>
                  <td>
                    ${themeDisplayed.modules.map(module => module.id).join(', ')}
                  </td>
                  <td>
                    <img class="table-item-image" src='images/modify.png' @click="${() => this.openModifyThemePopup(themeDisplayed.id)}" />
                  </td>
                  <td>
                    <img class="table-item-image" src='images/delete.png' @click="${() => this.checkThemeForDelete(themeDisplayed.id)}"/>
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
customElements.define('theme-list', ThemeList);
