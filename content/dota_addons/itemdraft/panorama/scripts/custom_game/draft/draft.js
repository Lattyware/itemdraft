"use strict";

var rootPanel = $.GetContextPanel();

var time = 30;
var draftUnderway = false;

var draftTimer = $("#draft-timer");
var draftTimerDescription = $("#draft-timer-description");

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

var draftOrderInnerPanel = $("#draft-order");
var draftOrderPanel = $("#draft-order-panel");
var draftersShown = 4;
for (var i = 1; i <= draftersShown; i++) {
  var draftOrderPlayer = $.CreatePanel("Panel", draftOrderInnerPanel, "draft-order-player-" + i.toString());
  draftOrderPlayer.SetAttributeInt("order", i);
  draftOrderPlayer.SetAttributeInt("maxOrder", draftersShown);
  draftOrderPlayer.BLoadLayout("file://{resources}/layout/custom_game/draft/order.xml", false, false);
}

function decrementTimer()
{
  setTime(time - 1);
  $.Schedule(1, decrementTimer);
}

setTime(time);
$.Schedule(1, decrementTimer);
function draftChange(table, key, value) {
  if (draftUnderway) {
    setTime(5);
  }
  if (key === "draft") {
    if (value["order"] != undefined) {
      if (!draftUnderway) {
        draftUnderway = true;
        draftOrderPanel.RemoveClass("hidden");
        draftTimerDescription.text = $.Localize("#draftunderwaydescription");
        setTime(5);
      }
    }
    if (draftUnderway && Object.keys(value["order"]).length === 0) {
      rootPanel.DeleteAsync(0);
    }
  }
}
manageNetTable("draft", draftChange)

function setTime(value) {
  time = value;
  draftTimer.SetDialogVariableInt("time", time);
}