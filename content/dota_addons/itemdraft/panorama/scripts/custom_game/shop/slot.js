"use strict";

var rootPanel = $.GetContextPanel();

var slot = rootPanel.GetAttributeString("slot", "");
var key = rootPanel.GetAttributeString("key", "");
var ability = rootPanel.GetAttributeString("ability", "");
var sourceHero = rootPanel.GetAttributeString("sourceHero", "");

var button = rootPanel.GetChild(0);
var icon = button.GetChild(0);
var keyLabel = button.GetChild(1);

function showTooltip() {
  $.DispatchEvent("DOTAShowAbilityTooltip", icon, ability);
}

function hideTooltip() {
  $.DispatchEvent("DOTAHideAbilityTooltip", icon);
}

icon.SetPanelEvent("onmouseover", showTooltip);
icon.SetPanelEvent("onmouseout", hideTooltip);

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

button.SetPanelEvent("oncontextmenu", sell);

function upgrade() {
  GameEvents.SendCustomGameEventToServer("upgrade_ability", {
    ability: encodeAsKey(ability),
    sourceHero: encodeAsKey(sourceHero)
  });
}

function update() {
  keyLabel.text = key;
  icon.abilityname = ability;
  var heroEntityIndex = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer());
  icon.contextEntityIndex = Entities.GetAbilityByName(heroEntityIndex, ability);
}