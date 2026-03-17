import { expect } from "chai";
import { getDockingTree } from "../../src/getdockingtree/GetDockingTree.js"; // adjust path as needed

/**
 * Minimal fake scene object builder.
 */
function makeSceneObject({
	                         name,
	                         dockingInfo = null,      // if null => getDockingInfo() returns null
	                         children = [],
                         } = {}) {
	return {
		asset: { name },
		getDockingInfo() {
			return dockingInfo;
		},
		getChildren() {
			// Return a fresh array each time to mimic typical APIs and avoid mutation surprises
			return [...children];
		},
	};
}

/**
 * Utility: set up the global `core.scene.getObjects()` dependency.
 */
function stubCoreScene(objects) {
	globalThis.core = {
		scene: {
			getObjects() {
				return objects;
			},
		},
	};
}

describe("getDockingTree", () => {
	afterEach(() => {
		// clean up global dependency to avoid cross-test pollution
		delete globalThis.core;
	});

	it("returns an empty array when core.scene.getObjects() is empty", () => {
		stubCoreScene([]);

		const tree = getDockingTree();
		expect(tree).to.deep.equal([]);
	});

	it("includes only top-level objects whose dockingInfo has no parent", () => {
		const topA = makeSceneObject({
			name: "TopA",
			dockingInfo: { parent: null }, // no parent => top-level per code
			children: [],
		});

		const topB = makeSceneObject({
			name: "TopB",
			dockingInfo: { parent: null },
			children: [],
		});

		const nonTop = makeSceneObject({
			name: "ChildX",
			dockingInfo: { parent: topA }, // has parent => should NOT be top-level
			children: [],
		});

		stubCoreScene([topA, topB, nonTop]);

		const tree = getDockingTree();

		expect(tree).to.have.length(2);
		expect(tree.map(n => n.name)).to.have.members(["TopA", "TopB"]);
	});

	it("builds a recursive children tree and omits `children` when leaf nodes have none", () => {
		const leaf1 = makeSceneObject({
			name: "Leaf1",
			dockingInfo: { parent: "Mid", parentDp: "P1", ownDp: "O1" },
			children: [],
		});

		const leaf2 = makeSceneObject({
			name: "Leaf2",
			dockingInfo: { parent: "Mid" ,parentDp: "P2", ownDp: "O2" },
			children: [],
		});

		const mid = makeSceneObject({
			name: "Mid",
			dockingInfo: { parent: "Top", parentDp: "PM", ownDp: "OM" },
			children: [leaf1, leaf2],
		});

		const top = makeSceneObject({
			name: "Top",
			dockingInfo: { parent: null },
			children: [mid],
		});

		stubCoreScene([top, mid, leaf1, leaf2]);

		const tree = getDockingTree();

		expect(tree).to.deep.equal([
			{
				name: "Top",
				children: [
					{
						name: "Mid",
						children: [
							{
								name: "Leaf1",
								// children should be omitted (undefined) for leaf nodes in module output
								children: undefined,
								ownDp: "O1",
								parentDp: "P1",
							},
							{
								name: "Leaf2",
								children: undefined,
								ownDp: "O2",
								parentDp: "P2",
							},
						],
						ownDp: "OM",
						parentDp: "PM",
					},
				],
			},
		]);
	});

	it("sorts children deterministically by (asset.name + '_' + parentDpSuffix)", () => {
		// Create children out of order on purpose.
		const c1 = makeSceneObject({
			name: "B",
			dockingInfo: { parentDp: "2" },
			children: [],
		});
		const c2 = makeSceneObject({
			name: "A",
			dockingInfo: { parentDp: "9" },
			children: [],
		});
		const c3 = makeSceneObject({
			name: "A",
			dockingInfo: { parentDp: "1" },
			children: [],
		});
		const c4 = makeSceneObject({
			name: "A",
			dockingInfo: { parentDp: null }, // suffix becomes "" per module
			children: [],
		});

		const top = makeSceneObject({
			name: "Top",
			dockingInfo: { parent: null },
			children: [c1, c2, c3, c4], // intentionally unsorted
		});

		stubCoreScene([top]);

		const tree = getDockingTree();

		const childNamesAndParentDp = tree[0].children.map(x => ({
			name: x.name,
			parentDp: x.parentDp,
		}));

		// Module compares strings:
		// aString = name + "_" + (parentDp ? parentDp : "")
		// So ordering should be:
		// "A_"   (parentDp null)
		// "A_1"
		// "A_9"
		// "B_2"
		expect(childNamesAndParentDp).to.deep.equal([
			{ name: "A", parentDp: null },
			{ name: "A", parentDp: "1" },
			{ name: "A", parentDp: "9" },
			{ name: "B", parentDp: "2" },
		]);
	});
});
