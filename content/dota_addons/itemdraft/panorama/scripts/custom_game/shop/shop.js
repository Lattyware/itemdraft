"use strict";

GameUI.SetDefaultUIEnabled(
  DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_SHOP, false);
GameUI.SetDefaultUIEnabled(
  DotaDefaultUIElement_t.DOTA_DEFAULT_UI_SHOP_SUGGESTEDITEMS, false);

var shop = $("#shop");
var shopButton = $("#shopButton");

adjustForHudFlipping();

function abilityChange(table, heroName, abilities) {
  var newRow = $.CreatePanel("Panel", shop, "shop-row-" + heroName);
  var abilityArray = []
  for (var ability in abilities) {
    var cost = abilities[ability]["cost"]
    abilityArray.push(ability + "=" + cost);
  }
  newRow.SetAttributeString("heroName", heroName);
  newRow.SetAttributeString("abilities", abilityArray.join(";"));
  newRow.BLoadLayout("file://{resources}/layout/custom_game/shop/row.xml", false, false);

}
manageNetTable("abilities", abilityChange);

function showAbilityShop() {
  shop.ToggleClass("hidden");
  // We can't detect the settings change, so doing it here means it can at least be sorted when the user clicks.
  adjustForHudFlipping();
}

function adjustForHudFlipping() {
  setForHudFlipping(shop);
  setForHudFlipping(shopButton);
}
