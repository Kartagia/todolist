import { initializeApp } from 'firebase/app';

// Your web app's Firebase configuration
const firebaseConfig = {
apiKey: "Add API key here",
  authDomain: "todo-js-428e3.firebaseapp.com",
  databaseURL: "https://todo-js-428e3-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "todo-js-428e3",
  storageBucket: "todo-js-428e3.appspot.com",
  messagingSenderId: "678632811467",
  appId: "1:678632811467:web:3e8969025152ad00efa44e"
};

const app = initializeApp(firebaseConfig);

/**
 * Het firebase application.
 */
export function getApp() {
  return app;
}