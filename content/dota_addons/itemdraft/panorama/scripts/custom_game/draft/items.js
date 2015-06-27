"use strict";

function items(table, name, data) {
  var costLabel = $.CreatePanel("Label", $("#" + name), name+"-cost");
  costLabel.AddClass("cost");
  costLabel.text = data.cost;
}
manageNetTable("items", items);

function attemptDraft(item) {
  var drafted = {};
  drafted[item] = item;
  GameEvents.SendCustomGameEventToServer("draft", {draft: drafted});
}
