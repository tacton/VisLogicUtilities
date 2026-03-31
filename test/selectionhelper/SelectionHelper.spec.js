import { SelectionHelper } from "../../src/selectionhelper/SelectionHelper.js";
import { expect } from "chai";

describe("SelectionHelper", function () {

	let lineCalls;
	let textCalls;
	let debugCalls;
	beforeEach(() => {
		lineCalls = [];
		textCalls = [];
		debugCalls = [];
		globalThis.core = {
			scene : {
				showOutlines: false
			},
			log: {
				debug: (msg) => debugCalls.push(msg),
			},
			sketches: {
				text: function (p) {
					textCalls.push(p);
					return {dispose: function() {}}
				},
				visible: false,
			},
		};
	});

	afterEach(() => {
		// Clean up global pollution between test files/runs
		delete globalThis.core;
	});
	it("handleSelection without options and a valid event throws no errors", function () {
		let sceneObject = {
			asset: {name: "a"},
			dockingPoints: {
				"a": {
					name: "a",
					position: [0, 0, 0]
				},
				"b": {
					name: "b",
					position: [1, 1, 1]
				}
			},
		};
		let eventDummy = {
			sceneObjects: [sceneObject],
			sceneObject: sceneObject
		}
		expect(() => SelectionHelper.handleSelection(eventDummy)).not.to.throw(Error);
	})
	it("handleSelection calls the nameResolveFunction with the original asset name and prints its return value to console", function () {
		let sceneObject = {
			asset: {name: "testName123"},
			dockingPoints: {},
		};
		let eventDummy = {
			sceneObjects: [sceneObject],
			sceneObject: sceneObject
		};
		let nameResolveFunction = function (assetName) {
			return assetName + "_added";
		}
		SelectionHelper.handleSelection(eventDummy, {nameResolveFunction});
		expect(debugCalls[0]).to.include("testName123_added");
	});
});
