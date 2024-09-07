
/**
 * @callback Logout
 * @param {UserInfo} user the logged out user.
 * @param {ProviderInfo} [provider] The provider of the login.
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
 * @property {Readonly<string>} displayName The name shown.
 * @property {Readonly<string>} [image] The user image url.
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
  * @return {Promise<UserInfo>} The promise of completion.
  */

 /**
  * Logout email user.
  * 
  * @callback LogoutEmail
  * @param {UserInfo} user The logged out user.
  * @returns {Promise<never>} The promise of completion.
  */

 /**
  * @callback LoginEmail
  * @param {string} user The user name.
  * @param {string} secret The secret of the user.
  * @return {Promise<UserInfo>} The promise of completion.
  */

 /**
  * @typedef {Object} EmailProviderProps
  * @property {RegisterEmail} register
  * @property {LoginEmail} login
  * @property {LogoutEmail} logout
  */

 /**
  * The email and password provider.
  * @typedef {EmailProviderProps & ProviderInfo} EmailProviderInfo
  */