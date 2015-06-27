"use strict";

var teamPanel = $.GetContextPanel();
var teamName = teamPanel.GetAttributeString("name", "");
teamPanel.GetChild(0).text = teamName;
var teamId = teamPanel.GetAttributeInt("id", -1);

var playersPanel = teamPanel.GetChild(1);

for (var playerId of Game.GetAllPlayerIDs()) {
  var playerInfo = Game.GetPlayerInfo(playerId);
  if (playerInfo["player_team_id"] === teamId) {
    var teamPanel = $.CreatePanel("Panel", playersPanel, "player" + playerId);
    teamPanel.SetAttributeInt("id", playerId);
    teamPanel.SetAttributeString("steamId", playerInfo["player_steamid"]);
    teamPanel.BLoadLayout("file://{resources}/layout/custom_game/draft/player.xml", false, false);
  }
}
