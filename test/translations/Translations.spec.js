import {Translations} from "../../src/translations/Translations.js";
import { expect } from "chai";

beforeEach(function () {
	Translations.reset();
});

describe("Translations", function () {
	it("reset resets all state to its default values", function () {
		Translations.addSource({Key_A: {DE: "A"}});
		Translations.currentLanguage = "DE";
		Translations.reset();
		expect(Translations.currentLanguage).to.equal("default");
		expect(Translations.getMap()).to.deep.equal({});
	});
	it("addSource adds the source to the internal state", function () {
		let sourceA = {Key_A: {DE: "A_DE", EN: "A_EN"}, Key_B: {DE: "B_DE"}};
		Translations.addSource(sourceA);
		expect(Translations.getMap()).to.deep.equal({
			Key_A: {
				DE: "A_DE",
				EN: "A_EN"
			},
			Key_B: {
				DE: "B_DE"
			}
		});
	});
	it("addSource may overwrite existing values", function () {
		let sourceA = {Key_A: {DE: "A_DE", EN: "A_EN"}, Key_B: {DE: "B_DE"}};
		let sourceB = {Key_A: {EN: "A_EN_2"}, Key_B: {EN: "B_EN"}};
		Translations.addSource(sourceA);
		Translations.addSource(sourceB);
		expect(Translations.getMap()).to.deep.equal({
			Key_A: {
				DE: "A_DE",
				EN: "A_EN_2"
			},
			Key_B: {
				DE: "B_DE",
				EN: "B_EN"
			}
		});
	});
	it("the order of addSource calls is important", function () {
		let sourceA = {Key_A: {DE: "A_DE", EN: "A_EN"}, Key_B: {DE: "B_DE"}};
		let sourceB = {Key_A: {EN: "A_EN_2"}, Key_B: {EN: "B_EN"}};
		Translations.addSource(sourceB);
		Translations.addSource(sourceA);
		expect(Translations.getMap()).to.deep.equal({
			Key_A: {
				DE: "A_DE",
				EN: "A_EN"
			},
			Key_B: {
				DE: "B_DE",
				EN: "B_EN"
			}
		});
	});
	it("addSources does the same as calling addSource multiple Times", function () {
		let sourceA = {Key_A: {DE: "A"}};
		let sourceB = {Key_B: {DE: "B"}};
		Translations.addSources([sourceA, sourceB]);
		let state = JSON.parse(JSON.stringify(Translations.getMap())); //make a copy
		Translations.reset();
		Translations.addSource(sourceA);
		Translations.addSource(sourceB);
		let state2 = JSON.parse(JSON.stringify(Translations.getMap()));
		expect(state).to.deep.equal(state2);
	});
	it("get returns the translated value with optional language", function () {
		let source = {Key_A: {DE: "A"}};
		Translations.addSource(source);
		expect(Translations.get("Key_A", "DE")).to.equal("A");
		Translations.currentLanguage = "DE";
		expect(Translations.get("Key_A")).to.equal("A");
	});
	it("get returns the key via notFoundFunction if it could not find a result", function () {
		let source = {Key_A: {DE: "A"}};
		Translations.addSource(source);
		expect(Translations.get("Key_A")).to.equal("Key_A");
	});
	it("notFoundFunction can be overwritten", function () {
		let source = {Key_A: {DE: "A_DE", EN: "A_EN"}};
		Translations.addSource(source);
		Translations.notFoundFunction = function () {
			return "B";
		};
		expect(Translations.get("Key_A")).to.equal("B");

		//if there is no known key, return the key
		//if there is a key but no language, return the key in a default language
		//else return ""
		let fallbackLanguage = "EN";
		Translations.notFoundFunction = function (key, language) {
			let map = Translations.getMap();
			if (!map[key])
				return key;
			if (!map[key][language] && map[key][fallbackLanguage])
				return map[key][fallbackLanguage];
			return "";
		};
		expect(Translations.get("Key_A")).to.equal("A_EN");
		expect(Translations.get("Key_B")).to.equal("Key_B");
	})
});
