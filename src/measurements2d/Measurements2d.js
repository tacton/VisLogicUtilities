/**
 * Allows a streamlined drawing of complex measurement shapes using a clean interface
 */
export class Measurements2d {
	/**
	 * draws a measurement with the supplied options
	 * @param options {Object} - Options object.
	 */
	static draw (options) {
		options = initOptions(options);
		calculateOffsetPoints(options);
		calculateDistance(options);

		drawHelperLines(options);
		drawMeasurementLine(options);
		drawText(options);
	}
}

/**
 * Ensures all the options that are optional but not supplied are initialized to their default values
 * @param options {Object} - Options object
 * @returns {Object} - Initialized options object
 */
function initOptions (options) {
	if (!options)
		options = {};
	checkMinimumOptions(options);
	let defaultOptions = {
		point1: undefined,
		point2: undefined,
		offset: 0,
		orientation: "horizontal",
		textOffset: [0, 0],
		textSize: 12,
		lineColor: [0, 0, 0, 1],
		textColor: [0, 0, 0, 1],
		text: "%d",
		distanceFunction: undefined,
		textAngle: 0
	};
	for (let property in defaultOptions) {
		if (!defaultOptions.hasOwnProperty(property))
			continue;
		if (!options.hasOwnProperty(property))
			options[property] = defaultOptions[property];
	}

	if(options.point1.length === 3){
		options.projectedPoint1 = core.sketches.projectPoint(options.point1);
	}
	if(options.point2.length === 3){
		options.projectedPoint2 = core.sketches.projectPoint(options.point2);
	}

	return options;
}

/**
 * checks if the minimum required properties - in the right format - have been supplied by the user. Throws an error if they weren't.
 * @param options {Object} - Options object
 */
function checkMinimumOptions (options) {
	let requiredPropertiesAsArray = ["point1", "point2"];
	for (let propName of requiredPropertiesAsArray) {
		let value = options[propName];
		if (!value)
			throw new TypeError("Required property \"" + propName + "\" is not defined!");
		if (!value instanceof Array)
			throw new TypeError("Property \"" + propName + "\" is not an Array!");
	}
}

/**
 * Calculates offset points based on the original points.
 * Offset points are the points where the actual measurement line is drawn (with arrows).
 * @param options {Object} - options object
 */
function calculateOffsetPoints (options) {
	options.half = [(options.projectedPoint1[0] + options.projectedPoint2[0]) / 2, (options.projectedPoint1[1] + options.projectedPoint2[1]) / 2];
	options.offset_point1 = options.half.slice();
	options.offset_point2 = options.half.slice();
	if (options.orientation === "horizontal") {
		options.offset_point1[0] = options.projectedPoint1[0];
		options.offset_point1[1] += options.offset;

		options.offset_point2[0] = options.projectedPoint2[0];
		options.offset_point2[1] += options.offset;
	} else {
		options.offset_point1[0] += options.offset;
		options.offset_point1[1] = options.projectedPoint1[1];

		options.offset_point2[0] += options.offset;
		options.offset_point2[1] = options.projectedPoint2[1];
	}
}

/**
 * Calculates the distance between point1 and point2, the actual measured value.
 * Also applies the user-supplied distance function where transformations of the measured value can be made.
 * @param options {Object} - options object
 */
function calculateDistance (options) {
	let p1 = options.point1.slice();
	let p2 = options.point2.slice();
	let dx = p1[0] - p2[0];
	let dy = p1[1] - p2[1];
	let dz = p1[2] - p2[2];

	options.distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
	if (options.distanceFunction)
		options.distance = options.distanceFunction(options.distance);
}

/**
 * Draws a line from a point to its corresponding offsetpoint
 * @param options {Object} - options object
 */
function drawHelperLines (options) {
	let line1 = {
		point1: options.projectedPoint1,
		point2: options.offset_point1,
		color: options.lineColor,
		width: 1,
		pattern: "solid",
		arrowHeads: "none"
	};
	core.sketches.line(line1);

	let line2 = {
		point1: options.projectedPoint2,
		point2: options.offset_point2,
		color: options.lineColor,
		width: 1,
		pattern: "solid",
		arrowHeads: "none"
	};
	core.sketches.line(line2);
}

/**
 * Draws a line with arrows between both offset points
 * @param options {Object} - options object
 */
function drawMeasurementLine (options) {
	let lineDescription = {
		point1: options.offset_point1,
		point2: options.offset_point2,
		color: options.lineColor,
		width: 1,
		pattern: "solid",
		arrowHeads: "both"
	};
	core.sketches.line(lineDescription);
}

/**
 * Draws the text of the measurement
 * @param options {Object} - options object
 */
function drawText (options) {
	let textPoint = calculateTextPoint(options);
	let text = resolvePlaceholderText(options);
	let textDescription = {
		point: textPoint,
		text: text,
		size: options.textSize,
		color: options.textColor,
		highlightColor: options.highlightColor,
		angle: options.textAngle
	};
	core.sketches.text(textDescription);
}

/**
 * Replaces the placeholder token with the measured distance
 * @param options {Object} - options object
 * @returns {string} - Final text
 */
function resolvePlaceholderText (options) {
	let placeHolderString = "%d";
	let result = options.text;
	result = result.split(placeHolderString).join(options.distance.toString());
	return result;
}

/**
 * Calculates the center point of the text
 * @param options {Object} - options object
 * @returns {Array}
 */
function calculateTextPoint (options) {
	let result = options.offset_point1.slice();
	if(options.orientation === "horizontal"){
		result[0] = options.half[0];
	}
	else {
		result[1] = options.half[1];
	}
	result[0] += options.textOffset[0];
	result[1] += options.textOffset[1];
	return result;
}