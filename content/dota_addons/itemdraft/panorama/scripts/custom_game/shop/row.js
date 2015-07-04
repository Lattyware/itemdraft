"use strict";

var rootPanel = $.GetContextPanel();

var heroName = rootPanel.GetAttributeString("heroName", "");
var abilitiesString = rootPanel.GetAttributeString("abilities", "");

var heroIcon = rootPanel.GetChild(0);

heroIcon.heroname = heroName

function showTooltip() {
  $.DispatchEvent("DOTAShowTextTooltip", heroIcon, $.Localize("#" + heroName));
}

function hideTooltip() {
  $.DispatchEvent("DOTAHideTextTooltip", heroIcon);
}

heroIcon.SetPanelEvent("onmouseover", showTooltip);
heroIcon.SetPanelEvent("onmouseout", hideTooltip);

var abilitesPanel = rootPanel.GetChild(1)

var abilities = []
for (var abilityInfo of abilitiesString.split(";")) {
  var splitAbilityInfo = abilityInfo.split("=");
  var name = splitAbilityInfo[0];
  var ultimate = name.indexOf("!", name.length - 1) !== -1;;
  if (ultimate) {
    name = name.substring(0, name.length - 1)
  }
  abilities.push({
    "name": name,
    "ultimate": ultimate,
    "cost": parseInt(splitAbilityInfo[1])
  });
}

abilities.sort(function(a, b) {
  var aCost = a["cost"];
  var bCost = b["cost"];
  if (aCost < bCost) return -1;
  if (aCost > bCost) return 1;
  return 0;
});

for (var a of abilities) {
  var ability = a["name"];
  var cost = a["cost"];
  var newAbility = $.CreatePanel("Panel", abilitesPanel, "shop-row-" + heroName + "-" + ability);
  newAbility.SetAttributeString("heroName", heroName);
  newAbility.SetAttributeString("ability", ability);
  newAbility.SetAttributeInt("cost", cost);
  newAbility.BLoadLayout("file://{resources}/layout/custom_game/shop/ability.xml", false, false);
  if (a["ultimate"]) {
    newAbility.AddClass("ultimate");
  }
}