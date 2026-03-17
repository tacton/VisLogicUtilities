import {Measurements2d} from "../../src/Measurements2d/Measurements2d.js";
import { expect } from "chai";

describe("Measurements2d", () => {
	let calls;

	function installCoreStub({ projectPointImpl } = {}) {
		calls = {
			projectPoint: [],
			line: [],
			text: [],
		};

		globalThis.core = {
			sketches: {
				projectPoint: (p) => {
					calls.projectPoint.push(p);
					return projectPointImpl ? projectPointImpl(p) : [p[0], p[1]];
				},
				line: (desc) => {
					calls.line.push(desc);
					return desc;
				},
				text: (desc) => {
					calls.text.push(desc);
					return desc;
				},
			},
		};
	}

	function uninstallCoreStub() {
		delete globalThis.core;
		calls = undefined;
	}

	afterEach(() => uninstallCoreStub());

	describe("minimum required options", () => {
		it("throws TypeError when point1 is missing", () => {
			installCoreStub();
			expect(() => Measurements2d.draw({ point2: [0, 0, 0] })).to.throw(
				TypeError,
				'Required property "point1" is not defined!'
			);
		});

		it("throws TypeError when point2 is missing", () => {
			installCoreStub();
			expect(() => Measurements2d.draw({ point1: [0, 0, 0] })).to.throw(
				TypeError,
				'Required property "point2" is not defined!'
			);
		});
	});

	describe("projection behavior", () => {
		it("calls core.sketches.projectPoint for both points when they are 3D", () => {
			installCoreStub({
				projectPointImpl: (p) => [p[0] + 10, p[1] + 20],
			});

			Measurements2d.draw({
				point1: [1, 2, 3],
				point2: [4, 5, 6],
				text: "%d",
			});

			expect(calls.projectPoint).to.deep.equal([
				[1, 2, 3],
				[4, 5, 6],
			]);
			// 2 helper lines + 1 measurement line
			expect(calls.line).to.have.length(3);
			expect(calls.text).to.have.length(1);
		});
	});

	describe("default options + horizontal orientation", () => {
		it("uses defaults (offset=0, orientation=horizontal, textOffset=[0,0], textSize=12, colors, textAngle=0)", () => {
			installCoreStub();

			Measurements2d.draw({
				point1: [0, 0, 0],
				point2: [10, 0, 0],
				text: "%d",
			});

			// Two helper lines + one measurement line
			expect(calls.line).to.have.length(3);

			// Helper lines use arrowHeads none, width 1, pattern solid, color lineColor default
			expect(calls.line[0]).to.include({
				width: 1,
				pattern: "solid",
				arrowHeads: "none",
			});
			expect(calls.line[1]).to.include({
				width: 1,
				pattern: "solid",
				arrowHeads: "none",
			});

			// Measurement line uses arrowHeads both
			expect(calls.line[2]).to.include({
				width: 1,
				pattern: "solid",
				arrowHeads: "both",
			});

			// Text defaults
			expect(calls.text).to.have.length(1);
			expect(calls.text[0].size).to.equal(12);
			expect(calls.text[0].color).to.deep.equal([0, 0, 0, 1]);
			expect(calls.text[0].angle).to.equal(0);
		});

		it("computes offset points for horizontal orientation (y shifted by offset, x matches projected points)", () => {
			installCoreStub({
				projectPointImpl: (p) => [p[0], p[1]], // projection: drop z
			});

			Measurements2d.draw({
				point1: [0, 0, 0],
				point2: [10, 0, 0],
				offset: 5,
				text: "%d",
			});

			// projected points
			const projected1 = [0, 0];
			const projected2 = [10, 0];

			// expected offset points:
			// half = [5,0]; offset_point1 = [0, 5]; offset_point2 = [10, 5]
			expect(calls.line[0].point1).to.deep.equal(projected1);
			expect(calls.line[0].point2).to.deep.equal([0, 5]);

			expect(calls.line[1].point1).to.deep.equal(projected2);
			expect(calls.line[1].point2).to.deep.equal([10, 5]);

			// measurement line between offset points
			expect(calls.line[2].point1).to.deep.equal([0, 5]);
			expect(calls.line[2].point2).to.deep.equal([10, 5]);
		});

		it("places text at midpoint x (half[0]) and offset_point1 y, plus textOffset", () => {
			installCoreStub({
				projectPointImpl: (p) => [p[0], p[1]],
			});

			Measurements2d.draw({
				point1: [0, 0, 0],
				point2: [10, 0, 0],
				offset: 5,
				textOffset: [2, -1],
				text: "%d",
			});

			// base text point: result starts as offset_point1 [0,5], then for horizontal set x=half[0]=5
			// => [5,5] then + textOffset => [7,4]
			expect(calls.text[0].point).to.deep.equal([7, 4]);
		});
	});

	describe("vertical orientation", () => {
		it("computes offset points for vertical orientation (x shifted by offset, y matches projected points)", () => {
			installCoreStub({
				projectPointImpl: (p) => [p[0], p[1]],
			});

			Measurements2d.draw({
				point1: [0, 0, 0],
				point2: [0, 10, 0],
				offset: 3,
				orientation: "vertical",
				text: "%d",
			});

			// half = [0,5]; start offset points as [0,5] then vertical:
			// offset_point1: x += 3 => 3, y = projected1[1] => 0  => [3,0]
			// offset_point2: x += 3 => 3, y = projected2[1] => 10 => [3,10]
			expect(calls.line[0].point2).to.deep.equal([3, 0]);
			expect(calls.line[1].point2).to.deep.equal([3, 10]);
			expect(calls.line[2].point1).to.deep.equal([3, 0]);
			expect(calls.line[2].point2).to.deep.equal([3, 10]);
		});

		it("places text at midpoint y (half[1]) and offset_point1 x for vertical, plus textOffset", () => {
			installCoreStub({
				projectPointImpl: (p) => [p[0], p[1]],
			});

			Measurements2d.draw({
				point1: [0, 0, 0],
				point2: [0, 10, 0],
				offset: 3,
				orientation: "vertical",
				textOffset: [-1, 2],
				text: "%d",
			});

			// offset_point1 = [3,0]; then for vertical set y=half[1]=5 => [3,5]
			// then + textOffset => [2,7]
			expect(calls.text[0].point).to.deep.equal([2, 7]);
		});
	});

	describe("distance calculation + placeholder replacement", () => {
		it("calculates 3D Euclidean distance and replaces %d in text", () => {
			installCoreStub({
				projectPointImpl: (p) => [p[0], p[1]],
			});

			// Distance between (0,0,0) and (3,4,12) => sqrt(9+16+144)=13
			Measurements2d.draw({
				point1: [0, 0, 0],
				point2: [3, 4, 12],
				text: "dist=%d",
			});

			expect(calls.text[0].text).to.equal("dist=13");
		});

		it("applies distanceFunction when provided", () => {
			installCoreStub({
				projectPointImpl: (p) => [p[0], p[1]],
			});

			Measurements2d.draw({
				point1: [0, 0, 0],
				point2: [0, 0, 10],
				distanceFunction: (d) => d * 2,
				text: "%d mm",
			});

			expect(calls.text[0].text).to.equal("20 mm");
		});

		it("replaces all occurrences of %d", () => {
			installCoreStub({
				projectPointImpl: (p) => [p[0], p[1]],
			});

			Measurements2d.draw({
				point1: [0, 0, 0],
				point2: [0, 0, 2],
				text: "%d|%d",
			});

			expect(calls.text[0].text).to.equal("2|2");
		});
	});

	describe("pass-through properties", () => {
		it("passes lineColor to all line calls, and textColor + angle + highlightColor to text", () => {
			installCoreStub({
				projectPointImpl: (p) => [p[0], p[1]],
			});

			Measurements2d.draw({
				point1: [0, 0, 0],
				point2: [10, 0, 0],
				lineColor: [1, 0, 0, 0.5],
				textColor: [0, 0, 1, 1],
				highlightColor: [0, 1, 0, 1],
				textAngle: 30,
				text: "%d",
			});

			expect(calls.line[0].color).to.deep.equal([1, 0, 0, 0.5]);
			expect(calls.line[1].color).to.deep.equal([1, 0, 0, 0.5]);
			expect(calls.line[2].color).to.deep.equal([1, 0, 0, 0.5]);

			expect(calls.text[0].color).to.deep.equal([0, 0, 1, 1]);
			expect(calls.text[0].highlightColor).to.deep.equal([0, 1, 0, 1]);
			expect(calls.text[0].angle).to.equal(30);
		});
	});
});