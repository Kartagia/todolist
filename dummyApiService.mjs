
import {InMemoryApiService} from "./apiServices.mjs";
/**
 * @module dummyApiService
 * The dummy api service for testing purposes.
 */

/**
 * The api service properties.
 * @type {import("./apiServices.mjs").ApiServiceParams<Todo>} 
 */
const apiServiceProps = {
    /**
     * The mapping from user identifiers to the todos of the user.
     * @type {Record<string, TodoData>}
     */
    content: {},
    /**
     * The users of the api.
     * @type {Record<string, UserData>}
     */
    users: {},
    /**
     * The active sessions.
     * @type {Record<string, SessionData>}
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

export default service;