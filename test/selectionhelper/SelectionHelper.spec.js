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
				text: (p) => textCalls.push(p),
				visible: false,
			},
		};
	});

	afterEach(() => {
		// Clean up global pollution between test files/runs
		delete globalThis.core;
	});
	it("handleSelection without options and a valid event throws no errors", function () {
		let eventDummy = {
			sceneObjects: {
				dockingPoints: {
					"a": {
						name: "a",
						position: [0, 0, 0]
					},
					"b": {
						name: "b",
						position: [1, 1, 1]
					}
				}
			}
		}
		expect(() => SelectionHelper.handleSelection(eventDummy)).not.to.throw(Error);
	})
	//TODO more tests
});
