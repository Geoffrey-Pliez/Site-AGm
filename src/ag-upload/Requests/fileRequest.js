import { arrayUnion, collection, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { app, setState } from "../Core/App";
import { requireAuthenticatedUser } from "../Core/auth";
import { handleMultipleDocumentRequest } from "./generalRequest";

export async function findAllFiles() {
  let filesInfos = await handleMultipleDocumentRequest(() => getDocs(collection(app.db, "files")));
  return filesInfos;
}

export function addFile(filename, moduleName, fileContentObject) {
  if (!requireAuthenticatedUser()) {
    return;
  }
  let newFileDocRef = doc(app.db, 'files', filename);
  let moduleDocRef = doc(app.db, 'modules', moduleName);

  setDoc(newFileDocRef, {
    module: moduleDocRef,
    version: fileContentObject.appVersion,
    environment: fileContentObject.envName,
  });

  updateDoc(moduleDocRef, {
    files: arrayUnion(newFileDocRef),
  });
}

export async function updateFiles() {
  if (!requireAuthenticatedUser()) {
    setState({ files: [] });
    return;
  }
  let files = await findAllFiles();
  setState({ files });
}
