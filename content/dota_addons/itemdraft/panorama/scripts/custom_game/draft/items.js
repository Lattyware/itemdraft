"use strict";

for (var item of CustomNetTables.GetAllTableValues("items")) {
  var name = item.key;
  var data = item.value;
  var costLabel = $.CreatePanel("Label", $("#" + name), name+"-cost");
  costLabel.AddClass("cost");
  costLabel.text = data.cost;
}

function attemptDraft(item) {
  var drafted = {};
  drafted[item] = item;
  GameEvents.SendCustomGameEventToServer("draft", {draft: drafted});
}
