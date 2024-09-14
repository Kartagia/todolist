
/**
 * @module test/ApiService
 * 
 */

import { expect } from "chai";
import createApiService, { HAS_DIGIT_REGEX, HAS_LOWER_CASE_LETTER_REGEX, HAS_PUNCTUATION_REGEX, HAS_UPPER_CASE_LETTER_REGEX, InMemoryApiService, VALID_PASSWORD_REGEX } from "../apiServices.mjs";

describe("Test password", function () {
    const validPasswordsByLowerCase = ["diibadaaba", "Labrador", "0Abbasil", "Lubre", "yeah!", "Yeah!", "9a", "a9", "A9a", "a9A", "aFf3cted!", "F00baryMaru!"];
    const validPasswordsByUpperCase = ["Labrador", "0Abbasil", "L", "Lubre", "Yeah!", "A9", "9Z2", "A9a", "a9A", "aFf3cted!", "F00baryMaru!"];
    const validPasswordsByPunctuation = ["!", "-", "_", ".", "\"", "'", "yeah!", "Yeah!", "aFf3cted!", "F00baryMaru!"];
    const validPasswordsByDigit = ["0", "0Abbasil", "991239", "9a", "a9", "A9", "9Z2", "A9a", "a9A", "aFf3cted!", "F00baryMaru!"];
    const invalidPasswords = ["", " ", "   ", "\t\f\b\n", "\n"];
    const validPasswords = validPasswordsByDigit.filter(
        password => validPasswordsByUpperCase.includes(password)
    ).filter(
        password => validPasswordsByLowerCase.includes(password)
    ).filter(
        password => validPasswordsByPunctuation.includes(password)
    );
    it("Has single digit regexp", function () {
        const regex = HAS_DIGIT_REGEX;
        const validSet = validPasswordsByDigit;
        const invalidFilter = (password) => (!validSet.includes(password));
        validSet.forEach(tested => {
            expect(regex.test(tested)).true;
        });
        [...invalidPasswords, ...(validPasswords.filter(invalidFilter))].forEach(tested => {
            expect(regex.test(tested)).false;
        });
    });
    it("Has single lower case letter regexp", function () {
        const regex = HAS_LOWER_CASE_LETTER_REGEX;
        const validSet = validPasswordsByLowerCase;
        const invalidFilter = (password) => (!validSet.includes(password));
        validSet.forEach(tested => {
            expect(regex.test(tested)).true;
        });
        [...invalidPasswords, ...(validPasswords.filter(invalidFilter))].forEach(tested => {
            expect(regex.test(tested)).false;
        });
    });
    it("Has single upper case letter regexp", function () {
        const regex = HAS_UPPER_CASE_LETTER_REGEX;
        const validSet = validPasswordsByUpperCase;
        const invalidFilter = (password) => (!validSet.includes(password));
        validSet.forEach(tested => {
            expect(regex.test(tested)).true;
        });
        [...invalidPasswords, ...(validPasswords.filter(invalidFilter))].forEach(tested => {
            expect(regex.test(tested)).false;
        });
    });
    it("Has single punctuation character regexp", function () {
        const regex = HAS_PUNCTUATION_REGEX;
        const validSet = validPasswordsByPunctuation;
        const invalidFilter = (password) => (!validSet.includes(password));
        validSet.forEach(tested => {
            expect(regex.test(tested)).true;
        });
        [...invalidPasswords, ...(validPasswords.filter(invalidFilter))].forEach(tested => {
            expect(regex.test(tested)).false;
        });
    });
    it("Has single digit character regexp", function () {
        const regex = HAS_DIGIT_REGEX;
        const validSet = validPasswordsByDigit;
        const invalidFilter = (password) => (!validSet.includes(password));
        validSet.forEach(tested => {
            expect(regex.test(tested)).true;
        });
        [...invalidPasswords, ...(validPasswords.filter(invalidFilter))].forEach(tested => {
            expect(regex.test(tested)).false;
        });
    });
    it("Valid password regex", function () {
        const regex = VALID_PASSWORD_REGEX;
        const validSet = validPasswords;
        const invalidFilter = (password) => (!validSet.includes(password));
        validSet.forEach(tested => {
            expect(regex.test(tested)).true;
        });
        [...invalidPasswords, ...(validPasswords.filter(invalidFilter))].forEach(tested => {
            expect(regex.test(tested)).false;
        });

    })
})

describe("In Memory Api Service", function () {
    it("Construction", function () {
        [{ caseName: "Empty parameters", params: {} }, { caseName: "Default Parameters", params: undefined, exception: TypeError },
        {
            caseName: "With valid crypt options of simple sha1 of length 1", params: {
                cryptOptions: {
                    algorithm: "sha1",
                    length: 1
                }
            }
        }
        ].forEach(({ caseName, params, exception = null }, caseIndex) => {
            console.log(`Test case ${caseIndex}: name=${caseName} params=${params}, exception=${exception}`
            );
            const testFunc = () => {
                new InMemoryApiService(params);
            };
            if (exception == null) {
                it(`Test Case without error #${caseIndex}: ${caseName}`, function () {
                    console.log("Without exception");
                    expect(() => {testFunc()}).not.throw();
                })
            } else {
                it(`Test Case with error #${caseIndex}: ${caseName}`, function () {

                    console.log("With exception");
                    expect(() => {testFunc()}).throw(exception);
                });
            }
        });
    });
})
