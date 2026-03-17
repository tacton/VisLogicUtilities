let Translations = {};

let _map = {};
/**
 * Use this value as a default if no explicit language parameter is present in the get function
 * @type {string}
 */
Translations.currentLanguage = "default";

/**
 * Resets all state of this module
 */
Translations.reset = function () {
	Translations.currentLanguage = "default";
	Translations.notFoundFunction = defaultNotFoundFunction;
	_map = {};
};
/**
 * Adds multiple sources at once
 * @param {Object[]} sources - Array of JSON-Objects. See addSource
 */
Translations.addSources = function (sources) {
	for (let i = 0; i < sources.length; i++)
		Translations.addSource(sources[i]);
};

/**
 * Adds a translation data source
 * @param {Object} source - A JSON-Representation of a translation object. For a detailed description of the source format, see README.md
 */
Translations.addSource = function (source) {
	for (let key in source) {
		if (!source.hasOwnProperty(key))
			continue;
		if (!_map[key])
			_map[key] = {};
		for (let language in source[key]) {
			if (!source[key].hasOwnProperty(language))
				continue;
			_map[key][language] = source[key][language];
		}
	}
};

/**
 * Translates a text by key and language
 * @param {string} key - The name of the text to be translated
 * @param {string} language - The name of the language for which the key should be translated
 * @returns {string} The translated text
 */
Translations.get = function (key, language) {
	language = language || Translations.currentLanguage;
	let result = _map[key];
	if (!result || !result[language])
		return Translations.notFoundFunction(key, language);
	return result[language];
};
/**
 * Function which is called if a key/language combination was not found in get
 * @type {function}
 * @param {string} key - see key parameter in get
 * @param {string} language - see language parameter in get
 * @returns {string} the translated text
 */
Translations.notFoundFunction = defaultNotFoundFunction;

function defaultNotFoundFunction (key/*, language*/) {
	return key;
}

/**
 * Returns the complete translation map object. Useful if you want to send it to your GUI.
 * @returns {Object}
 */
Translations.getMap = function () {
	return _map;
};
export {Translations};