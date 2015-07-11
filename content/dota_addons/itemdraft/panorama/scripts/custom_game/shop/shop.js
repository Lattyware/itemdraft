"use strict";

GameUI.SetDefaultUIEnabled(
  DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_SHOP, false);
GameUI.SetDefaultUIEnabled(
  DotaDefaultUIElement_t.DOTA_DEFAULT_UI_SHOP_SUGGESTEDITEMS, false);

var shop = $("#shop");
var rows = $("#rows");
var shopButton = $("#shop-button");
var currentView = $("#current-view");
var searchBox = $("#search-box");
var itemTabContent = $("#item-tab-content");
var abilityTabContent = $("#ability-tab-content");

var itemTab = $("#item-tab");
var abilityTab = $("#ability-tab");

function swapToItems() {
  abilityTab.SetSelected(false);
  abilityTabContent.SetHasClass("hidden", true);
  itemTabContent.SetHasClass("hidden", false);
}

function swapToAbilities() {
  itemTab.SetSelected(false);
  itemTabContent.SetHasClass("hidden", true);
  abilityTabContent.SetHasClass("hidden", false);
}

itemTab.SetPanelEvent("onselect", swapToItems);
abilityTab.SetPanelEvent("onselect", swapToAbilities);

abilityTab.SetSelected(true);

searchBox.RaiseChangeEvents(true);

var slots = {};
var slotOrder = ["Q", "W", "E", "D", "F", "R"];

var heroes = [];

adjustForHudFlipping();

var synonyms = {};
function synonymsChanged(table, heroName, heroSynonyms) {
  synonyms[heroName] = heroSynonyms;
}
manageNetTable("search_synonyms", synonymsChanged);

var heroSearchIndex = {};

function shopChanged(table, heroName, abilities) {
  var newRow = $.CreatePanel("Panel", rows, "shop-row-" + heroName);
  heroes.push(newRow);
  var abilityArray = [];
  for (var ability in abilities) {
    heroSearchIndex[$.Localize("#" + ability).toLowerCase()] = newRow;
    var cost = abilities[ability]["cost"];
    if (abilities[ability]["ultimate"]) {
      ability += "!";
    }
    abilityArray.push(ability + "=" + cost);
  }
  var localHeroName = $.Localize("#" + heroName);
  heroSearchIndex[localHeroName.toLowerCase()] = newRow;
  for (var synonym in synonyms[heroName]) {
    heroSearchIndex[synonyms[heroName][synonym].toLowerCase()] = newRow;
  }
  newRow.SetAttributeString("heroName", heroName);
  newRow.SetAttributeString("name", localHeroName);
  newRow.SetAttributeString("abilities", abilityArray.join(";"));
  newRow.BLoadLayout("file://{resources}/layout/custom_game/shop/row.xml", false, false);
  sort();
}
manageNetTable("shop", shopChanged);

function itemsChanged(table, groupName, group) {
  var newGroup = $.CreatePanel("Panel", itemTabContent, "shop-group-" + groupName);
  newGroup.AddClass("item-group");
  var sortedItems = [];
  for (var item in group) {
    sortedItems.push(item);
  }
  sortedItems.sort(function(a, b) {
    var aCost = group[a]["ItemCost"];
    var bCost = group[b]["ItemCost"];
    if (aCost < bCost) return -1;
    if (aCost > bCost) return 1;
    return 0;
  });
  for (var item of sortedItems) {
    var newItem = $.CreatePanel("Panel", newGroup, "shop-item-" + item);
    newItem.SetAttributeString("item", item);
    newItem.SetAttributeInt("cost", group[item]["ItemCost"]);
    newItem.BLoadLayout("file://{resources}/layout/custom_game/shop/item.xml", false, false);
  }
}
manageNetTable("shop_items", itemsChanged);

function sort() {
  heroes.sort(function(a, b) {
    var aName = a.GetAttributeString("name", "");
    var bName = b.GetAttributeString("name", "");
    if (aName < bName) return -1;
    if (aName > bName) return 1;
    return 0;
  });
  for (var i = 1; i < heroes.length; i++) {
    rows.MoveChildAfter(heroes[i], heroes[i - 1]);
  }
}

function toggleAbilityShop() {
  shop.ToggleClass("hidden");
  // We can't detect the settings change, so doing it here means it can at least be sorted when the user clicks.
  adjustForHudFlipping();
}

function adjustForHudFlipping() {
  setForHudFlipping(shop);
  setForHudFlipping(shopButton);
}

function abilityChanged(table, playerId, abilities) {
  if (playerId === Game.GetLocalPlayerID().toString()) {
    for (var slot of slotOrder) {
      if ((slot in abilities) && !(slot in slots)) {
        var abilityInfo = abilities[slot];
        var ability = $.CreatePanel("Panel", currentView, "slot_" + slot);
        ability.SetAttributeString("slot", slot);
        ability.SetAttributeString("key", slot);
        ability.SetAttributeString("ability", abilityInfo["name"]);
        ability.SetAttributeString("sourceHero", abilityInfo["sourceHero"]);
        slots[slot] = ability;
        ability.BLoadLayout("file://{resources}/layout/custom_game/shop/slot.xml", false, false);
      }
    }
  }
}
manageNetTable("abilities", abilityChanged);

function removePlaceholder() {
  searchBox.GetChild(0).SetHasClass("hidden", true);
}

function onSearch() {
  for (var row of heroes) {
    row.SetHasClass("hidden", true)
  }
  for (var name in heroSearchIndex) {
    var row = heroSearchIndex[name];
    if (name.search(searchBox.text.toLowerCase()) != -1) {
      row.SetHasClass("hidden", false)
    }
  }
}

function clearSearch() {
  searchBox.SetAcceptsFocus(false);
  searchBox.SetAcceptsFocus(true);
  for (var row of heroes) {
    row.SetHasClass("hidden", false)
  }
  searchBox.text = "";
  searchBox.GetChild(0).SetHasClass("hidden", false);
}