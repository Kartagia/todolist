
import {InMemoryApiService} from "./apiServices.mjs";
/**
 * @module dummyApiService
 * The dummy api service for testing purposes.
 */

/**
 * The email user properties.
 * @typedef {Object} EmailUser
 * @property {Readonly<boolean>} [validatedEmail=false] Has the user validated email.
 * @property {Readonly<EmailUser[]>} [backupAddresses=[]] The backup addresses of the user.
 */

/**
 * The api service properties.
 * @type {import("./apiServices.mjs").ApiServiceParams<Todo, void, EmailUserProperties>} 
 */
const apiServiceProps = {
    /**
     * The mapping from user identifiers to the todos of the user.
     * @type {Record<string, import("./apiServices.mjs").TodoData>}
     */
    content: {},

    /**
     * The users of the api.
     * THe mapping from user email to the user data.
     * @type {Record<string, import("./apiServices.mjs").UserData<UserInfo>>}
     */
    users: {
    },
    /**
     * The active sessions.
     * @type {Record<string, import("./apiServices.mjs").SessionData>}
     */
    sessions: {},
    hashOptions: {
        rounds: 200000,
        length: 64,
        algorithm: "sha512",
        method: "pbkdf2"
    },
    sessionTimeout: 30*60*1000
};

/**
 * The todo api service.
 * 
 * @type {import("./apiServices.mjs").ApiService<import("./apiServices.mjs").Todo>}
 */
var service = new InMemoryApiService(apiServiceProps);

(async () => {
    const id = crypto.randomUUID();
    let userName = "antti@kautiainen.com";
    let secret = "F00baryMaru!";
    console.group("Creating dummy users");
    service.createUser(
        userName, 
        secret, 
        {
            displayName: "Administrator",
            image: "https://www.svgrepo.com/show/70079/administrator.svg"
        }
    ).then(
        (userInfo) => {
            console.log(`Created user ${displayName} as user ${userName}[${userInfo.id}]`)
        },
        (error) => {
            console.error(`The password validation failed for ${secret} due ${error.name} ${error.message}`);
            throw error;
        }
    );
    console.groupEnd();
})();

export default service;