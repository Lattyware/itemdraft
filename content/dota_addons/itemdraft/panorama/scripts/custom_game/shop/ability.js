"use strict";

var rootPanel = $.GetContextPanel();

var heroName = rootPanel.GetAttributeString("heroName", "");
var ability = rootPanel.GetAttributeString("ability", "");
var cost = rootPanel.GetAttributeInt("cost", -1);

var button = rootPanel.GetChild(0);
var icon = button.GetChild(0);
var costLabel = button.GetChild(1);
var subabilitiesPanel = button.GetChild(2);

icon.abilityname = ability
costLabel.text = cost.toString();

function showTooltip() {
  $.DispatchEvent("DOTAShowAbilityTooltip", icon, ability);
}

function hideTooltip() {
  $.DispatchEvent("DOTAHideAbilityTooltip", icon);
}

icon.SetPanelEvent("onmouseover", showTooltip);
icon.SetPanelEvent("onmouseout", hideTooltip);

function buy() {
  GameEvents.SendCustomGameEventToServer("buy_ability", {
    sourceHero: heroName,
    ability: ability
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

var subabilities = []
function shopChanged(table, shopHeroName, shopAbilities) {
  if (shopHeroName === heroName) {
    for (var abilityName in shopAbilities) {
      if (abilityName === ability) {
        var subs = shopAbilities[abilityName]["subabilities"];
        for (var key in subs) {
          var sub = subs[key];
          var subability = $.CreatePanel("DOTAAbilityImage", subabilitiesPanel,
            "shop-row-" + heroName + "-" + ability + "-" + sub);
          subability.abilityname = sub;
          subability.SetPanelEvent("onmouseover",
            function() {$.DispatchEvent("DOTAShowAbilityTooltip", subability, sub)});
          subability.SetPanelEvent("onmouseout",
            function() {$.DispatchEvent("DOTAHideAbilityTooltip", subability)});
        }
      }
    }
  }
}
manageNetTable("shop", shopChanged);