import {Vector3} from "./Vector3.js";

/**
 * Sets y and z to 0
 * @returns {Vector3}
 */
Vector3.prototype.filterX = function () {
	this.setY(0);
	this.setZ(0);
	return this;
};

/**
 * Sets x and z to 0
 * @returns {Vector3}
 */
Vector3.prototype.filterY = function () {
	this.setX(0);
	this.setZ(0);
	return this;
};

/**
 * Sets x and y to 0
 * @returns {Vector3}
 */
Vector3.prototype.filterZ = function () {
	this.setX(0);
	this.setY(0);
	return this;
};

/**
 * Adds given value to x
 * @param {number} num
 * @returns {Vector3}
 */
Vector3.prototype.addToX = function (num) {
	this.setX(this.x + num);
	return this;
};

/**
 * Adds given value to y
 * @param {number} num
 * @returns {Vector3}
 */
Vector3.prototype.addToY = function (num) {
	this.setY(this.y + num);
	return this;
};

/**
 * Adds given value to z
 * @param {number} num
 * @returns {Vector3}
 */
Vector3.prototype.addToZ = function (num) {
	this.setZ(this.z + num);
	return this;
};

/**
 * Calculates distance only in x and y to another vector
 * @param {Vector3} v
 * @returns {number}
 */
Vector3.prototype.xyDistanceTo = function (v) {
	let dx = this.x - v.x;
	let dy = this.y - v.y;
	return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calculates distance only in x to another vector
 * @param {Vector3} v
 * @returns {number}
 */
Vector3.prototype.xDistanceTo = function (v) {
	return Math.abs(this.x - v.x);
};

/**
 * Calculates distance only in y to another vector
 * @param {Vector3} v
 * @returns {number}
 */
Vector3.prototype.yDistanceTo = function (v) {
	return Math.abs(this.y - v.y);
};

/**
 * Calculates distance only in z to another vector
 * @param {Vector3} v
 * @returns {number}
 */
Vector3.prototype.zDistanceTo = function (v) {
	return Math.abs(this.z - v.z);
};

/**
 * Check if x,y,z are equal to 0
 * @returns {boolean}
 */
Vector3.prototype.isNull = function () {
	return this.x === 0 && this.y === 0 && this.z === 0;
};

/**
 * Turns a vector into a string representation.
 * @override
 * @returns {string}
 */
Vector3.prototype.toString = function () {
	return this.x + "," + this.y + "," + this.z;
};

/**
 * Constructs a new Vector3 from a string
 * @static
 * @param {string} string - Comma-separated string of numbers.
 * @example
 * // returns new Vector3(1,2,3)
 * Vector3.fromString("1,2,3");
 * @returns {Vector3}
 */
Vector3.fromString = function (string) {
	if (typeof string !== "string")
		throw new Error("Input is not a string");
	let parts = string.split(",");
	if (parts.length !== 3)
		throw new Error("Input is not a string of 3 values separated by comma");
	let x = parseFloat(parts[0]);
	let y = parseFloat(parts[1]);
	let z = parseFloat(parts[2]);
	if (isNaN(x) || isNaN(y) || isNaN(z))
		throw new Error("One or more input values is not a valid number");
	return new Vector3(x, y, z);
};

/**
 * Add Vectors together without manipulating any parameter!
 * @static
 * @param {Vector3} a
 * @param {Vector3} b
 * @returns {Vector3}
 */
Vector3.addVectors = function (a, b) {
	let result = new Vector3();
	return result.addVectors(a, b);
};

/**
 * Subtract vectors without manipulating any parameter
 * @static
 * @param {Vector3} a
 * @param {Vector3} b
 * @returns {Vector3}
 */
Vector3.subVectors = function (a, b) {
	let result = new Vector3();
	return result.subVectors(a, b);
};

/**
 * Multiplies two vectorss component-wise and returns the result in a new vector.
 * @static
 * @param {Vector3} a
 * @param {Vector3} b
 * @returns {Vector3}
 */
Vector3.mulVectors = function (a, b) {
	var result = new Vector3();
	return result.multiplyVectors(a, b);
}

/**
 * Multiplies the given vector by a scalar and returns the result in a new vector.
 * @static
 * @param {Vector3} v
 * @param {number} s
 * @returns {Vector3}
 */
Vector3.mulScalar = function (v, s) {
	var result = new Vector3();
	return result.multiplyVectors(v, new Vector3(s, s, s));
}

/**
 * Computes the component-wise absolute value of the given vector and returns 
 * the result in a new vector.
 * @static
 * @param {Vector3} a
 * @returns {Vector3}
 */
Vector3.abs = function (a) {
	return new Vector3(Math.abs(a.x), Math.abs(a.y), Math.abs(a.z));
}

/**
 * Null-Vector
 * @type {Vector3}
 */
Vector3.NULL = new Vector3();
Object.defineProperty(Vector3.NULL, 'x', {
	enumerable: true,
	configurable: false,
	writable: false,
	value: 0
});
Object.defineProperty(Vector3.NULL, 'y', {
	enumerable: true,
	configurable: false,
	writable: false,
	value: 0
});
Object.defineProperty(Vector3.NULL, 'z', {
	enumerable: true,
	configurable: false,
	writable: false,
	value: 0
});

/**
 * Vector for heading = 180°
 * @type {Vector3}
 */
Vector3.REVERSE_HEADING = new Vector3(180, 0, 0);
Object.defineProperty(Vector3.REVERSE_HEADING, 'x', {
	enumerable: true,
	configurable: false,
	writable: false,
	value: 180
});
Object.defineProperty(Vector3.REVERSE_HEADING, 'y', {
	enumerable: true,
	configurable: false,
	writable: false,
	value: 0
});
Object.defineProperty(Vector3.REVERSE_HEADING, 'z', {
	enumerable: true,
	configurable: false,
	writable: false,
	value: 0
});

/**
 * Vector for default scaling
 * @type {Vector3}
 */
Vector3.DEFAULT_SCALE = new Vector3(1, 1, 1);
Object.defineProperty(Vector3.DEFAULT_SCALE, 'x', {
	enumerable: true,
	configurable: false,
	writable: false,
	value: 1
});
Object.defineProperty(Vector3.DEFAULT_SCALE, 'y', {
	enumerable: true,
	configurable: false,
	writable: false,
	value: 1
});
Object.defineProperty(Vector3.DEFAULT_SCALE, 'z', {
	enumerable: true,
	configurable: false,
	writable: false,
	value: 1
});

export {Vector3}