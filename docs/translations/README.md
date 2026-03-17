# Translations

A module for managing texts in multiple languages.

For a detailed documentation of the public functions, please see the JSDoc comments in [src/translations/Translations.js](src/translations/Translations.js).

This module can store translations from multiple *sources* which are stored in a single key-language-value json hierarchy.

**Keys are unique across the whole module**. When you add a source which contains a key that is already known, the old value will be **overwritten** by the new value.

The user can define custom behavior for when a translation text could not be found by overriding the `notFoundFunction` member.

## Using Translations in VisLogic

```javascript
//any file in vislogic
//import
import {Translations} from "./VisLogicUtilities/src/translations/Translations.js";
//use
Translations.currentLanguage = "DE";
Translations.addSource({
    Key_A: {
        DE: "A_DE",
        EN: "A_EN"
    },
    Key_B: {
        DE: "B_DE",
        EN: "B_EN"
    }
});
let a = Translations.get("Key_A"); // A_DE
let b = Translations.get("Key_B", "EN"); //B_EN
```

## Source format
A source is a JSON-Object with the following hierarchy:
* Top-level property names are names for the translation texts also known as *keys*
* Top-level values are objects containing the languages and texts
* Second-level property names are the names of the *languages*
* Second-level values are strings representing the actual translation

Example:

```json
{
  "PdfCustomerNameText": {
    "DE": "Kunde",
    "EN": "Customer",
    "FR": "client"
  },
  "PdfDateText": {
    "DE": "Einsatztermin",
    "EN": "Use Date",
    "FR": "date de dépôt"
  }
}
```

## Defining custom behavior
Per default, if the key or the key/language combination cannot be found, the key will be returned by `get`. This behavior can be overriden by redefining `notFoundFunction`.

```javascript
let a = Translations.get("UnkownKey"); // a => "UnknownKey"
Translations.notFoundFunction = function(key, language) {
  return "";	
};
let b = Translations.get("UnknownKey"); // b => ""
Translations.notFoundFunction = function(key, language) {
  //if there is no known key, return the key
  //if there is a key but no language, return the text in english (EN)
  //else return ""
  let map = Translations.getMap();
  if (!map[key])
    return key;
  if (!map[key][language] && map[key]["EN"])
    return map[key]["EN"];
  return "";
};
let c = Translations.get("UnknownKey"); // c => "UnknownKey"
```

## Best Practices
Since editing your *sources* manually is cumbersome, it is recommended that you edit/manage your translations as a Microsoft Excel file. This is also what most customers will use in case they manage the translations on their own.  
You can then use a tool like [TranslationsImporter](https://git.tacton.com/external/TranslationsConverter) to convert your excel file to JSON.
