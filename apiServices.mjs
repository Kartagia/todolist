
/**
 * @module ApiServices
 * 
 * The module containing the API services of the todo list.
 */

import { AccessForbiddenException, AuthenticationRequiredException, HttpStatusException } from "./errors.mjs";
import { NotFoundException } from "./errors.mjs";
import { InvalidParameterException, BadRequestException } from "./errors.mjs";

///////////////////////////////////////////////////////////////////
// The hashing related data types and methods.
///////////////////////////////////////////////////////////////////

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

/////////////////////////////////////////////////////////////////////
// Utility types.
/////////////////////////////////////////////////////////////////////

/**
 * @template TYPE The tested type.
 * @callback Predicate
 * @param {TYPE} tested The tested value.
 * @returns {boolean} True, if and only if the tested value passes the predicate.
 */

/**
 * The predicate form of the predicate does resolve with passing value and reject with
 * failure.
 * 
 * @template TYPE The tested type.
 * @callback PredicatePromise
 * @param {TYPE} tested The tested value.
 * @returns {Promise<void>} The promise of validity.
 * @throws {InvalidParameterException<TYPE>} The tested value did not pass the predicate. 
 */

/**
 * Create a predicate promise.
 * 
 * @template TYPE The type of the tested value.
 * @param {Predicate<TYPE>} predicate The predicate performing the testing.
 * @param {string|symbol} [parameter] The tested parameter name. Defaults to "tested".
 * @param {string} [message] The error meessage of the rejection. Defaults to "Invalid ${parameter} value".
 * @returns {PredicatePromise<TYPE>} The predicate promise using the given predicate to determine
 * validity.
 * @throws {TypeError} The predicate is not a function.
 * @throws {RangeError} The predicate requires more than 1 parameter.
 */
export function createPredicatePromise(predicate, parameter = "tested", message = undefined) {
    if (typeof predicate !== "function") {
        throw new TypeError("A function predicate is required");
    } else if (predicate.length > 1) {
        throw new RangeError("The predicate must accept at most 1 parameter");
    }

    return /** @type {PredicatePromise<TYPE>} */ (tested) => (new Promise((resolve, reject) => {
        if (predicate(tested)) {
            resolve();
        } else {
            reject(new InvalidParameterException(parameter, tested, message === undefined ? `Invalid ${parameter} value` : message));
        }
    }));
}

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
 * A creator creates a new resource.
 * 
 * @template [SOURCE=any] The source type.
 * @template [RESOURCE=any] The result type.
 * @template [EXCEPTION=any] The rejection error type.
 * @callback Creator
 * @param {SOURCE} source The source value, from which the resource is created.
 * @returns {Promise<RESOURCE>} The promise of the created resource.
 * @throws {EXCEPTION} The creation of the resource failed.
 */

/**
 * An entry is a identifier-content pair.
 *
 * @template [ID=string] The type of the entry identifier..
 * @template [CONTENT=any] The type of the content.
 * @typedef {Object} Entry
 * @property {ID} id The identifier of the entry.
 * @property {CONTENT} content The content of the entry.
 */

/**
 * The properties specific to a mutable entry.
 * 
 * @template [ID=string] The type of the entry identifier..
 * @template [CONTENT=any] The type of the content.
 * @typedef {Object} MutableEntryProps
 * @property {(value: CONTENT) => Promise<void>} setContent The setter of a content value.
 * @property {Predicate<CONTENT>} [validContent] The validator of the content. Defaults to a
 * predicate accepting all values.
 */

/**
 * A mutable entry allows setting the content.
 * 
 * @template [ID=string] The type of the entry identifier..
 * @template [VALUE=any] The type of the value.
 * @typedef {Entry<ID, VALUE> & MutableEntryProps<ID, VALUE>} MutableEntry
 */

/////////////////////////////////////////////////////////////////////
// Tasks section.
/////////////////////////////////////////////////////////////////////

/**
 * A simple task contains task name and
 * @typedef {Object} SimpleTask
 * @property {Readonly<string>} name The name of the task.
 * @property {Readonly<boolean>} done Has the task completed.
 */

/**
 * A task, whose status can be changed.
 * @typedef {Object} MutableTask
 * @property {Readonly<string>} name The name of the task.
 * @property {boolean} done Has the task compelted.
 */

/**
 * Create a new todo.
 * @param {string} name The name of the todo. 
 * @param {boolean} [done=false] The status of the task. Defaults to false.
 * @returns {SimpleTask} The created simple todo.
 */
export function createSimpleTask(name, done=false) {
    return {
        name,
        done: done == true
    };
}

/**
 * Linked todo joining several tasks.
 * 
 * @typedef {Object} LinkedTask
 * @property {string} name The name of the linked todo.
 * @property {Task[]} [completedBy=[]] The todos determining the completion.
 * @property {Readonly<boolean>} partial Is the todo partially completed.
 * @property {Readonly<boolean|undefined>} done Is the todo completed. An undefined value
 * indicates the todo is impartial - between all tasks completed and no task completed. 
 */

/**
 * A task, which may be blocked.
 * @typedef {Object} Blockable
 * @property {Task[]} [blockedBy=[]] The prohibited todos preventing the completion.
 * @property {Readonly<boolean>} blocked Is the completion prohibited due complete blocked task.
 */

/**
 * A task which is both linked and blcokable.
 * @typedef {LinkedTask & Blockable} BlockableLinkedTask
 */

/**
 * Createa linked task.
 * 
 * @param {string} name The name of the linked task.
 * @param {Task[]} [members=[]] The members of the linked task.
 * @param {Predicate<Task[]>} [completionFn] The funciton testing whether the members fulfil the task.
 * Defaults to the all members are completed.
 * @returns {LinkedTask} The create dlinked task.
 */
export function createLinkedTask(name, members = [], completionFn = (members) => (members.every( task => task.done))) {
    const result = /** @type {LinkedTask} */ {
        get name() {
            return name;
        },

        get completedBy() {
            return members;
        },

        get done() {
            return completionFn(this.completedBy);
        },

        get partial() {
            return this.completedBy.some( task => task.done) && !this.done;
        }
    };
    return Promise.resolve(result);
}

/**
 * Create a task requiring all tasks are completed.
 * 
 * @param {string} name The name of the taks.
 * @param {...Task} [completedBy=[]] The list of tasks required to complee the task.
 * @returns {LinkedTask} A linked task completed when all tasks are completed.
 */
export function createCompleteAllTask(name, completedBy = []) {
    return createLinkedTask(name, completedBy);
}

/**
 * Create a task requiring any task to completed.
 * 
 * @param {string} name The name of the taks.
 * @param {...Task} [completedBy=[]] The list of tasks required to complee the task.
 * @returns {LinkedTask} A linked task completed when any task are completed.
 */
export function createCompleteAnyTask(name, completedBy = []) {
    return createLinkedTask(name, completedBy, (members) => (members.some( task => task.done)));
}

/**
 * Get todo requiring all todos to complete.
 * 
 * @param {Readonly<string>} name The name of the todo. 
 * @param {Readonly<Task[]>} [completedBy=[]] The list of tasks, which has to be all completed.
 * @param {Readonly<Task[]>} [blockedBy=[]] The list of tasks, which all has to be incompleted.
 * @returns {BlockableLinkedTask} a task completed when all of the require tasks are finished, and
 * blocked, when any of the prohibted tasks is completed.
 */
export function createCompleteAllStepsBlockingTask(name, completedBy = [], blockedBy = []) {
    return /** @type {BlockableLinkedTask} */ {
        get name() {
            return name;
        },
        get completedBy() {
            return completedBy;
        },
        get blockedBy() {
            return blockedBy;
        },
        get blocked() {
            return blockedBy.length > 0 && blockedBy.anyMatch(prohibited => (prohibited.done));
        },
        get done() {
            if (this.prohibited) {
                return false;
            } else {
                const completed = this.completedBy.reduce( (result, todo) => (
                    result + (todo.done ? 1 : 0)
                ), 0);
                return completed === this.completedBy.length ? true : undefined;
            }
        },
        get partial() {
            return this.done === undefined;
        }
    };
}

/**
 * The type of tasks.
 * @typedef {SimpleTask|LinkedTask|MutableTask} Task
 */

/**
 * The todo data of the user.
 * @typedef {Object} TodoData
 * @property {Task[]} todos The todos of the user.
 */


/////////////////////////////////////////////////////////////////////
// User section
/////////////////////////////////////////////////////////////////////

/**
 * The user information structure.
 * 
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
 * 
 * @template [DETAIL=void] The user detail.
 * @template [USER_ID=string] The user identifier type.
 * @typedef {Object} UserData
 * @property {string} userName the user name.
 * @property {string} hashedSecret The hashed secret.
 * @property {string} salt The salt used to hash the secret.
 * @property {USER_ID} id The uuid of the user.
 * @property {UserInfo<DETAIL>} userInfo The user detail.
 * @property {boolean} [emailVerified=false] Has the user email been verified.
 */

/**
 * The user login without session.
 * 
 * @template [RESULT=void] The result of the login.
 * @callback Login
 * @param {string} user The user name.
 * @param {string} secret The secret.
 * @returns {Promise<RESULT>} The promise of the successful login.
 * @throws {AccessForbiddenException<string>} The user cannot log in.
 * @throws {InvalidParameterException<string>} Either the user or secret was invalid.
 */

/**
 * Create a new user.
 * 
 * @template [DETAIL=void] The detail type of the user information.
 * @template [USER_ID=string] The user identifier.
 * @callback CreateUser
 * @param {string} user The user name.
 * @param {string} secret The user secret.
 * @param {Partial<UserInfo<DETAIL>>} [details] The user details.
 * @returns {Promise<Entry<USER_ID, UserInfo<USER_DETAIL>>} The promise of the entry of user identifier
 * and user information.
 * @throws {InvalidParameterException<string>} The user or secret was invalid.
 * @throws {InvalidParameterException<Partial<UserInfo<USER_DETAIL>>>} The user information was invalid.
 */


/**
 * The user registry.
 * @template [USER_DETAIL=void] The user detail.
 * @template [ID=string] The identifier type of the user.
 * @typedef {Object} UserRegistry
 * @property {Login<USER_DETAIL>} login Log in an existing user.
 * @property {CreateUser<USER_DETAIL, ID>} register Register
 * a new user.
 * @property {Getter<ID, UserData<USER_DETAIL, ID>>} getUser Get the user with identifier.
 * @property {Setter<ID, UserData<USER_DETAIL, ID>>} setUser Set the user with identifier.
 * @property {Getter<ID, void>} removeUser Remove an user.
 */

///////////////////////////////////////////////////////////////////
// Session
///////////////////////////////////////////////////////////////////

/**
 * Session data.
 * 
 * @template DETAIL The session detail
 * @template [SESSION_ID=string] The session identifier.
 * @template [USER_ID=string] The user identifier.
 * @typedef {Object} SessionData
 * @property {SESSION_ID} id The session identifier.
 * @property {USER_ID} userId The session owner identifier.
 * @property {number} created The creation UTC timestamp.
 * @property {number|null} expires The expiration UTC timestamp. If null, the session will not expire.
 * @property {string} hashedSecret The hashed secret.
 * @property {DETAIL} [sessionDetail] The optional session detail. 
 */


/**
 * Log in an user with a session.
 * 
 * If the caller provides a valid session identifier, and the session exists and is owned
 * by the user, the given session is re-opened on successful login.
 * 
 * Otherwise a new session is created on successful login.
 *
 * @template [SESSION_ID=string] The session identifier.
 * @template [SESSION_DETAIL=void] The session detail type.
 * @template [USER_DETAIL=void] The user detail type.
 * @callback SessionLogin
 * @param {string} user The user name.
 * @param {string} secret The secret.
 * @param {SESSION_ID} [sessionId] The session identifier of the session the login tries
 * to update before creating a new session.
 * @returns {Promise<SessionData<SESSION_DETAIL, SESSION_ID, USER_ID>>} The promise of the session data.
 * @throws {AccessForbiddenException<string>} The user cannot log in.
 * @throws {InvalidParameterException<string>} Either the user or secret was invalid.
 */

/**
 * Update an existing session.
 *
 * @template [DETAIL=void] The detail of the session.
 * @template [SESSION_ID=string] The session identifier.
 * @template [USER_ID=string] The user identifier.
 * @callback UpdateSession
 * @param {USER_ID} userId The user identifier of the owning user.
 * @param {SESSION_ID} sessionId The session id of the current session.
 * @param {DETAIL} [detail] The optional new detail of the session.
 * @returns {Promise<SessionData<DETAIL,SESSION_ID, USER_ID>>} The promise of the updated session data. 
 */

/**
 * The crypt service options.
 * @typedef {Object} CryptServiceOptions
 * @property {Partial<CryptOptions>} cryptOptions The crypt options for the secrets.
 */

///////////////////////////////////////////////////////////////////
// The Api Service 
///////////////////////////////////////////////////////////////////

/**
 * A simple api service.
 * @template [ID=string] The identifier type of the api service.
 * @template [RESOURCE=any] The API service content type. The resource the service provides.
 * @typedef {Object} ApiService
 * @property {Readonly<Getter<ID,RESOURCE>>} getContent Get content of the API service.
 * @property {Readonly<Setter<ID,RESOURCE>>} [setContent] The optional replacer of the content.
 * @property {Readonly<Creator<Partial<RESOURCE>, Entry<ID, RESOURCE>>} [createContent] Create a new content.
 */
/**
 * An user identifying Api Service.
 * @template [RESOURCE_ID=string] The identifier type of the api service.
 * @template [USER_ID=string] The identifier type of the user.
 * @template [RESOURCE=any] The API service content type. The resource the service provides.
 * @template [USER_DETAIL=void] The user detail.
 * @typedef {UserRegistry<USER_DETAIL, USER_ID> & ApiService<RESOURCE_ID, RESOURCE>}
 */

/**
 * A session registry.
 * @template [SESSION_DETAIL=void] The session detail.
 * @template [SESSION_ID=string] The session identifeir type.
 * @template [USER_ID=string] The identifier type of the user.
 * @typedef {Object} SessionRegistry
 * @property {SessionLogin<SESSION_ID, SESSION_DETAIL, USER_ID>} sessionLogin Log in a session. 
 * @property {Getter<USER_ID, SessionData<SESSION_DETAIL>>} createSession Create a new session for an user.
 * @property {UpdateSession<SESSION_DETAIL, SESSION_ID, USER_ID>} updateSession Update an existing session.
 * @property {(sessionId: SESSION_ID) => Promise<void>} closeSession Close an existing session.
 */

/**
 * The user registry wtih session registry. The registry requires session login instead of user login.
 * 
 * @template [SESSION_DETAIL=void] The session detail.
 * @template [USER_DETAIL=void] The user detail.
 * @template [SESSION_ID=string] The session identifeir type.
 * @template [USER_ID=string] The identifier type of the user.
 * @typedef {Omit<UserRegistry<USER_DETAIL, USER_ID>, "login"> & SessionRegistry<SESSION_DETAIL, SESSION_ID, USER_ID>} UserAndSessionRegistry
 */

/**
 * An API service represents a Api Service for resource.
 * @template [ID=string] The identifier type of the api service.
 * @template [RESOURCE=any] The API service content type. The resource the service provides.
 * @template [SESSION_DETAIL=void] The session detail.
 * @template [USER_DETAIL=void] The user detail.
 * @typedef {UserAndSessionRegistry<SESSION_DETAIL, USER_DETAIL, ID, ID> & ApiService<ID, RESOURCE>} IdentifiedApiService
 */

/**
 * The identified api service construction parameters.
 * 
 * @template CONTENT The api service content type.
 * @template [SESSION_DETAIL=void] The session detail.
 * @template [USER_DETAIL=void] The user detail.
 * @typedef {Partial<IdentifiedApiService<ID, CONTENT, SESSION_DETAIL, USER_DETAIL>> & Partial<CryptServiceOptions>} IdentifiedApiServiceParams
 */

/////////////////////////////////////////////////////////////////////
// Password validation
/////////////////////////////////////////////////////////////////////

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

/////////////////////////////////////////////////////////////////////
// In memory api service
/////////////////////////////////////////////////////////////////////

/**
 * @template CONTENT The api service content type.
 * @template [SESSION_DETAIL=void] The session detail.
 * @template [USER_DETAIL=UserInfo] The user detail.
 * @template [ID=string] The identifier type.
 * @template [USER_ID=ID] The user identifier type.
 * @template [SESSION_ID=ID] The session identifier type.
 * 
 * A class implementing an api service caching the content into memory.
 * 
 * @extends {IdentifiedApiService<ID, CONTENT, SESSION_DETAIL, USER_DETAIL>}
 */
export class InMemoryApiService {

    /**
     * The contents of the API service.
     * @type {Record<USER_ID, Entry<ID, CONTENT>[]>}
     */
    #content = {};

    /**
     * The registered users of the api service.
     * The mapping is from user name to the user data.
     * 
     * @type {Record<string, UserData<USER_DETAIL, USER_ID>>}
     */
    #users = {};

    /**
     * The valid authenticated sessions of the api service.
     * 
     * @type {Record<SESSION_ID, SessionData<SESSION_DETAIL, SESSION_ID, USER_ID>>}
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
    getAvailableContent(sessionId, userId, contentId) {
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
                            resolve(this.#content[userId][contentId].content);
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
     * @param {IdentifiedApiServiceParams} param 
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
     * The array of reserved session secrets with session id of the secret.
     *
     * @type {[string, string][]}
     */
    #reservedSessionSecrets = [];

    /**
     * Create a new session.
     * 
     * @param {USER_ID} userId The user identifier.
     * @returns {Promise<SessionData<SESSION_DETAIL, SESSION_ID, USER_ID>>} The promise of the session data.
     */
    createSession(userId) {
        const now = Date.now();
        return new Promise((resolve, reject) => {
            if (userId in this.#users) {
                const sessionId = this._createId(Object.getOwnPropertyNames(this.#sessions));
                this.#sessions[sessionId] = null;
                secret = this._createId(this.#reservedSessionSecrets.map( entry => (entry[0])));
                this.#reservedSessionSecrets.push([secret, sessionId]);
                this.#sessions[sessionId] = {
                    userId,
                    sessionId: id,
                    created: now,
                    expires: (this.sessionTimeOut == 0 ? undefined : now + this.sessionTimeOut),
                    hashedSecret: crypto.createHash("sha512", secret)
                };
                resolve(this.#sessions[sessionId]);
            } else {
                reject(new AccessForbiddenException("User access forbidden!", undefined));
            }
        });

    }

    /**
     * Update an existing session.
     * 
     * @param {SESSION_ID} sessionId The session identifier.
     * @param {USER_ID} userId The user identifier of the session user.
     * @param {SESSION_DETAIL} [sessionDetail] The new session detail of the session.
     * @returns {Promise<SessionData<SESSION_DETAIL, SESSION_ID, USER_ID>>} The promise of the updated session data.
     */
    updateSession(sessionId, userId, sessionDetail = undefined) {
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
                            userInfo: (sessionDetail === undefined ? session.userInfo : sessionDetail)
                        };
                        resolve(this.#sessions[sessionId]);
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
     * @param {SESSION_ID} sessionId The session identifier.
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
                    if (session.expires == null || session.expires > closeTime) {
                        // The session is active. 
                        this.#sessions[id] = { ...session, expires: closeTime };
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
        if (this.validUserName(userName, message = "Invalid user name")) {
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
     * @type {CreateUser<USER_DETAIL, USER_ID>}
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

    /**
     * Get todos of the user.
     * 
     * @param {USER_ID} userId The user id of the todo owner.
     * @param {Predicate<Entry<ID, CONTENT>>} [filter] The filter of the todo. Defaults to get all.
     * @returns {Entry<ID, CONTENT>[]} The array of content entries.
     */
    getContents(userId, filter = (() => true)) {
        return new Promise((resolve, reject) => {
            if (this.validId(userId)) {
                if (userId in this.#users && userId in this.#content) {
                    resolve(this.#content[userId].filter(filter));
                } else {
                    resolve(/** @type {ContentEntry<CONTENT>[]}*/[]);
                }
            } else {
                reject(new BadRequestException("Bad request"));
            }
        });
    }

    /**
     * Get single todo.
     * 
     * @param {USER_ID} userId The user identifier.
     * @param {ID} contentId The content identifier.
     * @param {string} [message] The error message, if the content is not found
     * @returns {Promise<CONTENT>} The promise of the todo.
     * @throws {NotFoundException} The not found exception wiht the todo identifier
     * as value.
     */
    getContent(userId, contentId, message = "Content not found") {
        return this.getContents(userId, (content) => (content.id === contentId)).then(
            (contents) => {
                if (contents.length > 0) {
                    resolve(contents[0].content);
                } else {
                    reject(new NotFoundException(message));
                }
            }
        );
    }

    /**
     * Test validity of a new content.
     *
     * @param {Partial<CONTENT>} content The new content.
     * @returns {boolean} True, if and only if the content is valid.
     */
    validNewContent(content) {
        return typeof content === "object" && content !== null;
    }

    /**
     * Test validity of a content.
     *  
     * @param {CONTENT} content The content.
     * @returns {boolean} True, if and only if the content is valid.
     */
    validContent(content) {
        return typeof content === "object" && content !== null;
    }

    /**
     * Get the default values of the content.
     * 
     * @returns {Partial<CONTENT>} The default values of the content.
     */
    defaultContentValues() {
        return {};
    }

    /**
     * Create a new identifier.
     * 
     * @param {SESSION_ID[]} [idCollection] The reserved identifiers.
     * @returns {Promise<SESSION_ID>} The promise of a new unique identifier.
     */
    _createId() {
        return new Promise((resolve, reject) => {
            try {
                var result = crypto.randomUUID();
                if (idCollection) {
                    while (result in idCollection) {
                        result = crypto.randomUUID();
                    }
                }
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Get next content identifier.
     * 
     * @returns {Promise<string>} The promise of the next identifier.
     */
    createContentId() {
        return this._createId(Object.getOwnPropertyNames(this.#content));
    }

    /**
     * Create a new content.
     * @param {Partial<CONTENT>} newContent The new content.
     * @returns {Promise<Entry<string, CONTENT>>} The new content entry.
     * @throws {InvalidParameterException<CONTENT>} The new content was invalid. 
     */
    async createContentEntry(newContent) {
        return new Promise((resolve, reject) => {
            if (this.validNewContent(newContent)) {
                var id = undefined;
                this.createContentId().then(
                    (id) => {
                        resolve({
                            id,
                            content: { ... this.defaultContentValues(), ...newContent }
                        });
                    },
                    (error) => {
                        reject(new HttpStatusException("Could not generate identifier", error, 500));
                    }
                );
            } else {
                reject(new InvalidParameterException("newContent", newContent, "Invalid new content"));
            }
        })
    }

    /**
     * Create a new todo.
     * 
     * @param {string} ownerId The user id of the owner.
     * @param {Partial<CONTENT>} content The created content.
     * @returns {Promise<string>} The promise of the todo identifier of the created todo.
     * @throws {InvalidParameterException<CONTENT>} The cotent was invalid.
     */
    createContent(userId, content) {
        return new Promise((resolve, reject) => {
            if (this.validId(userId) && userId in this.#users) {
                if (!this.validNewContent(content)) {
                    reject(new BadRequestException("Invalid content"));
                    return;
                }
                // Adding the created.
                if (!(userId in this.#content)) {
                    this.#content[userId] = [this.createContentEntry(content)];
                } else {
                    this.#content[userId].push(this.createContentEntry(content));
                }
            } else {
                reject(new BadRequestException("Bad request"));
            }
        });
    }
}

/**
 * Create a new service.
 *
 * @template [CONTENT=any] The content type of the service.
 * @param {IdentifiedApiServiceParams<CONTENT>} param 
 * @returns 
 */
export default function createApiService(param) {
    return new InMemoryApiService(param);
}