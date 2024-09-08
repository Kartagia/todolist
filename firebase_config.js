import { initializeApp } from 'firebase/app';
import firebaseConfig from "./cgi-bin/firebase.config.json";

// Your web app's Firebase configuration
const firebaseConfig = {};

const app = initializeApp(firebaseConfig);

/**
 * Het firebase application.
 */
export function getApp() {
  return app;
}