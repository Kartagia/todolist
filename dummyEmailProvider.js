
import bcrypt from './cdn_modules/bcryptjs@2.4.3/bcrypt.min.js';

function equalUser(compared, comparee) {
  return compared.userInfo.id === comparee.id;
}

/**
 * Get the hashed secret.
 * 
 * @param secret The hashed secret.
 * @param salt The salt used for hashing.
 * @return The promise of the hashed secret.
 */
function hash(secret, salt) {
  return new Promise( (resolve, reject) => {
    if (salt == null) {
      reject(SyntaxError("Missing salt"));
      return;
    }
    
    bcrypt.hash(secret, salt, (err, result) => {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  })
  });
}
/**
 * Get salt.
 * @param {string} [email] The user email of the user.
 *  @returns If user is given, the salt of the user. Otherwise the newly generated salt.
 */
async function getSalt(email=null) {
  if (email == null) {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          reject(err);
        } else {
          resolve(salt);
        }
      })
    })
  } else {
    const found = users.find(current => (current.email == email));
    return found ? Promise.resolve(found.salt) : Promise.reject(new NotFoundException("The user does not exist"));
  
}
}
/**
 * Generate next user id.
 * @returns {string} The generated UUID for an user.
 */
function nextUserId() {
  var result = Crypto.randomUUID();
  while (users.find( current => (current.id === result))) {
    result = Crypto.randomUUID();
  }
  return result;
}

/**
 * @typedef {Object} UserData
 * @property {string} id The user identifier.
 * @property {string} email The user email.
 * @property {string} hashedSecret The hashed secret.
 * @property {string} salt The salt used for hashing.
 * @property {import("./login.js").UserInfo} userInfo The user information.
 * @property {number} [expireTime] The account expiration time.
 */

/**
 * @type {UserData}
 */
var users = [];

getSalt().then(
  salt => {
    alert(`Salt ${salt}`)
    return hash("F00baru!", salt).then(
      hashedSecret => {
        users.push({
          id: "admin-1",
          email: "antti@kautiainen.com",
          hashedSecret,
          salt,
          userInfo: {
            id: "2abb1b43-859c-4e84-b306-ccc945bf2e9d",
            displayName: "A. Admin"
          }
        });
      });
  }).catch( (error) => {
    console.error(`Adding user failed due ${error.name} ${error.message}`)
  });


export function invalidUserError() {
  return {
    name: "InvalidUserError",
  errorCode: 1,
  errorMessage: "Invalid username or password",
  get message() {
  return this.errorMessage;
}, cause: undefined
};
}

export function existingAccountError() {
 return {
   name: "ExistingAccountError",
   errorCode: 2,
   errorMessage: "Account not available",
   get message() {
  return this.errorMessage;
},cause: undefined
 };
}

export function sessionCreationError(cause=undefined) {
  return {
    name: "SessionCreationError",
    errorCode: 4,
    errorMessage: "Could not create session",
    get message() {
      return this.errorMessage;
    },
    cause
  };
}

function createUser(email, secret, userInfo=null) {
  return new Promise( (resolve, reject) => {
    if (email == null || secret == null) {
      reject(invalidUserError())
    }
  const user = users.find(current => (current.email=== email));
  if (user) {
    reject(existingAccountError())
  }
  getSalt().then( (salt) => {
    hash(secret, salt).then( hashedSecret => {
      const id = nextUserId();
      users.push({
  id,
  email,
  hashedSecret,
  salt,
  userInfo: {
    id,
    displayName: email
  }
      });
    }).catch(reject);
    
}).catch(reject);
});
}

function loginUser(email, secret) {
  return new Promise( (resolve, reject) => {
    const user = users.find( current => (current.email === email));
    if (user) {
      bcrypt.compare(secret, user.hashedSecret, (err, result) => {
          if (err) {
            reject(err);
          } else if (result) {
            resolve(user.userInfo);
          } else {
            reject(invalidUserError());
          }
            }
            )
    } else {
      reject(invalidUserError());
    }
  });
}

/**
 * The session data.
 * @template DATA Session data.
 * @typedef {Object} SessionData
 * @property {string} startTime The session start time.
 * @property {string} [expireTime] The optional expiration time.
 * @property {string} updateTime The update time.
 * @property {DATA} data The session data.
 */

/**
 * @type {Record<string, SessionData>}
 */
var sessions = {};

/**
 * @template DATA The session data type.
 * @param {DATA} data The session data.
 * @param {string|number} [expires] The optional expiration time.
 * @returns {SessionData<DATA>} The created session data.
 */
function createSession(data, expires=null) {
  const startTime = (new (Date.now())).toISOString();
  const expireTime = (expires == null ? null : (typeof expires === "number" ? new Date(expires) : new Date(Date.parse(expires))).toISOString());
  return {
    startTime,
    expireTime,
    updateTime: startTime,
    data
  };
}

function getExpireTime(source, timeoutMs=60*1000) {
  if (source != null) {
    switch (typeof source) {
      case "string":
        return (new Date(Date.parse(source) + timeoutMs)).toISOString();
      case "number":
        return (new Date(source + timeoutMs)).toISOString();
    }
  }
  return null;
}

function updateSessionData(source, dataAlter) {
  const updateTime = (new Date(Date.now())).toISOString();
  const data = (dataAlter != null && (source.expireTime == null || updateTime < source.expireTime) ? dataAlter(source.data): source.data);
  const expireTime = (target.timeout > 0 ? getExpireTime(updateTime, target.timeout): target.expireTime);
  return {
    ...source,
    updateTime,
    expireTime,
    data
  };
}

function updateSession(user, data) {
  const userId = users.find(current => (equalUser(current, user)));
  if (userId != null && userId.id in sessions) {
    sessions[userId.id] = updateSessionData(sessions[userId.id], ()=>(data));
  }
  return Promise.reject("No such session exists");
}

function logoutUser(user) {
  return new Promise( (resolve, reject) => {
  const userData = users.find( current => equalUser(current,user));
  if (user && user.id in sessions) {
    sessions[user.id].expireTime = (new Date(Date.now())).toISOString();
  }
  resolve();
  });
  
}
/**
 * @type {import("./login.js").EmailProvideraaInfo}
 */
var provider = {
  name: "Dummy Email Provider",
  login(email, secret) {
    return loginUser(email, secret).then(
      (userInfo) => {
        getSession(userInfo.id).then(
          (session) => {
            return updateSession().then(
              () => {
                return userInfo;
              },
              (error) => {
                createSession().then(
                  ()=>{
                    return userInfo;
                  },
                  (err) => {
                    throw sessionCreationError(err);
                  })
              })
          }, 
          () => {
            return createSession(userInfo).then(
              ()=> {
                return userInfo;
              },
              (err) => {
                throw sessionCreationError(err);
              });
          })
      }
    );
  },
  logout(user) {
    return logoutUser(user);
  },
  register(email, secret) {
    return createUser(email, secret);
  }
};

export default provider;