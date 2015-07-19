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

var abilitiesPanel = rootPanel.GetChild(1)

var abilities = []
function shopChanged(table, shopHeroName, shopAbilities) {
  if (shopHeroName === heroName) {
    for (var ability in shopAbilities) {
      var abilityDetails = shopAbilities[ability];
      abilityDetails["name"] = ability;
      abilities.push(shopAbilities[ability]);
    }
  }
}
manageNetTable("shop", shopChanged);

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
  var newAbility = $.CreatePanel("Panel", abilitiesPanel, "shop-row-" + heroName + "-" + ability);
  newAbility.SetAttributeString("heroName", heroName);
  newAbility.SetAttributeString("ability", ability);
  newAbility.SetAttributeInt("cost", cost);
  newAbility.BLoadLayout("file://{resources}/layout/custom_game/shop/ability.xml", false, false);
  if (a["ultimate"]) {
    var ultIndicator = $.CreatePanel("Label", newAbility, "shop-row-" + heroName + "-" + ability + "-ult-indicator");
    ultIndicator.text = "Ult";
    ultIndicator.AddClass("ultimate");
  }
}