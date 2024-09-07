import React from 'react';
import {createContext} from 'react';
import {initializeApp} from 'firebase/app';
import {getAuth, createUserWithEmailAndPassword, signInWithEmail, signOut} from 'firebase/auth';
import LoginPage from "./Login.jsx";
//import { getAuth } from './cdn_modules/firebase@9.23.0/firebase-auth.js';
import {useState, useEffect, Fragment} from 'react';
import ErrorPage from "./Error.jsx";

/**
 * @typedef {import("./login.js").ProviderInfo} ProviderInfo
 */
 /**
  * @typedef {import("./login.js").RegisterEmail} RegisterEmail
  */


/**
 * @typedef {@import("./login.js").EmailProviderInfo} EmailProviderInfo
 */

/**
 * @typedef {import("./login.js").UserInfo} UserInfo
 */



/**
 * The authentication context data.
 * @typedef {Object} AuthData
 * @property {Readonly<ProviderInfo>} [provider] The provider of authemtication.
 * @property {Readonly<UserInfo>} userInfo The user information of the logged user
 * @property {Readonly<boolean>} loggedIn Is there logged in user.
 * @property {(user:UserInfo|undefined)=>undefined} setUser Set logged user.
 * @property {(provider:ProviderInfo|undefined)=>undefined} setProvider Set current authentication provider.
 * @property {()=>undefined} logout Logs out the current user.
 */

/**
 * The authentication context
 * @type {@import('react').Context<AuthData>}
 */
export const AuthContext = createContext(
  {
    provider: undefined,
    userInfo: null,
    get loggedIn() {
      return this.userInfo != null;
    },
    setUser(userInfo) {
      if (this.loggedIn && userInfo == null && this.provider && this.provider.logout) {
        this.provider.logout(this.userInfo);
      }
      this.userInfo = userInfo || null;
    },
    setProvider(provider) {
      this.provider = provider;
    },
    logout() {
      this.setUser(null);
    }
  }
  );

/**
 * @typedef {Object} AuthProps
 * @property {Record<String,String>} [firebaseConfig] The application firebase configuration.
 * @property {EmailProviderInfo} [emailProvider] The email provider.
 * @property {boolean} [loggedIn=false] Is there logged in user.
 */

function getAuthData(props) {
  if (props.firebaseConfig) {
  try {
    const app = initializeApp(props.firebaseConfig);
    const auth = getAuth(app);
    return {
      provider: {
        name: "Firebase",
        login: (user, secret) => {
          signInWithEmailAndPassword(auth, email, secret)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    resolve(user);
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    reject(error);
  });
        },
        register: (user, secret) => {
          createUserWithEmailAndPassword(auth, email, secret)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    resolve(user);
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    resolve(error);
  });
        },
        logout: (user) => {
          return new Promise( (resolve, reject) => {
            signOut(auth).then(() => {
  // Sign-out successful.
  resolve();
}).catch((error) => {
  // An error happened.
  reject(error);
});
          });
        }
      },
      get userInfo() { return auth.userInfo }
    };
  } catch (error) {
  console.error("Initializing Firebase authentication failed", error);
  if (props.emailProvider) {
    console.log("Fallback to secondary email provider");
    return {
      provider: props.emailProvider,
      userInfo: null
    };
  }
}
} else if (props.emailProvider) {
  const user = props.loggedIn ? props.user : null;
  return {
    provider: props.emailProvider,
    userInfo: user
  };
} else {
  return null;
}
}

/**
 * @param {import("react").PropsWithChildren<AuthProps>} props The component props
 */
export default function Authentication(props) {
  const [authData, setAuthData] = useState(getAuthData(props));
  const {loggedIn, setLoggedIn} = useState(props.loggedIn ? true : false);
    
    const content = authData.loggedIn ?
    props.children: <LoginPage 
      allowEmail={true}
      emailProvider={
        authData.provider
      }
      onLogin={ (userInfo, provider) => {
      setAuthData( (old) => {
        return {
          ...old,
          userInfo,
          provider
        }
      });
    }
    }
    
    onLogout={
      () => {
        setAuthData( (old) => ({
        ...old,
          userInfo: null,
          provider: undefined
        }) )
      }
    }
    
    />;
    return (<AuthContext.Provider value={authData}>{content}</AuthContext.Provider>);
  
}
