"use strict";

var rootPanel = $.GetContextPanel();

var time = 30;
var draftUnderway = false;

var teamNames = [$.Localize("DOTA_GoodGuys"), $.Localize("DOTA_BadGuys")];
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
var draftersShown = 4;
for (var i = 1; i <= draftersShown; i++) {
  var draftOrderPlayer = $.CreatePanel("Panel", draftOrderPanel, "draft-order-player-" + i.toString());
  draftOrderPlayer.SetAttributeInt("order", i);
  draftOrderPlayer.SetAttributeInt("maxOrder", draftersShown);
  draftOrderPlayer.BLoadLayout("file://{resources}/layout/custom_game/draft/order.xml", false, false);
}

var draftTimer = $("#draft-start-timer");

function decrementTimer()
{
  time -= 1;
  draftTimer.SetDialogVariableInt("time", time);
  $.Schedule(1, decrementTimer);
}

draftTimer.SetDialogVariableInt("time", time);
$.Schedule(1, decrementTimer);
function draftChange(table, key, value) {
  if (draftUnderway) {
    time = 5;
    draftTimer.SetDialogVariableInt("time", time);
  }
  if (key === "draft") {
    if (value["order"] != undefined) {
      if (!draftUnderway) {
        draftUnderway = true;
        draftTimer.AddClass("hidden");
        draftTimer = $("#draft-underway-timer");
        draftTimer.RemoveClass("hidden");
        $("#draft-order").RemoveClass("hidden");
        time = 5;
        draftTimer.SetDialogVariableInt("time", time);
      }
    }
    if (draftUnderway && Object.keys(value["order"]).length === 0) {
      rootPanel.DeleteAsync(0);
    }
  }
}
manageNetTable("draft", draftChange)