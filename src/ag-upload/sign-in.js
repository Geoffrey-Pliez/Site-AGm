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
      isFocused: Boolean,
      email: String,
      password: String,
      error: String,
      isPasswordShown: Boolean,
    };
  }

  static get styles() {
    return [
      css`
        :host {
          -webkit-touch-callout: none; /* iOS Safari */
          -webkit-user-select: none; /* Safari */
          -khtml-user-select: none; /* Konqueror HTML */
          -moz-user-select: none; /* Old versions of Firefox */
          -ms-user-select: none; /* Internet Explorer/Edge */
          user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
        }

        @keyframes popup-opactiy {
          from {opacity: 0.5;}
          to {opacity: 1;}
        }

        .background {
          background-color: rgba(102, 102, 102, 0.5);
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 100;

          opacity: 1;
          animation-name: popup-opactiy;
          animation-duration: 0.1s;
          transition: opacity 0.1s;
        }

        form {
          background-color: white;
          position: absolute;
          top: 20%;
          left: calc(50% - 400px / 2);
          display: grid;
          width: 400px;
          margin:0;
          padding:0;
          border-radius: 7px;
          box-shadow: 0px 0px 30px rgb(102, 102, 102);
          overflow-y: hidden;
        }

        h1 {
          margin-left: 35px;
        }

        label {
          display: block;
          margin: 10px auto;
          width: 350px;
          height: 50px;
        }

        label > span {
          position: relative;
          padding: 0px 2px;
          left: 10px;
          top: calc(50px / 2 - 17px / 2);
          font-size: 17px;
          line-height: 17px;
          color: grey;
          background-color: white;
          cursor: text;
          transition: top 0.2s, font-size 0.2s, color 0.2s;
        }

        label.focused > span, label.filled > span {
          top: -10px;
          font-size: 10px;
          line-height: 10px;
          color: grey;
        }

        label.error > span {
          color: red;
        }

        label.focused > span {
          color: var(--main-theme-color);
        }

        label > input[type=text], label > input[type=password] {
          padding: 0px 10px;
          font-size: 17px;
          position: absolute;
          width: 350px;
          height: 50px;
          box-sizing: border-box;
          border: solid;
          border-width: 2px;
          border-color: grey;
          border-radius: 10px;
          outline: none;
          transition: border 0.2s;
        }

        label.error > input[type=text],
        label.error > input[type=password] {
          border-color: red;
        }

        label.focused > input[type=text],
        label.focused > input[type=password] {
          border-color: var(--main-theme-color);
        }

        input[type=submit] {
          width: 200px;
          height: 50px;
          margin: 10px auto;
          cursor: pointer;
        }

        span.error {
          margin-left: 35px;
          color: red;
        }

        img {
          position: relative;
          height: 25px;
          width: 25px;
          right: 10px;
          top: calc(50px / 2 - 25px / 2);
          float: right;
        }
      `,
    ];
  }

  render() {
    return html`
      <div class="background" @click="${this.close}">
        <form @click="${(e) => e.preventDefault()}">
          <h1>
            Se connecter
          </h1>
          <label class="email-label">
            <input @focus="${this.focuser}" @focusout="${this.focuser}" @change="${this.changeEmail}" type="text" required>
            <span @click="${this.focuser}">email</span>
          </label>
          <span class="error">
            ${this.error == 'invalid-email' ? 'email invalide' : ''}
            ${this.error == 'user-not-found' ? 'email non reconnu' : ''}
            ${this.error.includes('empty-email') ? '*champs requis' : ''}
          </span>
          <label class="password-label">
            <input @focus="${this.focuser}" @focusout="${this.focuser}" @change="${this.changePassword}" type="${this.isPasswordShown ? 'text' : 'password'}" required>
            <span @click="${this.focuser}">mot de passe</span>
            <img @click="${this.changePasswordVisibility}" src="${this.isPasswordShown ? 'images/eye.png' : 'images/eye cross.png'}"/>
          </label>

          <span class="error">
            ${this.error == 'wrong-password' ? 'mauvais mot de passe' : ''}
            ${this.error.includes('empty-password') ? '*champs requis' : ''}
          </span>
          <input @click="${this.submit}" type="submit" value="Connexion">
        </form>
      </div>
    `
  }

  focuser(e) {
    if (e.type == "focus" || e.type == "click") {
      e.target.parentNode.classList.add('focused');
      e.target.parentNode.focus();
    } else {
      e.target.parentNode.classList.remove('focused');
      e.target.parentNode.classList.remove('error');
    }
  }

  changeEmail(e) {
    this.email = e.target.value;
    if (this.email)
      e.target.parentNode.classList.add('filled');
    else
      e.target.parentNode.classList.remove('filled');
  }

  changePassword(e) {
    this.password = e.target.value;
    if (this.password)
      e.target.parentNode.classList.add('filled');
    else
      e.target.parentNode.classList.remove('filled');
  }

  changePasswordVisibility() {
    this.isPasswordShown = !this.isPasswordShown;
  }

  async submit(e) {
    e.preventDefault();
    document.activeElement.blur();
    this.shadowRoot.querySelector('.password-label').classList.remove('error');
    this.shadowRoot.querySelector('.email-label').classList.remove('error');
    if (!this.email || !this.password) {
      if (!this.email && !this.password) {
        this.shadowRoot.querySelector('.email-label').classList.add('error');
        this.shadowRoot.querySelector('.password-label').classList.add('error');
        this.error = 'empty-email & empty-password';
      } else if (!this.email) {
        this.shadowRoot.querySelector('.email-label').classList.add('error');
        this.error = 'empty-email';
      } else if (!this.password) {
        this.shadowRoot.querySelector('.password-label').classList.add('error');
        this.error = 'empty-password';
      }
      return;
    }
    let isUserAuthenticated = await authenticateUser(this.email, this.password);
    if (isUserAuthenticated === true) {
      console.log('authentifié')
      this.close();
    } else {
      let error = isUserAuthenticated.toString().match(/\(auth\/(.*)\)/)[1];
      switch(error) {
        case 'invalid-email':
        case 'user-not-found':
          this.shadowRoot.querySelector('.email-label').classList.add('error');
          break;
        case 'wrong-password':
          this.shadowRoot.querySelector('.password-label').classList.add('error');
          break;
        default:
          break;
      }
      this.error = error;
    }
  }

  close(e) {
    if (e && e.type == 'click' && e.target.classList[0] == 'background')
      this.closeAnimation();
    else if (e)
      return;
    else
      this.closeAnimation();
  }

  closeAnimation() {
    this.shadowRoot.querySelector('div').style.opacity = 0;
    setTimeout(() => this.remove(), 100);
  }
}
customElements.define('sign-in', SignIn);
