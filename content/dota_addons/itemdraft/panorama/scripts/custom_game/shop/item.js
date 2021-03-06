"use strict";

var rootPanel = $.GetContextPanel();

var item = rootPanel.GetAttributeString("item", "");
var cost = rootPanel.GetAttributeInt("cost", -1);

var button = rootPanel.GetChild(0);
var icon = button.GetChild(0);
var costLabel = button.GetChild(1);
var stockLabel = button.GetChild(2);

var playerTeam = Game.GetLocalPlayerInfo()["player_team_id"];

icon.itemname = item
costLabel.text = cost;

function showTooltip() {
  $.DispatchEvent("DOTAShowAbilityTooltip", icon, item);
}

function hideTooltip() {
  $.DispatchEvent("DOTAHideAbilityTooltip", icon);
}

icon.SetPanelEvent("onmouseover", showTooltip);
icon.SetPanelEvent("onmouseout", hideTooltip);

function stockChange(table, key, value) {
  if (key === item) {
    var currentStock = value[playerTeam];
    rootPanel.SetHasClass("out-of-stock", currentStock < 1);
    stockLabel.text = currentStock;
  }
}
manageNetTable("stock", stockChange)

function buy() {
  GameEvents.SendCustomGameEventToServer("buy_item", {
    item: item
  });
}

function goldChange(args) {
  var gold = Players.GetGold(Players.GetLocalPlayer());
  if (gold < cost) {
    rootPanel.AddClass("not-buyable");
  } else {
    rootPanel.RemoveClass("not-buyable");
  }
}
GameEvents.Subscribe("dota_money_changed", goldChange)