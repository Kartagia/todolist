/**
 * @module Session
 * 
 * The session related structures.
 */
 
 /**
  * Session stricture.
  * 
  * @template [DATA=void] Session data.
  * @typedef {Object} Session
  * @property {Readonly<string>} created The creation time of the session in ISO format at Z.
  * @property {Readonly<string>} updated The most recent update time.
  * @property {Readonly<string>} [expires] The expiration time.
  * @property {Readonly<number>} [timeOutMs] The expiration timeout in milliseconds.
  * @property {Readonly<DATA>} [data] The session data.
  * @property {Readonly<boolean>} active Is the session active.
  */
  
  /**
   * Constructor of a new Session.
   * @template [DATA=void]
   * @callback CreateSession
   * @param {Partial<Session<DATA>>} params
   * @return {Promise<Session<DATA>>} the promise of the created data.
   */
   
   /**
    * Create a new session.
    * @template [DATA=void] Session data type.
    * @type {CreateSession<DATA>}
    */
  export function createSession(params) {
    const created = Date.now();
    return Promise.resolve(/** @type {Session<DATA>} */ {
      _created: created,
      _updated: created,
      _expires: params.expires,
      _timeOutMs: params.timeOutMs || undefined,
      _data: params.data,
      get created() {
        return this._created;
      },
      get expires() {
        return this._expires == null && this._timeOutMs != null ? this._updated + this._timeOutMs: this._expires;
      },
      get active() {
        return this.expires == null || this.expires > Date.now();
      },
      get created() {
        return this._created;
      },
      get updated() {
        return this._updated;
      },
      get data() {
        return this._data
      }
    });
  }
  
  export function updateSession(session, data=undefined, updated = Date.now()) {
    return Promise.resolve(/** @type {Session<DATA>} */ {
      _created: session.created,
      _updated: updated,
      _expires: session.expires,
      _timeOutMs: session.timeOutMs,
      _data: data == null ? source.data : data,
      get created() {
        return this._created;
      },
      get expires() {
        return this._expires == null && this._timeOutMs != null ? this._updated + this._timeOutMs: this._expires;
      },
      get active() {
        return this.expires == null || this.expires > Date.now();
      },
      get created() {
        return this._created;
      },
      get updated() {
        return this._updated;
      },
      get data() {
        return this._data
      }
    });
  }