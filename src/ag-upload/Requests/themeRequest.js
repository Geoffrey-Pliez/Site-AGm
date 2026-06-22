import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { app, setState } from "../Core/App";
import { requireAuthenticatedUser } from "../Core/auth";
import { handleMultipleDocumentRequest } from "./generalRequest";

export function addTheme(themeName) {
  if (!requireAuthenticatedUser()) {
    return;
  }
  setDoc(doc(app.db, "themes", themeName), {
    modules: []
  });
}

export async function findAllThemes() {
  let themesInfos = await handleMultipleDocumentRequest(() => getDocs(collection(app.db, "themes")));
  return themesInfos;
}

export async function updateThemes() {
  if (!requireAuthenticatedUser()) {
    setState({ themes: [] });
    return;
  }
  let themes = await findAllThemes();
  setState({ themes });
}
