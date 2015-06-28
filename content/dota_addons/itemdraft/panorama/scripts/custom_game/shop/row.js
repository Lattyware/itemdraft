"use strict";

var rootPanel = $.GetContextPanel();

var heroName = rootPanel.GetAttributeString("heroName", "");
var abilitiesString = rootPanel.GetAttributeString("abilities", "");

rootPanel.GetChild(0).heroname = heroName
var abilitesPanel = rootPanel.GetChild(1)

for (var abilityInfo of abilitiesString.split(";")) {
  var splitAbilityInfo = abilityInfo.split("=");
  var ability = splitAbilityInfo[0];
  var cost = parseInt(splitAbilityInfo[1]);
  var newAbility = $.CreatePanel("Panel", abilitesPanel, "shop-row-" + heroName + "-" + ability);
  newAbility.SetAttributeString("heroName", heroName);
  newAbility.SetAttributeString("ability", ability);
  newAbility.SetAttributeInt("cost", cost);
  newAbility.BLoadLayout("file://{resources}/layout/custom_game/shop/ability.xml", false, false);
}
