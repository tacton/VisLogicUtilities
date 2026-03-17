# GetDockingTree

A module for creating a JSON object structure of the complete docking hierarchy of a scene.

For a detailed documentation of the public functions, please see the JSDoc comments
in [src/getdockingtree/GetDockingTree.js](src/dockingtreeanimation/DockingTreeAnimation.js).

## Using GetDockingTree in VisLogic

```javascript
//any file in vislogic
//import
import { getDockingTree } from "./VisLogicUtilities/src/getdockingtree/GetDockingTree.js";
//use
//...
//code that creates any sort of docking hierarchy.
//...
//After the docking hierarchy is established, call the function and then print it to the console
let dockingHierarchy = getDockingTree();
core.log.debug(JSON.stringify(dockingHierarchy, null, 4));
```