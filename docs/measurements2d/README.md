# Measurements2d

A module for creating sketch measurements. All distances are in 3D space, but offsets and measurement lines are in 2D.


For a detailed documentation of the public functions, please see the JSDoc comments
in [src/measurements2d/Measurements2d.js](src/measurements2d/Measurements2d.js).

## Using Measurements2d in VisLogic

```javascript
//any file in vislogic
//import
import { Measurements2d } from "./VisLogicUtilities/src/measurements2d/Measurements2d.js";
//use
Measurements2d.draw({
	point1: [0, 0, 0],
	point2: [1, 1, 1],
	orientation: "vertical",
	text: "%d mm",
	offset: 10,
	textSize: 13,
	textOffset: [10, 0],
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
| point1           | Array         | undefined              | Mandatory. 3D-coordinates of the first point of your measurement.                                                                                    |
| point2           | Array         | undefined              | Mandatory. 3D-coordinates of the second point of your measurement.                                                                                   |
| offset           | Number        | 0                      | How far away the measurement line is from the middle of the two measure points in pixel.                                                             |
| orientation      | String        | "horizontal"           | Whether the measurement line is horizontal or vertical in 2D screen space                                                                            |
| textOffset       | Array         | `[0, 0]`               | How far away the text is from the measurement line in pixel in 2D screens space                                                                      |
| textSize         | Number        | 12                     | Size of the measurement text in Pixel                                                                                                                |
| lineColor        | Array(Number) | `[0, 0, 0, 1]` (black) | Color of the text of the measurement                                                                                                                 |
| textColor        | Array(Number) | `[0, 0, 0, 1]` (black) | Color of the text of the measurement                                                                                                                 |
| text             | String        | '%d'                   | Text to display as the measurement. `%d` is a placeholder and will be replaced by the result of the distanceFunction.                                |
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