"use strict";

GameUI.SetDefaultUIEnabled(
  DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_SHOP, false);
GameUI.SetDefaultUIEnabled(
  DotaDefaultUIElement_t.DOTA_DEFAULT_UI_SHOP_SUGGESTEDITEMS, false);

var shop = $("#shop");
var rows = $("#rows");
var shopButton = $("#shopButton");
var currentView = $("#currentView");

var slots = {};
var slotOrder = ["Q", "W", "E", "D", "F", "R"];

var heroes = [];

adjustForHudFlipping();

function shopChanged(table, heroName, abilities) {
  var newRow = $.CreatePanel("Panel", rows, "shop-row-" + heroName);
  heroes.push(newRow);
  var abilityArray = [];
  for (var ability in abilities) {
    var cost = abilities[ability]["cost"];
    if (abilities[ability]["ultimate"]) {
      ability += "!";
    }
    abilityArray.push(ability + "=" + cost);
  }
  newRow.SetAttributeString("heroName", heroName);
  newRow.SetAttributeString("name", $.Localize("#" + heroName));
  newRow.SetAttributeString("abilities", abilityArray.join(";"));
  newRow.BLoadLayout("file://{resources}/layout/custom_game/shop/row.xml", false, false);
  sort();
}
manageNetTable("shop", shopChanged);

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

function showAbilityShop() {
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
        slots[slot] = ability;
        ability.BLoadLayout("file://{resources}/layout/custom_game/shop/slot.xml", false, false);
      }
    }
  }
}
manageNetTable("abilities", abilityChanged);