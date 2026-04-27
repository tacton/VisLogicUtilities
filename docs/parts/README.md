# Parts

A module for keeping track of your scene contents and abstracting away complexity by referring to meshes via user-defined names.

## Concepts
### Purpose
The purpose of this module is to allow a convenient way of storing and accessing the mesh contents of your 3D scene. Each mesh you want to add to the scene should be added via `add()`, where it is assigned a globally unique name, known as a part name. Then, anywhere else in your code, you can access this mesh by calling `get()` with its name.  
This is especially powerful if your code is fragmented into many modules and/or events, all with their own JavaScript scope.

### Part
A part is a reference to a specific `core.SceneObject` in the 3D scene, accessible under a globally unique part name.  
The goal is to allow abstraction of product features, regardless of which variant of that feature was selected via the configuration.

### Alias
An alias is a user-assigned name for a specific `core.Asset`, meaning a real mesh asset on the file system.  
The goal to make it easier to write dynamic visual logic, regardless of the asset names on the file system.

### Example
You are building a bike.  
The configuration allows for 4 variants of saddle:
* `Standard`
* `Sport`
* `Comfort`
* `Heavy Duty`

Your 3D Artist provides 4 files:
* `saddle comfort 3264764.fbx`
* `saddle_sport_fiber.fbx`
* `883321-33-0 standard.fbx`
* `heavy-duty-sadle.fbx`

A clever alias map could use the real configuration values as alias names and already assign them the correct asset, saving you having to write control structures that achieve the same result.
```javascript
Parts.setAliasMap({
    "Standard": core.assets("883321-33-0 standard"), //article numbers are irrelevant here
    "Sport": core.assets("saddle_sport_fiber"),
    "Comfort": core.assets("saddle comfort 3264764"),
    "Heavy Duty": core.assets("heavy-duty-sadle")
});
```

```javascript
let aliasName = core.config["saddleType"].value; //read out configuration value
Parts.add(aliasName, "saddle"); //use the config value as alias name, thereby picking the correct asset. Save it under the part name "saddle".
```
After this, you can access the specific asset which represents the saddle with the chosen part name `saddle`, regardless of which variant of saddle has actually been chosen.

```javascript
Parts.get("saddle").docTo(Parts.get("frame"), "saddle_connector", "connector");
```
With hard-coded docking point names like so, all possible variants of the saddle must have a docking point called `connector`. To help ensure that all variants of a so-called family fulfill these requirements, see the module [AssetFamilies](../assetfamilies/README.md).

## Using Parts in VisLogic

```javascript
//any file in vislogic
//import
import Parts from "./VisLogicUtilities/src/parts/Parts.js";

//use
//define alias map
let myAliasMap = {
    "aliasA": core.assets("myFolder/myAsset"),
    "aliasB": core.assets("myFolder/myAsset"), //multiple aliases can point to the same asset
    "aliasC": core.assets("myFolder/myAsset2")
};
//set alias map
Parts.setAliasMap(myAliasMap);

//add objects to 3D scene
Parts.add("aliasA", "myPartA"); //explicit alias and explicit part name
Parts.add("aliasB"); //explicit alias, no explicit part name. Part name becomes the same as the alias!
Parts.add("myFolder/myAsset3", "myPartB"); //not a mapped alias, but a proper asset path. Still works!
Parts.add(core.assets("myFolder/myAsset4")); //It even works when you only send in a real core.Asset. 
let p = Parts.add("aliasC"); //returns a real core.SceneObject

//access previously added parts
p.position = [1, 2, 3]; //access via the local variable p
Parts.get("aliasC").visible = false; //access via implicit part name 
Parts.get("myPartB").dockTo(Parts.get("myFolder/myAsset3"), "parent", "child"); //access via proper part name and via implicit path-partname
```

## Public Functions
These are the supported public functions you can use in your code.


### reset()
Resets the data storage for all parts in the scene. Use together with `core.scene.reset()`.

### setAliasMap(aliasMap)
Sets the alias map to be used by the module.

**Parameters**
| Name | Type | Description | Default |
| ---- | ---- | ---- | ---- |
| `aliasMap` | `Object` | A map of alias names (strings, keys) to specific instances of core.Asset (values). | |

### add(aliasOrAsset, partName)
Adds the specified asset to the scene and sets selectable = true, then saves the sceneObject in the global parts list under a globally unique name.

**Parameters**
| Name | Type | Description | Default |
| ---- | ---- | ---- | ---- |
| `aliasOrAsset` | `String` or `core.Asset` | Information about which asset to instantiate. See the usage example above. | |
| `partName` | `String` | Optional. The part name to save this instantiated object as. | `aliasOrAsset` |

**Returns**
| Name | Type | Description |
| ---- | ---- | ---- |
| `part` | `core.SceneObject` | The created scene object for convenience. |

### remove(partNameOrAsset) 
Removes the specified part from the scene and frees up the name.

**Parameters**
| Name | Type | Description | Default |
| ---- | ---- | ---- | ---- |
| `partNameOrAsset` | `String` or `core.Asset` | The name of the part you want to remove. | |

### has(partNameOrAsset) 
Check whether the specified part name exists (and therefore is part of the scene).

**Parameters**
| Name | Type | Description | Default |
| ---- | ---- | ---- | ---- |
| `partNameOrAsset` | `String` or `core.Asset` | The name of the part whose existence you want to check. | |


**Returns**
| Name | Type | Description |
| ---- | ---- | ---- |
| `exists` | `Boolean` | `true` if it exists, otherwise `false`. |

### get(partNameOrAsset) 
Get a reference to the sceneObject saved under the specified part name

**Parameters**
| Name | Type | Description | Default |
| ---- | ---- | ---- | ---- |
| `partNameOrAsset` | `String` or `core.Asset` | The name of the part you want to access. | |


**Returns**
| Name | Type | Description |
| ---- | ---- | ---- |
| `part` | `core.SceneObject` | The scene object you requested. |

### getAll() 
Gets the complete list of parts with their names. Useful when you want to iterate over all parts of the scene.


**Returns**
| Name | Type | Description |
| ---- | ---- | ---- |
| `parts` | `Object` | A mapping of part names (`String`, keys) to scene objects (`core.SceneObject`, values)  |

### resolveName(sceneObject) 
Gets the part name of the specified sceneObject. A reverse of `get()`.

**Parameters**
| Name | Type | Description | Default |
| ---- | ---- | ---- | ---- |
| `sceneObject` | `core.SceneObject` | The scene object whose name you are requesting. | |


**Returns**
| Name | Type | Description |
| ---- | ---- | ---- |
| `partName` | `String` | The part name of the scene object you requested. |

### getAsset(aliasOrAssetPath) 
Turns the specified alias string or asset path into a proper core.Asset. Mostly used internally, but still public for your convenience.

**Parameters**
| Name | Type | Description | Default |
| ---- | ---- | ---- | ---- |
| `aliasOrAssetpath` | `String` | The alias or full path of the asset. | |


**Returns**
| Name | Type | Description |
| ---- | ---- | ---- |
| `asset` | `core.Asset` | A proper asset instance of what you requested. |

### getAlias(assetName) 
Gets the alias for the specified asset name. A reverse of `getAsset()`.

**Parameters**
| Name | Type | Description | Default |
| ---- | ---- | ---- | ---- |
| `assetName` | `String` | name of the asset you want to get the alias of. | |


**Returns**
| Name | Type | Description |
| ---- | ---- | ---- |
| `alias` | `String` | The alias of the asset Name. If no alias was found, returns the input. |