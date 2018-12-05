"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var merge = function merge(options, defaults) {
	if (!options) {
		return defaults;
	}
	var result = {};
	var key = void 0;
	for (key in defaults) {
		// A `hasOwnProperty` check is not needed here, since only recognized
		// option names are used anyway. Any others are ignored.
		result[key] = options.hasOwnProperty(key) ? options[key] : defaults[key];
	}
	return result;
};
exports.default = merge;