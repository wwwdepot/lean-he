import encode from "./lib/methods/encode";
import decode from "./lib/methods/decode";
import escape from "./lib/methods/escape";

const lean_he = {
	'version': '2.0.0',
	'encode': encode,
	'decode': decode,
	'escape': escape,
	'unescape': decode
};

export default lean_he;
