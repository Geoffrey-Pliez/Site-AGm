import { arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { css, html, LitElement } from 'lit';
import { app } from '../Core/App';
import { requireAuthenticatedUser } from '../Core/auth';
import { updateModules } from '../Requests/moduleRequest';
import { updateThemes } from '../Requests/themeRequest';
import { TemplatePopup } from './template-popup';

class ModifyModulePopup extends LitElement {
  static get properties() {
    return {
      moduleToModify: { type: String },
      oldThemeName: { type: String },
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
      css``,
    ];
  }

  changeThemeSelected(e) {
    this.newThemeName = e.target.value;
  }

  firstUpdated() {
    this.newModuleName = this.moduleToModify;
  }

  render() {
    return html`
      <template-popup>
        <h2 slot="title">Modifier un module</h2>
        <div slot="body">
          <fieldset>
            <legend>Nom du module</legend>
            ${this.moduleToModify} => <input type="text" id="module" name="module" placeholder="${this.moduleToModify}" @input="${e => this.newModuleName = e.target.value}"/>
          </fieldset>
          <fieldset>
            <legend>Thème</legend>
            ${this.oldThemeName} =>
            <select @change="${this.changeThemeSelected}" id="theme" name="theme">
              ${this.allThemes.map(theme => html`<option value="${theme.id}" ?selected="${theme.id == this.oldThemeName}">${theme.id}</option>`)}
            </select>
          </fieldset>
        </div>
        <div slot="footer">
          <button class="btn-primary" id="focus" @click="${() => this.modifyModule()}">Modifier</button>
        </div>
      </template-popup>
    `;
  }

  async modifyImpactedFiles(oldModuleDoc, newModuleDoc) {
    const q = query(collection(app.db, "files"), where("module", "==", oldModuleDoc));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((fileDoc) => {
      fileDoc = doc(app.db, "files", fileDoc.id);
      updateDoc(fileDoc, {
        module: newModuleDoc,
      });
    });
  }

  async modifyImpactedTheme(oldModuleDoc, newModuleDoc) {
    const themeDoc = doc(app.db, "themes", this.oldThemeName);
    updateDoc(themeDoc, {
      modules: arrayRemove(oldModuleDoc),
    });
    updateDoc(themeDoc, {
      modules: arrayUnion(newModuleDoc),
    });
  }

  async modifyModule() {
    if (!requireAuthenticatedUser()) {
      return;
    }
    this.close();

    let mustUpdateUI = false;

    if (this.newModuleName && this.newModuleName != "" && this.newModuleName != this.moduleToModify) {
      const oldModuleDoc = doc(app.db, "modules", this.moduleToModify);
      let docSnap = getDoc(oldModuleDoc);
      const newModuleDoc = doc(app.db, "modules", this.newModuleName);

      this.modifyImpactedFiles(oldModuleDoc, newModuleDoc);
      this.modifyImpactedTheme(oldModuleDoc, newModuleDoc);

      docSnap = await docSnap;
      const docData = docSnap.data();
      await setDoc(newModuleDoc, docData);
      deleteDoc(oldModuleDoc);

      mustUpdateUI = true;
    }

    if (this.newThemeName && this.newThemeName != "" && this.newThemeName != this.oldThemeName) {
      const moduleDoc = doc(app.db, "modules", this.newModuleName);

      const oldThemeDoc = doc(app.db, "themes", this.oldThemeName);
      const newThemeDoc = doc(app.db, "themes", this.newThemeName);

      updateDoc(moduleDoc, {
        theme: newThemeDoc,
      });
      updateDoc(oldThemeDoc, {
        modules: arrayRemove(moduleDoc),
      });
      updateDoc(newThemeDoc, {
        modules: arrayUnion(moduleDoc),
      });

      mustUpdateUI = true;
    }

    if (mustUpdateUI) {
      updateThemes();
      updateModules();
    }

  }

  close() {
    this.remove();
  }
}
customElements.define('modifymodule-popup', ModifyModulePopup);
