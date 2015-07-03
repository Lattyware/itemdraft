--
-- Handles level ups and item purchasing from experience.
--

-- Register the listeners for events to do with leveling and item purchasing.
function registerLevelCallbacks()
  ListenToGameEvent("dota_player_pick_hero", heroPicked, nil)
  ListenToGameEvent("dota_player_gained_level", heroGainedLevel, nil)
  CustomGameEventManager:RegisterListener("item", item)
end

-- Do an item draft level up, and stop the normal ability points from being given to the player.
function levelUp(player)
  player:GetAssignedHero():SetAbilityPoints(0)
  local playerId = player:GetPlayerID()
  local value = CustomNetTables:GetTableValue("game", tostring(playerId))
  value["gold"] = value["gold"] + levelGold / 25
  CustomNetTables:SetTableValue("game", tostring(playerId), value)
end

-- An item event was recieved from the user.
function item(_, args)
  local playerId = args["PlayerID"]
  local itemName = decodeFromKey(args["item"])

  local draft = destringTable(CustomNetTables:GetTableValue("draft", tostring(playerId))["draft"])
  local item = CustomNetTables:GetTableValue("items", itemName)
  local value = CustomNetTables:GetTableValue("game", tostring(playerId))
  local gold = value["gold"]
  local cost = item["cost"]

  -- TODO: Check valid.

  local leveled = destringTable(value["leveled"])
  local nextOne = nextNotIn(draft, itemName, keys(leveled, itemName))

  if nextOne == nil then
    return
  end
  if gold < cost then
    return
  end

  leveled[#leveled + 1] = nextOne

  value["gold"] = gold - cost
  value["leveled"] = leveled

  CustomNetTables:SetTableValue("game", tostring(playerId), value)

  local player = PlayerResource:GetPlayer(playerId)
  local hero = player:GetAssignedHero()
  local itemInstance = CreateItem(itemName, hero, hero)
  hero:AddItem(itemInstance)
end

-- Get the next key not in the given set.
function nextNotIn(tbl, item, exclude)
  for key, value in pairs(tbl) do
    if value == item and not exclude[key] then
      return key
    end
  end
  return nil
end

-- A callback at the start to give the initial level up and remove the hero's default skills.
function heroPicked(event)
  local player = EntIndexToHScript(event.player)
  levelUp(player)
  local hero = EntIndexToHScript(event.heroindex)
  removeAbilities(hero)
end

-- A callback to level up the player.
function heroGainedLevel(event)
  local player = EntIndexToHScript(event.player)
  levelUp(player)
end



