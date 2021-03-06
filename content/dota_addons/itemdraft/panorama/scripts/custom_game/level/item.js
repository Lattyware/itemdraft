"use strict";

var playerId = Game.GetLocalPlayerID().toString();

var itemPanel = $.GetContextPanel();
var itemName = itemPanel.GetAttributeString("itemName", "");
var cost = itemPanel.GetAttributeInt("cost", -1);
var draftId = itemPanel.GetAttributeString("draftId", "");

var button = itemPanel.GetChild(0);

var image = button.GetChild(0);
image.itemname = itemName;

var costLabel = button.GetChild(1);
costLabel.text = cost;

function buy() {
  GameEvents.SendCustomGameEventToServer("item", {draftId: draftId});
}

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
    }
  }
}
manageNetTable("draft", draftChange)

function gameChange(table, key, value) {
  if (key === playerId) {
    var gold = parseInt(value["gold"]);
    for (var tableItemName in draftedItems) {
      if (tableItemName === itemName) {
        if (parseInt(draftedItems[itemName]["cost"]) < gold) {
          itemPanel.RemoveClass("not-buyable");
        } else {
          itemPanel.AddClass("not-buyable");
        }
      }
    }
  }
}
manageNetTable("game", gameChange);