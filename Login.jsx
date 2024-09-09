import React from 'react';
import { useContext, useState, useRef } from 'react';
import { AuthContext } from './Authentication.jsx';
import {validEmail} from "./hostname.js";

/**
 * @typedef {import("./login.js").ProviderInfo} ProviderInfo
 */

/**
 * @typedef {import("./login.js").LoginListener} LoginListener
 */

/**
 * @typedef {import("./login.js").LogoutListener} LogoutListener
 */

/**
 * @typedef {Object} LoginListenerProps
 * @property { LoginListener } [onLogin] The handler of the login event.
 * @property { LogoutListener } [onLogout] The handler of the logout event.
 */
 

 /**
  * Test validity of a secret.
  * @param {string} secret The tested secret.
  * @returns {boolean} True, if and only if the secret starts and ends with punctuation, letter, or digit, contains at least one punctuation character,and letters of both cases. The interior may contain spacer, and has at least 6 and at most 72 characters.
  */
 export function validSecret(secret) {
   return typeof secret === "string" && secret.length <= 72 && (new RegExp("^[\\p{L}\\p{N}\\p{Pu}][\\s\\p{L}\\p{N}\\p{Pu}]{4,70}[\\p{L}\\p{N}\\p{Pu}]$", "u")).test(secret) && (new RegExp("\\p{Lu}", "u")).test(secret) &&
   (new RegExp("\\p{Ll}", "u")).test(secret) &&
   (new RegExp("\\p{Pu}", "u")).test(secret)
 }

/**
 * @typedef {Object} EmailLoginProps
 * @property {EmailProviderInfo} provider
 */

/**
 * @param {EmailLoginProps & LoginListenerProps} props
 */
export function EmailLogin(props) {
  const auth = useContext(AuthContext);
  const [error, setError] = useState(props.errors);
  const [provider, setProvider] = useState(props.provider);
  const userField = useRef();
  const secretField = useRef();
  const performLogin = (userInfo, provider, handler) => {
    alert(`Performing login ${userInfo.displayName} with ${provider.name}`)
    auth.setProvider(provider);
    auth.setUser(userInfo);
    if (props.onLogin) {
      console.log("informing listener")
      props.onLogin(userInfo, provider)
      console.log("informed listener")
    }
    handler(null);
  }
  const login = (user, secret, handler = (_errors = null) => {}) => {
    if (props.provider) {
      props.provider.login(user, secret).then(
        (userInfo) => {
          if (auth.loggedIn && props.onLogout) {
            props.onLogout(auth.userInfo, auth.provider).then(
              () => {
                performLogin(userInfo, props.provider, handler);
              }, handler(error))
          } else {
            performLogin(userInfo, props.provider, handler);

          }
        },
        (error) => {
          handler(error.errorMessage);
        }
      )
    } else {
      console.log("No provider")
      handler("Invalid username or password");
    }
  }

  const loginAction = (e) => {

    const user = userField.current.value;
    const secret = secretField.current.value;
    alert(`Login "${user}" with "${secret}"`);
    e.preventDefault();
    e.target.disabled = true;
    const oldVal = e.target.value;
    e.target.value = "Processing...";
    login(user, secret, (errors = undefined) => {
      setError(errors);
      e.target.disabled = false;
      e.target.value = oldVal;

    });
  };
  const cancelAction = (e) => {
    e.preventDefault();
  }
  const signUpAction = (e) => {
    const user = userField.current.value;
    if (!validEmail(user)) {
      setError({email: "Invalid email"});
      e.preventDefault();
    }
    const secret = secretField.current.value;
    if (!validSecret(secret)) {
      setError({"password":"The password must have 6 characters, and both upper and lower case letters"});
    }
    alert(`Register "${user}" with "${secret}"`);
    e.preventDefault();
    if (props.provider.register) {
      props.provider.register(user, secret).then(
        (userInfo) => {
          performLogin(useInfo, props.provider)
          handler();
        },
        (errors) => {
          handler(errors.errorMessage);
        }
      )
    } else {
      handler("Registration refused");
    }
  }

  console.group("Email provider login", props.provider.name);
  console.table(auth);
  console.groupEnd();

  return (<section name={props.name || "login:email"}>
    <header>{props.title || "Email Login"}</header>
    <main>
      <article><label>Email<input ref={userField} type="email" name="email" /></label>
      <ErrorText errors={error} field="email"/></article>
      <article><label>Password<input ref={secretField} type="password" name="secret" /></label>
      <ErrorText errors={error} field="secret"/></article>
      {(typeof error === "string") && <article className="error">{error}</article>}
    </main>
    <footer><input type="submit" value={props.login || "Log In"}
    onClick={loginAction}/>{props.allowSignUp ? "Sign Up Here": null}{
      props.allowCancel ? <input type="default" value={props.cancel || "Cancel"} onClick={cancelAction}/>: null
    }</footer>
  </section>);
}

/**
 * @typedef {Object} LoginProps
 * @property {import("./Authentication.jsx").EmailProviderInfo} [emailProvider] The email login provider.
 * @property {boolean} [allowEmail=false] Is email login allowed 
 * @property {import("./Authentication.jsx").ProviderInfo[]} [providers=[]] The custom login providers.
 */

/**
 * Create login page.
 * 
 * @param {LoginProps & LoginListenerProps} props
 */
export default function LoginPage(props) {
  const auth = useContext(AuthContext);
  const [providers, setProviders] = useState((props.providers || []));

  console.group("Login Component");
  console.debug(`Auth: ${auth ? typeof auth : "Undefined"}`);
  console.debug(`Providers: ${providers.map( cur => (cut.name)).join(",")}`);
  console.log(`Email login: ${props.allowEmail}`);
  console.groupEnd();

  return (<form>
    {props.allowEmail && <EmailLogin provider={props.emailProvider} onLogin={props.onLogin}
    onLogout={props.onLogout}
    />}
    {providers.map(
    provider => (<Provider provider={provider} onLogin={props.onLogin}
    onLogout={props.onLogout}/>)
    )}
  </form>);
}



/**
 * @param {string|Record<string,string>} [props.errors] The initial errors.
 * @param {string} [field] The field, whose error the component show. Required with record errors.
 */
export function ErrorText(props) {
  switch (typeof props.errors) {
    case "string":
      if (props.field) {
        break;
      } else {
        return <article className="error">{props.errors}</article>;
      }
    case "object":
      if (props.field && props.errors[props.field]) {
        return <p className="error">{props.errors[props.field]}</p>;
      }
  }
  return <React.Fragment />;
}


export function Provider(param) {
  return (<article>Provider {param.data.name} placeholder</article>)
}