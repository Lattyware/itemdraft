"use strict";

var rootPanel = $.GetContextPanel();
var order = rootPanel.GetAttributeInt("order", -1);
var maxOrder = rootPanel.GetAttributeInt("maxOrder", -1);

var panel = rootPanel.GetChild(0);

if (order === maxOrder) {
  rootPanel.GetChild(1).AddClass("last-fade");
}

function draftChange(table, key, value) {
  if (key === "draft") {
    var playerId = value["order"][order.toString()];
    if (playerId == undefined) {
      panel.AddClass("hidden");
      return;
    }
    var playerInfo = Game.GetPlayerInfo(playerId);
    var steamId = playerInfo["player_steamid"];
    panel.GetChild(0).steamid = steamId;
    panel.GetChild(1).steamid = steamId;
  }
}
manageNetTable("draft", draftChange)