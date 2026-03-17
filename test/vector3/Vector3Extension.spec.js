import {Vector3} from "../../src/vector3/Vector3Extension.js";
import { expect } from "chai";

function testVectorEquals (v, x, y, z) {
	if (typeof x === "number") {
		expect(v.x).to.equal(x);
		expect(v.y).to.equal(y);
		expect(v.z).to.equal(z);
	} else { //x is another vector!
		expect(v.x).to.equal(x.x);
		expect(v.y).to.equal(x.y);
		expect(v.z).to.equal(x.z);
	}
}
function testFloatEquals (num1, num2) {
	let precision = 0.00001;
	let diff = num1 - num2;
	expect(diff).to.be.below(precision);
}

describe("Vector3Extension", function () {
	it("filterX", function () {
		let v = new Vector3(1, 2, 3);
		let res = v.filterX();
		testVectorEquals(v, 1, 0, 0);
		testVectorEquals(v, res);
	});
	it("filterY", function () {
		let v = new Vector3(1, 2, 3);
		let res = v.filterY();
		testVectorEquals(v, 0, 2, 0);
		testVectorEquals(v, res);
	});
	it("filterZ", function () {
		let v = new Vector3(1, 2, 3);
		let res = v.filterZ();
		testVectorEquals(v, 0, 0, 3);
		testVectorEquals(v, res);
	});
	it("addToX", function () {
		let v = new Vector3(1, 2, 3);
		let res = v.addToX(1);
		testVectorEquals(v, 2, 2, 3);
		testVectorEquals(v, res);
	});
	it("addToY", function () {
		let v = new Vector3(1, 2, 3);
		let res = v.addToY(1);
		testVectorEquals(v, 1, 3, 3);
		testVectorEquals(v, res);
	});
	it("addToZ", function () {
		let v = new Vector3(1, 2, 3);
		let res = v.addToZ(1);
		testVectorEquals(v, 1, 2, 4);
		testVectorEquals(v, res);
	});
	it("xyDistanceTo", function () {
		let v1 = new Vector3(1, 2, 3);
		let v2 = new Vector3(4, 5, 6);
		let res = v1.xyDistanceTo(v2);
		testVectorEquals(v1, 1, 2, 3);
		testVectorEquals(v2, 4, 5, 6);
		testFloatEquals(res, 4.24264);
	});
	it("xDistance/yDistance/zDistance", function () {
		let v1 = new Vector3(1, 2, 3);
		let v2 = new Vector3(4, 5, 6);
		let resX = v1.xDistanceTo(v2);
		let resY = v1.yDistanceTo(v2);
		let resZ = v1.zDistanceTo(v2);
		testVectorEquals(v1, 1, 2, 3);
		testVectorEquals(v2, 4, 5, 6);
		expect(resX).to.equal(3);
		expect(resY).to.equal(3);
		expect(resZ).to.equal(3);
	});
	it("fromString", function () {
		let v = Vector3.fromString("1,2,3");
		testVectorEquals(v, 1, 2, 3);
		expect(Vector3.fromString).to.throw();
		expect(function () {
			Vector3.fromString("123")
		}).to.throw();
		expect(function () {
			Vector3.fromString("1,2,a")
		}).to.throw();
	});
	it("toString", function () {
		let v = new Vector3(1, 2, 3);
		expect(v.toString()).to.equal("1,2,3");
		testVectorEquals(v, 1, 2, 3);
	});
	it("addVectors", function () {
		let v1 = new Vector3();
		let v2 = new Vector3();
		let v3 = Vector3.addVectors(v1, v2);
		testVectorEquals(v1, 0, 0, 0);
		testVectorEquals(v2, 0, 0, 0);
		testVectorEquals(v3, 0, 0, 0);

		let v4 = new Vector3(1, 0, 0);
		let v5 = Vector3.addVectors(v1, v4);
		testVectorEquals(v1, 0, 0, 0);
		testVectorEquals(v2, 0, 0, 0);
		testVectorEquals(v3, 0, 0, 0);
		testVectorEquals(v4, 1, 0, 0);
		testVectorEquals(v5, 1, 0, 0);
	});
	it("subVectors", function () {
		let v1 = new Vector3();
		let v2 = new Vector3();
		let v3 = Vector3.subVectors(v1, v2);
		testVectorEquals(v1, 0, 0, 0);
		testVectorEquals(v2, 0, 0, 0);
		testVectorEquals(v3, 0, 0, 0);

		let v4 = new Vector3(1, 0, 0);
		let v5 = Vector3.subVectors(v1, v4);
		testVectorEquals(v1, 0, 0, 0);
		testVectorEquals(v2, 0, 0, 0);
		testVectorEquals(v3, 0, 0, 0);
		testVectorEquals(v4, 1, 0, 0);
		testVectorEquals(v5, -1, 0, 0);
	});
	it("isNull", function () {
		let v1 = new Vector3();
		expect(v1.equals(new Vector3(0, 0, 0))).to.equals(true);
		testVectorEquals(v1, 0, 0, 0);

		let v2 = new Vector3(1, 1, 1);
		expect(v2.equals(new Vector3())).to.equals(false);
		testVectorEquals(v2, 1, 1, 1);
	});
});
