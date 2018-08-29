import encode from "./methods/encode";
import decode from "./methods/decode";
import escape from "./methods/escape";

const leanHe = {
	'version': '2.0.0',
	'encode': encode,
	'decode': decode,
	'escape': escape,
	'unescape': decode
};

export default leanHe;
