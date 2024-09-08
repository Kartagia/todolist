
/**
 * Module initializing the firebase for the app.
 */

import {readFile} from 'node:fs';
import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";

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