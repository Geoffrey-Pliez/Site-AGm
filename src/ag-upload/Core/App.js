window.dev_mode = location.hostname === 'localhost';

/**
 * Classe principale de l'application
 */
export class App {
  constructor() {
    this.user = null;

    this.themes = [];
    this.modules = [];
    this.files = [];

    this.fileEnvironmentToShow = 'Tous les environnements';
    this.fileModuleToShow = 'Tous les modules';
    this.moduleThemeToShow = 'Tous les thèmes';
  }
}

export const app = new App();

//Préparation à un state-changed plus général
//Ceci permettra aussi de réduire le nombre de listener par la suite
export const setState = (update) => {
  // modifie le pointeur de app, du coup marche pas
  // app = {...Object.entries(app), ...Object.entries(update)};
  for (const [key, value] of Object.entries(update)) {
    app[key] = value;
  }
  window.dispatchEvent(new CustomEvent('state-changed', { detail: app }));
  if ('themes' in update) {
    window.dispatchEvent(new CustomEvent('themes-changed', { detail: app }));
  }
  if ('modules' in update) {
    window.dispatchEvent(new CustomEvent('modules-changed', { detail: app }));
  }
  if ('files' in update) {
    window.dispatchEvent(new CustomEvent('files-changed', { detail: app }));
  }
  if ('fileEnvironmentToShow' in update) {
    window.dispatchEvent(new CustomEvent('fileEnvironmentToShow-changed', { detail: app }));
  }
  if ('fileModuleToShow' in update) {
    window.dispatchEvent(new CustomEvent('fileModuleToShow-changed', { detail: app }));
  }
  if ('moduleThemeToShow' in update) {
    window.dispatchEvent(new CustomEvent('moduleThemeToShow-changed', { detail: app }));
  }
  if ('user' in update) {
    window.dispatchEvent(new CustomEvent('user-changed', { detail: app }));
  }
};
