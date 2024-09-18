
/**
 * @module utils
 * 
 * The utility types, structures and methods.
 */

import { InvalidParameterException } from "./errors.mjs";

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
