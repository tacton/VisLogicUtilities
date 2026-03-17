import { Vector3 } from "../vector3/Vector3.js";

/**
 * Module-wide store of the options object
 * @type {Object}
 * @private
 */
let _options = undefined;

/**
 * Module-wide store of the animation counter. This is required to give each KeyframeTrack and Animation object its unique identifier.
 * @type {number}
 * @private
 */
let _animCounter = 0;

/**
 * Module-wide store of the animation queue
 * @type {*[]}
 * @private
 */
let _queue = [];

/**
 * Class for playing animations of the whole docking tree
 */
export class DockingTreeAnimation {

	/**
	 * Function that triggers the animations to play.
	 * @param options - Options object
	 */
	static play(options) {
		//reset state
		_queue = [];
		_animCounter = 0;
		_options = initOptions(options);
		
		buildQueue();
		
		//adjust timings
		if(_options.totalDuration !== -1) {
			let totalDuration = _queue.reduce((acc, e) => acc + e.durationSeconds, 0);
			for(let obj of _queue){
				let ratioOfTotal = obj.durationSeconds / totalDuration;
				obj.durationSeconds = _options.totalDuration * ratioOfTotal;
			}
		}

		//start animation sequence
		playNext();	
	}
}

/**
 * Initializes the options object and sets the defaults for any omitted parameter properties.
 * @param options {}
 * @returns {{}} - fully filled-out options object
 */
function initOptions(options) {
	//If any of the option properties are omitted, use these default values
	const defaultOptions = {
		offsetVector: [1, 0, 0],
		manipulatorFunction: undefined,
		totalDuration: -1
	};
	if (!options) {
		options = {};
	}
	for (let property in defaultOptions) {
		if (!defaultOptions.hasOwnProperty(property)) {
			continue;
		}
		if (!options.hasOwnProperty(property)) {
			options[property] = defaultOptions[property];
		}
	}

	return options;
}

/**
 * Builds the animation queue based on all meshes in the scene.
 */
function buildQueue() {
	for(let s of core.scene.getObjects()) {
		if(!s.getDockingInfo().parent){
			//start recursion for all meshes that are not docked to anything (all docking roots)
			recurseTopDown(s);
		}
	}
}

/**
 * Recursive function for traversing the docking hierarchy
 * @param sceneObject
 */
function recurseTopDown(sceneObject)  {
	addToQueue(sceneObject);
	let children = getChildrenStable(sceneObject);
	for(let c of children){
		recurseTopDown(c);
	}
}

/**
 * Add the given sceneObject to the animation queue. Also hides it for a better visual effect.
 * @param sceneObject
 */
function addToQueue(sceneObject){
	sceneObject.visible = false;
	_queue.push({
		sceneObject,
		durationSeconds: 1
	});
}

/**
 * A stable version of sceneObject.getChildren. If we do not sort manually, the order of children returned is random and different every time we call it.
 * @param sceneObject - Parent object whose children to get
 * @returns [{SceneObject}] - List of child scene Objects
 */
function getChildrenStable(sceneObject) {
	return sceneObject.getChildren().sort(function(a, b){
		let aParentDp = a.getDockingInfo().parentDp;
		let aParentSuffix = aParentDp ? aParentDp : "";
		let aString = a.asset.name + "_" + aParentSuffix;
		
		let bParentDp = b.getDockingInfo().parentDp;
		let bParentSuffix = bParentDp ? bParentDp : "";
		let bString = b.asset.name + "_" + bParentSuffix;
		
		if(aString === bString){
			return 0;
		}
		return aString < bString ? -1 : 1;
	});
}

/**
 * Play the animation for the next object in the queue.
 */
function playNext() {
	let queueObject = _queue.shift();
	if(!queueObject) {
		return; //end of queue
	}
	let sceneObject = queueObject.sceneObject;
	try { //We have to wrap this in a try catch because there is no way to check whether a sceneObject has already been disposed of before accessing it. For disposed sceneObjects, any API function call will throw an error.
		let relevantProperty = sceneObject.getDockingInfo().parent ? "dockingTranslation" : "position"; //docked sceneObjects cannot have their position set and instead we have to use dockingTranslation
		let savedPosition = sceneObject[relevantProperty].slice(); //slice creates a copy of the array
		let offsetToUse = typeof _options.manipulatorFunction === "function"
			? _options.manipulatorFunction(_options.offsetVector, sceneObject)
			: _options.offsetVector;
		//convert to VLU.Vector3 to not have to re-implement Vector addition.
		let offsetV = new Vector3().fromArray(offsetToUse);
		let offsetPosition = new Vector3().fromArray(savedPosition).add(offsetV);
		
		//actually manipulate the scene object in the scene
		sceneObject.visible = true;
		sceneObject[relevantProperty] = offsetPosition.toArray(); //move it to position as calculated by offset vector
		
		let kftP = new core.KeyframeTrack("kftPx_" + _animCounter, "position"); //One keyframetrack to animate all 3 axis of the position
		kftP.setKeys([
			{ time: 0, value: sceneObject[relevantProperty] },
			{ time: queueObject.durationSeconds, value: savedPosition },
		]);
		let anim = new core.Animation("anim_" + _animCounter, [kftP]);
		_animCounter++;
		
		let player = new core.AnimationPlayer(sceneObject, [anim]);
		player.onFinished = function () {
			playNext(); //trigger animation of next object in the queue.
		}
		player.start();	
	}
	catch (e) {
		return;
	}
}