const encode = require('./encode');
const decode = require('./decode');
const escape = require('./escape');

const leanHe = {
	'version': '2.0.0',
	'encode': encode,
	'decode': decode,
	'escape': escape,
	'unescape': decode
};

module.exports = leanHe;
