import encode from "./methods/encode";
import decode from "./methods/decode";
import escape from "./methods/escape";

const lean_he = {
	'version': '2.0.0',
	'encode': encode,
	'decode': decode,
	'escape': escape,
	'unescape': decode
};

export default lean_he;
