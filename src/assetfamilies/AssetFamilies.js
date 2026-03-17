/**
 * Class to automatically verify assets and print results
 */
export class AssetFamilies {
	/**
	 * Tests supplied families and prints the result to console
	 */
	static verify (families) {
		let result = {};
		for (let familyName in families) {
			let family = families[familyName];
			for (let member of family.members) {
				for (let dp of family.expectedDps) {
					if (!member.dockingPoints[dp]) {
						addToResult(result, familyName, member.name, dp);
					}
				}
			}
		}
		print(result);
	}
}

/**
 * Adds a missing DP to the result data structure
 * @param result - test result data structure
 * @param familyName
 * @param memberName
 * @param dpName
 */
function addToResult (result, familyName, memberName, dpName) {
	//init family and or set if it does not exist already
	if (!result[familyName]) {
		result[familyName] = {};
	}
	if (!result[familyName][memberName]) {
		result[familyName][memberName] = new Set(); //We use Set because it prevents duplicate entries
	}
	//add
	result[familyName][memberName].add(dpName);
}

/**
 * print the test results to the console for humans to read
 * @param result - test result object containing grouped list of missing DPs
 */
function print (result) {
	if (Object.keys(result).length === 0) {
		return;
	}
	let message = "The following docking points are missing:";
	for (let familyName in result) {
		for (let memberName in result[familyName]) {
			let missingDps = result[familyName][memberName];
			if (missingDps.size > 0) {
				message += `\n"${familyName}" - "${memberName}" - ${[...missingDps].map((e) => `"${e}"`).join(", ")}`;
			}
		}
	}
	if (message.includes("\n")) { //Don't show message if there are no problems.
		core.log.warn(message);
	}
}