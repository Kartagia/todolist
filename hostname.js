/**
 * @module hostname
 * 
 * Hostname related module.
 */

/**
 * Base character groups of the hostname.
 * @type {string[]}
 */
const baseChars = [
   "A-Z", "a-z", "0-9"
  ];

/**
 * The regular expression matching to host name segment.
 * @type {RegExp}
 */
export const hostNameSegmentRegex = new RegExp(`([${baseChars.join("")}]` + "(?:" + `[${[...baseChars, "-"].join("") }]{0,61}` + `[${baseChars.join("")}]` + ")?)");
/**
 * The regular expresison matching to URL host-name (without checking for all numbers)
 * @type {RegExp} 
 */
export const urlHostRegex = new RegExp(hostNameSegmentRegex.source + "(?:\\." + hostNameSegmentRegex.source + ")+");

/**
 * The regular expression matching to IPv4 address segment.
 */
export const ip4segmentRegex = new RegExp("(?:2(?:5[0-5]|[0-4][0-9])|1[0-9]{2}|[1-9]?[0-9])")

/**
 * The regular epxression matching to an IPv4 address.
 */
export const ip4regex = new RegExp(ip4segmentRegex.source + "(?:\\." + ip4segmentRegex.source + "){3}")

export const ip6segmentRegex = new RegExp("(?:[0-9a-fA-F]{1,4})");
/**
 * The regular expression matching a simple ipv6.
 */
export const simpleIp6regex = new RegExp(
  ip6segmentRegex.source +
  "(?::" + ip6segmentRegex.source + "{1,4}){7}");
export const ipv6shorthandRegex = new RexExp([0, 1, 2, 3, 4, 5, 6, 7].reduce(
  (result, prefixSize) => {
    const prefix = (ip6segmentRegex.source + ":").repeat(prefixSize) + (prefixSize == 0 || prefixSize == 7 ? ":" : "") + ("(?::" + ip6segmentRegex.source + `){${prefixSize==0?1:0},${7-prefixSize}}`);
    result.push(prefix);
    return result;
  }, []
).join("|"));
export const ip6LocalhostRegex = new RegExp("::1");

/**
 * The regular expression matching ip6regex
 */
export const ip6regex = new RegExp(
  "\\[" + [
    simpleIp6Regex.source,
    ipv6shorthandRegex.source
    ].join("|") + "\\]"
);

/**
 * The regular expression matching host name.
 */
export const hostNameRegex = new RegExp(
  "(?:" + [
    ip4regex.source,
    ip6regex.source,
    urlHostRegex.source
    ].join("|") + ")"
)

export const hostNameOnlyRegexp = new RegExp("^" + hostNameRegex.source + "$");

export function validHost(host) {
  return typeof host === "string" && hostNameOnlyRegex.test(host);
}

const emailStartRegex = new RegExp("[A-Za-z0-9!#\\$\\%\\&'\\*\\+\-/=?\^_`{|}~]");
const emailRemainderRegex = new RegExp("([A-Za-z0-9!\\#\\$\\%\\&'\\*\\+\-/=?\^_`{\\|}~]|\.(?:$|[A-Za-z0-9!\\#\\$%\\&'*+\-/=?\\^_`{\\|}~]))*");


/**
 * Test validity of an email.
 * @param {string} email The tested email.
 * @return {boolean} True, if and only if email is a valid candidate for email.
 */
export function validEmail(email) {
  return typeof email === "string" && (
    new RegExp("^" + emailStartRegex.source + emailRemainderRegex.source + "@" + hostNameRegex.source + "$")
  ).test(email);
}