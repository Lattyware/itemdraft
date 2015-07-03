"use strict";

var playerId = Game.GetLocalPlayerID().toString();
var levelButton = $("#levelButton");
var itemSelection = $("#itemSelection");

adjustForHudFlipping()

var items = {};
function itemChange(table, key, value) {
  items[key] = value;
}
manageNetTable("items", itemChange)

var draftKeys = {};
var draftedItems = {};
function draftChange(table, key, value) {
  if (key === playerId) {
    var draft = value["draft"];
    draftKeys = draft;
    for (var k in draft) {
      var itemName = draft[k];
      if (!(itemName in draftedItems)) {
        draftedItems[itemName] = items[itemName];
        var newItem = $.CreatePanel("Panel", itemSelection, "selection-" + k);
        newItem.SetAttributeString("itemName", itemName);
        newItem.SetAttributeInt("cost", items[itemName]["cost"]);
        newItem.BLoadLayout("file://{resources}/layout/custom_game/level/item.xml", false, false);
      }
    }
  }
}
manageNetTable("draft", draftChange)

function showLevelOptions() {
  itemSelection.ToggleClass("hidden");
  // We can't detect the settings change, so doing it here means it can at least be sorted when the user clicks.
  adjustForHudFlipping()
}

function gameChange(table, key, value) {
  if (key === playerId) {
    var leveled = value["leveled"];
    for (var key in leveled) {
      var leveledItemKey = leveled[key];
      delete draftedItems[draftKeys[leveledItemKey]];
      $("#selection-" + leveledItemKey).AddClass("hidden");
    }
    var gold = parseInt(value["gold"]);
    levelButton.GetChild(0).text = "Level Up (" + gold.toString() + ")"
    for (var itemName in draftedItems) {
      if (parseInt(draftedItems[itemName]["cost"]) < gold) {
        levelButton.RemoveClass("hidden");
      } else {
        levelButton.AddClass("hidden");
        itemSelection.AddClass("hidden");
      }
    }
  }
}
manageNetTable("game", gameChange);


function adjustForHudFlipping() {
  setForHudFlipping(itemSelection);
  setForHudFlipping(levelButton);
}