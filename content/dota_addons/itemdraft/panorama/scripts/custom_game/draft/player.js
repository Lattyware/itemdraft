"use strict";

var playerPanel = $.GetContextPanel();
var playerId = playerPanel.GetAttributeInt("id", -1);
var steamId = playerPanel.GetAttributeString("steamId", "");

var playerInfoPanel = playerPanel.GetChild(0);
var avatar = playerInfoPanel.GetChild(0);
var username = playerInfoPanel.GetChild(1);
var remainingMoneyLabel = playerInfoPanel.GetChild(2);

var draftedItems = [];

avatar.steamid = steamId;
username.steamid = steamId;

var draftedItemsPanel = playerPanel.GetChild(1);
var row0 = draftedItemsPanel.GetChild(0);
row0.SetAttributeInt("items", 0);
var row1 = draftedItemsPanel.GetChild(1);
row1.SetAttributeInt("items", 0);

function draftChange(table, key, value) {
  if (key === playerId.toString()) {
    remainingMoneyLabel.text = value["gold"];
    var draft = value["draft"];
    var newItems = [];
    for (var key in draft) {
      newItems.push(draft[key]);
    }
    for (var existingItem of draftedItems) {
      // Yes, this is array.remove(). Thanks JS.
      var index = newItems.indexOf(existingItem);
      if (index > -1) {
        newItems.splice(index, 1);
      }
    }
    var itemNumber = draftedItems.length;
    for (var item of newItems) {
      var row = row0;
      if (row0.GetAttributeInt("items", -1) >= 14) {
        row = row1;
      }
      var itemImage = $.CreatePanel("Image", row, "player-drafted-item-" + (itemNumber++).toString());
      var itemName = item.substring(5, item.length);
      itemImage.SetImage("file://{images}/" + itemName + ".png");
      itemImage.AddClass("drafted-item");
    }
    draftedItems = draftedItems.concat(newItems);
  }
}
manageNetTable("draft", draftChange)
