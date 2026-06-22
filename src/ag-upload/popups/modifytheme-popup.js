import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { css, html, LitElement } from 'lit';
import { app } from '../Core/App';
import { requireAuthenticatedUser } from '../Core/auth';
import { updateModules } from '../Requests/moduleRequest';
import { updateThemes } from '../Requests/themeRequest';
import { TemplatePopup } from './template-popup';

class ModifyThemePopup extends LitElement {
  static get properties() {
    return {
      themeToModify: { type: String },
      // newThemeName: { type: String },
    };
  }

  constructor() {
    super();

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
    console.log(this.themeToModify);
  }

  render() {
    return html`
      <template-popup>
        <h2 slot="title">Modifier un thème</h2>
        <div id="" slot="body">
          <fieldset>
            <legend>Nom du thème</legend>
            ${this.themeToModify} => <input type="text" id="theme" name="theme" placeholder="${this.themeToModify}" @input="${e => this.newThemeName = e.target.value}"/>
          </fieldset>
        </div>
        <div slot="footer">
          <button id="focus" @click="${() => this.modifyTheme()}">Modifier</button>
        </div>
      </template-popup>
    `;
  }

  async modifyImpactedModules(oldThemeDoc, newThemeDoc) {
    const q = query(collection(app.db, "modules"), where("theme", "==", oldThemeDoc));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((moduleDoc) => {
      moduleDoc = doc(app.db, "modules", moduleDoc.id);
      updateDoc(moduleDoc, {
        theme: newThemeDoc,
      });
    });
  }

  async modifyTheme() {
    if (!requireAuthenticatedUser()) {
      return;
    }
    this.close();

    if (this.newThemeName && this.newThemeName != "") {
      const oldThemeDoc = doc(app.db, "themes", this.themeToModify);
      let docSnap = getDoc(oldThemeDoc);
      const newThemeDoc = doc(app.db, "themes", this.newThemeName);

      this.modifyImpactedModules(oldThemeDoc, newThemeDoc);

      docSnap = await docSnap;
      const docData = docSnap.data();
      await setDoc(newThemeDoc, docData);
      deleteDoc(oldThemeDoc);
      updateThemes();
      updateModules();
    }
  }

  close() {
    this.remove();
  }
}
customElements.define('modifytheme-popup', ModifyThemePopup);
