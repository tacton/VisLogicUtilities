import { Labels } from "../../src/labels/Labels.js";
import { expect } from "chai";

describe("Labels", () => {
	let calls;

	function installCoreStub({
		                         projectPointImpl,
		                         textArea = { left: 10, right: 110 }, // width = 100
	                         } = {}) {
		calls = {
			projectPoint: [],
			text: [],
			arc: [],
			line: [],
		};

		globalThis.core = {
			sketches: {
				projectPoint: (p3) => {
					calls.projectPoint.push(p3);
					return projectPointImpl ? projectPointImpl(p3) : [p3[0], p3[1]];
				},
				text: (opts) => {
					calls.text.push(opts);
					return {
						getScreenArea: () => textArea,
					};
				},
				arc: (opts) => calls.arc.push(opts),
				line: (opts) => calls.line.push(opts),
			},
		};
	}

	function uninstallCoreStub() {
		delete globalThis.core;
		calls = undefined;
	}

	afterEach(() => uninstallCoreStub());

	describe("required options", () => {
		it("throws TypeError when options.text is missing (draw)", () => {
			installCoreStub();
			expect(() => Labels.draw({ position: [0, 0] })).to.throw(
				TypeError,
				'Required property "text" is not defined!'
			);
		});

		it("throws TypeError when options.text is empty string (drawAbsolute)", () => {
			installCoreStub();
			expect(() => Labels.drawAbsolute({ position: [0, 0], text: "" })).to.throw(
				TypeError,
				'Required property "text" is not defined!'
			);
		});
	});

	describe("early returns (no drawing)", () => {
		it("returns without drawing when position is missing", () => {
			installCoreStub();
			Labels.draw({ text: "hello" });
			expect(calls.text).to.have.length(0);
			expect(calls.arc).to.have.length(0);
			expect(calls.line).to.have.length(0);
		});

		it("returns without drawing when text.getScreenArea() returns null", () => {
			installCoreStub({ textArea: null });
			Labels.draw({ text: "hello", position: [5, 6] });
			expect(calls.text).to.have.length(1); // text is created first
			expect(calls.arc).to.have.length(0);
			expect(calls.line).to.have.length(0);
		});
	});

	describe("projection behavior", () => {
		it("projects 3D position via core.sketches.projectPoint", () => {
			installCoreStub({
				projectPointImpl: () => [100, 200],
			});

			Labels.draw({ text: "hi", position: [1, 2, 3] });

			expect(calls.projectPoint).to.deep.equal([[1, 2, 3]]);
			expect(calls.line).to.have.length(1);
			expect(calls.line[0].point1).to.deep.equal([100, 200]);
		});

		it("does not project 2D position", () => {
			installCoreStub();
			Labels.draw({ text: "hi", position: [7, 8] });
			expect(calls.projectPoint).to.have.length(0);
			expect(calls.line[0].point1).to.deep.equal([7, 8]);
		});
	});

	describe("relative mode: Labels.draw()", () => {
		it("computes textPoint = position2d + offset and calls sketches.text with anchorV center", () => {
			installCoreStub();
			Labels.draw({
				text: "hello",
				position: [10, 20],
				offset: [3, -4],
				textSize: 18,
			});

			expect(calls.text).to.have.length(1);
			expect(calls.text[0]).to.include({
				text: "hello",
				size: 18,
				anchorV: "center",
			});
			expect(calls.text[0].point).to.deep.equal([13, 16]); // 10+3, 20-4

			expect(calls.arc).to.have.length(1);
			expect(calls.arc[0].center).to.deep.equal([13, 16]);
		});

		it("uses default offset [0,0] and textSize 12 when not provided", () => {
			installCoreStub();
			Labels.draw({ text: "x", position: [1, 2] });

			expect(calls.text[0].point).to.deep.equal([1, 2]);
			expect(calls.text[0].size).to.equal(12);
		});
	});

	describe("absolute mode: Labels.drawAbsolute()", () => {
		it("uses options.textPosition as the text point", () => {
			installCoreStub();
			Labels.drawAbsolute({
				text: "abs",
				position: [0, 0],
				textPosition: [50, 60],
				textSize: 22,
			});

			expect(calls.text).to.have.length(1);
			expect(calls.text[0].point).to.deep.equal([50, 60]);
			expect(calls.text[0].size).to.equal(22);
			expect(calls.arc[0].center).to.deep.equal([50, 60]);
		});
	});

	describe("circle drawing (alpha + radius)", () => {
		it("sets arc color alpha to 0 when drawCircle is false (default)", () => {
			installCoreStub({ textArea: { left: 0, right: 200 } }); // width=200 => radius=100
			Labels.draw({ text: "c", position: [0, 0], offset: [200, 0] });

			expect(calls.arc).to.have.length(1);
			expect(calls.arc[0].color).to.deep.equal([0, 0, 0, 0]); // alpha=0
			expect(calls.arc[0].radius).to.equal(100); // width/2 * factor(1)
		});

		it("sets arc color alpha to 1 when drawCircle is true", () => {
			installCoreStub({ textArea: { left: 0, right: 50 } }); // width=50 => radius=25
			Labels.draw({
				text: "c",
				position: [0, 0],
				offset: [100, 0],
				drawCircle: true,
			});

			expect(calls.arc[0].color).to.deep.equal([0, 0, 0, 1]);
			expect(calls.arc[0].radius).to.equal(25);
		});

		it("applies circleRadiusFactor", () => {
			installCoreStub({ textArea: { left: 0, right: 100 } }); // width=100 => base radius=50
			Labels.draw({
				text: "c",
				position: [0, 0],
				offset: [100, 0],
				circleRadiusFactor: 2,
			});

			expect(calls.arc[0].radius).to.equal(100); // 50 * 2
		});
	});

	describe("line endpoint shortening by circleRadius", () => {
		it("shortens line length by circleRadius along the direction towards textPoint", () => {
			// Arrange: position2d = [0,0], textPoint = [10,0] (offset [10,0])
			// text width 4 => radius = 2 (since width/2)
			// original vector length = 10, shortened len = 8 => lineEndPoint should be [8,0]
			installCoreStub({ textArea: { left: 0, right: 4 } }); // width=4 => radius=2

			Labels.draw({
				text: "t",
				position: [0, 0],
				offset: [10, 0],
			});

			expect(calls.line).to.have.length(1);
			expect(calls.line[0].point1).to.deep.equal([0, 0]);
			expect(calls.line[0].point2).to.deep.equal([8, 0]);
			expect(calls.line[0].arrowHeads).to.equal("start");
		});
	});
});