"use strict";

var rootPanel = $.GetContextPanel();

var slot = rootPanel.GetAttributeString("slot", "");
var type = rootPanel.GetAttributeString("type", "");
var ability = rootPanel.GetAttributeString("ability", "");
var sourceHero = rootPanel.GetAttributeString("sourceHero", "");
var upgradeCost = 0;
var value = 0;
var empty = true;

var button = rootPanel.GetChild(0);
var icon = button.GetChild(0);
var slotType = button.GetChild(1);
var upgradeCostLabel = button.GetChild(2);
var valueLabel = button.GetChild(3);

function showTooltip() {
  $.DispatchEvent("DOTAShowAbilityTooltip", icon, ability);
}

function hideTooltip() {
  $.DispatchEvent("DOTAHideAbilityTooltip", icon);
}

icon.SetPanelEvent("onmouseover", showTooltip);
icon.SetPanelEvent("onmouseout", hideTooltip);

slotType.text = type;

var costs = {}
function shopChanged(table, heroName, abilities) {
  var abilityCosts = {}
  for (var name in abilities) {
    var abilityDetails = abilities[name];
    abilityCosts[name] = parseInt(abilityDetails["cost"]) / 2;
  }
  costs[heroName] = abilityCosts;
}
manageNetTable("shop", shopChanged);

function abilityChanged(table, playerId, abilities) {
  if (playerId === Game.GetLocalPlayerID().toString()) {
    for (var abilitySlot in abilities) {
      if (abilitySlot === slot) {
        var abilityInfo = abilities[abilitySlot];
        ability = abilityInfo["name"];
        sourceHero = abilityInfo["sourceHero"];
        empty = abilityInfo["empty"];
        if (!empty) {
          value = parseInt(abilityInfo["sunkCost"]);
          upgradeCost = costs[sourceHero][ability];
        }
        update();
      }
    }
  }
}
manageNetTable("abilities", abilityChanged);

function sell() {
  GameEvents.SendCustomGameEventToServer("sell_ability", {
    ability: ability
  });
}

button.SetPanelEvent("oncontextmenu", sell);

function upgrade() {
  if (sourceHero != undefined) {
    GameEvents.SendCustomGameEventToServer("upgrade_ability", {
      ability: ability,
      sourceHero: sourceHero
    });
  }
}

function update() {
  icon.abilityname = ability;
  var heroEntityIndex = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer());
  icon.contextEntityIndex = Entities.GetAbilityByName(heroEntityIndex, ability);
  upgradeCostLabel.SetHasClass("hidden", empty);
  valueLabel.SetHasClass("hidden", empty);
  upgradeCostLabel.text = upgradeCost;
  valueLabel.text = value;
}