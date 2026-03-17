# Vector3

Provides common functionality for 3-dimensional Vectors, based on the Vector3 module of three.js r88.

It actually consists of two modules, `Vector3.js`(taken from three.js) and `Vector3Extension.js` which extends the functionality to include more use cases.

For the documentation of the core functionalities, see the [official  three.js docs](https://threejs.org/docs/index.html#api/math/Vector3).

For an overview of the extended functionality, please see the JSDoc comments in [src/vector3/Vector3Extension.js](src/vector3/Vector3Extension.js).

## Using Vector3 in VisLogic
Make sure to include the Vector3Extension.js only, but make it available as `Vector3`.

```javascript
//any file in vislogic
//import
import {Vector3} from "./VisLogicUtilities/src/vector3/Vector3Extension.js";
//use
let a = new Vector3(1, 2, 3);
let b = Vector3.fromString("4,5,6");
let c = Vector3.addVectors(a, b); //c: 5,7,9
```