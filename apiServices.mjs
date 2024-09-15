
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
 * The user information structure.
 * @template [DETAIL=void] The detail type of the user information.
 * @typedef {Object} UserInfo
 * @property {string} displayName The display name of the user.
 * @property {string} [image] The image URL.
 * @property {string} [email] The email displayed to other users.
 * @property {boolean} [emailVerified] Has the displayed email been verified.
 * @property {DETAIL} [details] The details of the user information.
 */

/**
 * The user data.
 * @template [DETAIL=void] The user detail.
 * @typedef {Object} UserData
 * @property {string} userName the user name.
 * @property {string} hashedSecret The hashed secret.
 * @property {string} salt The salt used to hash the secret.
 * @property {string} id The uuid of the user.
 * @property {UserInfo<DETAIL>} userInfo The user detail.
 * @property {boolean} [emailVerified=false] Has the user email been verified.
 */

/**
 * Session data.
 * @template DETAIL The session detail
 * @template USER_DETAIL The user detail.
 * @typedef {Object} SessionData
 * @property {string} id The session identifier.
 * @property {string} userId The session owner identifier.
 * @property {number} created The creation UTC timestamp.
 * @property {number|null} expires The expiration UTC timestamp. If null, the session will not expire.
 * @property {string} hashedSecret The hashed secret.
 * @property {UserInfo<USER_DETAIL>} userInfo The user information of the current user.
 * @property {DETAIL} [sessionDetail] The optional session detail. 
 */

/**
 * Log in an user.
 *
 * @template [DETAIL=void] The session detail type.
 * @template [USER_DETAIL=void] The user detail type.
 * @callback Login
 * @param {string} user The user name.
 * @param {string} secret The secret.
 * @returns {Promise<SessionData<DETAIL, USER_DETAIL>>} The promise of the session data.
 * @throws {AccessForbiddenException<string>} The user cannot log in.
 * @throws {InvalidParameterException<string>} Either the user or secret was invalid.
 */

/**
 * Create a new user.
 * 
 * @template [DETAIL=void] The detail type of the user information.
 * @callback CreateUser
 * @param {string} user The user name.
 * @param {string} secret The user secret.
 * @param {Partial<UserInfo<DETAIL>>} [details] The user details.
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
 * @template [SESSION_DETAIL=void] The session detail.
 * @template [USER_DETAIL=void] The user detail.
 * @typedef {Object} ApiService
 * @property {Readonly<Getter<string,CONTENT>>} getContent Get content of the API service.
 * @property {Readonly<Setter<string,CONTENT>>} [setContent] The optional replacer of the content. 
 * @property {Login<SESSION_DETAIL, USER_DETAIL>} login Log in an existing user.
 * @property {CreateUser<USER_DETAIL>} register Register
 * a new user.
 * @property {Getter<string, SessionData<SESSION_DETAIL, USER_DETAIL>>} createSession Create a new session for an user.
 * @property {UpdateSession<UserInfo<USER_DETAIL>>} updateSession Update an existing session.
 * @property {(sessionId: string) => Promise<void>} closeSession Close an existing session.
 */

/**
 * The crypt service options.
 * @typedef {Object} CryptServiceOptions
 * @property {Partial<CryptOptions>} cryptOptions The crypt options for the secrets.
 */

/**
 * The Api service construction parameters.
 * 
 * @template CONTENT The api service content type.
 * @template [SESSION_DETAIL=void] The session detail.
 * @template [USER_DETAIL=void] The user detail.
 * @typedef {Partial<ApiService<CONTENT, SESSION_DETAIL, USER_DETAIL>> & Partial<CryptServiceOptions>} ApiServiceParams
 */

/**
 * The bad request excpetion.
 * @template [CAUSE=any] The cause of the exception.
 * @extends {HttpStatusException<CAUSE>}
 */
export class BadRequestException extends HttpStatusException {

    /**
     * Create a new bad request exception.
     *
     * @param {string} [message] The message of the exception.
     * @param {CAUSE} [cause] The cause of the exception. 
     */
    constructor(message = undefined, cause = undefined) {
        super(message, cause, 400);
    }
}

/**
 * The valid password checking regular expression.
 */
export const VALID_PASSWORD_REGEX = /^(?:[\p{L}\p{N}\p{P}])(?:[\p{L}\p{N}\p{P} ]*[\p{L}\p{N}\p{P}])?$/u;

/**
 * The regular expression checking that there is an upper case letter.
 */
export const HAS_UPPER_CASE_LETTER_REGEX = /\p{Lu}/u;

/**
 * The regular expression checking that there is a lower case letter.
 */
export const HAS_LOWER_CASE_LETTER_REGEX = /\p{Ll}/u;

/**
 * The regular expression checking that there is a punctuation character.
 */
export const HAS_PUNCTUATION_REGEX = /\p{P}/u;

/**
 * The regular expression checking that there is a number.
 */
export const HAS_DIGIT_REGEX = /\p{N}/u;

/**
 * @template CONTENT The api service content type.
 * @template [SESSION_DETAIL=void] The session detail.
 * @template [USER_DETAIL=UserInfo] The user detail.
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
     * @type {Record<string, UserData<USER_DETAIL>>}
     */
    #users = {};

    /**
     * The valid authenticated sessions of the api service.
     * 
     * @type {Record<string, SessionData<SESSION_DETAIL, USER_DETAIL>>}
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
    #sessionTimeOut = 30 * 60 * 1000;

    /**
     * Create hashed secret.
     * @param {string} password The hashed password.
     * @returns {Promise<HashedPassword>}
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

    /**
     * Check validity of the password.
     * @param {UserInfo} user The user.
     * @param {string} secret The secret.
     * @returns {Promise<UserInfo<USER_DETAIL>>} The promise of a valid password.
     * @throws {AccessForbiddenException} The user invalid password.
     * @throws {NotFoundException} The user does not exist.
     */
    validPassword(user, secret) {
        const userData = this.#users.find(current => (current.user === user));
        if (userData == null) {
            return Promise.reject(new NotFoundException("Invalid user"));
        } else {
            return this.hashedSecret(user, secret).then(
                (hashedSecret) => {
                    if (userData.hashedSecret === hashedSecret) {
                        return userData.userInfo;
                    } else {
                        throw new AccessForbiddenException("Invalid password");
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
                if (sessionId in this.#sessions && (this.#sessions[sessionId].expires == null || this.#sessions[sessionId].expires > now)) {
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
     * Check the crypt options. 
     * @param {Partial<CryptOptions>} cryptOptions The parameters.
     * @param {CryptOptions} [defaults] The default values of the crypt options.
     * @return {CryptOptions} The crypto options derived from the paraemters.
     * @throws {InvalidParameterException<string>} The string valued parameter is invalid.
     * @throws {InvalidParameterException<number>} The number valued parameter is invalid.
     * @throws {InvalidParameterException<any>} The invalid value parameter is invalid.
     */
    checkCryptOptions(cryptOptions, defaults = undefined) {
        const result = {
            algorithm: "sha512",
            length: 64,
            ...(defaults == null ?? {})
        };
        [
            ["algorithm", (value) => (typeof value === "string" && value.length > 0), result.algorithm],
            ["length", (value) => (typeof value === "number" && Number.isSafeInteger(value) && value > 0), result.length],
            ["method", (value) => (typeof value === "string" && value.length > 0), result.method]
        ].forEach(([property, validator, defaultValue]) => {
            if (property in cryptOptions && !validator(cryptOptions[property])) {
                throw new InvalidParameterException(property, undefined, "Invalid crypto property value");
            } else if (property in cryptOptions) {
                result[property] = value;
            } else {
                result[property] = defaultValue;
            }
        });
        [
            ["saltLength", (result, value) => (typeof value === "number" && Number.isSafeInteger(value) && value > 0), (result, value = undefined) => (value == null ? result.length / 2 : value)],
            ["rounds", (result, value) => (typeof value === "number" && Number.isSafeInteger(value) && value > 0), (result, value = undefined) => (value == null ? 1 : value)]
        ].forEach(([property, validator, valueFn]) => {
            if (property in cryptOptions) {
                if (validator(result, cryptOptions[property])) {
                    result[property] = valueFn(result, cryptOptions[property]);
                } else {
                    throw new InvalidParameterException(property, cryptOptions[property], "Invalid crypto property value");
                }
            } else {
                result[property] = valueFn(result, cryptOptions[property]);
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
     * @param {ApiServiceParams} param 
     */
    constructor(param) {
        if ("content" in param) {
            this.#content = { ...param.content };
        }
        if ("users" in param) {
            this.#users = { ...param.users };
        }
        if ("sessions" in param) {
            this.#sessions = { ...param.sessions };
        }
        if ("sessionTimeout" in param) {
            this.#sessionTimeOut = this.checkSessionTimeOut(param.sessionTimeout);
        }
        if ("cryptOptions" in param) {
            this.#cryptOptions = this.checkCryptOptions(param.cryptOptions, this.#cryptOptions);
        }
    }

    /**
     * Create a new session.
     * 
     * @param {string} userId The user identifier.
     * @returns {Promise<SessionData>} The promise of the session data.
     */
    createSession(userId) {
        const now = Date.now();
        return new Promise((resolve, reject) => {
            if (userId in this.#users) {
                var sessionId = crypto.randomUUID();
                while (sessionId in this.#sessions) {

                }
                secret = crypto.getRandomValue();
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
     * @param {CONTENT} [userInfo] The new content of the session.
     * @returns {Promise<SessionData<CONTENT>>} The promise of the updated session data.
     */
    updateSession(sessionId, userId, userInfo = undefined) {
        const now = Date.now();
        return Promise((resolve, reject) => {
            if (sessionId in this.#sessions) {
                const session = this.#sessions[sessionId];
                if (session.userId == userId) {
                    if (session.expires == null || session.expires > now) {
                        this.#sessions[sessionId] = {
                            ...session,
                            updated: now,
                            expires: (this.sessionTimeOut == null ? null : now + this.sessionTimeOut),
                            userInfo: (userInfo === undefined ? session.userInfo : userInfo)
                        };
                        respond(this.#sessions[sessionId]);
                    } else {
                        reject(new AuthenticationRequiredException("Session has expired"));
                    }
                } else {
                    reject(new BadRequestException("Bad request"));
                }
            } else {
                reject(new NotFoundException("Session not found"));
            }
        });
    }

    /**
     * Close an existing session.
     * 
     * @param {string} sessionId The session identifier.
     * @param {number} [closeTime] The time of closing. Defaults to the current moment.
     * @returns {Promise<void>} THe promise of completion.
     */
    async closeSession(sessionId, closeTime = undefined) {
        const now = Date.now();
        if (closeTime == null) {
            closeTime = now;
        } else if (closeTime > now) {
            return Promise.reject(new InvalidParameterException("closeTime", closeTime, "Close time in future"));
        }
        return this.checkSessionId(sessionId).then(
            (id) => {
                if (id in this.#sessions) {
                    const session = this.#sessions[id];
                    if (session.expires == null || session.expires > now) {
                        // The session is active. 
                        this.#sessions[id] = { ...session, expires: now };
                    }
                    return;
                } else {
                    throw new NotFoundException("Session not found");
                }
            }
        );
    }

    /**
     * Test validity of the user name.
     * @param {*} userName The tested user name.
     * @returns {boolean} True, if and only if the user name is valid.
     */
    validUserName(userName) {
        return (typeof userName === "string" && userName.trim() === userName && userName.length > 0);
    }

    /**
     * Check validity of the user name.
     *
     * @param {*} userName Tested user name.
     * @param {string} [message] The error messaage, if the test fails.
     * @returns {string} Valid user name, if the user name is valid.
     * @throws {TypeError} The type of the user name was invalid.
     * @throws {SyntaxError} The user name was valid type, but invalid value.
     */
    checkUserName(userName) {
        if (this.validUserName(userName, message="Invalid user name")) {
            return /** @type {string} */ userName;
        } else if (typeof userName === "string") {
            throw new TypeError(message);
        } else {
            throw new SyntaxError(message);
        }
    }


    /**
     * Check validity of the password.
     * 
     * @param {string} secret The checked secret.
     * @param {string} [message] The error messaage, if the test fails.
     * @return {Promise<string>} The promise of a valid password.
     * @throws {InvalidParameterException<string, SyntaxError|TypeError>} The secret was invalid.
     */
    checkSecret(secret, message = "Invalid secret") {
        return new Promise((resolve, reject) => {
            if (typeof secret === "string") {
                if (VALID_PASSWORD_REGEX.test(secret)) {
                    if (!HAS_LOWER_CASE_LETTER_REGEX.test(secret)) {
                        // The secret does not have lower case letter.
                        reject(new InvalidParameterException("secret", undefined, message, new SyntaxError("Missing lower case letter")));
                    } else if (!HAS_UPPER_CASE_LETTER_REGEX.test(secret)) {
                        // The secret does not have an upper case letter.
                        reject(new InvalidParameterException("secret", undefined, message, new SyntaxError("Missing upper case letter")));
                    } else if (!HAS_DIGIT_REGEX.test(secret)) {
                        // The secret does not have punctuation character.
                        reject(new InvalidParameterException("secret", undefined, message, new SyntaxError("Missing digit")));
                    } else if (!HAS_PUNCTUATION_REGEX.test(secret)) {
                        // The secret does not have punctuation character.
                        reject(new InvalidParameterException("secret", undefined, message, new SyntaxError("Missing punctuation character")));
                    } else {
                        // The secret is okay.
                        resolve(secret);
                    }
                } else {
                    reject(new InvalidParameterException("secret", undefined, message, new SyntaxError("Secret must start and end letter, number, or punctuation character, and may contain single spaces between the first and last character.")))
                }
            } else {
                reject(new InvalidParameterException("secret", undefined, message, new TypeError("Secret was not a string")));
            }
        });
    }


    /**
     * Create a new user.
     * @type {CreateUser<USER_DETAIL>}
     */
    createUser(userName, secret, userInfo = {}, expiration = undefined) {
        const now = Date.now();
        return new Promise((resolve, reject) => {
            this.checkSecret(secret).then(
                (validSecret) => {
                    this.createHashedSecret(validSecret).then(
                        ({ hash, salt }) => {
                            // Creating the user.
                            var id = crypto.randomUUID();
                            while (id in this.#users) {
                                id = crypto.randomUUID();
                            }
                            this.#users[id] = {
                                userName: this.checkUserName(userName),
                                hashedSecret: hash,
                                salt,
                                userInfo: /** @type {USER_DETAIL|undefined} */ userInfo,
                                expires: expiration ?? null,
                                emailVerified: false
                            };

                            resolve(this.#users[id].userInfo);
                        },
                        (error) => {
                            reject(new InvalidParameterException("userName or password", undefined, "Invalid username or password", error));
                        }
                    )
                },
                (error) => {
                    reject(new InvalidParameterException("Username or password", undefined, "Invalid username or secret", error));
                }
            )
        });
    }
}

/**
 * Create a new service.
 *
 * @template [CONTENT=any] The content type of the service.
 * @param {ApiServiceParams<CONTENT>} param 
 * @returns 
 */
export default function createApiService(param) {
    return new InMemoryApiService(param);
}