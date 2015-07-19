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

function draftChange(table, key, value) {
  if (key === playerId.toString()) {
    remainingMoneyLabel.text = value["gold"];
    var draft = value["draft"];
    var newItems = [];
    for (var key in draft) {
      newItems.push(draft[key]);
    }
    for (var existingItem of draftedItems) {
      var index = newItems.indexOf(existingItem);
      if (index > -1) {
        newItems.splice(index, 1);
      }
    }
    var itemNumber = draftedItems.length;
    for (var item of newItems) {
      var itemImage = $.CreatePanel("DOTAItemImage", draftedItemsPanel, "player-drafted-item-" + (itemNumber++).toString());
      itemImage.itemname = item;
      itemImage.AddClass("drafted-item");
    }
    draftedItems = draftedItems.concat(newItems);
  }
  if (key === "draft") {
    playerPanel.SetHasClass("current-drafter", value["order"][1] === playerId)
  }
}
manageNetTable("draft", draftChange)
