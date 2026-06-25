import { css, html, LitElement } from 'lit';
import { authenticateUser } from './Firebase/firebase-init';

class SignIn extends LitElement {
  constructor() {
    super();
    this.error = '';

    window.addEventListener('keydown', (e) => {
      if (e.keyCode == 27)
        this.close();
    });
  }

  static get properties() {
    return {
      email: String,
      password: String,
      error: String,
      isPasswordShown: Boolean,
    };
  }

  static get styles() {
    return css`
      :host {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .background {
        background-color: rgba(16, 44, 70, 0.35);
        position: fixed;
        inset: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.15s ease;
      }

      form {
        background: var(--surface);
        width: min(400px, 90vw);
        padding: 2rem;
        border-radius: 8px;
        box-shadow: var(--shadow);
        border: 1px solid var(--line);
        display: grid;
        gap: 1rem;
      }

      h2 {
        margin: 0;
        font-family: Georgia, Cambria, serif;
        font-size: 1.5rem;
        color: var(--ink);
      }

      .field {
        display: grid;
        gap: 0.35rem;
      }

      .field label {
        font-weight: 800;
        font-size: 0.9rem;
      }

      .field input {
        width: 100%;
        min-height: 42px;
        padding: 0.55rem 0.7rem;
        border: 1px solid var(--line);
        border-radius: 6px;
        color: var(--ink);
        font: inherit;
        background: var(--surface);
        box-sizing: border-box;
      }

      .field input:focus {
        outline: 2px solid var(--ink);
        outline-offset: -1px;
      }

      .field.error input {
        border-color: var(--coral);
      }

      .field.error input:focus {
        outline-color: var(--coral);
      }

      .password-wrapper {
        position: relative;
      }

      .password-wrapper input {
        padding-right: 2.5rem;
      }

      .password-toggle {
        position: absolute;
        right: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0.25rem;
        line-height: 1;
      }

      .error-msg {
        color: var(--coral);
        font-size: 0.85rem;
        font-weight: 600;
        min-height: 1.2em;
      }

      input[type="submit"] {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 0.68rem 1rem;
        border: 2px solid var(--ink);
        border-radius: 6px;
        font-weight: 800;
        background: var(--ink);
        color: white;
        cursor: pointer;
        font-size: 1rem;
        transition: background 0.15s;
      }

      input[type="submit"]:hover {
        background: var(--ink-soft);
      }

      @media (max-width: 768px) {
        form {
          padding: 1.5rem;
        }
      }
    `;
  }

  changeEmail(e) {
    this.email = e.target.value;
  }

  changePassword(e) {
    this.password = e.target.value;
  }

  changePasswordVisibility() {
    this.isPasswordShown = !this.isPasswordShown;
  }

  async submit(e) {
    e.preventDefault();
    this.error = '';
    if (!this.email || !this.password) {
      if (!this.email && !this.password) {
        this.error = 'empty-email & empty-password';
      } else if (!this.email) {
        this.error = 'empty-email';
      } else if (!this.password) {
        this.error = 'empty-password';
      }
      return;
    }
    let isUserAuthenticated = await authenticateUser(this.email, this.password);
    if (isUserAuthenticated === true) {
      this.close();
    } else {
      let error = isUserAuthenticated.toString().match(/\(auth\/(.*)\)/)[1];
      this.error = error;
    }
  }

  errorMessage() {
    switch (this.error) {
      case 'invalid-email': return 'Email invalide';
      case 'user-not-found': return 'Email non reconnu';
      case 'wrong-password': return 'Mot de passe incorrect';
      case 'empty-email & empty-password': return 'Remplissez tous les champs';
      case 'empty-email': return 'Remplissez le champ email';
      case 'empty-password': return 'Remplissez le champ mot de passe';
      default: return '';
    }
  }

  render() {
    const isEmailError = ['invalid-email', 'user-not-found', 'empty-email', 'empty-email & empty-password'].includes(this.error);
    const isPasswordError = ['wrong-password', 'empty-password', 'empty-email & empty-password'].includes(this.error);

    return html`
      <div class="background" @click="${this.close}">
        <form @click="${(e) => e.preventDefault()}" @submit="${this.submit}">
          <h2>Connexion</h2>

          <div class="field ${isEmailError ? 'error' : ''}">
            <label for="email">Email</label>
            <input id="email" type="text" @change="${this.changeEmail}" @input="${this.changeEmail}" required>
          </div>

          <div class="field ${isPasswordError ? 'error' : ''}">
            <label for="password">Mot de passe</label>
            <div class="password-wrapper">
              <input id="password" type="${this.isPasswordShown ? 'text' : 'password'}" @change="${this.changePassword}" @input="${this.changePassword}" required>
              <button type="button" class="password-toggle" @click="${this.changePasswordVisibility}" tabindex="-1">${this.isPasswordShown ? '👁' : '👁‍🗨'}</button>
            </div>
          </div>

          <div class="error-msg">${this.errorMessage()}</div>

          <input type="submit" value="Connexion">
        </form>
      </div>
    `
  }

  close(e) {
    if (e && e.type == 'click' && e.target.classList.contains('background'))
      this.closeAnimation();
    else if (e)
      return;
    else
      this.closeAnimation();
  }

  closeAnimation() {
    this.shadowRoot.querySelector('div').style.opacity = 0;
    setTimeout(() => this.remove(), 150);
  }
}
customElements.define('sign-in', SignIn);
