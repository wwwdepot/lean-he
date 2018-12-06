import lean_he from "../leanHe";
import {encodeData} from "./data/encode-data";

const he = lean_he;

function forEach(array, fn) {
	let index = -1;
	const length = array.length;
	while (++index < length) {
		fn(array[index]);
	}
}

describe('encode', function () {

	test('`he.encode.options.useNamedReferences` is exposed and `false` by default', () => {
		expect(he.encode.options.useNamedReferences).toStrictEqual(false);
	});

	test(`test encoding of items of size ${encodeData.length}`, () => {
		forEach(encodeData, function (item) {
			expect(he.encode(item.decoded, {useNamedReferences: true})).toEqual(item.encoded);
		});
	});

	test('`he.encode.options.useNamedReferences` is exposed and `false` by default', () => {
		expect(he.encode.options.useNamedReferences).toStrictEqual(false);
	});

	test('`he.encode.options`isexposed', () => {
		expect(typeof he.encode.options).toEqual('object');
	});


	test('Othernon-ASCIIsymbolsarerepresentedthroughhexadecimalescapes', () => {
		expect(he.encode('foo\xA9bar\uD834\uDF06baz\u2603qux')).toEqual('foo&#xA9;bar&#x1D306;baz&#x2603;qux');
	});

	test('Othernon-ASCIIsymbolsarerepresentedthroughhexadecimalescapes', () => {
		expect(he.encode('foo\xA9bar\uD834\uDF06baz\u2603qux', {'useNamedReferences': true})).toEqual('foo&copy;bar&#x1D306;baz&#x2603;qux');
	});

	test('Othernon-ASCIIsymbolsarerepresentedthroughdecimalescapes', () => {
		expect(he.encode('foo\xA9bar\uD834\uDF06baz\u2603qux', {
			'useNamedReferences': true,
			'decimal': true
		})).toEqual('foo&copy;bar&#119558;baz&#9731;qux');
	});

	test('Encode`escape`’scharacterswithoutusingnamedreferences', () => {
		expect(he.encode('\'"<>&', {'useNamedReferences': false})).toEqual('&#x27;&#x22;&#x3C;&#x3E;&#x26;');
	});

	test('Encode`escape`’scharacterswithoutusingnamedreferences', () => {
		expect(he.encode('\'"<>&', {
			'useNamedReferences': false,
			'decimal': true
		})).toEqual('&#39;&#34;&#60;&#62;&#38;');
	});

	test('Encodetabas`&#x9;`when`encodeEverything:true`', () => {
		expect(he.encode('a\tb', {'encodeEverything': true})).toEqual('&#x61;&#x9;&#x62;');
	});

	test('Encodetabas`&#9;`when`encodeEverything:true`and`decimal:true`', () => {
		expect(he.encode('a\tb', {'encodeEverything': true, 'decimal': true})).toEqual('&#97;&#9;&#98;');
	});

	test('Encodetabas`&Tab;`when`encodeEverything:true,useNamedReferences:true`', () => {
		expect(he.encode('a\tb', {'encodeEverything': true, 'useNamedReferences': true})).toEqual('&#x61;&Tab;&#x62;');
	});

	test('EncodeU+1D306as`&#x1D306;`when`encodeEverything:true,useNamedReferences:false`', () => {
		expect(he.encode('a\uD834\uDF06b', {
			'encodeEverything': true,
			'useNamedReferences': false
		})).toEqual('&#x61;&#x1D306;&#x62;');
	});

	test('EncodeU+1D306as`&#x1D306;`when`encodeEverything:true,useNamedReferences:true`', () => {
		expect(he.encode('a\uD834\uDF06b', {
			'encodeEverything': true,
			'useNamedReferences': true
		})).toEqual('&#x61;&#x1D306;&#x62;');
	});

	test('Allkindsofsymbolswhen`encodeEverything:true,useNamedReferences:false`', () => {
		expect(he.encode('a&b123;+\xA9>\u20D2<\u20D2\nfja', {
			'encodeEverything': true,
			'useNamedReferences': false
		})).toEqual('&#x61;&#x26;&#x62;&#x31;&#x32;&#x33;&#x3B;&#x2B;&#xA9;&#x3E;&#x20D2;&#x3C;&#x20D2;&#xA;&#x66;&#x6A;&#x61;');
	});

	test('Allkindsofsymbolswhen`encodeEverything:true,useNamedReferences:true`', () => {
		expect(he.encode('a&b123;+\xA9>\u20D2<\u20D2\nfja', {
			'encodeEverything': true,
			'useNamedReferences': true
		})).toEqual('&#x61;&amp;&#x62;&#x31;&#x32;&#x33;&semi;&plus;&copy;&nvgt;&nvlt;&NewLine;&fjlig;&#x61;');
	});

	test('Lonehighsurrogate', () => {
		expect(he.encode('foo\uD800bar')).toEqual('foo&#xD800;bar');
	});

	test('Lonehighsurrogateatthestartofastring', () => {
		expect(he.encode('\uD800bar')).toEqual('&#xD800;bar');
	});

	test('Lonehighsurrogateattheendofastring', () => {
		expect(he.encode('foo\uD800')).toEqual('foo&#xD800;');
	});

	test('Lonehighsurrogate', () => {
		expect(he.encode('foo\uDBFFbar')).toEqual('foo&#xDBFF;bar');
	});

	test('Lonehighsurrogateatthestartofastring', () => {
		expect(he.encode('\uDBFFbar')).toEqual('&#xDBFF;bar');
	});

	test('Lonehighsurrogateattheendofastring', () => {
		expect(he.encode('foo\uDBFF')).toEqual('foo&#xDBFF;');
	});

	test('Lonelowsurrogate', () => {
		expect(he.encode('foo\uDC00bar')).toEqual('foo&#xDC00;bar');
	});

	test('Lonelowsurrogateatthestartofastring', () => {
		expect(he.encode('\uDC00bar')).toEqual('&#xDC00;bar');
	});

	test('Lonelowsurrogateattheendofastring', () => {
		expect(he.encode('foo\uDC00')).toEqual('foo&#xDC00;');
	});

	test('Lonelowsurrogate', () => {
		expect(he.encode('foo\uDFFFbar')).toEqual('foo&#xDFFF;bar');
	});

	test('Lonelowsurrogateatthestartofastring', () => {
		expect(he.encode('\uDFFFbar')).toEqual('&#xDFFF;bar');
	});

	test('Lonelowsurrogateattheendofastring', () => {
		expect(he.encode('foo\uDFFF')).toEqual('foo&#xDFFF;');
	});

	test('Encodesdisallowedcodepointsininput,exceptthosewhosecharacterreferenceswouldrefertoanothercodepoint', () => {
		expect(he.encode('\0\x01\x02\x03\x04\x05\x06\x07\b\x0B\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F\uFDD0\uFDD1\uFDD2\uFDD3\uFDD4\uFDD5\uFDD6\uFDD7\uFDD8\uFDD9\uFDDA\uFDDB\uFDDC\uFDDD\uFDDE\uFDDF\uFDE0\uFDE1\uFDE2\uFDE3\uFDE4\uFDE5\uFDE6\uFDE7\uFDE8\uFDE9\uFDEA\uFDEB\uFDEC\uFDED\uFDEE\uFDEF\uFFFE\uFFFF\uD83F\uDFFE\uD83F\uDFFF\uD87F\uDFFE\uD87F\uDFFF\uD8BF\uDFFE\uD8BF\uDFFF\uD8FF\uDFFE\uD8FF\uDFFF\uD93F\uDFFE\uD93F\uDFFF\uD97F\uDFFE\uD97F\uDFFF\uD9BF\uDFFE\uD9BF\uDFFF\uD9FF\uDFFE\uD9FF\uDFFF\uDA3F\uDFFE\uDA3F\uDFFF\uDA7F\uDFFE\uDA7F\uDFFF\uDABF\uDFFE\uDABF\uDFFF\uDAFF\uDFFE\uDAFF\uDFFF\uDB3F\uDFFE\uDB3F\uDFFF\uDB7F\uDFFE\uDB7F\uDFFF\uDBBF\uDFFE\uDBBF\uDFFF\uDBFF\uDFFE\uDBFF\uDFFF')).toEqual('\0&#x1;&#x2;&#x3;&#x4;&#x5;&#x6;&#x7;&#x8;&#xB;&#xE;&#xF;&#x10;&#x11;&#x12;&#x13;&#x14;&#x15;&#x16;&#x17;&#x18;&#x19;&#x1A;&#x1B;&#x1C;&#x1D;&#x1E;&#x1F;&#x7F;\x80&#x81;\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C&#x8D;\x8E&#x8F;&#x90;\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C&#x9D;\x9E\x9F&#xFDD0;&#xFDD1;&#xFDD2;&#xFDD3;&#xFDD4;&#xFDD5;&#xFDD6;&#xFDD7;&#xFDD8;&#xFDD9;&#xFDDA;&#xFDDB;&#xFDDC;&#xFDDD;&#xFDDE;&#xFDDF;&#xFDE0;&#xFDE1;&#xFDE2;&#xFDE3;&#xFDE4;&#xFDE5;&#xFDE6;&#xFDE7;&#xFDE8;&#xFDE9;&#xFDEA;&#xFDEB;&#xFDEC;&#xFDED;&#xFDEE;&#xFDEF;&#xFFFE;&#xFFFF;&#x1FFFE;&#x1FFFF;&#x2FFFE;&#x2FFFF;&#x3FFFE;&#x3FFFF;&#x4FFFE;&#x4FFFF;&#x5FFFE;&#x5FFFF;&#x6FFFE;&#x6FFFF;&#x7FFFE;&#x7FFFF;&#x8FFFE;&#x8FFFF;&#x9FFFE;&#x9FFFF;&#xAFFFE;&#xAFFFF;&#xBFFFE;&#xBFFFF;&#xCFFFE;&#xCFFFF;&#xDFFFE;&#xDFFFF;&#xEFFFE;&#xEFFFF;&#xFFFFE;&#xFFFFF;&#x10FFFE;&#x10FFFF;');
	});

	test('Encodesdisallowedcodepointsininput,exceptthosewhosecharacterreferenceswouldrefertoanothercodepoint,evenwhen`encodeEverything:true`', () => {
		expect(he.encode('\0\x01\x02\x03\x04\x05\x06\x07\b\x0B\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F\uFDD0\uFDD1\uFDD2\uFDD3\uFDD4\uFDD5\uFDD6\uFDD7\uFDD8\uFDD9\uFDDA\uFDDB\uFDDC\uFDDD\uFDDE\uFDDF\uFDE0\uFDE1\uFDE2\uFDE3\uFDE4\uFDE5\uFDE6\uFDE7\uFDE8\uFDE9\uFDEA\uFDEB\uFDEC\uFDED\uFDEE\uFDEF\uFFFE\uFFFF\uD83F\uDFFE\uD83F\uDFFF\uD87F\uDFFE\uD87F\uDFFF\uD8BF\uDFFE\uD8BF\uDFFF\uD8FF\uDFFE\uD8FF\uDFFF\uD93F\uDFFE\uD93F\uDFFF\uD97F\uDFFE\uD97F\uDFFF\uD9BF\uDFFE\uD9BF\uDFFF\uD9FF\uDFFE\uD9FF\uDFFF\uDA3F\uDFFE\uDA3F\uDFFF\uDA7F\uDFFE\uDA7F\uDFFF\uDABF\uDFFE\uDABF\uDFFF\uDAFF\uDFFE\uDAFF\uDFFF\uDB3F\uDFFE\uDB3F\uDFFF\uDB7F\uDFFE\uDB7F\uDFFF\uDBBF\uDFFE\uDBBF\uDFFF\uDBFF\uDFFE\uDBFF\uDFFF', {'encodeEverything': true})).toEqual('\0&#x1;&#x2;&#x3;&#x4;&#x5;&#x6;&#x7;&#x8;&#xB;&#xE;&#xF;&#x10;&#x11;&#x12;&#x13;&#x14;&#x15;&#x16;&#x17;&#x18;&#x19;&#x1A;&#x1B;&#x1C;&#x1D;&#x1E;&#x1F;&#x7F;\x80&#x81;\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C&#x8D;\x8E&#x8F;&#x90;\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C&#x9D;\x9E\x9F&#xFDD0;&#xFDD1;&#xFDD2;&#xFDD3;&#xFDD4;&#xFDD5;&#xFDD6;&#xFDD7;&#xFDD8;&#xFDD9;&#xFDDA;&#xFDDB;&#xFDDC;&#xFDDD;&#xFDDE;&#xFDDF;&#xFDE0;&#xFDE1;&#xFDE2;&#xFDE3;&#xFDE4;&#xFDE5;&#xFDE6;&#xFDE7;&#xFDE8;&#xFDE9;&#xFDEA;&#xFDEB;&#xFDEC;&#xFDED;&#xFDEE;&#xFDEF;&#xFFFE;&#xFFFF;&#x1FFFE;&#x1FFFF;&#x2FFFE;&#x2FFFF;&#x3FFFE;&#x3FFFF;&#x4FFFE;&#x4FFFF;&#x5FFFE;&#x5FFFF;&#x6FFFE;&#x6FFFF;&#x7FFFE;&#x7FFFF;&#x8FFFE;&#x8FFFF;&#x9FFFE;&#x9FFFF;&#xAFFFE;&#xAFFFF;&#xBFFFE;&#xBFFFF;&#xCFFFE;&#xCFFFF;&#xDFFFE;&#xDFFFF;&#xEFFFE;&#xEFFFF;&#xFFFFE;&#xFFFFF;&#x10FFFE;&#x10FFFF;');
	});

	test('Doesnotencodeinvalidcodepointswhosecharacterreferenceswouldrefertoanothercodepoint', () => {
		expect(he.encode('\0\x89')).toEqual('\0\x89');
	});

	test('Doesnotencodeinvalidcodepointswhosecharacterreferenceswouldrefertoanothercodepoint,evenwhen`encodeEverything:true`isused', () => {
		expect(he.encode('\0\x89', {'encodeEverything': true})).toEqual('\0\x89');
	});

	test('Markupcharacterspassthroughwhen`allowUnsafeSymbols:true`', () => {
		expect(he.encode('foo\xA9<bar\uD834\uDF06>baz\u2603"qux', {'allowUnsafeSymbols': true})).toEqual('foo&#xA9;<bar&#x1D306;>baz&#x2603;"qux');
	});

	test('`encodeEverything`takesprecedenceover`allowUnsafeSymbols`', () => {
		expect(he.encode('a<b', {'allowUnsafeSymbols': true, 'encodeEverything': true})).toEqual('&#x61;&#x3C;&#x62;');
	});

	test('`useNamedReferences`onlyaffectsnon-ASCIIsymbolswhen`allowUnsafeSymbols:true`', () => {
		expect(he.encode('a<\u223E>', {'allowUnsafeSymbols': true, 'useNamedReferences': true})).toEqual('a<&ac;>');
	});

	test('encodetodecimalnumericcharacterreferences', () => {
		expect(he.encode('\xE4\xF6\xFC\xC4\xD6\xDC', {'decimal': true})).toEqual('&#228;&#246;&#252;&#196;&#214;&#220;');
	});

	test('encodetonamedHTMLentitieswhereby`useNamedReferences`takesprecedenceover`decimal`', () => {
		expect(he.encode('\xE4\xF6\xFC\xC4\xD6\xDC', {
			'decimal': true,
			'useNamedReferences': true
		})).toEqual('&auml;&ouml;&uuml;&Auml;&Ouml;&Uuml;');
	});

	test('`encodeEverything`todecimalnumericcharacterreferences', () => {
		expect(he.encode('a<b', {'decimal': true, 'encodeEverything': true})).toEqual('&#97;&#60;&#98;');
	});

	test('Doesnotencodeinvalidcodepointswhosecharacterreferenceswouldrefertoanothercodepoint,evenif`decimal:true`isused', () => {
		expect(he.encode('\0\x89', {'decimal': true})).toEqual('\0\x89');
	});

	test('Doesnotencodeinvalidcodepointswhosecharacterreferenceswouldrefertoanothercodepoint,evenif`encodeEverything:true`and`decimal:true`isused', () => {
		expect(he.encode('\0\x89', {'decimal': true, 'encodeEverything': true})).toEqual('\0\x89');
	});

	test('Unsafesymbolspassthroughwhen`allowUnsafeSymbols:true`;non-ASCIIsymbolsareencodedtodecimalHTMLentities', () => {
		expect(he.encode('foo\xA9<bar\uD834\uDF06>baz\u2603"qux', {
			'decimal': true,
			'allowUnsafeSymbols': true
		})).toEqual('foo&#169;<bar&#119558;>baz&#9731;"qux');
	});

	test('`encodeEverything`todecimalnumericcharacterreferenceswhereby`encodeEverything`takesprecedenceover`allowUnsafeSymbols`', () => {
		expect(he.encode('a<b', {
			'decimal': true,
			'encodeEverything': true,
			'allowUnsafeSymbols': true
		})).toEqual('&#97;&#60;&#98;');
	});

	test('encodetonamedcharacterreferenceswhereby`useNamedReferences`takesprecedenceover`decimal`;unsafesymbolsallowed', () => {
		expect(he.encode('a<\xE4>', {
			'decimal': true,
			'allowUnsafeSymbols': true,
			'useNamedReferences': true
		})).toEqual('a<&auml;>');
	});

	test('`decimal`onlyaffectsnon-ASCIIsymbolswhen`allowUnsafeSymbols:true`', () => {
		expect(he.encode('a<\u223E>', {'decimal': true, 'allowUnsafeSymbols': true})).toEqual('a<&#8766;>');
	});

	test('Lonehighsurrogatetriggersparseerrorwhen`strict:true`', () => {
		expect(() => {
			he.encode('foo\uD800bar', {'strict': true});
		}).toThrow();
	});

	test('Lonehighsurrogateatthestartofastringtriggersparseerrorwhen`strict:true`', () => {
		expect(() => {
			he.encode('\uD800bar', {'strict': true});
		}).toThrow();
	});

	test('Lonehighsurrogateattheendofastringtriggersparseerrorwhen`strict:true`', () => {
		expect(() => {
			he.encode('foo\uD800', {'strict': true});
		}).toThrow();
	});

	test('Lonehighsurrogatetriggersparseerrorwhen`strict:true`', () => {
		expect(() => {
			he.encode('foo\uDBFFbar', {'strict': true});
		}).toThrow();
	});

	test('Lonehighsurrogateatthestartofastringtriggersparseerrorwhen`strict:true`', () => {
		expect(() => {
			he.encode('\uDBFFbar', {'strict': true});
		}).toThrow();
	});

	test('Lonehighsurrogateattheendofastringtriggersparseerrorwhen`strict:true`', () => {
		expect(() => {
			he.encode('foo\uDBFF', {'strict': true});
		}).toThrow();
	});

	test('Lonelowsurrogatetriggersparseerrorwhen`strict:true`', () => {
		expect(() => {
			he.encode('foo\uDC00bar', {'strict': true});
		}).toThrow();
	});

	test('Lonelowsurrogateatthestartofastringtriggersparseerrorwhen`strict:true`', () => {
		expect(() => {
			he.encode('\uDC00bar', {'strict': true});
		}).toThrow();
	});

	test('Lonelowsurrogateattheendofastringtriggersparseerrorwhen`strict:true`', () => {
		expect(() => {
			he.encode('foo\uDC00', {'strict': true});
		}).toThrow();
	});

	test('Lonelowsurrogatetriggersparseerrorwhen`strict:true`', () => {
		expect(() => {
			he.encode('foo\uDFFFbar', {'strict': true});
		}).toThrow();
	});

	test('Lonelowsurrogateatthestartofastringtriggersparseerrorwhen`strict:true`', () => {
		expect(() => {
			he.encode('\uDFFFbar', {'strict': true});
		}).toThrow();
	});

	test('Lonelowsurrogateattheendofastringtriggersparseerrorwhen`strict:true`', () => {
		expect(() => {
			he.encode('foo\uDFFF', {'strict': true});
		}).toThrow();
	});

	test('Parseerror:forbiddencodepointwhen`strict:true`', () => {
		expect(() => {
			he.encode('\0\x01\x02\x03\x04\x05\x06\x07\b\x0B\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F\uFDD0\uFDD1\uFDD2\uFDD3\uFDD4\uFDD5\uFDD6\uFDD7\uFDD8\uFDD9\uFDDA\uFDDB\uFDDC\uFDDD\uFDDE\uFDDF\uFDE0\uFDE1\uFDE2\uFDE3\uFDE4\uFDE5\uFDE6\uFDE7\uFDE8\uFDE9\uFDEA\uFDEB\uFDEC\uFDED\uFDEE\uFDEF\uFFFE\uFFFF\uD83F\uDFFE\uD83F\uDFFF\uD87F\uDFFE\uD87F\uDFFF\uD8BF\uDFFE\uD8BF\uDFFF\uD8FF\uDFFE\uD8FF\uDFFF\uD93F\uDFFE\uD93F\uDFFF\uD97F\uDFFE\uD97F\uDFFF\uD9BF\uDFFE\uD9BF\uDFFF\uD9FF\uDFFE\uD9FF\uDFFF\uDA3F\uDFFE\uDA3F\uDFFF\uDA7F\uDFFE\uDA7F\uDFFF\uDABF\uDFFE\uDABF\uDFFF\uDAFF\uDFFE\uDAFF\uDFFF\uDB3F\uDFFE\uDB3F\uDFFF\uDB7F\uDFFE\uDB7F\uDFFF\uDBBF\uDFFE\uDBBF\uDFFF\uDBFF\uDFFE\uDBFF\uDFFF', {'strict': true});
		}).toThrow();
	});

	test('Parseerror:forbiddencodepointwhen`allowUnsafeSymbols:true`and`strict:true`', () => {
		expect(() => {
			he.encode('\0\x01\x02\x03\x04\x05\x06\x07\b\x0B\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F\uFDD0\uFDD1\uFDD2\uFDD3\uFDD4\uFDD5\uFDD6\uFDD7\uFDD8\uFDD9\uFDDA\uFDDB\uFDDC\uFDDD\uFDDE\uFDDF\uFDE0\uFDE1\uFDE2\uFDE3\uFDE4\uFDE5\uFDE6\uFDE7\uFDE8\uFDE9\uFDEA\uFDEB\uFDEC\uFDED\uFDEE\uFDEF\uFFFE\uFFFF\uD83F\uDFFE\uD83F\uDFFF\uD87F\uDFFE\uD87F\uDFFF\uD8BF\uDFFE\uD8BF\uDFFF\uD8FF\uDFFE\uD8FF\uDFFF\uD93F\uDFFE\uD93F\uDFFF\uD97F\uDFFE\uD97F\uDFFF\uD9BF\uDFFE\uD9BF\uDFFF\uD9FF\uDFFE\uD9FF\uDFFF\uDA3F\uDFFE\uDA3F\uDFFF\uDA7F\uDFFE\uDA7F\uDFFF\uDABF\uDFFE\uDABF\uDFFF\uDAFF\uDFFE\uDAFF\uDFFF\uDB3F\uDFFE\uDB3F\uDFFF\uDB7F\uDFFE\uDB7F\uDFFF\uDBBF\uDFFE\uDBBF\uDFFF\uDBFF\uDFFE\uDBFF\uDFFF', {
				'allowUnsafeSymbols': true,
				'strict': true
			});
		}).toThrow();
	});

	test('Parseerror:forbiddencodepointwhen`decimal:true`,`strict:true`', () => {
		expect(() => {
			he.encode('\0\x01\x02\x03\x04\x05\x06\x07\b\x0B\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F\uFDD0\uFDD1\uFDD2\uFDD3\uFDD4\uFDD5\uFDD6\uFDD7\uFDD8\uFDD9\uFDDA\uFDDB\uFDDC\uFDDD\uFDDE\uFDDF\uFDE0\uFDE1\uFDE2\uFDE3\uFDE4\uFDE5\uFDE6\uFDE7\uFDE8\uFDE9\uFDEA\uFDEB\uFDEC\uFDED\uFDEE\uFDEF\uFFFE\uFFFF\uD83F\uDFFE\uD83F\uDFFF\uD87F\uDFFE\uD87F\uDFFF\uD8BF\uDFFE\uD8BF\uDFFF\uD8FF\uDFFE\uD8FF\uDFFF\uD93F\uDFFE\uD93F\uDFFF\uD97F\uDFFE\uD97F\uDFFF\uD9BF\uDFFE\uD9BF\uDFFF\uD9FF\uDFFE\uD9FF\uDFFF\uDA3F\uDFFE\uDA3F\uDFFF\uDA7F\uDFFE\uDA7F\uDFFF\uDABF\uDFFE\uDABF\uDFFF\uDAFF\uDFFE\uDAFF\uDFFF\uDB3F\uDFFE\uDB3F\uDFFF\uDB7F\uDFFE\uDB7F\uDFFF\uDBBF\uDFFE\uDBBF\uDFFF\uDBFF\uDFFE\uDBFF\uDFFF', {
				'decimal': true,
				'strict': true
			});
		}).toThrow();
	});

	test('Parseerror:forbiddencodepointwhen`decimal:true`,`allowUnsafeSymbols:true`and`strict:true`', () => {
		expect(() => {
			he.encode('\0\x01\x02\x03\x04\x05\x06\x07\b\x0B\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F\uFDD0\uFDD1\uFDD2\uFDD3\uFDD4\uFDD5\uFDD6\uFDD7\uFDD8\uFDD9\uFDDA\uFDDB\uFDDC\uFDDD\uFDDE\uFDDF\uFDE0\uFDE1\uFDE2\uFDE3\uFDE4\uFDE5\uFDE6\uFDE7\uFDE8\uFDE9\uFDEA\uFDEB\uFDEC\uFDED\uFDEE\uFDEF\uFFFE\uFFFF\uD83F\uDFFE\uD83F\uDFFF\uD87F\uDFFE\uD87F\uDFFF\uD8BF\uDFFE\uD8BF\uDFFF\uD8FF\uDFFE\uD8FF\uDFFF\uD93F\uDFFE\uD93F\uDFFF\uD97F\uDFFE\uD97F\uDFFF\uD9BF\uDFFE\uD9BF\uDFFF\uD9FF\uDFFE\uD9FF\uDFFF\uDA3F\uDFFE\uDA3F\uDFFF\uDA7F\uDFFE\uDA7F\uDFFF\uDABF\uDFFE\uDABF\uDFFF\uDAFF\uDFFE\uDAFF\uDFFF\uDB3F\uDFFE\uDB3F\uDFFF\uDB7F\uDFFE\uDB7F\uDFFF\uDBBF\uDFFE\uDBBF\uDFFF\uDBFF\uDFFE\uDBFF\uDFFF', {
				'decimal': true,
				'allowUnsafeSymbols': true,
				'strict': true
			});
		}).toThrow();
	});
});

