
/**
 * @module Exceptions
 * 
 * The exceptions.
 */

/**
 * An exception is an error with possible detail.
 *
 * @template [DETAIL=void] The detail of the exception.
 * @template [CAUSE=any] The cause type of the exception.
 */
export class Exception extends Error {

    /**
     * The detail of the exception.
     * @type {CAUSE|undefined}
     */
    #detail;

    /**
     * Create a new exception with an optional message, cause, and detail.
     *
     * @param {string} [message] The optinal message of the exception.
     * @param {CAUSE} [cause] The optional cause of the exception. 
     * @param {DETAIL} [detail] The optional detail of the exception.
     */
    constructor(message = undefined, cause = undefined, detail = undefined) {
        super(message, cause);
        this.name = this.constructor.name;
        this.#detail = detail;
    }

    /**
     * The optional detail of the exception.
     * 
     * @type {Readonly<DETAIL>|undefined}
     */
    get detail() {
        return this.#detail;
    }

}

/**
 * The default messages of the HTTP status codes.
 * 
 * - If the value is string, the code is standard code.
 * - If the value is a record to a string, the value is mapping from context to message.
 * - If the value is a record to a string array, the context has more than one message for same
 * code. The first value is the default message, but other message may be used.
 * 
 * @type {Record<number, string|Record<string, string|string[]>>}
 */
const httpStatusCodes = {
    // Information
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",
    103: "Early Hints",
    // Success
    200: "Ok",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    208: "Already Reported",
    226: "IM Used",
    // Redirection
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    306: "Switch Proxy",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    // Client errors
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a teapot",
    421: "Misdirected Request",
    422: "Unprocessable Content",
    423: "Locked",
    424: "Failed Dependency",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    // Server errors
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required",
    // Unofficial codes.
    218: { "Apache": "This is fine" },
    419: { "Laravel": "Page Expired" },
    420: { "Spring": "Method Failure", "Twitter": "Enhance Your Calm" },
    430: { "Shopify": ["Shopify Security Rejection", "Request Header Fields Too Large"] },
    450: { "Microsoft": "Blocked by Windows Parental Controls" },
    498: { "Esri": "Invalid Token" },
    499: { "Esri": "Token Required" },
    509: { "Apache": "Bandwith Limit Exceeded", "cPanel": "Bandwith Limit Exceeded" },
    529: { "Qualys": "Site is overloaded" },
    530: { "Pantheon": "Site is frozen" },
    540: { "Shopify": "Temporarily Disabled" },
    598: { "HTTP Proxy": "Network read timeout error" },
    599: { "HTTP Proxy": "Network Connect Timeout Error" },
    783: { "Shopify": "Unexpected Token" },
    999: { "LinkedIn": "Non-standard" },
    // IIS special codes
    440: { "IIS": "Login Time-out" },
    449: { "IIS": "Retry With" },
    451: { "IIS": "Redirect" },
    // nginx
    444: { "nginx": "No Response" },
    494: { "nginx": "Request header too large" },
    495: { "nginx": "SSL Certificate Error" },
    496: { "nginx": "SSL Certificate Required" },
    497: { "nginx": "HTTP Requst Sent to HTTPS Port" },
    499: { "nginx": "Client Closed Request" },
    // Cloudflare
    520: { "Cloudflare": "Web Server Returned an Unknown Error" },
    521: { "Cloudflare": "Web Server is Down" },
    522: { "Cloudflare": "Connection Timed Out" },
    523: { "Cloudflare": "Origin is Unreachable" },
    524: { "Cloudflare": "A Timeout Occured" },
    525: { "Cloudflare": "SSL Handshake Failed" },
    526: { "Cloudflare": "Invalid SSL Certificate" },
    527: { "Cloudflare": "Railgun Error" },
    530: { "Cloudflare": "" }
}

/**
 * Get hte status message at context.
 *
 * @param {number} statusCode The status code. 
 * @param {string} [context] The context of the status code.
 * @returns {string|null} The string containing the status message, or a null indicating the status code has no message withing
 * context.
 */
function getStatusMessage(statusCode, context = null) {
    if (Number.isInteger(statusCode) && statusCode in httpStatusCodes) {
        const result = httpStatusCodes[statusCode];
        switch (typeof result) {
            case "string":
                return result;
            case "object":
                if (context != null && context in result) {
                    return Array.isArray(result[context]) ? result[context][0] : result[context];
                } else if ("default" in result) {
                    return result.default;
                } else {
                    return null;
                }
            default:
                return null;
        }
    } else {
        return null;
    }
}

const validMessageFirstWordRegex = new RegExp("\\p{Lu}(?:[\\p{L}\\p{N}\\p{P}]*)", "u");

const validMessageWordRegex = new RegExp("[\\p{L}\\p{N}\p{P}]+", "u");

const validMessageSentenceRegex = new RegExp(validMessageFirstWordRegex + "(?:[\\.,]? " + validMessageWordRegex.source + ")*", "u");

const validMessageRegex = new RegExp("^" +  validMessageSentenceRegex.source + "(?:\\p{P}? " + validMessageSentenceRegex.source +  ")*\\p{P}?" + "$", "u");

/**
 * The detail of a HttpStatusDetail
 */
export class HttpStatusDetail {

    /**
     * The status code of the detail.
     * @type {number}
     */
    #status;

    /**
     * The error message of the http detail.
     * @type {string|null}
     */
    #message;

    /**
     * 
     * @param {number} statusCode The status code.
     * @param {message|null} [message=null] The message of the status. An undefined value indicates
     * the default message of the status code.
     */
    constructor(statusCode = 500, message = null) {
        this.#status = this.checkStatus(statusCode);
        this.#message = this.checkMessage(message);
    }

    /**
     * Test a status code.
     *
     * @param {*} statusCode The tested status code.
     * @returns {boolean} True, if and only if the status code is a valid status code.
     */
    validStatusCode(statusCode) {
        return typeof statusCode === "number" && Number.isInteger(statusCode) && statusCode >= 0 && statusCode < 599;
    }

    /**
     * Check validity of the status code.
     *
     * @param {*} statusCode The tested status code.
     * @returns {number} The valid status code.
     * @throws {TypeError} The status code was ivnalid.
     */
    checkStatus(statusCode) {
        if (this.validStatusCode(statusCode)) {
            return /** @type {number} */statusCode;
        } else {
            throw new TypeError("Invalid status code");
        }
    }

    /**
     * Test validity of a message.
     *
     * @param {*} message The tested message.
     * @returns {boolean} True, if and only if the message is a valid message.
     */
    validMessage(message) {
        switch (typeof message) {
            case "string":
                return validMessageRegex.test(message);
            case "object":
                return message == null;
        }
    }

    /**
     * Check validity of the message.
     * @param {*} message The tested message.
     * @returns {string|null} The valid message. An undefined value indicates the status code determines
     * the message.
     * @throws {SyntaxError} The message was not a valid message.
     */
    checkMessage(message) {
        if (this.validMessage(message)) {
            return message == null ? null : /** @type {string} */ message;
        } else {
            throw new SyntaxError("Invalid status message " + message);
        }
    }

    /**
     * The status code.
     *
     * @type {Readonly<number>} The status code.
     */
    get statusCode() {
        return this.#status;
    }

    /**
     * Get the default message for the status code.
     *
     * @param {number} statusCode The status code. 
     * @param {string|null} [context=null] The context of the status code.
     * @returns {string} The default message for the status code.
     * @throws {TypeError} The status code is invalid.
     */
    defaultMessage(statusCode, context = null) {
        const result = getStatusMessage(this.checkStatus(statusCode), context);
        if (result == null) {
            return "Unknown Status Code";
        } else {
            return result;
        }
    }

    /**
     * The message of the http status detail.
     *
     * @type {string}
     */
    get message() {
        return this.#message == null ? this.defaultMessage(this.statusCode) : this.#message;
    }
}

/**
 * A http status exception.
 *
 * @template [CAUSE=any] The cause of the exception.
 * @extends {Exception<HttpStatusDetail, CAUSE>}
 */
export class HttpStatusException extends Exception {

    /**
     * Create a new http status exception.
     * 
     * @param {string} [message] The message of the exception.
     * @param {CAUSE} [cause] The cause of the exception.
     * @param {number} [statusCode=500] The status code of the message. Defaults to the 500. 
     * @param {string|null} [statusMessage=null] 
     */
    constructor(message = undefined, cause = undefined, statusCode = 500, statusMessage = null) {
        super(message, cause, new HttpStatusDetail(statusCode, statusMessage));
    }

    /**
     * The HTTP status code.
     * 
     * @type {number}
     */
    get statusCode() {
        return this.detail.statusCode;
    }

    /**
     * The status message.
     * 
     * @type {string}
     */
    get statusMessage() {
        return this.detail.message;
    }
}

/**
 * A not found error indicates the resource is not found.
 * @template [CAUSE=any] The cause of the exception.
 * @extends {HttpStatusException<CAUSE>}
 */
export class NotFoundException extends HttpStatusException {

    /**
     * Create a new not found exception.
     * @param {string} [message] The error message. 
     * @param {CAUSE} [cause] The cause of the exception.
     * @param {string} [statusMessage] The optional status message replacing the default message.
     */
    constructor(message = undefined, cause = undefined, statusMessage = undefined) {
        super(message, cause, 404, statusMessage);
    }
}

/**
 * An exception indicating the user must authenticate.
 * 
 * @template [CAUSE=any]
 * @extends {HttpStatusException<CAUSE>}
 */
export class AuthenticationRequiredException extends HttpStatusException {

    /**
     * Create a new authentication required exception.
     *
     * @param {string} [message] The error message. 
     * @param {CAUSE} [cause] The cause of the exception.
     * @param {string} [statusMessage] The optional status message replacing the default message.
     */
    constructor(message = undefined, cause = undefined, statusMessage = undefined) {
        super(message, cause, 401, statusMessage);
    }
}

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
 * An exception indicating the resource access was forbidden.
 *
 * @template [CAUSE=any]
 * @extends {HttpStatusException<CAUSE>}
 */
export class AccessForbiddenException extends HttpStatusException {
    /**
     * Create a new access forbidden exception.
     *
     * @param {string} [message] The error message. 
     * @param {CAUSE} [cause] The cause of the exception.
     * @param {string} [statusMessage] The optional status message replacing the default message.
     */
    constructor(message = undefined, cause = undefined, statusMessage = undefined) {
        super(message, cause, 403, statusMessage);
    }

}

//////////////////////////////////////////////////////////////////////////////////
// Generid more detaileed exceptions
//////////////////////////////////////////////////////////////////////////////////

/**
 * An invalid parameter exception indicates some parameter was ivnalid.
 * It contaisn the parameter name, and may contain the invalid value, message, or cause.
 * 
 * @template [DETAIL=any] The parameter value type.
 * @template [CAUSE=any] The cause of the exception.
 * @extends {Exception<ParameterDefinition<DETAIL>, CAUSE>}
 */
export class InvalidParameterException extends Exception {

    /**
     * Create a new invalid parameter exception.
     * 
     * @param {string|symbol} parameterName The parameter name.
     * @param {DETAIL} [parameterValue] The parameter value.
     * @param {string} [message] The exception message.
     * @param {CAUSE} [cause] The exception cause.
     */
    constructor(parameterName, parameterValue = undefined, message = undefined, cause = undefined) {
        super(message, cause, {parameterName, parameterValue});
    }


    /**
     * The invalid paramter name.
     * 
     * @type {string|symbol}
     */
    get parameterName() {
        return this.detail.parameterName;
    }

    /**
     * The invalid parameter value.
     * 
     * @type {DETAIL|undefined}
     */
    get parameterValue() {
        return this.detail.parameterValue;
    }
}