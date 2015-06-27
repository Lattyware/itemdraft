"use strict";

var playerId = Game.GetLocalPlayerID().toString();
var levelButton = $("#levelButton");
var itemSelection = $("#itemSelection");

setForHudFlipping(itemSelection);
setForHudFlipping(levelButton);

var items = {};
function itemChange(table, key, value) {
  items[key] = value;
}
manageNetTable("items", itemChange)

var draftedItems = {};
function draftChange(table, key, value) {
  if (key === playerId) {
    var draft = value["draft"];
    for (var k in draft) {
      var itemName = draft[k];
      draftedItems[itemName] = items[itemName];
      var newItem = $.CreatePanel("Panel", itemSelection, "selection-" + k);
      newItem.SetAttributeString("itemName", itemName);
      newItem.BLoadLayout("file://{resources}/layout/custom_game/level/item.xml", false, false);
    }
  }
}
manageNetTable("draft", draftChange)

function showLevelOptions() {
  itemSelection.ToggleClass("hidden");
  // We can't detect the settings change, so doing it here means it can at least be sorted when the user clicks.
  setForHudFlipping(itemSelection);
  setForHudFlipping(levelButton);
}

function gameChange(table, key, value) {
  if (key === playerId) {
    var gold = parseInt(value["gold"]);
    for (var itemName in draftedItems) {
      if (parseInt(draftedItems[itemName]["cost"]) < gold) {
        levelButton.GetChild(0).text = "Level Up (" + gold.toString() + ")"
        levelButton.RemoveClass("hidden");
      } else {
        levelButton.AddClass("hidden");
        itemSelection.AddClass("hidden");
      }
    }
  }
}
manageNetTable("game", gameChange);