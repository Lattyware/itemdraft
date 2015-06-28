"use strict";

var itemPanel = $.GetContextPanel();
var itemName = itemPanel.GetAttributeString("itemName", "");

var button = itemPanel.GetChild(0);
button.onactivate = "buy(" + itemName + ")";

var image = button.GetChild(0);
var itemShortName = itemName.substring(5, itemName.length);
image.SetImage("file://{images}/items/" + itemShortName + ".png");

function buy() {
  GameEvents.SendCustomGameEventToServer("item", {item: encodeAsKey(itemName)});
}
