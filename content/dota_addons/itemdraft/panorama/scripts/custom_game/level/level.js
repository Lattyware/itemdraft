"use strict";

var playerId = Game.GetLocalPlayerID().toString();
var levelButton = $("#levelButton");
var itemSelection = $("#itemSelection");

setForHudFlipping(itemSelection);
setForHudFlipping(levelButton);

var items = {};
for (var item of CustomNetTables.GetAllTableValues("items")) {
  items[item.key] = item.value;
}

var draftedItems = {};
for (var keyValue of CustomNetTables.GetAllTableValues("draft")) {
  if (keyValue.key === playerId) {
    var draft = keyValue.value["draft"];
    for (var key in draft) {
      var itemName = draft[key];
      draftedItems[itemName] = items[itemName];
      var newItem = $.CreatePanel("Panel", itemSelection, "selection-" + key);
      newItem.SetAttributeString("itemName", itemName);
      newItem.BLoadLayout("file://{resources}/layout/custom_game/level/item.xml", false, false);
    }
  }
}

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