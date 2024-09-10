
/**
 * Module initializing the firebase for the app.
 */

import {readFile} from 'node:fs';
import {initializeApp} from "firebase/app";
import {createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut} from "firebase/auth";
import { Exception } from './login.mjs';

/**
 * A configuration error.
 */
export class ConfigurationError extends Exception {

    /**
     * Create new configuration error.
     * @param {string} [message] The error message. 
     * @param {*} [cause] The cause of the exception. 
     */
    constructor(message = null, cause = null) {
        super(message, cause);
        this.name = this.constructor.name;
    }
}

/**
 * The firebase application configuration.
 * 
 * @typedef {Object} FirebaseAppConfig
 * @property {string} apiKey The API key.
 * @property {string} authDomain The firebase authentication domain.
 * @property {string} databaseURL The firebase database url.
 * @property {string} projectId The firebase project identifier.
 * @property {string} storageBucket The firebase storage bucket.
 * @property {string} messagingSenderId The firebase messaging sender identifier.
 * @property {string} appId The firebase application identifier.
 */

/**
 * Read the configuration from the hidden configuration file.
 *
 * @param {Partial<FirebaseAppConfig>} defaultConfig The firebase configuration.
 * @returns {Promise<FirebaseAppConfig>} The promise of a proper firebase app configuration. 
 */
export function readConfig(defaultConfig = {}) {
    return new Promise( (resolve, reject) => {
        readFile("./firebase.env", (err, data) => {
            try {
                if (err) {
                    throw new Error("Could not read the configuration file");
                }
                    const config = JSON.parse(data);
                if (typeof config != "object") {
                    throw new SyntaxError("Invalid configuration file");
                }
                resolve({...defaultConfig, ...config});
            } catch(parseError) {
                reject(new ConfigurationError("Invalid firebase configuration", parseError));
            }
        });
    });
}

/**
 * Get the firebase application.
 *
 * @param {Partial<FirebaseAppConfig>} [defaultConfig] The default configuration of the firebase app. 
 * @returns {Promise<import("firebase/app").FirebaseApp>} The promise of a firebase application.
 */
export async function getApp(defaultConfig = undefined) {
    const firebaseConfig = await readConfig(defaultConfig);
    return initializeApp(firebaseConfig);
}

/**
 * Get the Firebase authetication information.
 *
 * @param {import('@firebase/app').FirebaseApp} [app] The firebase application, whose authentication is queried.
 * Defaults to the default application read from the hidden config file. 
 * @returns {Promise<import("firebase/auth").Auth>} The promise of the authentication.
 */
export async function getAuthentication(app = undefined) {
    if (app == null) {
        return getApp().then( app => (getAuth(app)));
    } else {
        return new Promise( (resolve, reject) => {
            try {
                resolve(getAuth(app));
            } catch(error) {
                reject(new ConfigurationError("Firebase authentication error", error));
            }
        });
    }
}

/**
 * Create new email user.
 *
 * @param {import('@firebase/auth').Auth} auth The firebase authentication.
 * @param {string} email The email address of the created user.
 * @param {string} secret The secret of the user.
 * @returns {Promise<import('@firebase/auth').User>} Firebase user information of the created user.
 */
export async function createUser(auth, email, secret) {
    return createUserWithEmailAndPassword(auth, email, secret).then( userCredentials => (userCredentials.user));
}

/**
 * Log in a user with email.
 *
 * @param {import('@firebase/auth').Auth} auth 
 * @param {string} email The email addrsss of the user.
 * @param {string} secret The secret of the user.
 * @returns {Promise<import('@firebase/auth').User} The promise of hte user information.
 */
export async function emailLogin(auth, email, secret) {
    return signInWithEmailAndPassword(auth, email, secret).then( userCredentials => (userCredentials.user));
}

/**
 * Signout the current user.
 * @param {import('@firebase/auth').Auth} auth The firebase authentication.
 * @param {UserInfo} user The signed out user.
 * @returns {Promise<void>} The promise of completion.
 */
export async function logout(auth) {
    return signOut(auth);
}


/**
 * Create the user information from the firebase user.
 * @param {import('@firebase/auth').User} user The firebase user.
 * @returns {Promise<import('./login.mjs').EmailUserInfo>} The user information representation from given firebase user.
 */
export function createUserInfo(user) {

    return Promise.resolve( /** @type {EmailUserInfo} */ {
        get displayName() {
            return user.displayName;
        },
        get image() {
            return user.photoURL;
        },
        get id() {
            return user.uid;
        },
        get email() {
            return user.email || undefined;
        },
        get verified() {
            return user.emailVerified;
        }
    });

}

/**
 * The firebase provider information.
 *
 * @typedef {import('./login.mjs').EmailProviderInfo & { firebaseAuth: Readonly<import('@firebase/auth').Auth> }} FirebaseProviderInfo
 */

/**
 * Logout user.
 * @param {import("./login.mjs").UserInfo} user The user information.
 * @return {Promise<void>} The promise of logout.
 */
export function logoutUser(auth) {
    return logout(auth);
}

/**
 * Get the firebase provider.
 * 
 * @param {import('@firebase/auth').Auth} auth The firebase authentication.
 * @returns {FirebaseProviderInfo} The providers of the firebase user services.
 */
export function getFirebaseProvider(auth) {

    return /** @type {FIrebaseProviderInfo} */ {
        /**
         * The firebase authentication of the provider.
         */
        get firebaseAuth() {
            return auth;
        },

        /**
         * @inheritdoc
         */
        get name() { return "Firebase"; },
        /**
         * The logged in user.
         */
        _user: null,
        /**
         * @inheritdoc
         */
        async login(user, secret) {
            return emailLogin(this.getFirebaseAuth(), user, secret).then( 
                (userInfo) => {
                    const result = createUserInfo(userInfo);
                    this._user = result;
                    return result;
                }
            );
        },
        /**
         * @inheritdoc
         */
        async register(user, secret) {
            return createUser(this.getFirebaseAuth(), user, secret).then(
                user => (createUserInfo(user))
            );
        },
        /**
         * @inheritdoc
         */
        async logout(user) {
            return new Promise( (resolve, reject) => {
                if (this._user === user) {
                    return logoutUser(this.getFirebaseAuth);
                } else {
                    reject(new Error("User not logged in"));
                }
            });
            return logoutUser(this.getFirebaseAuth());
        }
    };
}

/**
 * Get the authentication change listener performing setting of the user and provider on login or logout.
 *
 * @param auth The firebase authentication.
 * @param setUser The user setting function.
 * @param [setProvider] The provider setter.
 * @param {import('@firebase/auth').User} auth The firebase user. 
 */
export function getAuthChangeListener(auth, setUser, setProvider = null) {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
        if (user)  {
            // Sign in.
            if (setProvider) {
                setProvider(getFirebaseProvider(auth));
            }
            setUser(user);
            resolve(user);
        } else {
            // Sign out.
            setUser(null);
            resolve(null);
        }
    });
    });
}