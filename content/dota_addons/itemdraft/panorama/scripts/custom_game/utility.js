"use strict";

/**
 * Takes a table and a callback, calling the callback for all existing table entries, and registering it to be called
 * for future entries.
 */
function manageNetTable(table, callback) {
  for (var keyValue of CustomNetTables.GetAllTableValues(table)) {
    callback(table, keyValue.key, keyValue.value);
  }
  CustomNetTables.SubscribeNetTableListener(table, callback);
}

/**
 * Takes a map with key of string integer indexes (from "1") and produces an array.
 */
function toArray(map) {
  array = [];
  map.forEach(function (key, value) {
    array[parseInt(key) - 1] = value;
  });
  return array;
}

/**
 * Flip/unflip the UI as per user preference to account for the minimap-on-right option.
 */
function setForHudFlipping(panel) {
  panel.SetHasClass("hud-flipped", Game.IsHUDFlipped())
}
