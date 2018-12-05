"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _merge = require("../utils/merge");

var _merge2 = _interopRequireDefault(_merge);

var _parseError = require("../utils/parse-error");

var _parseError2 = _interopRequireDefault(_parseError);

var _regexDecode = require("../regex/regex-decode");

var _decodeMapNumeric = require("../map/decode-map-numeric");

var _invalidReferenceCodePoints = require("../utils/invalid-reference-code-points");

var _constains = require("../utils/constains");

var _constains2 = _interopRequireDefault(_constains);

var _decodeMap = require("../map/decode-map");

var _decodeMapLegacy = require("../map/decode-map-legacy");

var _regexInvalidEntry = require("../regex/regex-invalid-entry");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function codePointToSymbol(codePoint, strict) {
	var output = '';
	if (codePoint >= 0xD800 && codePoint <= 0xDFFF || codePoint > 0x10FFFF) {
		// See issue #4:
		// “Otherwise, if the number is in the range 0xD800 to 0xDFFF or is
		// greater than 0x10FFFF, then this is a parse error. Return a U+FFFD
		// REPLACEMENT CHARACTER.”
		if (strict) {
			(0, _parseError2.default)('character reference outside the permissible Unicode range');
		}
		return "\uFFFD";
	}

	if (_decodeMapNumeric.decodeMapNumeric.hasOwnProperty(codePoint)) {
		if (strict) {
			(0, _parseError2.default)('disallowed character reference');
		}
		return _decodeMapNumeric.decodeMapNumeric[codePoint];
	}
	if (strict && (0, _constains2.default)(_invalidReferenceCodePoints.invalidReferenceCodePoints, codePoint)) {
		(0, _parseError2.default)('disallowed character reference');
	}
	if (codePoint > 0xFFFF) {
		codePoint -= 0x10000;
		output += String.fromCharCode(codePoint >>> 10 & 0x3FF | 0xD800);
		codePoint = 0xDC00 | codePoint & 0x3FF;
	}
	output += String.fromCharCode(codePoint);
	return output;
}

var decode = function decode(html, options) {
	options = (0, _merge2.default)(options, decode.options);
	var strict = options.strict;
	if (strict && _regexInvalidEntry.regexInvalidEntity.test(html)) {
		(0, _parseError2.default)('malformed character reference');
	}
	return html.replace(_regexDecode.regexDecode, function ($0, $1, $2, $3, $4, $5, $6, $7) {
		var codePoint = void 0;
		var semicolon = void 0;
		var decDigits = void 0;
		var hexDigits = void 0;
		var reference = void 0;
		var next = void 0;
		if ($1) {
			// Decode decimal escapes, e.g. `&#119558;`.
			decDigits = $1;
			semicolon = $2;
			if (strict && !semicolon) {
				(0, _parseError2.default)('character reference was not terminated by a semicolon');
			}
			codePoint = parseInt(decDigits, 10);
			return codePointToSymbol(codePoint, strict);
		}
		if ($3) {
			// Decode hexadecimal escapes, e.g. `&#x1D306;`.
			hexDigits = $3;
			semicolon = $4;
			if (strict && !semicolon) {
				(0, _parseError2.default)('character reference was not terminated by a semicolon');
			}
			codePoint = parseInt(hexDigits, 16);
			return codePointToSymbol(codePoint, strict);
		}
		if ($5) {
			// Decode named character references with trailing `;`, e.g. `&copy;`.
			reference = $5;
			if (_decodeMap.decodeMap.hasOwnProperty(reference)) {
				return _decodeMap.decodeMap[reference];
			} else {
				// Ambiguous ampersand. https://mths.be/notes/ambiguous-ampersands
				if (strict) {
					(0, _parseError2.default)('named character reference was not terminated by a semicolon');
				}
				return $0;
			}
		}
		// If we’re still here, it’s a legacy reference for sure. No need for an
		// extra `if` check.
		// Decode named character references without trailing `;`, e.g. `&amp`
		// This is only a parse error if it gets converted to `&`, or if it is
		// followed by `=` in an attribute context.
		reference = $6;
		next = $7;
		if (next && options.isAttributeValue) {
			if (strict && next === '=') {
				(0, _parseError2.default)('`&` did not start a character reference');
			}
			return $0;
		} else {
			if (strict) {
				(0, _parseError2.default)('named character reference was not terminated by a semicolon');
			}
			// Note: there is no need to check `has(decodeMapLegacy, reference)`.
			return _decodeMapLegacy.decodeMapLegacy[reference] + (next || '');
		}
	});
};

decode.options = {
	'isAttributeValue': false,
	'strict': false
};

exports.default = decode;