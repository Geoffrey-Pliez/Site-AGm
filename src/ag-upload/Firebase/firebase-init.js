import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { setState } from '../Core/App';
import config from './firebase-config.json';


const firebaseApp = initializeApp(config);
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
