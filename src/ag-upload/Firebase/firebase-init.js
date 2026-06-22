import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { setState } from '../Core/App';

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.PUBLIC_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

const hasExplicitFirebaseConfig = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value.length > 0
);

const firebaseApp = hasExplicitFirebaseConfig
  ? initializeApp(firebaseConfig)
  : (() => {
      try {
        return initializeApp();
      } catch (error) {
        if (error?.code === "app/no-options") {
          throw new Error(
            "Firebase non configure. Renseigne les variables PUBLIC_FIREBASE_* dans .env (local) ou configure App Hosting pour l'autoconfig."
          );
        }
        throw error;
      }
    })();
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
setState({ db });
const storage = getStorage(firebaseApp);
setState({ storage });

export async function authenticateUser(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const user = credential.user;
    setState({ user });
    return true;
  } catch (e) {
    return e;
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    setState({ user });
  } else {
    setState({ user: null });
  }
});

export async function signOutUser() {
  await signOut(auth);
}
