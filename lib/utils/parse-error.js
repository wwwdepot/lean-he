"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var parseError = function parseError(message) {
	throw Error("Parse error: " + message);
};
exports.default = parseError;