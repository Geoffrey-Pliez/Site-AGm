import { arrayRemove, arrayUnion, deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { css, html, LitElement } from 'lit';
import { app } from '../Core/App';
import { requireAuthenticatedUser } from '../Core/auth';
import { updateFiles } from '../Requests/fileRequest';
import { updateModules } from '../Requests/moduleRequest';
import { TemplatePopup } from './template-popup';

class ModifyFilePopup extends LitElement {
  static get properties() {
    return {
      fileToModify: { type: String },
      oldModuleName: { type: String },
    };
  }

  constructor() {
    super();

    this.allModules = app.modules;
    window.addEventListener('modules-changed', () => this.allModules = app.modules);

    window.addEventListener('close-popup', () => this.close());
  }

  static get styles() {
    return [
      TemplatePopup.template_popup_styles(),
      css`
      `,
    ];
  }

  changeModuleSelected(e) {
    this.newModuleName = e.target.value;
  }

  firstUpdated() {
    this.newFileName = this.fileToModify;
  }

  changeFileSelected(e) {
    this.fileSelected = e.target.files[0];
  }

  render() {
    return html`
      <template-popup>
        <h2 slot="title">Modifier un fichier</h2>
        <div id="" slot="body">
          <fieldset>
            <legend>Nom du fichier</legend>
            ${this.fileToModify} => <input type="text" id="filename" name="filename" placeholder="${this.fileToModify}" @input="${e => this.newFileName = e.target.value}"/>
            ou <input type="file" id="file" name="file" @change="${this.changeFileSelected}"/>
          </fieldset>
          <fieldset>
            <legend>Module</legend>
            ${this.oldModuleName} =>
            <select @change="${this.changeModuleSelected}" id="theme" name="theme">
              ${this.allModules.map(theme => html`<option value="${theme.id}" ?selected="${theme.id == this.oldModuleName}">${theme.id}</option>`)}
            </select>
          </fieldset>
        </div>
        <div slot="footer">
          <button id="focus" @click="${() => this.modifyFile()}">Modifier</button>
        </div>
      </template-popup>
    `;
  }

  async modifyImpactedModule(oldFileDoc, newFileDoc) {
    const moduleDoc = doc(app.db, "modules", this.oldModuleName);
    updateDoc(moduleDoc, {
      files: arrayRemove(oldFileDoc),
    });
    updateDoc(moduleDoc, {
      files: arrayUnion(newFileDoc),
    });
  }

  async downloadFile(filename) {
    let URL = await getDownloadURL(ref(app.storage, filename));
    let fileDownloaded = await fetch(URL);
    let fileDownloadedBlob = await fileDownloaded.blob();
    return fileDownloadedBlob;
  }

  async uploadFile(filename, fileBlob) {
    const storageRef = ref(app.storage, filename);
    await uploadBytes(storageRef, fileBlob);
  }

  async modifyFile() {
    if (!requireAuthenticatedUser()) {
      return;
    }
    this.close();

    let mustUpdateUI = false;

    if (this.newFileName && this.newFileName != "" && this.newFileName != this.fileToModify) {
      // create new and delete old document in db
      const oldFileDoc = doc(app.db, "files", this.fileToModify);
      let docSnap = getDoc(oldFileDoc);
      const newFileDoc = doc(app.db, "files", this.newFileName);

      this.modifyImpactedModule(oldFileDoc, newFileDoc);

      docSnap = await docSnap;
      const docData = docSnap.data();
      await setDoc(newFileDoc, docData);
      deleteDoc(oldFileDoc);

      // replace file to change name
      const fileBlob = await this.downloadFile(this.fileToModify);
      await this.uploadFile(this.newFileName, fileBlob);
      deleteObject(ref(app.storage, this.fileToModify));

      mustUpdateUI = true;
    } else if (this.fileSelected) {
      // read file
      let filename = this.fileSelected.name;
      let fileContent = await this.fileSelected.text();
      let fileContentObject = JSON.parse(fileContent);
      this.newFileName = filename;

      // create new and delete old document in db
      const oldFileDoc = doc(app.db, "files", this.fileToModify);
      let docSnap = getDoc(oldFileDoc);
      const newFileDoc = doc(app.db, "files", filename);

      this.modifyImpactedModule(oldFileDoc, newFileDoc);

      docSnap = await docSnap;
      const docData = docSnap.data();
      docData.version = fileContentObject.appVersion;
      docData.environment = fileContentObject.envName;
      await deleteDoc(oldFileDoc);
      await setDoc(newFileDoc, docData);

      // upload new and delete old file
      const storageRef = ref(app.storage, filename);
      await deleteObject(ref(app.storage, this.fileToModify));
      await uploadBytes(storageRef, this.fileSelected);

      mustUpdateUI = true;
    }

    if (this.newModuleName && this.newModuleName != "" && this.newModuleName != this.oldModuleName) {
      const fileDoc = doc(app.db, "files", this.newFileName);

      const oldModuleDoc = doc(app.db, "modules", this.oldModuleName);
      const newModuleDoc = doc(app.db, "modules", this.newModuleName);

      updateDoc(fileDoc, {
        module: newModuleDoc,
      });
      updateDoc(oldModuleDoc, {
        files: arrayRemove(fileDoc),
      });
      updateDoc(newModuleDoc, {
        files: arrayUnion(fileDoc),
      });

      mustUpdateUI = true;
    }

    if (mustUpdateUI) {
      updateModules();
      updateFiles();
    }

  }

  close() {
    this.remove();
  }
}
customElements.define('modifyfile-popup', ModifyFilePopup);
