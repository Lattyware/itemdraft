"use strict";

var panel = $.GetContextPanel();
var order = panel.GetAttributeInt("order", -1);

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