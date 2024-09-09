
/**
 * Module initializing the firebase for the app.
 */

import {readFile} from 'node:fs';
import {initializeApp} from "firebase/app";
import {createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut} from "firebase/auth";
import { setDefaultResultOrder } from 'node:dns';

/**
 * A configuration error.
 */
export class ConfigurationError extends Error {

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
 * @param {*} auth The firebase authentication.
 * @param {*} user The signed out user.
 * @returns {Promise<void>} The promise of completion.
 */
export async function logout(auth) {
    return signOut(auth);
}

/**
 * The user information.
 * @typedef {Object} UserInfo
 * @property {string} displayName The display name.
 * @property {string|URL} [image] The user image.
 * @property {string} id The identifier of the user.
 */

/**
 *The pvovider information.
 * 
 * @typedef {Object} ProviderInfo
 * @todo Replace with import from login.js
 * @property {Readonly<string>} name The provider name.
 * @property {(email: string, email: secret) => Promise<UserInfo>} login Login with the user.
 * @property {(email: string, email: secret) => Promise<UserInfo>} register Register the user.
 * @property {(email: string) => Promise<void>} logout Logout the user.
 */

/**
 * The firebase provider information.
 *
 * @typedef {ProviderInfo & { firebaseAuth: Readonly<import('@firebase/auth').Auth> }} FIrebaseProviderInfo
 */

/**
 * Get the user information for the firebase user.
 * @param {import('@firebase/auth').User} firebaseUser The firebase user.
 * @returns {UserInfo} The user information of the given firebase user.
 */
export function createUserInfo(firebaseUser) {
    return {
        get id() {
            return firebaseUser.id
        },
        get displayName() {
            return firebaseUser.displayName;
        },
        get image() {
            return firebaseUser.image;
        }
    };
}

/**
 * Get the firebase provider.
 * 
 * @param {import('@firebase/auth').Auth} auth 
 * @returns {ProviderInfo} The providers of the firebase user services.
 */
export function getFirebaseProvider(auth) {

    return /** @type {FIrebaseProviderInfo} */ {
        /**
         * The firebase authentication of the provider.
         */
        get firebaseAuth() {
            return auth;
        },
        get name() { return "Firebase"; },
        /**
         * The logged in user.
         */
        _user: null,
        login(user, secret) {
            return emailLogin(this.getFirebaseAuth(), user, secret).then( 
                (userInfo) => {
                    const result = createUserInfo(userInfo);
                    this._user = result;
                    return result;
                }
            );
        },
        register(user, secret) {
            return createUser(this.getFirebaseAuth(), user, secret);
        },
        /**
         * Logout user.
         * 
         * @param {UserInfo} user The logged out user.
         * @returns {Promise<void>} Promise of the loggingout.
         */
        logout(user) {
            return new Promise( (resolve, reject) => {
                if (this._user === user) {
                    return logoutUser();
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