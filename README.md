# VisLogicUtilities

A centralized collection of script modules for use in the visualization logic of any visualization project.
Uses the official Tacton CPQ VizStudio API to make things happen in the 3D scene.
Detailed documentation for all modules can be found in [docs](docs)

## Available modules
* [Vector3](docs/vector3) - Math for 3-dimensional vectors
* [Translations](docs/translations) - Framework for managing localization texts.
* [Measurements3d](docs/measurements3d) - Draw measurements via core.sketches in 3D space (world space).
* [Measurements2d](docs/measurements2d) - Draw measurements via core.sketches in 2D space (screen space).
* [Labels](docs/labels) - Draw text labels via core.sketches pointing to 3D or 2D locations.
* [SelectionHelper](docs/selectionhelper) - Display helpful information when selecting things in 3D.
* [AssetFamilies](docs/assetfamilies) - Verify that certain assets have certain docking points.
* [DockingTreeAnimation](docs/dockingtreeanimation) - Automatically animate the docking hierarchy of any project. Limited customizability.
* [GetDockingTree](docs/getdockingtree) - A single function which creates a JSON representation of the docking hierarchy of a scene.
* [Parts](docs/parts) - A powerful abstraction layer in dealing with and keeping track of mesh scene contents.

## Installing VisLogicUtilities in your project
Download a release .zip archive and extract it into the `visualLogic` folder of your local VizStudio project files.

## Using VisLogicUtilities in your VisLogic
VisLogicUtilities offers several different modules which should only be included as needed!
You can include the modules like any other module. Just make sure the path is correct:

```javascript
//any file in vislogic
//import
import { Measurements3d } from "./VisLogicUtilities/src/measurements3d/Measurements3d.js";
import { Vector3 } from "./VisLogicUtilities/src/vector3/Vector3.js";
//use
Measurements3d.draw({
    point1: new Vector3(0, 0, 0),
    point2: new Vector3(2, 2, 2),
    axis: "x",
    distanceFunction: function(distance){
		return Math.round(distance);
    }
});
```

## Developing VisLogicUtilities

```
npm install
npm test
```
For a detailed guide on how to develop and test your own modules, see [the contribution guide](CONTRIBUTING.md)