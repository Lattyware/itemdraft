"use strict";

var rootPanel = $.GetContextPanel();

var slot = rootPanel.GetAttributeString("slot", "");
var key = rootPanel.GetAttributeString("key", "");
var ability = rootPanel.GetAttributeString("ability", "");

var button = rootPanel.GetChild(0);
var icon = button.GetChild(0);
var keyLabel = button.GetChild(1);

function abilityChanged(table, playerId, abilities) {
  if (playerId === Game.GetLocalPlayerID().toString()) {
    for (var abilitySlot in abilities) {
      if (abilitySlot === slot) {
        var abilityInfo = abilities[abilitySlot];
        ability = abilityInfo["name"]
        update()
      }
    }
  }
}
manageNetTable("abilities", abilityChanged);

function sell() {
  GameEvents.SendCustomGameEventToServer("sell_ability", {
    ability: encodeAsKey(ability)
  });
}

function update() {
  keyLabel.text = key;
  icon.SetImage("file://{images}/spellicons/" + ability + ".png");
}