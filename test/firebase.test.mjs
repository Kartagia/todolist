
/**
 * NodeJS Firebase testing.
 */

import { readConfig, getApp } from "../firebase.mjs";
import { expect } from "chai";
import { describe, it } from "mocha";

describe("Firebase library", function() {
    describe("readConfig", function() {
        it("Default config from environment file", function() {
            expect(readConfig()).eventually.a("object");
        });
    })

    describe("getApp", function() {
        it("Default config from environment file", function() {
            expect(getApp()).eventually.a("object");
        });
    });
});