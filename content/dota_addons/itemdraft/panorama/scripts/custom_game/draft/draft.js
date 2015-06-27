"use strict";

var rootPanel = $.GetContextPanel();

var teamNames = ["Radiant", "Dire"];
var nextTeamName = 0;
for (var teamId of Game.GetAllTeamIDs()) {
  var team = teamNames[nextTeamName++];
  var teamPanel = $.CreatePanel("Panel", $("#teams"), "team" + teamId);
  teamPanel.SetAttributeString("name", team);
  teamPanel.SetAttributeInt("id", teamId);
  teamPanel.BLoadLayout("file://{resources}/layout/custom_game/draft/team.xml", false, false);
}

var itemsPanel = $.CreatePanel("Panel", rootPanel, "items");
itemsPanel.BLoadLayout("file://{resources}/layout/custom_game/draft/items.xml", false, false);

var draftOrderPanel = $("#draft-order");
for (var i = 1; i <= 3; i++) {
    var draftOrderPlayer = $.CreatePanel("Panel", draftOrderPanel, "draft-order-player-" + i.toString());
    draftOrderPlayer.SetAttributeInt("order", i);
    draftOrderPlayer.BLoadLayout("file://{resources}/layout/custom_game/draft/order.xml", false, false);
}

function draftChange(table, key, value) {
  if (key === "draft") {
    if (Object.keys(value["order"]).length === 0) {
      rootPanel.DeleteAsync(0);
    }
  }
}
manageNetTable("draft", draftChange)