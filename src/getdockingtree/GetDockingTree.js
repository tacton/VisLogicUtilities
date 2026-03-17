export function getDockingTree () {
	let topLevelTree = [];
	for(let s of core.scene.getObjects()) {
		if(!s.getDockingInfo().parent){
			let children = recurseTopDown(s);
			topLevelTree.push({
				name: s.asset.name,
				children
			});
		}
	}
	return topLevelTree;
}

function recurseTopDown(sceneObject)  {
	let tree = [];
	
	for(let c of getChildrenStable(sceneObject)){
		let children = recurseTopDown(c);
	
		tree.push({
			name: c.asset.name,
			children: children.length ? children : undefined,
			ownDp: c.getDockingInfo() ? c.getDockingInfo().ownDp : undefined,
			parentDp: c.getDockingInfo() ? c.getDockingInfo().parentDp : undefined,
		});
	}
	
	return tree;
}

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