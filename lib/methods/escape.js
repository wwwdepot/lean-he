"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _regexEscape = require("../regex/regex-escape");

var _escapeMap = require("../map/escape-map");

var escape = function escape(string) {
	return string.replace(_regexEscape.regexEscape, function ($0) {
		// Note: there is no need to check `has(escapeMap, $0)` here.
		return _escapeMap.escapeMap[$0];
	});
};

exports.default = escape;