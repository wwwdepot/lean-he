import lean_he from "../src/lean-he";
import {officialData} from "./data/official-data";

const he = lean_he;

function forOwn(object, fn) {
	for (let key in object) {
		if (object.hasOwnProperty(key)) {
			fn(key, object[key]);
		}
	}
}

describe('decode', () => {
	test(`Decoding`, () => {
		forOwn(officialData, function (key, value) {
			const encoded = `a ${key} b`;
			const decoded = `a ${value.characters} b`;
			expect(he.decode(encoded)).toEqual(decoded);
		})
	});

	test(`decode(encode(decoded))`, () => {
		forOwn(officialData, function (key, value) {
			const decoded = `a ${value.characters} b`;
			expect(he.decode(he.encode(decoded))).toEqual(decoded)
		})
	});

	test('Only decode once 1', () => {
		expect(he.decode('&amp;amp;amp;')).toEqual('&amp;amp;')
	});

	test('Only decode once 2', () => {
		expect(he.decode('&#x26;amp;')).toEqual('&amp;')
	});

	test('Ambiguous ampersand 1', () => {
		expect(he.decode('a&foololthisdoesntexist;b')).toEqual('a&foololthisdoesntexist;b')
	});

	test('Ambiguous ampersand 2', () => {
		expect(he.decode('foo &lolwat; bar')).toEqual('foo &lolwat; bar')
	});

	test('Parse error: ambiguous ampersand in strict mode', () => {
		expect(() => {
			he.decode('foo &lolwat; bar', {
				'strict': true
			});
		}).toThrow();
	});

	test('Legacy named references (without a trailing semicolon)', () => {
		expect(he.decode('&notin; &noti &notin &copy123')).toEqual('\u2209 \xACi \xACin \xA9123')
	});

	test('Hexadecimal escape', () => {
		expect(he.decode('a&#x1D306;b&#X0000000000001d306;c')).toEqual('a\uD834\uDF06b\uD834\uDF06c')
	});

	test('Decimal escape', () => {
		expect(he.decode('a&#119558;b&#169;c&#00000000000000000169;d')).toEqual('a\uD834\uDF06b\xA9c\xA9d')
	});

	test('Special numerical escapes (see issue #4)', () => {
		expect(he.decode('a&#xD834;&#xDF06;b&#55348;&#57094;c a&#x0;b&#0;c')).toEqual('a\uFFFD\uFFFDb\uFFFD\uFFFDc a\uFFFDb\uFFFDc')
	});

	test('Parse error: special numerical escapes (see issue #4) in strict mode', () => {
		expect(() => {
			he.decode('a&#xD834;b', {
				'strict': true
			});
		}).toThrow();
	});

	test('Out-of-range hexadecimal escape in error-tolerant mode', () => {
		expect(he.decode('a&#x9999999999999999;b')).toEqual('a\uFFFDb')
	});

	test('Parse error: out-of-range hexadecimal escape in strict mode', () => {
		expect(() => {
			he.decode('a&#x9999999999999999;b', {
				'strict': true
			});
		}).toThrow();
	});

	test('Out-of-range hexadecimal escape in error-tolerant mode', () => {
		expect(he.decode('a&#x110000;b')).toEqual('a\uFFFDb')
	});

	test('Parse error: out-of-range hexadecimal escape in strict mode', () => {
		expect(() => {
			he.decode('a&#x110000;b', {
				'strict': true
			});
		}).toThrow();
	});

	test('Ambiguous ampersand in text context', () => {
		expect(he.decode('foo&ampbar')).toEqual('foo&bar')
	});

	test('Parse error: ambiguous ampersand in text context in strict mode', () => {
		expect(() => {
			he.decode('foo&ampbar', {
				'strict': true
			});
		}).toThrow();
	});

	test('Hexadecimal escape without trailing semicolon in error-tolerant mode', () => {
		expect(he.decode('foo&#x1D306qux')).toEqual('foo\uD834\uDF06qux')
	});

	test('Hexadecimal escape without trailing semicolon in strict mode', () => {
		expect(() => {
			he.decode('foo&#x1D306qux', {
				'strict': true
			});
		}).toThrow();
	});

	test('Decimal escape without trailing semicolon in error-tolerant mode', () => {
		expect(he.decode('foo&#119558qux')).toEqual('foo\uD834\uDF06qux')
	});

	test('Decimal escape without trailing semicolon in strict mode', () => {
		expect(() => {
			he.decode('foo&#119558qux', {
				'strict': true
			});
		}).toThrow();
	});

	test('Attribute value context', () => {
		expect(he.decode('foo&amp=', {'isAttributeValue': true})).toEqual('foo&amp=');
	});

	test('Parse error: `foo&amp=` in attribute value context in strict mode', () => {
		expect(() => {
			he.decode('foo&amp=', {
				'strict': true,
				'isAttributeValue': true
			});
		}).toThrow();
	});

	test('Parsing error: `foo&amplol` in text context', () => {
		expect(() => {
			he.decode('foo&amplol', {
				'isAttributeValue': false,
				'strict': true
			});
		}).toThrow();
	});

	test('Parse error: `I\'m ¬it; I tell you`', () => {
		expect(() => {
			he.decode('I\'m &notit; I tell you', {
				'strict': true,
				'isAttributeValue': false
			});
		}).toThrow();
	});

	test('Parse error: `I\'m &notit; I tell you` as attribute value', () => {
		expect(() => {
			he.decode('I\'m &notit; I tell you', {
				'strict': true,
				'isAttributeValue': true
			});
		}).toThrow();
	});

	test('Decoding `&#x8D;` in error-tolerant mode', () => {
		expect(he.decode('&#x8D;')).toEqual('\x8D')
	});

	test('Parse error: `&#x8D;` in strict mode', () => {
		expect(() => {
			he.decode('&#x8D;', {
				'strict': true
			});
		}).toThrow();
	});

	test('Decoding `&#xD;` in error-tolerant mode', () => {
		expect(he.decode('&#xD;')).toEqual('\x0D')
	});

	test('Parse error: `&#xD;` in strict mode', () => {
		expect(() => {
			he.decode('&#xD;', {
				'strict': true
			});
		}).toThrow();
	});

	test('Decoding `&#x94;` in error-tolerant mode', () => {
		expect(he.decode('&#x94;')).toEqual('\u201D')
	});

	test('Parse error: `&#x94;` in strict mode', () => {
		expect(() => {
			he.decode('&#x94;', {
				'strict': true
			});
		}).toThrow();
	});

	test('Decoding `&#x1;` in error-tolerant mode', () => {
		expect(he.decode('&#x1;')).toEqual('\x01')
	});

	test('Parse error: decoding `&#x1;` in strict mode', () => {
		expect(() => {
			he.decode('&#x1;', {
				'strict': true
			});
		}).toThrow();
	});


	test('Decoding `&#x10FFFF;` in error-tolerant mode', () => {
		expect(he.decode('&#x10FFFF;')).toEqual('\uDBFF\uDFFF')
	});

	test('Parse error: decoding `&#x10FFFF;` in strict mode', () => {
		expect(() => {
			he.decode('&#x10FFFF;', {
				'strict': true
			});
		}).toThrow();
	});

	test('Parse error: decoding `&#196607;` in strict mode', () => {
		expect(() => {
			he.decode('&#196607;', {
				'strict': true
			});
		}).toThrow();
	});

	test('Parse error: decoding `&#xZ` in strict mode', () => {
		expect(() => {
			he.decode('&#xZ', {
				'strict': true
			});
		}).toThrow();
	});

	test('Parse error: decoding `&#Z` in strict mode', () => {
		expect(() => {
			he.decode('&#Z', {
				'strict': true
			});
		}).toThrow();
	});


	test('Decoding `&#00` numeric character reference (see issue #43)', () => {
		expect(he.decode('&#00')).toEqual('\uFFFD')
	});


	test('Decoding `0`-prefixed numeric character referencs (see issue #43)', () => {
		expect(he.decode('&#0128;')).toEqual('\u20AC')
	});

	test("Attribute value context", () => {
		expect(he.decode("foo&ampbar", {isAttributeValue: true})).toEqual("foo&ampbar");
	});

	test("Attribute value context", () => {
		expect(he.decode("foo&amp;bar", {isAttributeValue: !0})).toEqual("foo&bar");
	});

	test("Attribute value context", () => {
		expect(he.decode("foo&amp;", {isAttributeValue: !0})).toEqual("foo&");
	});

	test("Attribute value context", () => {
		expect(he.decode("foo&amp", {isAttributeValue: !0})).toEqual("foo&");
	});

	test("Attribute value context (not a parsing error!)", () => {
		expect(he.decode("foo&amplol", {isAttributeValue: !0, strict: !0})).toEqual("foo&amplol");
	});

	test("No parse error: `I'm &notit; I tell you` as attribute value in error-tolerant mode", () => {
		expect(he.decode("I'm &notit; I tell you", {
			strict: !1,
			isAttributeValue: !0
		})).toEqual("I'm &notit; I tell you");
	});

	test("No parse error: `I'm &notin; I tell you` as attribute value", () => {
		expect(he.decode("I'm &notin; I tell you", {strict: !0})).toEqual("I'm ∉ I tell you");
	});

	test("Decoding `&#196605;` (valid code point) in strict mode", () => {
		expect(he.decode("&#196605;", {strict: true})).toEqual("\uD87F\uDFFD");
	});

	test("Decoding `&#xZ` in error-tolerant mode", () => {
		expect(he.decode("&#xZ", {strict: !1})).toEqual("&#xZ");
	});

	test("Decoding `&#Z` in error-tolerant mode", () => {
		expect(he.decode("&#Z", {strict: !1})).toEqual("&#Z");
	});
});

