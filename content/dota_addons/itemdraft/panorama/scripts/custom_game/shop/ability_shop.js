"use strict";

GameUI.SetDefaultUIEnabled(
  DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_SHOP, false);
GameUI.SetDefaultUIEnabled(
  DotaDefaultUIElement_t.DOTA_DEFAULT_UI_SHOP_SUGGESTEDITEMS, false);


function abilityChange(table, key, value) {
  //$.Msg(key, value);
}
manageNetTable("abilities", abilityChange);