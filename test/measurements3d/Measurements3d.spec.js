import {Measurements3d} from "../../src/measurements3d/Measurements3d.js";
import {Vector3} from "../../src/vector3/Vector3Extension.js";
import { expect } from "chai";

describe("Measurements3d", function () {

	let lineCalls;
	let textCalls;
	beforeEach(() => {
		lineCalls = [];
		textCalls = [];
		globalThis.core = {
			sketches: {
				line: (p) => lineCalls.push(p),
				text: (p) => textCalls.push(p),
			},
		};
	});

	afterEach(() => {
		// Clean up global pollution between test files/runs
		delete globalThis.core;
	});

	it("draw measurement with default options", function () {
		let inputOptions = {
			point1: new Vector3(0, 0, 0),
			point2: new Vector3(2, 2, 2)
		};
		Measurements3d.draw(inputOptions);
		expect(inputOptions.distance).to.equal(3.4641016151377544);
	});
	it("draw measurement with undefined axis parameter", function () {
		expect(() =>
			Measurements3d.draw({
				point1: new Vector3(0, 0, 0),
				point2: new Vector3(2, 2, 2),
				axis: undefined
			})).to.throw(TypeError);
	});
	it("draw measurement with invalid axis character parameter", function () {
		expect(() =>
			Measurements3d.draw({
				point1: new Vector3(0, 0, 0),
				point2: new Vector3(2, 2, 2),
				axis: 'a'
			})).to.throw(TypeError);
	});
	it("draw measurement with number as axis parameter", function () {
		expect(() =>
			Measurements3d.draw({
				point1: new Vector3(0, 0, 0),
				point2: new Vector3(2, 2, 2),
				axis: 1
			})).to.throw(TypeError);
	});
	it("draw measurement with valid text parameter", function () {
		let inputOptions = {
			point1: new Vector3(0, 0, 0),
			point2: new Vector3(2, 2, 2),
			text: "hello measurement"
		};
		Measurements3d.draw(inputOptions);
		expect(inputOptions.text).to.equal("hello measurement");
	});
	it("draw measurement with huge font", function () {
		let inputOptions = {
			point1: new Vector3(0, 0, 0),
			point2: new Vector3(2, 2, 2),
			textSize: 1200
		};
		Measurements3d.draw(inputOptions);
		expect(inputOptions.textSize).to.equal(1200);
	});
	it("draw measurement with undefined start point", function () {
		expect(() =>
			Measurements3d.draw({
				point1: undefined,
				point2: new Vector3(2, 2, 2),
			})).to.throw('Required property "point1" is not defined!');
	});
	it("draw measurement with undefined end point", function () {
		expect(() =>
			Measurements3d.draw({
				point1: new Vector3(2, 2, 2),
				point2: undefined,
			})).to.throw('Required property "point2" is not defined!');
	});
	it("use hex as text color", function () {
		let inputOptions = {
			point1: new Vector3(0, 0, 0),
			point2: new Vector3(2, 2, 2),
			textColor: "#000000"
		};
		Measurements3d.draw(inputOptions);
		expect(inputOptions.textColor).to.equal("#000000");
	});
	it("calculate distance x", function () {
		let inputOptions = {
			point1: new Vector3(0, 0, 0),
			point2: new Vector3(2, 2, 2),
			axis: 'x'
		};
		Measurements3d.draw(inputOptions);
		expect(inputOptions.distance).to.equal(2);
	});
	it("calculate distance y", function () {
		let inputOptions = {
			point1: new Vector3(0, 0, 0),
			point2: new Vector3(2, 2, 2),
			axis: 'y'
		};
		Measurements3d.draw(inputOptions);
		expect(inputOptions.distance).to.equal(2);
	});
	it("calculate distance z", function () {
		let inputOptions = {
			point1: new Vector3(0, 0, 0),
			point2: new Vector3(2, 2, 2),
			axis: 'z'
		};
		Measurements3d.draw(inputOptions);
		expect(inputOptions.distance).to.equal(2);
	});
	it("call draw with undefined axis", function () {
		expect(() =>
			Measurements3d.draw({
				point1: new Vector3(0, 0, 0),
				point2: new Vector3(2, 2, 2),
				axis: undefined
			})).to.throw(TypeError);
	});
});
