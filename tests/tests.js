(function(root) {
	'use strict';

	var noop = Function.prototype;

	var load = (typeof require == 'function' && !(root.define && define.amd)) ?
		require :
		(!root.document && root.java && root.load) || noop;

	var QUnit = (function() {
		return root.QUnit || (
			root.addEventListener || (root.addEventListener = noop),
			root.setTimeout || (root.setTimeout = noop),
			root.QUnit = load('../node_modules/qunitjs/qunit/qunit.js') || root.QUnit,
			addEventListener === noop && delete root.addEventListener,
			root.QUnit
		);
	}());

	var qe = load('../node_modules/qunit-extras/qunit-extras.js');
	if (qe) {
		qe.runInContext(root);
	}

	/** The `he` object to test */
	var he = root.he || (root.he = (
		he = load('../he.js') || root.he,
		he = he.he || he
	));

	/*--------------------------------------------------------------------------*/

	function forEach(array, fn) {
		var index = -1;
		var length = array.length;
		while (++index < length) {
			fn(array[index]);
		}
	}

	function forOwn(object, fn) {
		for (var key in object) {
			if (object.hasOwnProperty(key)) {
				fn(key, object[key]);
			}
		}
	}

	// `throws` is a reserved word in ES3; alias it to avoid errors
	var raises = QUnit.assert['throws'];

	// explicitly call `QUnit.module()` instead of `module()`
	// in case we are in a CLI environment
	QUnit.module('he');

	test('decode', function() {
		false && forOwn(officialData, function(key, value) {
			var encoded = 'a ' + key + ' b';
			var decoded = 'a ' + value.characters + ' b';
			var description = 'codepoints ' + value.codepoints.join(',');
			// Decode all the official test data
			equal(
				he.decode(encoded),
				decoded,
				'Decoding ' + description
			);
			// Test if `decode(encode(decoded) == decoded`
			equal(
				he.decode(he.encode(decoded)),
				decoded,
				'decode(encode(decoded)) ' + description
			);
		});
		equal(
			he.decode('&amp;amp;amp;'),
			'&amp;amp;',
			'Only decode once'
		);
		equal(
			he.decode('&#x26;amp;'),
			'&amp;',
			'Only decode once'
		);
		equal(
			he.decode('a&foololthisdoesntexist;b'),
			'a&foololthisdoesntexist;b',
			'Ambiguous ampersand'
		);
		equal(
			he.decode('foo &lolwat; bar'),
			'foo &lolwat; bar',
			'Ambiguous ampersand'
		);
		raises(
			function() {
				he.decode('foo &lolwat; bar', {
					'strict': true
				});
			},
			Error,
			'Parse error: ambiguous ampersand in strict mode'
		);
		equal(
			he.decode('&notin; &noti &notin &copy123'),
			'\u2209 \xACi \xACin \xA9123',
			'Legacy named references (without a trailing semicolon)'
		);
		equal(
			he.decode('a&#x1D306;b&#X0000000000001d306;c'),
			'a\uD834\uDF06b\uD834\uDF06c',
			'Hexadecimal escape'
		);
		equal(
			he.decode('a&#119558;b&#169;c&#00000000000000000169;d'),
			'a\uD834\uDF06b\xA9c\xA9d',
			'Decimal escape'
		);
		equal(
			he.decode('a&#xD834;&#xDF06;b&#55348;&#57094;c a&#x0;b&#0;c'),
			'a\uFFFD\uFFFDb\uFFFD\uFFFDc a\uFFFDb\uFFFDc',
			'Special numerical escapes (see issue #4)'
		);
		raises(
			function() {
				he.decode('a&#xD834;b', {
					'strict': true
				});
			},
			Error,
			'Parse error: special numerical escapes (see issue #4) in strict mode'
		);
		equal(
			he.decode('a&#x9999999999999999;b'),
			'a\uFFFDb',
			'Out-of-range hexadecimal escape in error-tolerant mode'
		);
		raises(
			function() {
				he.decode('a&#x9999999999999999;b', {
					'strict': true
				});
			},
			Error,
			'Parse error: out-of-range hexadecimal escape in strict mode'
		);
		equal(
			he.decode('a&#x110000;b'),
			'a\uFFFDb',
			'Out-of-range hexadecimal escape in error-tolerant mode'
		);
		raises(
			function() {
				he.decode('a&#x110000;b', {
					'strict': true
				});
			},
			Error,
			'Parse error: out-of-range hexadecimal escape in strict mode'
		);
		equal(
			he.decode('foo&ampbar'),
			'foo&bar',
			'Ambiguous ampersand in text context'
		);
		raises(
			function() {
				he.decode('foo&ampbar', {
					'strict': true
				});
			},
			Error,
			'Parse error: ambiguous ampersand in text context in strict mode'
		);
		equal(
			he.decode('foo&#x1D306qux'),
			'foo\uD834\uDF06qux',
			'Hexadecimal escape without trailing semicolon in error-tolerant mode'
		);
		raises(
			function() {
				he.decode('foo&#x1D306qux', {
					'strict': true
				});
			},
			Error,
			'Hexadecimal escape without trailing semicolon in strict mode'
		);
		equal(
			he.decode('foo&#119558qux'),
			'foo\uD834\uDF06qux',
			'Decimal escape without trailing semicolon in error-tolerant mode'
		);
		raises(
			function() {
				he.decode('foo&#119558qux', {
					'strict': true
				});
			},
			Error,
			'Decimal escape without trailing semicolon in strict mode'
		);
		equal(
			he.decode('foo&ampbar', {
				'isAttributeValue': true
			}),
			'foo&ampbar',
			'Attribute value context'
		);
		equal(
			he.decode('foo&amp;bar', {
				'isAttributeValue': true
			}),
			'foo&bar',
			'Attribute value context'
		);
		equal(
			he.decode('foo&amp;', {
				'isAttributeValue': true
			}),
			'foo&',
			'Attribute value context'
		);
		he.decode.options.isAttributeValue = true;
		equal(
			he.decode('foo&amp='),
			'foo&amp=',
			'Attribute value context'
		);
		raises(
			function() {
				he.decode('foo&amp=', {
					'strict': true
					// 'isAttributeValue': true is set globally
				});
			},
			Error,
			'Parse error: `foo&amp=` in attribute value context in strict mode'
		);
		he.decode.options.isAttributeValue = false;
		equal(
			he.decode('foo&amp', {
				'isAttributeValue': true
			}),
			'foo&',
			'Attribute value context'
		);
		equal(
			he.decode('foo&amplol', {
				'isAttributeValue': true,
				'strict': true
			}),
			'foo&amplol',
			'Attribute value context (not a parsing error!)'
			// E.g. `&amp` is only a parse error if it gets converted to `&` or if it
			// is followed by `=` in an attribute.
			// http://krijnhoetmer.nl/irc-logs/whatwg/20130701#l-249
		);
		raises(
			function() {
				he.decode('foo&amplol', {
					'isAttributeValue': false,
					'strict': true
				});
			},
			Error,
			'Parsing error: `foo&amplol` in text context'
		);
		he.decode.options.strict = true;
		raises(
			function() {
				he.decode('I\'m &notit; I tell you', {
					// 'strict': true is now set globally
					'isAttributeValue': false
				});
			},
			Error,
			'Parse error: `I\'m ¬it; I tell you`'
		);
		he.decode.options.strict = false;
		raises(
			function() {
				he.decode('I\'m &notit; I tell you', {
					'strict': true,
					'isAttributeValue': true
				});
			},
			Error,
			'Parse error: `I\'m &notit; I tell you` as attribute value'
		);
		equal(
			he.decode('I\'m &notit; I tell you', {
				'strict': false,
				'isAttributeValue': true
			}),
			'I\'m &notit; I tell you',
			'No parse error: `I\'m &notit; I tell you` as attribute value in error-tolerant mode'
		);
		equal(
			he.decode('I\'m &notin; I tell you', {
				'strict': true
			}),
			'I\'m \u2209 I tell you',
			'No parse error: `I\'m &notin; I tell you` as attribute value'
		);
		equal(
			he.decode('&#x8D;'),
			'\x8D',
			'Decoding `&#x8D;` in error-tolerant mode'
		);
		raises(
			function() {
				he.decode('&#x8D;', {
					'strict': true
				});
			},
			Error,
			'Parse error: `&#x8D;` in strict mode'
		);
		equal(
			he.decode('&#xD;'),
			'\x0D',
			'Decoding `&#xD;` in error-tolerant mode'
		);
		raises(
			function() {
				he.decode('&#xD;', {
					'strict': true
				});
			},
			Error,
			'Parse error: `&#xD;` in strict mode'
		);
		equal(
			he.decode('&#x94;'),
			'\u201D',
			'Decoding `&#x94;` in error-tolerant mode'
		);
		raises(
			function() {
				he.decode('&#x94;', {
					'strict': true
				});
			},
			Error,
			'Parse error: `&#x94;` in strict mode'
		);
		equal(
			he.decode('&#x1;'),
			'\x01',
			'Decoding `&#x1;` in error-tolerant mode'
		);
		raises(
			function() {
				he.decode('&#x1;', {
					'strict': true
				});
			},
			Error,
			'Parse error: decoding `&#x1;` in strict mode'
		);
		equal(
			he.decode('&#x10FFFF;'),
			'\uDBFF\uDFFF',
			'Decoding `&#x10FFFF;` in error-tolerant mode'
		);
		raises(
			function() {
				he.decode('&#x10FFFF;', {
					'strict': true
				});
			},
			Error,
			'Parse error: decoding `&#x10FFFF;` in strict mode'
		);
		equal(
			he.decode('&#196605;', {
				'strict': true
			}),
			'\uD87F\uDFFD',
			'Decoding `&#196605;` (valid code point) in strict mode'
		);
		raises(
			function() {
				he.decode('&#196607;', {
					'strict': true
				});
			},
			Error,
			'Parse error: decoding `&#196607;` in strict mode'
		);

		// “If no characters match the range, then don't consume any characters
		// (and unconsume the U+0023 NUMBER SIGN character and, if appropriate,
		// the X character). This is a parse error […].”
		equal(
			he.decode('&#xZ', {
				'strict': false
			}),
			'&#xZ',
			'Decoding `&#xZ` in error-tolerant mode'
		);
		raises(
			function() {
				he.decode('&#xZ', {
					'strict': true
				});
			},
			Error,
			'Parse error: decoding `&#xZ` in strict mode'
		);
		equal(
			he.decode('&#Z', {
				'strict': false
			}),
			'&#Z',
			'Decoding `&#Z` in error-tolerant mode'
		);
		raises(
			function() {
				he.decode('&#Z', {
					'strict': true
				});
			},
			Error,
			'Parse error: decoding `&#Z` in strict mode'
		);
		equal(
			he.decode('&#00'),
			'\uFFFD',
			'Decoding `&#00` numeric character reference (see issue #43)'
		);
		equal(
			he.decode('&#0128;'),
			'\u20AC',
			'Decoding `0`-prefixed numeric character referencs (see issue #43)'
		);

	});
	test('encode', function() {
		equal(
			typeof he.encode.options,
			'object',
			'`he.encode.options` is exposed'
		);
		strictEqual(
			he.encode.options.useNamedReferences,
			false,
			'`he.encode.options.useNamedReferences` is exposed and `false` by default'
		);
		// Test encoding
		forEach(encodeData, function(item) {
			he.encode.options.useNamedReferences = true;
			equal(
				he.encode(item.decoded),
				item.encoded
			);
			he.encode.options.useNamedReferences = false;
		});
		equal(
			he.encode('foo\xA9bar\uD834\uDF06baz\u2603qux'),
			'foo&#xA9;bar&#x1D306;baz&#x2603;qux',
			'Other non-ASCII symbols are represented through hexadecimal escapes'
		);
		equal(
			he.encode('foo\xA9bar\uD834\uDF06baz\u2603qux', { 'useNamedReferences': true }),
			'foo&copy;bar&#x1D306;baz&#x2603;qux',
			'Other non-ASCII symbols are represented through hexadecimal escapes'
		);
		equal(
			he.encode('foo\xA9bar\uD834\uDF06baz\u2603qux', { 'useNamedReferences': true, 'decimal': true }),
			'foo&copy;bar&#119558;baz&#9731;qux',
			'Other non-ASCII symbols are represented through decimal escapes'
		);
		equal(
			he.encode('\'"<>&', { 'useNamedReferences': false }),
			'&#x27;&#x22;&#x3C;&#x3E;&#x26;',
			'Encode `escape`’s characters without using named references'
		);
		equal(
			he.encode('\'"<>&', { 'useNamedReferences': false, 'decimal': true }),
			'&#39;&#34;&#60;&#62;&#38;',
			'Encode `escape`’s characters without using named references'
		);
		equal(
			he.encode('a\tb', { 'encodeEverything': true }),
			'&#x61;&#x9;&#x62;',
			'Encode tab as `&#x9;` when `encodeEverything: true`'
		);
		equal(
			he.encode('a\tb', { 'encodeEverything': true, 'decimal': true }),
			'&#97;&#9;&#98;',
			'Encode tab as `&#9;` when `encodeEverything: true` and `decimal: true`'
		);
		equal(
			he.encode('a\tb', { 'encodeEverything': true, 'useNamedReferences': true }),
			'&#x61;&Tab;&#x62;',
			'Encode tab as `&Tab;` when `encodeEverything: true, useNamedReferences: true`'
		);
		equal(
			he.encode('a\uD834\uDF06b', { 'encodeEverything': true, 'useNamedReferences': false }),
			'&#x61;&#x1D306;&#x62;',
			'Encode U+1D306 as `&#x1D306;` when `encodeEverything: true, useNamedReferences: false`'
		);
		equal(
			he.encode('a\uD834\uDF06b', { 'encodeEverything': true, 'useNamedReferences': true }),
			'&#x61;&#x1D306;&#x62;',
			'Encode U+1D306 as `&#x1D306;` when `encodeEverything: true, useNamedReferences: true`'
		);
		equal(
			he.encode('a&b123;+\xA9>\u20D2<\u20D2\nfja', { 'encodeEverything': true, 'useNamedReferences': false }),
			'&#x61;&#x26;&#x62;&#x31;&#x32;&#x33;&#x3B;&#x2B;&#xA9;&#x3E;&#x20D2;&#x3C;&#x20D2;&#xA;&#x66;&#x6A;&#x61;',
			'All kinds of symbols when `encodeEverything: true, useNamedReferences: false`'
		);
		equal(
			he.encode('a&b123;+\xA9>\u20D2<\u20D2\nfja', { 'encodeEverything': true, 'useNamedReferences': true }),
			'&#x61;&amp;&#x62;&#x31;&#x32;&#x33;&semi;&plus;&copy;&nvgt;&nvlt;&NewLine;&fjlig;&#x61;',
			'All kinds of symbols when `encodeEverything: true, useNamedReferences: true`'
		);
		equal(
			he.encode('foo\uD800bar'),
			'foo&#xD800;bar',
			'Lone high surrogate'
		);
		raises(
			function() {
				he.encode('foo\uD800bar', { 'strict': true });
			},
			Error,
			'Lone high surrogate triggers parse error when `strict: true`'
		);
		equal(
			he.encode('\uD800bar'),
			'&#xD800;bar',
			'Lone high surrogate at the start of a string'
		);
		raises(
			function() {
				he.encode('\uD800bar', { 'strict': true });
			},
			Error,
			'Lone high surrogate at the start of a string triggers parse error when `strict: true`'
		);
		equal(
			he.encode('foo\uD800'),
			'foo&#xD800;',
			'Lone high surrogate at the end of a string'
		);
		raises(
			function() {
				he.encode('foo\uD800', { 'strict': true });
			},
			Error,
			'Lone high surrogate at the end of a string triggers parse error when `strict: true`'
		);
		equal(
			he.encode('foo\uDBFFbar'),
			'foo&#xDBFF;bar',
			'Lone high surrogate'
		);
		raises(
			function() {
				he.encode('foo\uDBFFbar', { 'strict': true });
			},
			Error,
			'Lone high surrogate triggers parse error when `strict: true`'
		);
		equal(
			he.encode('\uDBFFbar'),
			'&#xDBFF;bar',
			'Lone high surrogate at the start of a string'
		);
		raises(
			function() {
				he.encode('\uDBFFbar', { 'strict': true });
			},
			Error,
			'Lone high surrogate at the start of a string triggers parse error when `strict: true`'
		);
		equal(
			he.encode('foo\uDBFF'),
			'foo&#xDBFF;',
			'Lone high surrogate at the end of a string'
		);
		raises(
			function() {
				he.encode('foo\uDBFF', { 'strict': true });
			},
			Error,
			'Lone high surrogate at the end of a string triggers parse error when `strict: true`'
		);
		equal(
			he.encode('foo\uDC00bar'),
			'foo&#xDC00;bar',
			'Lone low surrogate'
		);
		raises(
			function() {
				he.encode('foo\uDC00bar', { 'strict': true });
			},
			Error,
			'Lone low surrogate triggers parse error when `strict: true`'
		);
		equal(
			he.encode('\uDC00bar'),
			'&#xDC00;bar',
			'Lone low surrogate at the start of a string'
		);
		raises(
			function() {
				he.encode('\uDC00bar', { 'strict': true });
			},
			Error,
			'Lone low surrogate at the start of a string triggers parse error when `strict: true`'
		);
		equal(
			he.encode('foo\uDC00'),
			'foo&#xDC00;',
			'Lone low surrogate at the end of a string'
		);
		raises(
			function() {
				he.encode('foo\uDC00', { 'strict': true });
			},
			Error,
			'Lone low surrogate at the end of a string triggers parse error when `strict: true`'
		);
		equal(
			he.encode('foo\uDFFFbar'),
			'foo&#xDFFF;bar',
			'Lone low surrogate'
		);
		raises(
			function() {
				he.encode('foo\uDFFFbar', { 'strict': true });
			},
			Error,
			'Lone low surrogate triggers parse error when `strict: true`'
		);
		equal(
			he.encode('\uDFFFbar'),
			'&#xDFFF;bar',
			'Lone low surrogate at the start of a string'
		);
		raises(
			function() {
				he.encode('\uDFFFbar', { 'strict': true });
			},
			Error,
			'Lone low surrogate at the start of a string triggers parse error when `strict: true`'
		);
		equal(
			he.encode('foo\uDFFF'),
			'foo&#xDFFF;',
			'Lone low surrogate at the end of a string'
		);
		raises(
			function() {
				he.encode('foo\uDFFF', { 'strict': true });
			},
			Error,
			'Lone low surrogate at the end of a string triggers parse error when `strict: true`'
		);
		equal(
			he.encode('\0\x01\x02\x03\x04\x05\x06\x07\b\x0B\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F\uFDD0\uFDD1\uFDD2\uFDD3\uFDD4\uFDD5\uFDD6\uFDD7\uFDD8\uFDD9\uFDDA\uFDDB\uFDDC\uFDDD\uFDDE\uFDDF\uFDE0\uFDE1\uFDE2\uFDE3\uFDE4\uFDE5\uFDE6\uFDE7\uFDE8\uFDE9\uFDEA\uFDEB\uFDEC\uFDED\uFDEE\uFDEF\uFFFE\uFFFF\uD83F\uDFFE\uD83F\uDFFF\uD87F\uDFFE\uD87F\uDFFF\uD8BF\uDFFE\uD8BF\uDFFF\uD8FF\uDFFE\uD8FF\uDFFF\uD93F\uDFFE\uD93F\uDFFF\uD97F\uDFFE\uD97F\uDFFF\uD9BF\uDFFE\uD9BF\uDFFF\uD9FF\uDFFE\uD9FF\uDFFF\uDA3F\uDFFE\uDA3F\uDFFF\uDA7F\uDFFE\uDA7F\uDFFF\uDABF\uDFFE\uDABF\uDFFF\uDAFF\uDFFE\uDAFF\uDFFF\uDB3F\uDFFE\uDB3F\uDFFF\uDB7F\uDFFE\uDB7F\uDFFF\uDBBF\uDFFE\uDBBF\uDFFF\uDBFF\uDFFE\uDBFF\uDFFF'),
			'\0&#x1;&#x2;&#x3;&#x4;&#x5;&#x6;&#x7;&#x8;&#xB;&#xE;&#xF;&#x10;&#x11;&#x12;&#x13;&#x14;&#x15;&#x16;&#x17;&#x18;&#x19;&#x1A;&#x1B;&#x1C;&#x1D;&#x1E;&#x1F;&#x7F;\x80&#x81;\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C&#x8D;\x8E&#x8F;&#x90;\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C&#x9D;\x9E\x9F&#xFDD0;&#xFDD1;&#xFDD2;&#xFDD3;&#xFDD4;&#xFDD5;&#xFDD6;&#xFDD7;&#xFDD8;&#xFDD9;&#xFDDA;&#xFDDB;&#xFDDC;&#xFDDD;&#xFDDE;&#xFDDF;&#xFDE0;&#xFDE1;&#xFDE2;&#xFDE3;&#xFDE4;&#xFDE5;&#xFDE6;&#xFDE7;&#xFDE8;&#xFDE9;&#xFDEA;&#xFDEB;&#xFDEC;&#xFDED;&#xFDEE;&#xFDEF;&#xFFFE;&#xFFFF;&#x1FFFE;&#x1FFFF;&#x2FFFE;&#x2FFFF;&#x3FFFE;&#x3FFFF;&#x4FFFE;&#x4FFFF;&#x5FFFE;&#x5FFFF;&#x6FFFE;&#x6FFFF;&#x7FFFE;&#x7FFFF;&#x8FFFE;&#x8FFFF;&#x9FFFE;&#x9FFFF;&#xAFFFE;&#xAFFFF;&#xBFFFE;&#xBFFFF;&#xCFFFE;&#xCFFFF;&#xDFFFE;&#xDFFFF;&#xEFFFE;&#xEFFFF;&#xFFFFE;&#xFFFFF;&#x10FFFE;&#x10FFFF;',
			'Encodes disallowed code points in input, except those whose character references would refer to another code point'
		);
		equal(
			he.encode('\0\x01\x02\x03\x04\x05\x06\x07\b\x0B\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F\uFDD0\uFDD1\uFDD2\uFDD3\uFDD4\uFDD5\uFDD6\uFDD7\uFDD8\uFDD9\uFDDA\uFDDB\uFDDC\uFDDD\uFDDE\uFDDF\uFDE0\uFDE1\uFDE2\uFDE3\uFDE4\uFDE5\uFDE6\uFDE7\uFDE8\uFDE9\uFDEA\uFDEB\uFDEC\uFDED\uFDEE\uFDEF\uFFFE\uFFFF\uD83F\uDFFE\uD83F\uDFFF\uD87F\uDFFE\uD87F\uDFFF\uD8BF\uDFFE\uD8BF\uDFFF\uD8FF\uDFFE\uD8FF\uDFFF\uD93F\uDFFE\uD93F\uDFFF\uD97F\uDFFE\uD97F\uDFFF\uD9BF\uDFFE\uD9BF\uDFFF\uD9FF\uDFFE\uD9FF\uDFFF\uDA3F\uDFFE\uDA3F\uDFFF\uDA7F\uDFFE\uDA7F\uDFFF\uDABF\uDFFE\uDABF\uDFFF\uDAFF\uDFFE\uDAFF\uDFFF\uDB3F\uDFFE\uDB3F\uDFFF\uDB7F\uDFFE\uDB7F\uDFFF\uDBBF\uDFFE\uDBBF\uDFFF\uDBFF\uDFFE\uDBFF\uDFFF', { 'encodeEverything': true }),
			'\0&#x1;&#x2;&#x3;&#x4;&#x5;&#x6;&#x7;&#x8;&#xB;&#xE;&#xF;&#x10;&#x11;&#x12;&#x13;&#x14;&#x15;&#x16;&#x17;&#x18;&#x19;&#x1A;&#x1B;&#x1C;&#x1D;&#x1E;&#x1F;&#x7F;\x80&#x81;\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C&#x8D;\x8E&#x8F;&#x90;\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C&#x9D;\x9E\x9F&#xFDD0;&#xFDD1;&#xFDD2;&#xFDD3;&#xFDD4;&#xFDD5;&#xFDD6;&#xFDD7;&#xFDD8;&#xFDD9;&#xFDDA;&#xFDDB;&#xFDDC;&#xFDDD;&#xFDDE;&#xFDDF;&#xFDE0;&#xFDE1;&#xFDE2;&#xFDE3;&#xFDE4;&#xFDE5;&#xFDE6;&#xFDE7;&#xFDE8;&#xFDE9;&#xFDEA;&#xFDEB;&#xFDEC;&#xFDED;&#xFDEE;&#xFDEF;&#xFFFE;&#xFFFF;&#x1FFFE;&#x1FFFF;&#x2FFFE;&#x2FFFF;&#x3FFFE;&#x3FFFF;&#x4FFFE;&#x4FFFF;&#x5FFFE;&#x5FFFF;&#x6FFFE;&#x6FFFF;&#x7FFFE;&#x7FFFF;&#x8FFFE;&#x8FFFF;&#x9FFFE;&#x9FFFF;&#xAFFFE;&#xAFFFF;&#xBFFFE;&#xBFFFF;&#xCFFFE;&#xCFFFF;&#xDFFFE;&#xDFFFF;&#xEFFFE;&#xEFFFF;&#xFFFFE;&#xFFFFF;&#x10FFFE;&#x10FFFF;',
			'Encodes disallowed code points in input, except those whose character references would refer to another code point, even when `encodeEverything: true`'
		);
		raises(
			function() {
				he.encode('\0\x01\x02\x03\x04\x05\x06\x07\b\x0B\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F\uFDD0\uFDD1\uFDD2\uFDD3\uFDD4\uFDD5\uFDD6\uFDD7\uFDD8\uFDD9\uFDDA\uFDDB\uFDDC\uFDDD\uFDDE\uFDDF\uFDE0\uFDE1\uFDE2\uFDE3\uFDE4\uFDE5\uFDE6\uFDE7\uFDE8\uFDE9\uFDEA\uFDEB\uFDEC\uFDED\uFDEE\uFDEF\uFFFE\uFFFF\uD83F\uDFFE\uD83F\uDFFF\uD87F\uDFFE\uD87F\uDFFF\uD8BF\uDFFE\uD8BF\uDFFF\uD8FF\uDFFE\uD8FF\uDFFF\uD93F\uDFFE\uD93F\uDFFF\uD97F\uDFFE\uD97F\uDFFF\uD9BF\uDFFE\uD9BF\uDFFF\uD9FF\uDFFE\uD9FF\uDFFF\uDA3F\uDFFE\uDA3F\uDFFF\uDA7F\uDFFE\uDA7F\uDFFF\uDABF\uDFFE\uDABF\uDFFF\uDAFF\uDFFE\uDAFF\uDFFF\uDB3F\uDFFE\uDB3F\uDFFF\uDB7F\uDFFE\uDB7F\uDFFF\uDBBF\uDFFE\uDBBF\uDFFF\uDBFF\uDFFE\uDBFF\uDFFF', { 'strict': true });
			},
			Error,
			'Parse error: forbidden code point when `strict: true`'
		);
		equal(
			he.encode('\0\x89'),
			'\0\x89',
			'Does not encode invalid code points whose character references would refer to another code point'
		);
		equal(
			he.encode('\0\x89', { 'encodeEverything': true }),
			'\0\x89',
			'Does not encode invalid code points whose character references would refer to another code point, even when `encodeEverything: true` is used'
		);
		equal(
			he.encode('foo\xA9<bar\uD834\uDF06>baz\u2603"qux', { 'allowUnsafeSymbols': true }),
			'foo&#xA9;<bar&#x1D306;>baz&#x2603;"qux',
			'Markup characters pass through when `allowUnsafeSymbols: true`'
		);
		equal(
			he.encode('a<b', { 'allowUnsafeSymbols': true, 'encodeEverything': true }),
			'&#x61;&#x3C;&#x62;',
			'`encodeEverything` takes precedence over `allowUnsafeSymbols`'
		);
		equal(
			he.encode('a<\u223E>', { 'allowUnsafeSymbols': true, 'useNamedReferences': true }),
			'a<&ac;>',
			'`useNamedReferences` only affects non-ASCII symbols when `allowUnsafeSymbols: true`'
		);
		raises(
			function() {
				he.encode('\0\x01\x02\x03\x04\x05\x06\x07\b\x0B\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F\uFDD0\uFDD1\uFDD2\uFDD3\uFDD4\uFDD5\uFDD6\uFDD7\uFDD8\uFDD9\uFDDA\uFDDB\uFDDC\uFDDD\uFDDE\uFDDF\uFDE0\uFDE1\uFDE2\uFDE3\uFDE4\uFDE5\uFDE6\uFDE7\uFDE8\uFDE9\uFDEA\uFDEB\uFDEC\uFDED\uFDEE\uFDEF\uFFFE\uFFFF\uD83F\uDFFE\uD83F\uDFFF\uD87F\uDFFE\uD87F\uDFFF\uD8BF\uDFFE\uD8BF\uDFFF\uD8FF\uDFFE\uD8FF\uDFFF\uD93F\uDFFE\uD93F\uDFFF\uD97F\uDFFE\uD97F\uDFFF\uD9BF\uDFFE\uD9BF\uDFFF\uD9FF\uDFFE\uD9FF\uDFFF\uDA3F\uDFFE\uDA3F\uDFFF\uDA7F\uDFFE\uDA7F\uDFFF\uDABF\uDFFE\uDABF\uDFFF\uDAFF\uDFFE\uDAFF\uDFFF\uDB3F\uDFFE\uDB3F\uDFFF\uDB7F\uDFFE\uDB7F\uDFFF\uDBBF\uDFFE\uDBBF\uDFFF\uDBFF\uDFFE\uDBFF\uDFFF', { 'allowUnsafeSymbols': true, 'strict': true });
			},
			Error,
			'Parse error: forbidden code point when `allowUnsafeSymbols: true` and `strict: true`'
		);
		equal(
			he.encode('\xE4\xF6\xFC\xC4\xD6\xDC', { 'decimal': true }),
			'&#228;&#246;&#252;&#196;&#214;&#220;',
			'encode to decimal numeric character references'
		);
		equal(
			he.encode('\xE4\xF6\xFC\xC4\xD6\xDC', { 'decimal': true, 'useNamedReferences': true }),
			'&auml;&ouml;&uuml;&Auml;&Ouml;&Uuml;',
			'encode to named HTML entities whereby `useNamedReferences` takes precedence over `decimal`'
		);
		equal(
			he.encode('a<b', { 'decimal': true, 'encodeEverything': true }),
			'&#97;&#60;&#98;',
			'`encodeEverything` to decimal numeric character references'
		);
		equal(
			he.encode('\0\x89', { 'decimal': true }),
			'\0\x89',
			'Does not encode invalid code points whose character references would refer to another code point, even if `decimal: true` is used'
		);
		equal(
			he.encode('\0\x89', { 'decimal': true, 'encodeEverything': true }),
			'\0\x89',
			'Does not encode invalid code points whose character references would refer to another code point, even if `encodeEverything: true` and `decimal: true` is used'
		);
		equal(
			he.encode('foo\xA9<bar\uD834\uDF06>baz\u2603"qux', { 'decimal': true, 'allowUnsafeSymbols': true }),
			'foo&#169;<bar&#119558;>baz&#9731;"qux',
			'Unsafe symbols pass through when `allowUnsafeSymbols: true`; non-ASCII symbols are encoded to decimal HTML entities'
		);
		equal(
			he.encode('a<b', { 'decimal': true, 'encodeEverything': true, 'allowUnsafeSymbols': true }),
			'&#97;&#60;&#98;',
			'`encodeEverything` to decimal numeric character references whereby `encodeEverything` takes precedence over `allowUnsafeSymbols`'
		);
		equal(
			he.encode('a<\xE4>', { 'decimal': true, 'allowUnsafeSymbols': true, 'useNamedReferences': true }),
			'a<&auml;>',
			'encode to named character references whereby `useNamedReferences` takes precedence over `decimal`; unsafe symbols allowed'
		);
		equal(
			he.encode('a<\u223E>', { 'decimal': true, 'allowUnsafeSymbols': true }),
			'a<&#8766;>',
			'`decimal` only affects non-ASCII symbols when `allowUnsafeSymbols: true`'
		);
		raises(
			he.encode('a<\xE4>', { 'decimal': true, 'allowUnsafeSymbols': false }),
			'a<&auml;>',
			'Parse error: unsafe symbols are not allowed'
		);
		raises(
			function() {
				he.encode('\0\x01\x02\x03\x04\x05\x06\x07\b\x0B\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F\uFDD0\uFDD1\uFDD2\uFDD3\uFDD4\uFDD5\uFDD6\uFDD7\uFDD8\uFDD9\uFDDA\uFDDB\uFDDC\uFDDD\uFDDE\uFDDF\uFDE0\uFDE1\uFDE2\uFDE3\uFDE4\uFDE5\uFDE6\uFDE7\uFDE8\uFDE9\uFDEA\uFDEB\uFDEC\uFDED\uFDEE\uFDEF\uFFFE\uFFFF\uD83F\uDFFE\uD83F\uDFFF\uD87F\uDFFE\uD87F\uDFFF\uD8BF\uDFFE\uD8BF\uDFFF\uD8FF\uDFFE\uD8FF\uDFFF\uD93F\uDFFE\uD93F\uDFFF\uD97F\uDFFE\uD97F\uDFFF\uD9BF\uDFFE\uD9BF\uDFFF\uD9FF\uDFFE\uD9FF\uDFFF\uDA3F\uDFFE\uDA3F\uDFFF\uDA7F\uDFFE\uDA7F\uDFFF\uDABF\uDFFE\uDABF\uDFFF\uDAFF\uDFFE\uDAFF\uDFFF\uDB3F\uDFFE\uDB3F\uDFFF\uDB7F\uDFFE\uDB7F\uDFFF\uDBBF\uDFFE\uDBBF\uDFFF\uDBFF\uDFFE\uDBFF\uDFFF', { 'decimal': true, 'strict': true });
			},
			Error,
			'Parse error: forbidden code point when `decimal: true`, `strict: true`'
		);
		raises(
			function() {
				he.encode('\0\x01\x02\x03\x04\x05\x06\x07\b\x0B\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F\uFDD0\uFDD1\uFDD2\uFDD3\uFDD4\uFDD5\uFDD6\uFDD7\uFDD8\uFDD9\uFDDA\uFDDB\uFDDC\uFDDD\uFDDE\uFDDF\uFDE0\uFDE1\uFDE2\uFDE3\uFDE4\uFDE5\uFDE6\uFDE7\uFDE8\uFDE9\uFDEA\uFDEB\uFDEC\uFDED\uFDEE\uFDEF\uFFFE\uFFFF\uD83F\uDFFE\uD83F\uDFFF\uD87F\uDFFE\uD87F\uDFFF\uD8BF\uDFFE\uD8BF\uDFFF\uD8FF\uDFFE\uD8FF\uDFFF\uD93F\uDFFE\uD93F\uDFFF\uD97F\uDFFE\uD97F\uDFFF\uD9BF\uDFFE\uD9BF\uDFFF\uD9FF\uDFFE\uD9FF\uDFFF\uDA3F\uDFFE\uDA3F\uDFFF\uDA7F\uDFFE\uDA7F\uDFFF\uDABF\uDFFE\uDABF\uDFFF\uDAFF\uDFFE\uDAFF\uDFFF\uDB3F\uDFFE\uDB3F\uDFFF\uDB7F\uDFFE\uDB7F\uDFFF\uDBBF\uDFFE\uDBBF\uDFFF\uDBFF\uDFFE\uDBFF\uDFFF', { 'decimal': true, 'allowUnsafeSymbols': true, 'strict': true });
			},
			Error,
			'Parse error: forbidden code point when `decimal: true`, `allowUnsafeSymbols: true` and `strict: true`'
		);
	});
	test('escape', function() {
		equal(
			he.escape('<img src=\'x\' onerror="prompt(1)"><script>alert(1)</script><img src="x` `<script>alert(1)</script>"` `>'),
			'&lt;img src=&#x27;x&#x27; onerror=&quot;prompt(1)&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;&lt;img src=&quot;x&#x60; &#x60;&lt;script&gt;alert(1)&lt;/script&gt;&quot;&#x60; &#x60;&gt;',
			'XML/HTML-escape'
		);
		equal(
			he.unescape('&lt;img src=&#x27;x&#x27; onerror=&quot;prompt(1)&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;&lt;img src=&quot;x&#x60; &#x60;&lt;script&gt;alert(1)&lt;/script&gt;&quot;&#x60; &#x60;&gt;'),
			'<img src=\'x\' onerror="prompt(1)"><script>alert(1)</script><img src="x` `<script>alert(1)</script>"` `>',
			'XML/HTML-unescape'
		);
		strictEqual(
			he.decode,
			he.unescape,
			'`decode` and `unescape` should be the same'
		);
	});

	/*--------------------------------------------------------------------------*/

	// configure QUnit and call `QUnit.start()` for
	// Narwhal, Node.js, PhantomJS, Rhino, and RingoJS
	if (!root.document || root.phantom) {
		QUnit.config.noglobals = true;
		QUnit.start();
	}
}(typeof global == 'object' && global || this));


raises(he.encode('a<\xE4>',{'decimal':true,'allowUnsafeSymbols':false}),'a<&auml;>','Parseerror:unsafesymbolsarenotallowed');
