"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _merge = require("../utils/merge");

var _merge2 = _interopRequireDefault(_merge);

var _parseError = require("../utils/parse-error");

var _parseError2 = _interopRequireDefault(_parseError);

var _regexAsciiWhitelist = require("../regex/regex-ascii-whitelist");

var _regexInvalidRawCodePoint = require("../regex/regex-invalid-raw-code-point");

var _encodeMap = require("../map/encode-map");

var _regexEncodeNonAscii = require("../regex/regex-encode-non-ascii");

var _regexEscape = require("../regex/regex-escape");

var _regexAstralSymbols = require("../regex/regex-astral-symbols");

var _regexBmpWhitelist = require("../regex/regex-bmp-whitelist");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function hexEscape(codePoint) {
	return "&#x" + codePoint.toString(16).toUpperCase() + ";";
}

function decEscape(codePoint) {
	return "&#" + codePoint + ";";
}

var encode = function encode(string, options) {
	options = (0, _merge2.default)(options, encode.options);
	var strict = options.strict;
	if (strict && _regexInvalidRawCodePoint.regexInvalidRawCodePoint.test(string)) {
		(0, _parseError2.default)('forbidden code point');
	}
	var encodeEverything = options.encodeEverything;
	var useNamedReferences = options.useNamedReferences;
	var allowUnsafeSymbols = options.allowUnsafeSymbols;
	var escapeCodePoint = options.decimal ? decEscape : hexEscape;

	var escapeBmpSymbol = function escapeBmpSymbol(symbol) {
		return escapeCodePoint(symbol.charCodeAt(0));
	};

	if (encodeEverything) {
		// Encode ASCII symbols.
		string = string.replace(_regexAsciiWhitelist.regexAsciiWhitelist, function (symbol) {
			// Use named references if requested & possible.
			if (useNamedReferences && _encodeMap.encodeMap.hasOwnProperty(symbol)) {
				return "&" + _encodeMap.encodeMap[symbol] + ";";
			}
			return escapeBmpSymbol(symbol);
		});
		// Shorten a few escapes that represent two symbols, of which at least one
		// is within the ASCII range.
		if (useNamedReferences) {
			string = string.replace(/&gt;\u20D2/g, '&nvgt;').replace(/&lt;\u20D2/g, '&nvlt;').replace(/&#x66;&#x6A;/g, '&fjlig;');
		}
		// Encode non-ASCII symbols.
		if (useNamedReferences) {
			// Encode non-ASCII symbols that can be replaced with a named reference.
			string = string.replace(_regexEncodeNonAscii.regexEncodeNonAscii, function (string) {
				// Note: there is no need to check `has(encodeMap, string)` here.
				return "&" + _encodeMap.encodeMap[string] + ";";
			});
		}
		// Note: any remaining non-ASCII symbols are handled outside of the `if`.
	} else if (useNamedReferences) {
		// Apply named character references.
		// Encode `<>"'&` using named character references.
		if (!allowUnsafeSymbols) {
			string = string.replace(_regexEscape.regexEscape, function (string) {
				return "&" + _encodeMap.encodeMap[string] + ";"; // no need to check `has()` here
			});
		}
		// Shorten escapes that represent two symbols, of which at least one is
		// `<>"'&`.
		string = string.replace(/&gt;\u20D2/g, '&nvgt;').replace(/&lt;\u20D2/g, '&nvlt;');
		// Encode non-ASCII symbols that can be replaced with a named reference.
		string = string.replace(_regexEncodeNonAscii.regexEncodeNonAscii, function (string) {
			// Note: there is no need to check `has(encodeMap, string)` here.
			return "&" + _encodeMap.encodeMap[string] + ";";
		});
	} else if (!allowUnsafeSymbols) {
		// Encode `<>"'&` using hexadecimal escapes, now that they’re not handled
		// using named character references.
		string = string.replace(_regexEscape.regexEscape, escapeBmpSymbol);
	}
	return string
	// Encode astral symbols.
	.replace(_regexAstralSymbols.regexAstralSymbols, function ($0) {
		// https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
		var high = $0.charCodeAt(0);
		var low = $0.charCodeAt(1);
		var codePoint = (high - 0xD800) * 0x400 + low - 0xDC00 + 0x10000;
		return escapeCodePoint(codePoint);
	})
	// Encode any remaining BMP symbols that are not printable ASCII symbols
	// using a hexadecimal escape.
	.replace(_regexBmpWhitelist.regexBmpWhitelist, escapeBmpSymbol);
};

encode.options = {
	'allowUnsafeSymbols': false,
	'encodeEverything': false,
	'strict': false,
	'useNamedReferences': false,
	'decimal': false
};

exports.default = encode;