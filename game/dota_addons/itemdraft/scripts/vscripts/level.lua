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
  local item = decodeFromKey(args["item"])

  -- TODO: Check valid.

  local player = PlayerResource:GetPlayer(playerId)
  local hero = player:GetAssignedHero()
  local item = CreateItem(item, hero, hero)
  hero:AddItem(item)
end

-- A callback at the start to give the initial level up and remove the hero's default skills.
function heroPicked(event)
  local player = EntIndexToHScript(event.player)
  levelUp(player)
  local hero = EntIndexToHScript(event.heroindex)
  local done = false
  local i = 0
  while not done do
    local ability = hero:GetAbilityByIndex(i)
    if ability == nil then
      done = true
    else
      hero:RemoveAbility(ability:GetAbilityName())
    end
    i = i + 1
  end
end

-- A callback to level up the player.
function heroGainedLevel(event)
  local player = EntIndexToHScript(event.player)
  levelUp(player)
end



