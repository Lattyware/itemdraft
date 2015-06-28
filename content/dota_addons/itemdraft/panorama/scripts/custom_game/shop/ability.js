"use strict";

var rootPanel = $.GetContextPanel();

var heroName = rootPanel.GetAttributeString("heroName", "");
var ability = rootPanel.GetAttributeString("ability", "");
var cost = rootPanel.GetAttributeInt("cost", -1);

var button = rootPanel.GetChild(0);
var icon = button.GetChild(0);
var costLabel = button.GetChild(1);

icon.SetImage("file://{images}/abilities/" + ability + ".png");
costLabel.text = cost.toString();

function buy() {
  GameEvents.SendCustomGameEventToServer("ability", {
    sourceHero: encodeAsKey(heroName),
    ability: encodeAsKey(ability)
  });
}