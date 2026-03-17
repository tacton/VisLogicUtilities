
/**
 * Library to draw as sketches in the VizStudio. Labels are arrows that point to a location, with text at the other end of the arrow line.
 */
export class Labels {
	static draw(options){
		options = initOptionsDraw(options);
		drawInternal(options, "relative");
	}

	static drawAbsolute(options) {
		options = initOptionsDrawAbsolute(options);
		drawInternal(options, "absolute");
	}
}

/**
 * Ensures all the options that are optional but not supplied are initialized to their default values, for the draw function
 * @param options {Object} - Options object
 * @returns {Object} - Initialized options object
 */
function initOptions(options, defaultOptions) {
	if (!options)
		options = {};
	checkMinimumOptions(options);
	for (let property in defaultOptions) {
		if (!defaultOptions.hasOwnProperty(property)) {
			continue;
		}
		if (!options.hasOwnProperty(property)) {
			options[property] = defaultOptions[property];
		}
	}

	return options;
}

/**
 * Ensures all the options that are optional but not supplied are initialized to their default values, for the draw function
 * @param options {Object} - Options object
 * @returns {Object} - Initialized options object
 */
function initOptionsDraw(options) {
	let defaultOptions = {
		position: undefined,
		offset: [0, 0],
		textSize: 12,
		text: "",
		drawCircle: false,
		circleRadiusFactor: 1
	};
	return initOptions(options, defaultOptions);
}

function initOptionsDrawAbsolute(options) {
	let defaultOptions = {
		position: undefined,
		text: "",
		drawCircle: false,
		circleRadiusFactor: 1,
		textSize: 12,
		textPosition: undefined
	};
	return initOptions(options, defaultOptions);
}

/**
 * checks if the minimum required properties - in the right format - have been supplied by the user. Throws an error if they weren't.
 * @param options {Object} - Options object
 */
function checkMinimumOptions (options) {
	let requiredPropertiesAsArray = ["text"];
	for (let propName of requiredPropertiesAsArray) {
		let value = options[propName];
		if (!value) {
			throw new TypeError("Required property \"" + propName + "\" is not defined!");
		}
	}
}

function drawInternal(options, mode) {
	let position2d = options.position && options.position.length === 3 ? core.sketches.projectPoint(options.position) : options.position;
	if(!position2d){
		return;
	}
	let textPoint = mode === "relative"
		? [position2d[0] + options.offset[0], position2d[1] + options.offset[1]]
		: options.textPosition;

	let textSketch = core.sketches.text({
		point: textPoint,
		text: options.text,
		size: options.textSize,
		anchorV: "center"
	});
	let textArea =  textSketch.getScreenArea();
	if(!textArea){
		return;
	}
	let textWidthPixel = textArea.right - textArea.left;
	let circleRadius = (textWidthPixel / 2) * options.circleRadiusFactor;
	let circleAlpha = options.drawCircle ? 1 : 0;

	let lineVector = [textPoint[0] - position2d[0], textPoint[1] - position2d[1]];
	let len = length(lineVector) - circleRadius;
	let norm = normalize(lineVector);
	let lineEndPoint = [position2d[0] + norm[0] * len, position2d[1] + norm[1] * len];

	function length (vec) {
		return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
	}
	function normalize (vec) {
		let len = length(vec);
		if(len === 0){ //prevent division by zero
			return vec;
		}
		return [vec[0] / len, vec[1] / len];
	}

	core.sketches.arc({
		center: textPoint,
		radius: circleRadius,
		end: 360,
		color: [0, 0, 0, circleAlpha]
	});

	core.sketches.line({
		point1: position2d,
		point2: lineEndPoint,
		arrowHeads: "start",
	});
}