"use strict";

var playerId = Players.GetLocalPlayer().toString();

var items = {}
function itemsChange(table, name, data) {
  var itemPanel = $("#" + name);
  if (itemPanel != null) {
    var costLabel = $.CreatePanel("Label", itemPanel, name + "-cost");
    costLabel.AddClass("cost");
    costLabel.text = data.cost;
    items[name] = parseInt(data.cost);
  }
}
manageNetTable("items", itemsChange);

function attemptDraft(item) {
  GameEvents.SendCustomGameEventToServer("draft", {draft: item});
}

function draftChange(table, key, value) {
  if (key === playerId) {
    var gold = parseInt(value["gold"]);
    for (var item in items) {
      if (items[item] > gold) {
        $("#" + item).AddClass("not-buyable");
      }
    }
  }
}
manageNetTable("draft", draftChange)