# Measurements3d

A module for creating sketch measurements. All distances are in 3D space.


For a detailed documentation of the public functions, please see the JSDoc comments
in [src/measurements3d/Measurements3d.js](src/measurements3d/Measurements3d.js).

## Using Measurements3d in VisLogic

```javascript
//any file in vislogic
//import
import { Measurements3d } from "./VisLogicUtilities/src/measurements3d/Measurements3d.js";
import { Vector3 } from "./VisLogicUtilities/src/vector3/Vector3.js";
//use
let p1 = new Vector3(0, 0, 0);
let p2 = new Vector3(2, 2, 2);
Measurements3d.draw({
	point1: p1,
	point2: p2,
	axis: "x",
	text: "%d mm",
	offset: 0.5,
	textSize: 13,
	textOffset: 0.13,
	distanceFunction: function (distanceInM) {
		let result = distanceInM * 1000; //to mm
		return Math.round(result);
	}
});
```

## Parameter Object

The (so far) only public function `draw` uses a parameter object to customize the measurement.  
It supports the following properties:

| Property         | Value type    | Default Value          | Description                                                                                                                                          |
|------------------|---------------|------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| point1           | Vector3       | undefined              | Mandatory. First point of your measurement                                                                                                           |
| point2           | Vector3       | undefined              | Mandatory. Second point of your measurement                                                                                                          |
| offset           | Number        | 0                      | How far away the measurement line is from the middle of the two measure points (in units of length (meter))                                          |
| axis             | String        | "none"                 | Which axis to measure. Can be one of: `x`, `y`, `z`                                                                                                  |
| offsetAxis       | String        | x -> y, y -> x, z -> y | Axis of the measurement lines. Default Value depends on value of `axis` but can be overriden by the user.                                            |
| textOffset       | Number        | 0.05                   | How far away the text is from the measurement line (in units of length (meter))                                                                      |
| textSize         | Number        | 12                     | Size of the measurement text in Pixel                                                                                                                |
| lineColor        | Array(Number) | `[0, 0, 0, 1]` (black) | Color of the lines of the measurement                                                                                                                |
| textColor        | Array(Number) | `[0, 0, 0, 1]` (black) | Color of the text of the measurement                                                                                                                 |
| text             | String        | "%d"                   | Text to display as the measurement. `%d` is a placeholder and will be replaced by the result of the distanceFunction.                                |
| highlightColor   | Number[]      | undefined              | Whether to show a frame around the measurement text and if so, specifies color. See official VizStudio documentation on core.sketches.text().        |
| distanceFunction | Function      | undefined              | Mandatory. See below.                                                                                                                                |
| textAngle        | Number        | 0                      | The angle in which to draw the measurement text. 0 is default and normal, upright text.See official VizStudio documentation on core.sketches.text(). |

## Distance Function

The distance function enables you to customize the measured distance.
For example, you might want to convert the meter value to millimeter and round it:

```javascript
function millimeterDistanceFunction (distanceInMeter) {
	let result = distanceInMeter * 1000; //to mm
	return Math.round(result);
}
```