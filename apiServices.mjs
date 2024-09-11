
/**
 * @module ApiServices
 * 
 * The module containing the API services of the todo list.
 */

import { AccessForbiddenException, AuthenticationRequiredException, HttpStatusException } from "./errors.mjs";
import { NotFoundException } from "./errors.mjs";
import { InvalidParameterException } from "./errors.mjs";

/**
 * @typedef {Object} SimpleTodo
 * @property {string} name The name of the todo.
 * @property {boolean} done Is the todo done.
 */

/**
 * @typedef {Object} LinkedTodo
 * @property {string} name The name of the linked todo.
 * @property {Todo[]} [completedBy=[]] The required todos.
 * @property {Todo[]} [prohibitedBy=[]] The prohibited todos preventing the completion.
 * @property {Readonly<boolean>} completed Is the todo completed.
 * @property {Readonly<boolean>} prohibited Is the completion prohibited.
 * @property {Readonly<boolean>} partial Is the todo partially completed. 
 */

/**
 * Get todo requiring all todos to complete.
 * @param {string} name The name of the todo. 
 * @param {Todo[]} [completedBy=[]] The list of todos, which has to be all completed.
 * @param {Todo[]} [prohibitedBy=[]] The list of todos, which all has to be incompleted.
 * @returns {LinkedTodo}
 */
export function createCompleteAllTodo(name, completedBy = [], prohibitedBy = []) {
    return /** @type {LinkedTodo} */ {
        name,
        get completedBy() {
            return completedBy;
        },
        get prohibitedBy() {
            return prohibitedBy;
        },
        get prohibited() {
            return prohibitedBy.length > 0 && prohibitedBy.anyMatch(prohibited => (prohibited.done));
        },
        get done() {
            return !this.prohibited && (completedBy.length == 0 || completedBy.allMatch(completed => (completed.done)));
        },
        get partial() {
            return !this.prohibited && !this.done && (completedBy.length > 0 && completedBy.anyMatch(completed => (completed.done)));
        }
    };
}

/**
 * @typedef {SimpleTodo|LinkedTodo} Todo
 */

/**
 * Getter of a value.
 * @template [KEY=any] The type of the key.
 * @template [RESULT=any] The type of the getter value.
 * @callback Getter
 * @param {KEY} key The key of the get value.
 * @returns {Promise<RESULT>} The promise of the value.
 */

/**
 * Setter of a value.
 *
 * @template [KEY=any] The type of the key.
 * @template [RESULT=any] The type of the getter value.
 * @callback Setter
 * @param {KEY} key The key of the set value.
 * @param {RESULT} value The new value.
 * @returns {Promise<void>} The promise of the completion.
 * @throws {InvalidParameterException<RESULT>} The given value was invalid.
 * Exception is returned via promise.
 * @throws {InvalidParameterException<KEY>} The given key was invalid.
 * Exception is returned via promise.
 */

/**
 * The todo data of the user.
 * @typedef {Object} TodoData
 * @property {Todo[]} todos The todos of the user.
 */

/**
 * The user data.
 * @typedef {Object} UserData
 * @property {string} userName the user name.
 * @property {string} hashedSecret The hashed secret.
 * @property {string} salt The salt used to hash the secret.
 * @property {string} id The uuid of the user.
 */

/**
 * Session data.
 * @typedef {Object} SessionData
 * @property {string} id The session identifier.
 * @property {string} userId The session owner identifier.
 * @property {number} created The creation UTC timestamp.
 * @property {number|null} expires The expiration UTC timestamp. If null, the session will not expire.
 * @property {string} hashedSecret The hashed secret.
 */

/**
 * Log in an user.
 *
 * @callback Login
 * @param {string} user The user name.
 * @param {string} secret The secret.
 * @returns {Promise<SessionData>} The promise of the session data.
 * @throws {AccessForbiddenException<string>} The user cannot log in.
 * @throws {InvalidParameterException<string>} Either the user or secret was invalid.
 */

/**
 * Create a new user.
 * 
 * @callback CreateUser
 * @param {string} user The user name.
 * @param {string} secret The user secret.
 * @param {Partial<UserInfo>} [details] The user details.
 * @returns {Promise<UserInfo>} The promise of the user information.
 * @throws {InvalidParameterException<string>} The user or secret was invalid.
 * @throws {InvalidParameterException<Partial<UserInfo>>} The user information was invalid.
 */

/**
 * Update an existing session.
 *
 * @template [DETAIL=void] The detail of the session.
 * @callback UpdateSession
 * @param {string} userId The user identifier of the owning user.
 * @param {string} sessionId The session id of the current session.
 * @param {DETAIL} [detail] The optional new detail of the session.
 * @returns {Promise<SessionData<DETAIL>>} The promise of the updated session data. 
 */

/**
 * Hashing algoritm options.
 * 
 * @typedef {Object} HashOptions 
 * @property {string} algoritm The algorithm used for crypting.
 * @property {number} [length] The key length of the hash. Defaults to the key length of the algorithm.
 */

/**
 * @typedef {Object} ComplexHashOptionProps
 * @property {number} [rounds] The number of rounds the hashing
 * @property {number} [saltLength] The length of the salt. Defaults to the half of the key length.
 */

/**
 * Complex hash algoritm options.
 * @typedef {ComplexHashOptionProps & HashOptions} ComplexHashOptions
 */

/**
 * The crypt options for password encyption.
 * @typedef {Partial<ComplexHashOptions>|Partial<HashOptions>} CryptOptions
 */

/**
 * The hashed password stores the hashed password and the salt used.
 *
 * @typedef {Object} HashedPassword
 * @property {string} salt The salt used for hashing in hex format.
 * @property {string} hash The hashed password.
 */

/**
 * @template [CONTENT=any] The API service content type.
 * @typedef {Object} ApiService
 * @property {Readonly<Getter<CONTENT>>} getContent Get content of the API service. 
 * @property {Login} login Log in an existing user.
 * @property {CreateUser} register Register
 * a new user.
 * @property {Getter<string, SessionData>} createSession Create a new session for an user.
 * @property {UpdateSession<UserInfo>} updateSession Update an existing session.
 */

/**
 * @template CONTENT The api service content type.
 * A class implementing an api service caching the content into memory.
 */
export class InMemoryApiService {

    /**
     * The contents of the API service.
     * @type {Record<string, CONTENT>}
     */
    #content = {};

    /**
     * The registered users of the api service.
     * 
     * @type {Record<string, UserData>}
     */
    #users = {};

    /**
     * The valid authenticated sessions of the api service.
     * 
     * @type {Record<string, SessionData>}
     */
    #sessions = {};

    /**
     * The crypt options for the password crypting.
     * 
     * @type {CryptOptions}
     */
    #cryptOptions = {
        rounds: 200000,
        length: 64,
        algorithm: "sha512",
        method: "pbkdf2"
    };

    /**
     * The session timeout in millisecond.
     * @type {number}
     */
    #sessionTimeOut = 30*60*1000*1000;

    /**
     * Create hashed secret.
     * @param {string} password The hashed password.
     * @returns {HashedPassword}
     */
    createHashedSecret(password) {
        return new Promise((resolve, reject) => {
            const result = { salt: null, hash: null };
            try {
                switch (this.#cryptOptions.method) {
                    case "pbkdf2":
                        // Using pkdfs2
                        result.salt = crypto.randomBytes(this.#cryptOptions.length / 2).toString("hex");
                        result.hash = crypto.pbkdf2Sync(password, salt, this.#cryptOptions.rounds, this.#cryptOptions.length, this.#cryptOptions.algorithm).toString("hex");
                        return { salt, hash }
                    default:
                        // Using default method - the hashing algorithm with password concatenated with salt.
                        result.salt = crypto.randomBytes(this.#cryptOptions.length / 2).toString("hex");
                        result.hash = crypto.createHash(this.#cryptOptions.algorithm, password + salt).toString("hex");
                }
                resolve(result);
            } catch (error) {
                reject(error);
            }
        })
    }

    validPassword(user, secret) {
        const userData = this.#users.find( current => (current.user === user));
        if (userData == null) {
            return Promise.reject(new AccessForbiddenException("Invalid username or passwrod"));
        } else {
            return this.hashedSecret(user, secret).then(
                (hashedSecret) => {
                    if (userData.hashedSecret === hashedSecret) {
                        return userData.userInfo;
                    } else {
                        throw new AccessForbiddenException("Invalid user name or password");
                    }
                });
        }
    }

    /**
     * Get the content available for the user.
     * 
     * @param {string} sessionId The session idetnifier.
     * @param {string} userId The user identifier.
     * @param {string} contentId The content identifier.
     * @returns {Promise<CONTENT>} The promise of the content.
     * @throws {NotFoundException<string[]>} The content is not found. The details contains the 
     * userId and the contentId.
     * @throws {AccessForbiddenException<string>} The content is not available for the user.
     * The details contains the user id.
     * @throws {AuthenticationRequiredException<string>} The client must authenticate before
     * resending the request. The details contains the user id.
     * @throws {HttpStatusException<void>} The request was invalid.
     */
    getContent(sessionId, userId, contentId) {
        const now = Date.now();
        return new Promise((resolve, reject) => {

            if (!userId in this.#users || (this.#users[userId].expires != null && this.#users[userId].expires <= now)) {
                reject(new AccessForbiddenException("User cannot access the content"));
            } else {
                const user = this.#users[userId];
                if (sessionId in this.#sessions && (this.#sessions[sessionId].expires == null || this.#sessions[sessionId].expires > now) ) {
                    // The session is valid.
                    const session = this.#sessions[sessionId];
                    if (session.userId === userId) {
                        if (userId in this.#content && contentId in this.#content[userId]) {
                            resolve(this.#content[userId][contentId]);
                        } else {
                            reject(new NotFoundException("The resource does not exists", undefined, [userId, contentId]));
                        }
                    } else {
                        reject(new HttpStatusException("Bad request"));
                    }
                } else {
                    reject(new AuthenticationRequiredException("User authentication required", undefined, userId));
                }
            }
        });
    }


    /**
     * The session timeout.
     * 
     * @type {number|null} The session timeout in milliseconds.
     */
    get sessionTimeOut() {
        return this.#sessionTimeOut;
    }

    /**
     * 
     * @param {Partial<CryptOptions>} param The parameters.
     * @return {CryptOptions} The crypto options derived from the paraemters.
     * @throws {InvalidParameterException<string>} The string valued parameter is invalid.
     * @throws {InvalidParameterException<number>} The number valued parameter is invalid.
     * @throws {InvalidParameterException<any>} The invalid value parameter is invalid.
     */
    checkCryptOptions(param, defaults=undefined) {
        const result = {
            algorithm: "sha512",
            length: 64,
            ...(defaults == null ?? {})
        };
        [
            ["algorithm", (value) => (typeof value === "string" && value.length > 0), result.algorithm],
            ["length", (value) => (typeof value === "number" && Number.isSafeInteger(value) && value > 0), result.length],
            ["method", (value) => (typeof value === "string" && value.length > 0 ), result.method]
        ].forEach( ([property, validator, defaultValue]) => {
            if (property in param && !validator(param[property])) {
                throw new InvalidParameterException(property, undefined, "Invalid crypto property value");
            } else if (property in param) {
                result[property] = value;
            } else {
                result[property] = defaultValue;
            }
        });
        [
            ["saltLength", (result, value) => (typeof value === "number"), (result, value = undefined) => (value == null ? result.length / 2 : value)],
            ["rounds", (result, value) => (typeof value === "number" && Number.isSafeInteger(value) && value > 0), (result, value = undefined) => (value == null ? 1 : value)]
        ].forEach( ([property, validator, valueFn]) => {
            if (property in param) {
                if (validator(result, param[property])) {
                    result[property] = valueFn(result, value);
                } else {
                    throw new InvalidParameterException(property, param[property], "Invalid crypto property value");
                }
            } else {
                result[property] = valueFn(result, param[property]);
            }
        });
    }

    /**
     * Check timeout.
     * 
     * @param {*} timeOut The checked timeout value.
     * @returns {number|null} A valid timeout value.
     * @throws {TypeError} The timeout is an invalid value.
     */
    checkSessionTimeOut(timeOut) {
        if (timeOut == null || timeOut === 0) {
            return null;
        } else if (Number.isSafeInteger(timeOut) && (timeOut > 0)) {
            return timeOut;
        } else {
            throw new TypeError("Invalid timeout value");
        }
    }

    /**
     * Create a new api service.
     * @param {Partial<ApiService<CONTENT>> & Partial<CryptOptions>} param 
     */
    constructor(param) {
        if ("content" in param) {
            this.#content = {...param.content};
        }
        if ("users" in param) {
            this.#users = {...param.users};
        }
        if ("sessions" in param) {
            this.#sessions = {...param.sessions};
        }
        if ("sessionTimeout" in param) {
            this.#sessionTimeOut = this.checkSessionTimeOut(param.sessionTimeout);
        }
        this.#cryptOptions = this.checkCryptOptions(param, this.#cryptOptions);
    }
  
    /**
     * Create a new session.
     * 
     * @param {string} userId The user identifier.
     * @returns {Promise<SessionData>} The promise of the session data.
     */
    createSession(userId) {
        const now = Date.now();
        return new Promise( (resolve, reject) =>  {
            if (userId in this.#users) {
                var sessionId = crypto.randomUUID();
                while (sessionId in this.#sessions) {

                }
                secret = crypto.getRandomValues();
                this.#sessions[sessionId] = {
                    userId,
                    sessionId: id,
                    created: now,
                    expires: (this.sessionTimeOut == 0 ? undefined : now + this.sessionTimeOut),
                    hashedSecret: crypto.createHash("sha512", secret)
                };
                resolve(this.#sessions[sessionId]);
            } else {
                reject(new AccessForbiddenException("User access forbidden", undefined, userId));
            }
        });

    }

    /**
     * Update an existing session.
     * 
     * @param {string} sessionId The session identifier.
     * @param {string} userId The user identifier of the session user.
     * @returns {Promise<SessionData>} The promise of the updated session data.
     */
    updateSession(sessionId, userId) {

    }
}

/**
 * @type {ApiService<Todo>}
 */
const apiService = new ApiService({
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
});

