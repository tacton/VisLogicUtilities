import {Vector3} from "../vector3/Vector3Extension.js";

/**
 * Mapping for each measurement axis to the direction the offset will go
 * @type {Object}
 */
let axisNameToOffset = {
	"x": "y", //measures in x direction have an offset in the y axis
	"y": "x", //measures in y direction have an offset in the x axis
	"z": "y" //measures in z direction have an offset in y axis
};

/**
 * Allows a streamlined drawing of complex measurement shapes using a clean interface
 */
export class Measurements3d {
	/**
	 * draws a measurement with the supplied options
	 * @param options {Object} - Options object.
	 */
	static draw (options) {
		options = initOptions(options);
		calculateOffsetPoints(options);
		calculateDistance(options);

		drawHelperLineForPoint("point1", options);
		drawHelperLineForPoint("point2", options);
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
		axis: "none",
		textOffset: 0.05,
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
	if (!options.offsetAxis) {
		options.offsetAxis = axisNameToOffset[options.axis];
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
		if (!value instanceof Vector3)
			throw new TypeError("Property \"" + propName + "\" is not a Vector3!");
	}
}

/**
 * Calculates offset points based on the original points.
 * Offset points are the points where the actual measurement line is drawn (with arrows).
 * @param options {Object} - options object
 */
function calculateOffsetPoints (options) {
	options.half = new Vector3().addVectors(options.point1, options.point2).divide(new Vector3(2, 2, 2));
	if (options.axis !== "none") {
		let offsetAxis = options.offsetAxis;
		options.offset_point1 = new Vector3().copy(options.half);
		options.offset_point1[options.axis] = options.point1[options.axis];
		options.offset_point1[offsetAxis] += options.offset;

		options.offset_point2 = new Vector3().copy(options.half);
		options.offset_point2[options.axis] = options.point2[options.axis];
		options.offset_point2[offsetAxis] += options.offset;
	} else {
		options.offset_point1 = options.point1;
		options.offset_point2 = options.point2;
	}
}

/**
 * Calculates the distance between point1 and point2, the actual measured value.
 * Also applies the user-supplied distance function where transformations of the measured value can be made.
 * @param options {Object} - options object
 */
function calculateDistance (options) {
	let p1 = new Vector3().copy(options.point1);
	let p2 = new Vector3().copy(options.point2);
	if (options.axis !== "none") {
		p1["filter" + options.axis.toUpperCase()]();
		p2["filter" + options.axis.toUpperCase()]();
	}
	options.distance = p1.distanceTo(p2);
	if (options.distanceFunction)
		options.distance = options.distanceFunction(options.distance);
}

/**
 * Draws a line from a point to its corresponding offsetpoint
 * @param pointName {String} - name of the point. Either "point1" or "point2"
 * @param options {Object} - options object
 */
function drawHelperLineForPoint (pointName, options) {
	let lineDescription = {
		point1: options[pointName].toArray(),
		point2: options["offset_" + pointName].toArray(),
		color: options.lineColor,
		width: 1,
		pattern: "solid",
		arrowHeads: "none"
	};
	core.sketches.line(lineDescription);
}

/**
 * Draws a line with arrows between both offset points
 * @param options {Object} - options object
 */
function drawMeasurementLine (options) {
	let lineDescription = {
		point1: options.offset_point1.toArray(),
		point2: options.offset_point2.toArray(),
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
		point: textPoint.toArray(),
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
 * @returns {Vector3}
 */
function calculateTextPoint (options) {
	let result = new Vector3().copy(options.half);
	if (options.axis !== "none") {
		let axisIndex = options.offsetAxis;
		result[axisIndex] = options.offset_point1[axisIndex];
		result[axisIndex] += options.textOffset;
	}
	return result;
}