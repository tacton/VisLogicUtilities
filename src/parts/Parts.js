/**
 * A map of part names (strings, keys) to specific instances of sceneObject (values)
 */
let _parts = {};
/**
 * A map of alias names (strings, keys) to specific instances of core.Asset (values). If used at all, must be supplied to this module via setAliasMap()
 */
let _aliasMap = {};

/**
 * A Module to help manage sceneObjects with globally unique names to help accessing sceneObjects everywhere in your project code
 */
export default class Parts {
	/**
	 * Resets the data storage for all parts in the scene. Use together with core.scene.reset()
	 */
	static reset() {
		_parts = {};
	}

	/**
	 * Sets the alias map to be used by the module.
	 * @param {*} aliasMap - alias map to set
	 */
	static setAliasMap(aliasMap) {
		_aliasMap = aliasMap;
	}

	/**
	 * Adds the specified asset to the scene and sets selectable = true, then saves the sceneObject in the global parts list under a globally unique name.
	 * @param {string|core.Asset} aliasOrAsset - Information about which asset to instantiate
	 * @param {string} [partName] - Optional. The part name to save this instantiated object as. If ommitted, defaults to the first parameter aliasOrAsset.
	 * @throws Will throw an error when adding a part whose name already exists
	 * @returns {sceneObject} - The created sceneObject instance.
	 */
	static add(aliasOrAsset, partName = aliasOrAsset) {
		aliasOrAsset = coerceToString(aliasOrAsset);
		partName = coerceToString(partName, aliasOrAsset);
		if (_parts[partName]) {
			throw new Error("A Part with the name " + partName + " already exists!");
		}
		let assetRef = this.getAsset(aliasOrAsset);
		let sceneObject = core.scene.create(assetRef);
		sceneObject.selectable = true;
		_parts[partName] = sceneObject;
		return sceneObject;
	}

	/**
	 * Removes the specified part from the scene and frees up the name
	 * @param {string|core.Asset} partNameOrAsset 
	 */
	static remove(partNameOrAsset) {
		let partName = coerceToString(partNameOrAsset);
		let p = Parts.get(partName);
		p.dispose();
		delete _parts[partName];
	}

	/**
	 * Check whether the specified part name exists (and therefore is part of the scene)
	 * @param {string|core.Asset} partNameOrAsset 
	 * @returns true if it exists, otherwise false.
	 */
	static has(partNameOrAsset) {
		let partName = coerceToString(partNameOrAsset);
		return Object.keys(_parts).includes(partName);
	}

	/**
	 * Get a reference to the sceneObject saved under the specified part name
	 * @param {string|core.Asset} partNameOrAsset 
	 * @throws Will throw an error when the specified part name does not exist. If you want to avoid throwing, verify existence with the has() function first.
	 * @returns {sceneObject} - The requested sceneObject
	 */
	static get(partNameOrAsset) {
		let partName = coerceToString(partNameOrAsset);
		let result = _parts[partName];
		if (!result) {
			throw new Error("A Part with the name " + partName + " does not exist!");
		}
		return result;
	}

	/**
	 * Gets the complete list of parts with their names. Useful when you want to iterate over all parts of the scene.
	 * @returns {} - A shallow copy of the internal storage
	 */
	static getAll() {
		return { ..._parts }; //shallow copy
	}

	/**
	 * Gets the part name of the specified sceneObject. A reverse of .get()
	 * @param {sceneObject} sceneObject - sceneObject whose part name you want
	 * @throws Will throw an error when the sceneObject is unknown, meaning it was not created via .add()
	 * @returns The part name of the sceneObject
	 */
	static resolveName(sceneObject) {
		for (let partName in _parts) {
			let p = _parts[partName];
			if (p === sceneObject) {
				return partName;
			}
		}
		throw new Error("A Part for that sceneObject does not exist!");
	}

	/**
	 * Turns the specified alias string or asset path into a proper core.Asset
	 * @param {string} aliasOrAssetpath - Name of the alias or the complete asset path of the asset you want
	 * @throws Will throw an error when there it could not find an asset based on the input
	 * @returns {core.Asset} - proper core.Asset instance of what you wanted
	 */
	static getAsset(aliasOrAssetpath) {
		if (_aliasMap[aliasOrAssetpath]) {
			return _aliasMap[aliasOrAssetpath];
		}
		try {
			let asset = core.assets(aliasOrAssetpath);
			return asset;
		}
		catch (e) {
			throw new Error("No asset found for alias or asset '" + aliasOrAssetpath + "'");
		}
	}

	/**
	 * Gets the alias for the specified asset name. Kind of a reverse of getAsset().
	 * @param {string} assetName - name of the asset you want to get the alias of
	 * @returns {string} - The alias of the asset Name. If no alias was found, returns the input.
	 */
	static getAlias(assetName) {
		for (let alias in _aliasMap) {
			let asset = _aliasMap[alias];
			if (asset.name === assetName) {
				return alias;
			}
		}
		return assetName;
	}
}

/**
 * Internal function to coerce the input into a string that is either an alias or the name of a core.Asset
 * @param {string|core.Asset} stringOrAsset - Alias or name of a core.Asset
 * @param {string} [stringOverride] - Optional. If the first parameter is a core.Asset and this parameter is present, this will be returned. 
 * @throws Will throw an error when the first argument could not be coerced to a string. This is the case when it is not already a string and is also not a core.Asset.
 * @returns {string} - A string that represents which alias/assetpath/part it is
 */
function coerceToString(stringOrAsset, stringOverride = undefined) {
	let result = undefined;
	//Would love a proper type check for core.Asset here, but that is currently impossible according to product devs
	if (typeof stringOrAsset !== "string") { //is a core.Asset
		result = stringOverride ?? stringOrAsset?.name;
	}
	else {
		result = stringOrAsset;
	}
	if (typeof result !== "string") {
		throw new Error("Argument is neither of type string nor core.Asset!");
	}
	return result;
}