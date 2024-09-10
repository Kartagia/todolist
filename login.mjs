
/**
 * @module login
 * 
 * Login related information.
 */

/**
 * An exception is an error with limited causes and possible detail.
 * @template [CAUSE=Error] The cause of the error.
 * @template [DETAIL=void] The details of the error.
 */
export class Exception extends Error {

    /**
     * The detail of the exception.
     * @type {DETAIL}
     */
    #detail;

    /**
     * Create a new exception with an optiona message, a cause, and a detail.
     * @param {string} [message] The error message.
     * @param {CAUSE} [cause] The cause of the error.
     * @param {DETAIL} [detail] The details of the exception.
     */
    constructor(message = undefined, cause = undefined, detail = undefined) {
        super(message, cause);
        this.name = this.constructor.name;
        this.detail = detail;
    }


    /**
     * The detail of the exception.
     * 
     * @type {Readonly<DETAIL>}
     */
    get detail() {
        return this.#detail;
    }
}

/**
 * Createa a not found error.
 * @template [DETAIL=void] The details of the error.
 * The error indicating that something was not found.
 * @template [CAUSE=Error] The cause of the error.
 * @extends {Exception<CAUSE, DETAIL>}
 */
export class NotFoundError extends Exception {
    /**
     * Create a new not found error.
     * @param {string} [message] The error message.
     * @param {CAUSE} [cause] The cause of the error.
     * @param {DETAIL} [details] The details of the exception.
     */
    constructor(message = undefined, cause = undefined, detail = undefined) {
        super(message, cause, detail);
    }
}

/**
 * An interface representing a paramter value.
 * @template TYPE Value type.
 * @typedef {Object} ParameterDefinition
 * @property {string|symbol} parameterName The name of the parameter.
 * @property {TYPE} [value] The optional value of the parameter.
 */

/**
 * An exception indicating a parameter was invalid.
 * @template VALUE The value type of the invalid parameter.
 * @template [CAUSE=any] The cause of the exception.
 * @extends {Exception<any, ParameterDefinition<VALUE>>}
 */
export class InvalidParameterException extends Exception {

    /**
     * Create a new invalid parameter exception.
     * @param {string|symbol} parameterName The name of the invalid parameter.
     * @param {VALUE} [parameterValue] The optional value of the invalid parameter.
     * @param {string} [message] The message of the exception. 
     * @param {CAUSE} [cause] The cause of the exception.
     */
    constructor(parameterName, parameterValue = undefined, message = undefined, cause = undefined) {
        super(message, cause, { parameterName, value: parameterValue });
    }

    /**
     * The parameter name of the invalid parameter.
     * @type {string}
     */
    get parameterName() {
        return this.detail.parameterName;
    }

    /**
     * The parameter value of the invalid parameter.
     * @type {VALUE|undefined}
     */
    get parameterValue() {
        return this.detail.value;
    }
}

/**
 * Loggout user. 
 * 
 * @callback Logout
 * @param {UserInfo} user the logged out user.
 * @param {ProviderInfo} [provider] The provider of the login.
 * @returns {Promise<never>} Promise of completion.
 * @throws {NotFoundError<UserInfo>} The given user was not logged in with the handling provider.
 */

 /**
  * Provider details.
 * @typedef {Object} ProviderInfo
 * @property {Readonly<string>} name The name of the provider.
 * @property {Logout} [logout] Logout the user. Defaults to the current provider.
 */
 
/**
 * The user information.
 * @typedef {Object} UserInfo
 * @property {Readonly<string>} id The user identifier.
 * @property {Readonly<string>} displayName The name shown.
 * @property {Readonly<string>} [image] The user image url.
 */


/**
 * The email user information specific properties.
 * @typedef {Object} EmailUserInfoProps
 * @property {string} [email] The email address of the user.
 * @property {boolean} [verified] Is the user email verified.
 */

 /**
  * The email user information.
  * @typedef {UserInfo & EmailUserInfoProps} EmailUserInfo
  */

/**
 * Listener of a login event.
 *
 * @callback LoginListener
 * @param {UserInfo} user The user information of the logged in user.
 * @param {ProviderInfo} provider The login provider of the login.
 */
 
 /**
  * Listener of a logout event.
  * 
  * @callback LogoutListener
  * @param {UserInfo} user The logged out user.
  * @param {ProviderInfo} [provider] The provider of the logged out user.
  */
  
   /**
  * Register email user.
  * 
  * @callback RegisterEmail
  * @param {string} user The user name.
  * @param {string} secret The secret of the user.
  * @return {Promise<EmailUserInfo>} The promise of completion.
  */

 /**
  * Logout email user.
  * 
  * @callback LogoutEmail
  * @param {UserInfo} user The logged out user.
  * @param {EmailProviderInfo|ProviderInfo} [provider] The provider of the login.
  * @returns {Promise<never>} The promise of completion.
  * @throws {NotFoundError<UserInfo>}
  */

 /**
  * The login with email and secret. The exceptions are not thrown but returned via promise.
  * @callback LoginEmail
  * @param {string} user The user name.
  * @param {string} secret The secret of the user.
  * @return {Promise<EmailUserInfo>} The promise of completion.
  * @throws {InvalidParameterException<string, any>} The exception indicating that the login failed due invalid user or secret.
  * @throws {Error} The error indicating that the login failed. 
  */
 /**
  * The email provider specific properties.
  * @typedef {Object} EmailProviderProps
  * @property {RegisterEmail} register Register a new user.
  * @property {LoginEmail} login Login an user with email and secret.
  * @property {LogoutEmail} logout Logout an user.
  */

 /**
  * The email and password provider.
  * @typedef {EmailProviderProps & ProviderInfo} EmailProviderInfo
  */