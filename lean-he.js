const encode = require('./encode');
const decode = require('./decode');
const escape = require('./escape');

const lean_he = {
	'version': '2.0.0',
	'encode': encode,
	'decode': decode,
	'escape': escape,
	'unescape': decode
};

module.exports = lean_he;
