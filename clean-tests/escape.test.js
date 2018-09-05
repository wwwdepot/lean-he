import lean_he from "../lean-he";

const he = lean_he;

describe('escape', () => {

	test('XML/HTML-escape 1', () => {
		expect(he.escape('<img src=\'x\' onerror="prompt(1)"><script>alert(1)</script><img src="x` `<script>alert(1)</script>"` `>'))
			.toEqual('&lt;img src=&#x27;x&#x27; onerror=&quot;prompt(1)&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;&lt;img src=&quot;x&#x60; &#x60;&lt;script&gt;alert(1)&lt;/script&gt;&quot;&#x60; &#x60;&gt;');
	});

	test('XML/HTML-unescape 2', () => {
		expect(he.unescape('&lt;img src=&#x27;x&#x27; onerror=&quot;prompt(1)&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;&lt;img src=&quot;x&#x60; &#x60;&lt;script&gt;alert(1)&lt;/script&gt;&quot;&#x60; &#x60;&gt;'))
			.toEqual('<img src=\'x\' onerror="prompt(1)"><script>alert(1)</script><img src="x` `<script>alert(1)</script>"` `>');
	});
});

