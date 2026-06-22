import { app } from './App';

export function requireAuthenticatedUser() {
  if (app.user) {
    return true;
  }
  alert("Vous devez d'abord vous connecter pour utiliser l'administration.");
  return false;
}
