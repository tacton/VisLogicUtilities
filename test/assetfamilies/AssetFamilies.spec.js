import {AssetFamilies} from "../../src/assetfamilies/AssetFamilies.js";
import {expect} from "chai";

describe("AssetFamilies.verify", () => {
	let warnCalls;

	beforeEach(() => {
		warnCalls = [];
		globalThis.core = {
			log: {
				warn: (msg) => warnCalls.push(msg),
			},
		};
	});

	afterEach(() => {
		// Clean up global pollution between test files/runs
		delete globalThis.core;
	});

	it("warns when at least one expected docking point is missing", () => {
		const families = {
			FamilyA: {
				expectedDps: ["DP1", "DP2"],
				members: [
					{name: "Asset1", dockingPoints: {DP1: true}}, // missing DP2
				],
			},
		};

		AssetFamilies.verify(families);

		expect(warnCalls).to.have.length(1);
		expect(warnCalls[0]).to.include("The following docking points are missing:");
		expect(warnCalls[0]).to.include('"FamilyA" - "Asset1" - "DP2"');
	});

	it("does not warn when all expected docking points exist", () => {
		const families = {
			FamilyA: {
				expectedDps: ["DP1", "DP2"],
				members: [
					{name: "Asset1", dockingPoints: {DP1: true, DP2: true}},
				],
			},
		};

		AssetFamilies.verify(families);

		expect(warnCalls).to.have.length(0);
	});

	it("groups missing docking points per member and family", () => {
		const families = {
			FamilyA: {
				expectedDps: ["DP1", "DP2", "DP3"],
				members: [
					{name: "Asset1", dockingPoints: {DP1: true}}, // missing DP2, DP3
					{name: "Asset2", dockingPoints: {DP1: true, DP3: true}}, // missing DP2
				],
			},
			FamilyB: {
				expectedDps: ["X", "Y"],
				members: [
					{name: "Asset9", dockingPoints: {Y: true}}, // missing X
				],
			},
		};

		AssetFamilies.verify(families);

		expect(warnCalls).to.have.length(1);
		const msg = warnCalls[0];

		// FamilyA / Asset1 includes DP2 and DP3
		expect(msg).to.include('"FamilyA" - "Asset1" - "DP2", "DP3"');
		// FamilyA / Asset2 includes DP2 only
		expect(msg).to.include('"FamilyA" - "Asset2" - "DP2"');
		// FamilyB / Asset9 includes X only
		expect(msg).to.include('"FamilyB" - "Asset9" - "X"');
	});

	it("does not duplicate missing DPs for the same member (Set behavior)", () => {
		// This intentionally uses duplicate expectedDps to prove Set dedupes output.
		const families = {
			FamilyA: {
				expectedDps: ["DP2", "DP2"],
				members: [
					{name: "Asset1", dockingPoints: {}}, // missing DP2
				],
			},
		};

		AssetFamilies.verify(families);

		expect(warnCalls).to.have.length(1);
		const msg = warnCalls[0];

		// Should contain DP2 exactly once in the rendered list.
		const occurrences = (msg.match(/"DP2"/g) || []).length;
		expect(occurrences).to.equal(1);
	});

	it("warn message contains one line per (family, member) with missing DPs", () => {
		const families = {
			FamilyA: {
				expectedDps: ["DP1", "DP2"],
				members: [
					{name: "Asset1", dockingPoints: {DP1: true}}, // missing DP2
					{name: "Asset2", dockingPoints: {DP2: true}}, // missing DP1
				],
			},
		};

		AssetFamilies.verify(families);

		expect(warnCalls).to.have.length(1);
		const lines = warnCalls[0].split("\n");

		expect(lines.slice(1)).to.have.length(2); //slice(1) removes header line from output
		expect(lines.slice(1).join("\n")).to.include('"FamilyA" - "Asset1" - "DP2"');
		expect(lines.slice(1).join("\n")).to.include('"FamilyA" - "Asset2" - "DP1"');
	});
});