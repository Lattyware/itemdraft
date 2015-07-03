"use strict";

var rootPanel = $.GetContextPanel();

var heroName = rootPanel.GetAttributeString("heroName", "");
var ability = rootPanel.GetAttributeString("ability", "");
var cost = rootPanel.GetAttributeInt("cost", -1);

var button = rootPanel.GetChild(0);
var icon = button.GetChild(0);
var costLabel = button.GetChild(1);

icon.SetImage("file://{images}/spellicons/" + ability + ".png");
costLabel.text = cost.toString();

var tooltip = {
  title: $.Localize("#DOTA_Tooltip_ability_" + ability),
  text: $.Localize("#DOTA_Tooltip_ability_" + ability + "_Description")
}

function buy() {
  GameEvents.SendCustomGameEventToServer("buy_ability", {
    sourceHero: encodeAsKey(heroName),
    ability: encodeAsKey(ability)
  });
}

goldChange();

function goldChange(args) {
  var gold = Players.GetGold(Players.GetLocalPlayer());
  if (gold < cost) {
    rootPanel.AddClass("not-buyable");
  } else {
    rootPanel.RemoveClass("not-buyable");
  }
}
GameEvents.Subscribe("dota_money_changed", goldChange)