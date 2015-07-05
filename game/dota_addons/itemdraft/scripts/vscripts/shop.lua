--
-- Handles the shop for abilities.
--

require("utility")

abilitySlots = {"Q", "W", "E", "D", "F", "R"}
ultimateAbilitySlot = {Q = false, W = false, E = false, D = false, F = false, R = true }
placeholders = {Q = "invoker_empty1", W = "invoker_empty2", E = "doom_bringer_empty1",
                D = "doom_bringer_empty2", F = "wisp_empty1", R = "wisp_empty2"}

-- Register the listeners for events to do with drafting.
function registerShopCallbacks()
  CustomGameEventManager:RegisterListener("buy_ability", onBuyAility)
  CustomGameEventManager:RegisterListener("upgrade_ability", onUpgradeAility)
  CustomGameEventManager:RegisterListener("sell_ability", onSellAbility)
end

-- Load the relevant data for the shop.
function loadShop()
  local abilities = LoadKeyValues("scripts/data/abilities.txt")
  local npcAbilities = LoadKeyValues("scripts/data/npc_abilities.txt")
  for hero, skills in pairs(abilities) do
    for skillName, skill in pairs(skills) do
      skill["ultimate"] = npcAbilities[skillName]["AbilityType"] == "DOTA_ABILITY_TYPE_ULTIMATE"
    end
    CustomNetTables:SetTableValue("shop", hero, skills)
  end
  local npcHeroes = LoadKeyValues("scripts/data/npc_heroes.txt")
  for hero, data in pairs(npcHeroes) do
    if type(data) == "table" then
      local aliases = data["NameAliases"];
      if (aliases ~= nil) then
        CustomNetTables:SetTableValue("search_synonyms", hero, split(aliases, ";"))
      end
    end
  end
end

-- Handles buy ability events from clients.
function onBuyAility(_, args)
  local playerId = args["PlayerID"]
  local sourceHero = decodeFromKey(args["sourceHero"])
  local purchasedAbility = decodeFromKey(args["ability"])

  local abilityDetails = CustomNetTables:GetTableValue("shop", sourceHero)[purchasedAbility]
  local cost = tonumber(abilityDetails["cost"])
  local ultimate = abilityDetails["ultimate"] ~= 0
  local gold = PlayerResource:GetGold(playerId)

  if gold < cost then
    return
  end
  -- TODO: Check stock.

  local hero = PlayerResource:GetPlayer(playerId):GetAssignedHero()
  if addOrUpgradeAbility(playerId, hero, sourceHero, purchasedAbility, cost, ultimate) then
    hero:SpendGold(cost, DOTA_ModifyGold_PurchaseItem)
  end
end

-- Handles upgrade ability events from the client.
function onUpgradeAility(_, args)
  local playerId = args["PlayerID"]
  local sourceHero = decodeFromKey(args["sourceHero"])
  local upgradedAbility = decodeFromKey(args["ability"])

  local abilityDetails = CustomNetTables:GetTableValue("shop", sourceHero)[upgradedAbility]
  local cost = tonumber(abilityDetails["cost"])
  local gold = PlayerResource:GetGold(playerId)

  if gold < cost then
    return
  end

  local hero = PlayerResource:GetPlayer(playerId):GetAssignedHero()
  if upgradeAbility(playerId, hero, upgradedAbility, cost) then
    hero:SpendGold(cost, DOTA_ModifyGold_PurchaseItem)
  end
end

-- Handles sell ability events from clients.
function onSellAbility(_, args)
  local playerId = args["PlayerID"]
  local soldAbility = decodeFromKey(args["ability"])

  local hero = PlayerResource:GetPlayer(playerId):GetAssignedHero()

  sellAbility(playerId, hero, soldAbility)
end

-- Add or upgrade the given ability on the given player, returning true if the ability was added/upgraded.
function addOrUpgradeAbility(playerId, hero, sourceHero, abilityName, cost, ultimate)
  if (abilityInfoByName(playerId, abilityName) ~= nil) then
    return upgradeAbility(playerId, hero, abilityName, cost)
  else
    return addAbility(playerId, hero, sourceHero, abilityName, cost, ultimate)
  end
end

-- Add an ability to the given player, returning true if the ability was added/upgraded.
function addAbility(playerId, hero, sourceHero, abilityName, cost, ultimate)
  local slot = nextEmptyAbilitySlot(playerId, ultimate)
  if slot ~= nil then
    local playerAbilities = getPlayerAbilities(playerId)
    local abilityInfo = playerAbilities[slot]
    hero:RemoveAbility(abilityInfo["name"])
    abilityInfo["name"] = abilityName
    abilityInfo["level"] = 0
    abilityInfo["sunkCost"] = 0
    abilityInfo["sourceHero"] = sourceHero
    abilityInfo["empty"] = false
    PrecacheUnitByNameAsync(sourceHero, addAbilityCallback(playerId, hero, abilityName, cost))
    -- We don't need the whole hero! But this doesn't work T__T
    --PrecacheItemByNameAsync(abilityName, addAbilityCallback(playerId, hero, abilityName, cost))
    setPlayerAbilities(playerId, playerAbilities)
    return true
  end
  return false
end

-- Actually add and upgrade the ability, used as a callback after loading the ability.
function addAbilityCallback(playerId, hero, abilityName, cost)
  function callback()
    hero:AddAbility(abilityName)
    upgradeAbility(playerId, hero, abilityName, cost)
  end
  return callback
end

-- Get the ability info given the name of the ability, if the player has it, or nil.
function abilityInfoByName(playerId, abilityName)
  for _, abilityInfo in pairs(getPlayerAbilities(playerId)) do
    if (abilityInfo ~= nil and abilityInfo["name"] == abilityName) then
      return abilityInfo
    end
  end
  return nil
end

-- Find the next empty normal ability slot, or nil.
function nextEmptyAbilitySlot(playerId, ultimate)
  local playerAbilities = getPlayerAbilities(playerId)
  for _, slot in ipairs(abilitySlots) do
    local abilityInfo = playerAbilities[slot]
    if ((ultimateAbilitySlot[slot] == ultimate) and (abilityInfo["empty"] == 1)) then
      return slot
    end
  end
  return nil
end

-- Upgrade an ability.
function upgradeAbility(playerId, hero, abilityName, cost)
  local ability = hero:FindAbilityByName(abilityName)
  if (ability:GetLevel() < ability:GetMaxLevel()) then
    local abilityInfo = abilityInfoByName(playerId, abilityName)
    abilityInfo["level"] = abilityInfo["level"] + 1
    abilityInfo["sunkCost"] = abilityInfo["sunkCost"] + cost
    ability:UpgradeAbility(false)
    local playerAbilities = getPlayerAbilities(playerId)
    playerAbilities[abilityInfo["slot"]] = abilityInfo
    setPlayerAbilities(playerId, playerAbilities)
    return true;
  end
  return false;
end

-- Sell an ability.
function sellAbility(playerId, hero, abilityName)
  local abilityInfo = abilityInfoByName(playerId, abilityName)
  hero:ModifyGold(tonumber(abilityInfo["sunkCost"]) / 2, true, DOTA_ModifyGold_SellItem)
  hero:RemoveAbility(abilityName)
  placeholderAbility(playerId, hero, abilityInfo["slot"])
end

-- Remove all the default abilities and replace with blanks.
function removeAbilities(hero)
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

  local playerId = hero:GetPlayerID()

  local playerAbilities = {}
  setPlayerAbilities(playerId, playerAbilities)
  for _, slot in ipairs(abilitySlots) do
    placeholderAbility(playerId, hero, slot)
  end
end

-- Add a placeholder ability
function placeholderAbility(playerId, hero, slot)
  local abilityInfo = {
    slot = slot,
    name = placeholders[slot],
    empty = true
  }
  local playerAbilities = getPlayerAbilities(playerId)
  playerAbilities[slot] = abilityInfo
  setPlayerAbilities(playerId, playerAbilities)
  hero:AddAbility(placeholders[slot])
end

-- Get player abilites.
function getPlayerAbilities(playerId)
  return CustomNetTables:GetTableValue("abilities", tostring(playerId))
end

-- Set player abilities.
function setPlayerAbilities(playerId, playerAbilities)
  CustomNetTables:SetTableValue("abilities", tostring(playerId), playerAbilities)
end