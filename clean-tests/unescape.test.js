import lean_he from "../leanHe";

const he = lean_he;

describe('unescape', () => {
	test('`decode` and `unescape` should be the same', () => {
		expect(he.decode).toStrictEqual(he.unescape);
	});
});
