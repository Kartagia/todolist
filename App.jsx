import React from 'react';
import {createRoot} from 'react-dom';
import emailProvider from "./dummyEmailProvider.js";
import Dashboard from './Dashboard.jsx';
import Auth from './Authentication.jsx';
// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAV2k4gs7L_6NeXSOzC7BaIt5eCWrftSYI",
  authDomain: "todo-js-428e3.firebaseapp.com",
  databaseURL: "https://todo-js-428e3-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "todo-js-428e3",
  storageBucket: "todo-js-428e3.appspot.com",
  messagingSenderId: "678632811467",
  appId: "1:678632811467:web:3e8969025152ad00efa44e"
};

const root = createRoot(mountNode);
root.render(
  <Auth firebaseConfig={firebaseConfig} emailProvider={emailProvider}>
  <Dashboard classes={{
    tableContainer: '',
    appBarSpacer: '',
    container: '',
    drawerPaper: '',
    title: '',
    toolbar: '',
    root: ''
  }} />
</Auth>);
