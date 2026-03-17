import { DockingTreeAnimation } from "../../src/dockingtreeanimation/DockingTreeAnimation.js";
import { expect } from "chai";

/**
 * Helper to create scene-object-like stubs that match the API the module uses.
 */
function makeSceneObject({
	                         assetName,
	                         parent = null,
	                         parentDp = undefined,
	                         position = [0, 0, 0],
	                         dockingTranslation = [0, 0, 0],
	                         children = [],
                         } = {}) {
	return {
		visible: true,
		asset: { name: assetName },
		position: position.slice(),
		dockingTranslation: dockingTranslation.slice(),
		getDockingInfo() {
			return { parent, parentDp };
		},
		getChildren() {
			// Return a copy so the module can sort without mutating our fixture array
			return children.slice();
		},
	};
}

describe("DockingTreeAnimation.play", () => {
	let createdPlayers;
	let createdTracks;
	let createdAnims;

	beforeEach(() => {
		createdPlayers = [];
		createdTracks = [];
		createdAnims = [];

		// Stub the global core API the module expects
		globalThis.core = {
			scene: {
				getObjects: () => [],
			},

			KeyframeTrack: class {
				constructor(id, property) {
					this.id = id;
					this.property = property;
					this.keys = null;
					createdTracks.push(this);
				}
				setKeys(keys) {
					this.keys = keys;
				}
			},

			Animation: class {
				constructor(id, tracks) {
					this.id = id;
					this.tracks = tracks;
					createdAnims.push(this);
				}
			},

			AnimationPlayer: class {
				constructor(sceneObject, anims) {
					this.sceneObject = sceneObject;
					this.anims = anims;
					this.onFinished = null;
					createdPlayers.push(this);
				}
				start() {
					// Make playback deterministic in tests: finish immediately
					if (typeof this.onFinished === "function") this.onFinished();
				}
			},
		};
	});

	afterEach(() => {
		delete globalThis.core;
	});

	it("applies default options (offsetVector [1,0,0]) and animates all root objects top-down", () => {
		const child = makeSceneObject({ assetName: "Child", parent: {} });
		const root = makeSceneObject({ assetName: "Root", parent: null, children: [child] });

		core.scene.getObjects = () => [root];

		DockingTreeAnimation.play(); // no options passed

		// Both objects should have been animated => 2 players created
		expect(createdPlayers).to.have.length(2);

		// addToQueue hides everything first; playNext should make them visible when played
		expect(root.visible).to.equal(true);
		expect(child.visible).to.equal(true);

		// Root is not docked => relevantProperty is "position"
		// Default offsetVector [1,0,0] => moved to [1,0,0] before anim keys set
		expect(root.position).to.deep.equal([1, 0, 0]);

		// Child is docked (parent exists) => relevantProperty is "dockingTranslation"
		expect(child.dockingTranslation).to.deep.equal([1, 0, 0]);

		// Verify the keyframes: time 0 uses offset position, end uses saved position
		expect(createdTracks[0].property).to.equal("position");
		expect(createdTracks[0].keys[0]).to.deep.include({ time: 0 });
		expect(createdTracks[0].keys[1]).to.deep.include({ time: 1 });
	});

	it("uses manipulatorFunction when provided (instead of raw offsetVector)", () => {
		const root = makeSceneObject({ assetName: "Root", parent: null, position: [10, 0, 0] });
		core.scene.getObjects = () => [root];

		let calls = 0;
		DockingTreeAnimation.play({
			offsetVector: [1, 0, 0],
			manipulatorFunction: (offsetVector, sceneObject) => {
				calls++;
				expect(offsetVector).to.deep.equal([1, 0, 0]);
				expect(sceneObject.asset.name).to.equal("Root");
				return [0, 2, 0]; // override direction
			},
		});

		expect(calls).to.equal(1);
		// Root starts at [10,0,0], manipulator returns [0,2,0] => offset position [10,2,0]
		expect(root.position).to.deep.equal([10, 2, 0]);
	});

	it("scales durations proportionally when totalDuration is set (all default durations are 1 sec)", () => {
		const a = makeSceneObject({ assetName: "A", parent: null });
		const b = makeSceneObject({ assetName: "B", parent: null });
		const c = makeSceneObject({ assetName: "C", parent: null });
		core.scene.getObjects = () => [a, b, c];

		DockingTreeAnimation.play({ totalDuration: 12 });

		// All queue items start with durationSeconds = 1
		// totalDuration = 12 => each gets 12 * (1 / 3) = 4 seconds.
		// This value is used as the second keyframe time.
		for (const track of createdTracks) {
			expect(track.keys[1].time).to.equal(4);
		}
	});

	it("stops immediately if a queued object throws during playback (try/catch returns)", () => {
		const bad = makeSceneObject({ assetName: "Bad", parent: null });
		let badCallsCounter = 0;
		bad.getDockingInfo = () => {
			//Only start throwing errors for any calls beyond the first. This is because the building of the queue also calls this and it still needs to be good then.
			if(badCallsCounter >= 1){
				throw new Error("disposed");
			}
			badCallsCounter++;
			return {parent: null, parentDp: null };
		};

		const good = makeSceneObject({ assetName: "Good", parent: null });

		core.scene.getObjects = () => [bad, good];

		try {
			DockingTreeAnimation.play();
		}
		catch (e){

		}

		// Playback returns on first error and does NOT continue to playNext() for the rest.
		// So: no players created (it fails before it can construct AnimationPlayer),
		// OR at most it fails before setting up a player; we assert Good never becomes visible again.
		expect(good.visible).to.equal(false); // addToQueue hides it, but it's never played => stays hidden
	});
});
