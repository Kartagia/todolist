import { createRoot } from 'react-dom/client';
import App from "./App.jsx";
import React, { useContext, useState } from 'react';
import { REPL_MODE_SLOPPY } from 'repl';


/**
 * The properties of the login.
 *
 * @typedef {Object} LoginProps
 * @property {import("./login.mjs").EmailProviderInfo} [emailProvider] The email and password login provider.
 * @property {import("./login.mjs").ProviderInfo[]} [federatedProviders=[]] The federated login providers.
 * @property {import("./login.mjs").LoginListener} [onLogin] The login listener listening for login.
 * @property {import("./login.mjs").LogoutListener} [onLogout] The listener of the logout of the current user.
 */

/**
 * An exception indicating something was not supported.
 */
export class UnsupportedError extends Error {

    /**
     * Create an unsupported error.
     * @param {string} [message] The message of the exception. 
     * @param {any} [cause] The cause of the error. 
     */
    constructor(message = undefined, cause = undefined) {
        super(message, cause);
        this.name = this.constructor.name;
    }
}

/**
 * The provider login component.
 * @param {*} props 
 * @param {import('./login.mjs').ProviderInfo} [props.provider] The federated provider.
 * @returns {React.JSX} The JSX of the provider login.
 */
function ProviderLogin(props) {
    return(<React.Fragment><div>Placeholder for provider {props.provider.name}</div></React.Fragment>)
}

/**
 * The email login component.
 * @param {*} props
 * @param {import("./login.mjs").EmailProviderInfo} [props.provider] The email login provider. 
 * @returns {React.JSX} The JSX of the email login.
 */
function EmailLogin(props) {
    return(<React.Fragment><div>Placeholder for email login with {props.provider.name}</div></React.Fragment>)
}

/**
 * The login component.
 * @param {LoginProps} props The properties of the login dialogue.
 */
function Login(props) {
    return (<section name="login" className="login">
        <header><h1>Todo List Login</h1></header>
        <main>
            {props.emailProvider && <EmailLogin provider={props.emailProvider} onLogin={props.onLogin} onLogout={props.onLogout} ></EmailLogin>}
            {(props.federatedProviders || []).map( provider => (<ProviderLogin provider={provider} onLogin={props.onLogin} onLogout={props.onLogout}></ProviderLogin>))}
        </main>
    </section>);
}

/**
 * @typedef {Object} AuthenticationProps
 * @property {import("./login.mjs").ProviderInfo} provider The authentication provider.
 */

/**
 * The authentication context.
 */
const Authentication = useContext({
    /**
     * @type {import('./login.mjs').UserInfo|null} The user information.
     */
    get currentUser() {
        return null;
    },
    /**
     * The login provider.
     * @type {import('./login.mjs').ProviderInfo|null}
     */
    get provider() {
        return null;
    },
    set provider(newProvider) {
        throw new UnsupportedError("Changing provider is not allowed");
    },
    set currentUser(newUser) {
        throw new UnsupportedError("Changing user is not allowed");
    }
})

function getAuthContext(props) {
    return {
        get currentUser() {
            return props.user == null ? null :props.user;
        },
        get provider() {
            return props.provider == null ? null : props.provider;
        },
        set currentUser(user) {
            if (props.setUser) {
                return props.setUser(user);
            } else {
                return Promise.reject(new UnsupportedError("Changing user not allowed"));
            }
        },
        set currentProfider(provider) {
            if (props.setProvider) {
                return props.setProvider(provider);
            } else {
                return Promise.reject(new UnsupportedError("Changing provider not allowed"));
            }
        }
    }
}

/**
 * Authentication context.
 * @param {import("react").PropsWithChildren<AuthenticationProps>} props The authentication props. 
 */
export function Authentication(props) {
    const [authContext, setAuthContext] = useState(getAuthContext(props));
    
    const logoutHandler = () => {
        setAuthContext( (old) => ({...old, currentUser: undefined}));
    }
    const loginHandler = (user) => {
        setAuthContext( (old) => ({...old, currentUser: user}));
    }
    const content = (authContext != null && authContext.currentUser != null ? <React.Fragment>{children}</React.Fragment> : (<Login emailProvider={props.emailProvider} federatedProviders={
        props.federatedProviders || []
    }></Login>));
    return (<Authentication.Provider value={authContext} onLogin={loginHandler} onLogout={logoutHandler}>{content}</Authentication.Provider>)
}

const auth = {

};

// Render your React component instead
const root = createRoot(document.getElementById('app'));
root.render(<App><Authentication value={auth}></Authentication></App>);