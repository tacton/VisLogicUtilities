import Parts from "../../src/parts/Parts.js";
import { expect } from "chai";

describe("Parts", () => {
    // Fake core + helpers -------------------------------------------------------
    let created;         // record created objects
    let assetsCalls;     // record assets() calls
    let disposed;        // record disposed objects
    let assetRegistry;   // map path -> core.Asset object

    class FakeAsset {
        constructor(name) {
            this.name = name;
        }
    }

    function makeSceneObject(assetRef) {
        return {
            assetRef,
            selectable: false,
            dispose() {
                disposed.push(this);
            },
        };
    }

    function installFakeCore() {
        created = [];
        disposed = [];
        assetsCalls = [];
        assetRegistry = new Map();

        globalThis.core = {
            scene: {
                create(assetRef) {
                    const obj = makeSceneObject(assetRef);
                    created.push(obj);
                    return obj;
                },
                // if you also call core.scene.reset() in your app, it can be added here
            },
            assets(assetPath) {
                assetsCalls.push(assetPath);
                if (!assetRegistry.has(assetPath)) {
                    // mimic your getAsset() behavior: core.assets throws if missing
                    throw new Error("missing asset: " + assetPath);
                }
                return assetRegistry.get(assetPath);
            },
        };
    }

    function uninstallFakeCore() {
        delete globalThis.core;
    }

    // Reset state before each test ---------------------------------------------
    beforeEach(() => {
        installFakeCore();
        Parts.reset();
    });

    afterEach(() => {
        uninstallFakeCore();
    });

    // Tests ---------------------------------------------------------------------

    describe("add()", () => {
        it("creates a sceneObject from an asset path and stores it under the part name", () => {
            const asset = new FakeAsset("WheelAsset");
            assetRegistry.set("assets/wheel", asset);

            const obj = Parts.add("assets/wheel", "wheel_1");

            expect(obj).to.be.an("object");
            expect(obj.selectable).to.equal(true);
            expect(Parts.has("wheel_1")).to.equal(true);
            expect(Parts.get("wheel_1")).to.equal(obj);
            expect(created).to.have.length(1);
            expect(created[0].assetRef).to.equal(asset);
        });

        it("defaults partName to aliasOrAsset when partName is omitted", () => {
            const asset = new FakeAsset("BodyAsset");
            assetRegistry.set("assets/body", asset);

            const obj = Parts.add("assets/body");

            expect(Parts.has("assets/body")).to.equal(true);
            expect(Parts.get("assets/body")).to.equal(obj);
        });

        it("throws when adding a part name that already exists", () => {
            const asset = new FakeAsset("SeatAsset");
            assetRegistry.set("assets/seat", asset);

            Parts.add("assets/seat", "seat_1");
            expect(() => Parts.add("assets/seat", "seat_1"))
                .to.throw(Error, "already exists");
        });

        it("accepts core.Assets for aliasOrAsset and partName", () => {
            const asset = new FakeAsset("DoorAsset");
            assetRegistry.set("DoorAsset", asset);

            const obj = Parts.add(asset);

            expect(Parts.has("DoorAsset")).to.equal(true);
            expect(Parts.get("DoorAsset")).to.equal(obj);
        });

        it("throws if aliasOrAsset cannot be coerced to string nor asset", () => {
            expect(() => Parts.add({ not: "an asset" }, "x"))
                .to.throw(Error, "Argument is neither of type string nor core.Asset");
        });
    });

    describe("remove()", () => {
        it("disposes the sceneObject and deletes the part entry", () => {
            const asset = new FakeAsset("MirrorAsset");
            assetRegistry.set("assets/mirror", asset);

            const obj = Parts.add("assets/mirror", "mirror_1");
            expect(Parts.has("mirror_1")).to.equal(true);

            Parts.remove("mirror_1");

            expect(disposed).to.deep.equal([obj]);
            expect(Parts.has("mirror_1")).to.equal(false);
            expect(() => Parts.get("mirror_1")).to.throw(Error, "does not exist");
        });

        it("accepts core.Asset as partNameOrAsset", () => {
            const asset = new FakeAsset("GlassAsset");
            assetRegistry.set("GlassAsset", asset);
            Parts.add(asset);
            expect(Parts.has(asset)).to.equal(true);

            Parts.remove(asset);
            expect(Parts.has(asset)).to.equal(false);
        });
    });

    describe("has() / get()", () => {
        it("has() returns true only for existing parts", () => {
            const asset = new FakeAsset("FrameAsset");
            assetRegistry.set("assets/frame", asset);

            expect(Parts.has("frame_1")).to.equal(false);
            Parts.add("assets/frame", "frame_1");
            expect(Parts.has("frame_1")).to.equal(true);

        });

        it("get() throws for unknown part names", () => {
            expect(() => Parts.get("nope"))
                .to.throw(Error, "does not exist");
        });
    });

    describe("resolveName()", () => {
        it("returns the stored part name for a known sceneObject", () => {
            const asset = new FakeAsset("AAsset");
            assetRegistry.set("assets/a", asset);

            const obj = Parts.add("assets/a", "partA");
            expect(Parts.resolveName(obj)).to.equal("partA");
        });

        it("throws when the sceneObject is unknown", () => {
            expect(() => Parts.resolveName({}))
                .to.throw(Error, "does not exist");
        });
    });

    describe("getAsset()", () => {
        it("returns aliasMap entry when alias exists", () => {
            const aliasAsset = new FakeAsset("AliasAsset");
            Parts.setAliasMap({ ALIAS_X: aliasAsset });

            const resolved = Parts.getAsset("ALIAS_X");
            expect(resolved).to.equal(aliasAsset);
            expect(assetsCalls).to.have.length(0); // should not call core.assets()
        });

        it("falls back to core.assets(path) when no alias exists", () => {
            Parts.setAliasMap({});

            const asset = new FakeAsset("DirectAsset");
            assetRegistry.set("assets/direct", asset);

            const resolved = Parts.getAsset("assets/direct");
            expect(resolved).to.equal(asset);
            expect(assetsCalls).to.deep.equal(["assets/direct"]);
        });

        it("throws a friendly error when core.assets throws", () => {
            Parts.setAliasMap({});

            expect(() => Parts.getAsset("assets/missing"))
                .to.throw(Error, "No asset found for alias or asset");
        });
    });

    describe("getAlias()", () => {
        it("returns the alias whose mapped asset.name matches the input assetName", () => {
            const asset = new FakeAsset("RealAssetName");
            Parts.setAliasMap({ niceAlias: asset });

            expect(Parts.getAlias("RealAssetName")).to.equal("niceAlias");
        });

        it("returns the input assetName when no alias matches", () => {
            Parts.setAliasMap({ someAlias: new FakeAsset("OtherName") });

            expect(Parts.getAlias("UnaliasedAsset")).to.equal("UnaliasedAsset");
        });
    });

    describe("getAll()", () => {
        it("returns a shallow copy (mutating returned object does not affect internal storage)", () => {
            const asset = new FakeAsset("CopyAsset");
            assetRegistry.set("assets/copy", asset);

            Parts.add("assets/copy", "copy_1");

            const all = Parts.getAll();
            expect(all).to.be.an("object");

            // mutate returned object
            all.copy_1 = "hijack";

            // should not affect actual stored object
            const stored = Parts.get("copy_1");
            expect(stored).to.not.equal("hijack");
            expect(stored).to.be.an("object");
        });
    });
})