import {mul, sum} from '../src/math';

test('add 1 and 2', () => {
	expect(sum(1, 2)).toBe(3);
	expect(mul(1, 3)).toBe(3);
	expect(() => {
		sum(0, 2)
	}).toThrow();
});
