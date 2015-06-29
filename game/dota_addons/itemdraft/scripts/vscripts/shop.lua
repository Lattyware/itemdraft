--
-- Handles the shop for abilities.
--

require("utility")

-- Register the listeners for events to do with drafting.
function registerShopCallbacks()
  CustomGameEventManager:RegisterListener("ability", ability)
end

-- Load the relevant data for the shop.
function loadShop()
  local abilities = LoadKeyValues("scripts/data/abilities.txt")
  for hero, skills in pairs(abilities) do
    CustomNetTables:SetTableValue("abilities", hero, skills)
  end
end

-- Handles ability events from clients.
function ability(_, args)
  local playerId = args["PlayerID"]
  local sourceHero = decodeFromKey(args["sourceHero"])
  local purchasedAbility = decodeFromKey(args["ability"])

  local abilityDetails = CustomNetTables:GetTableValue("abilities", sourceHero)[purchasedAbility]
  local cost = tonumber(abilityDetails["cost"])
  local gold = PlayerResource:GetGold(playerId)

  if gold < cost then
    return
  end
  -- TODO: Check stock.

  local hero = PlayerResource:GetPlayer(playerId):GetAssignedHero()
  upgradeAbilityAndAssociated(hero, purchasedAbility)
  hero:SpendGold(cost, DOTA_ModifyGold_PurchaseItem)
end

-- Add/Upgrade an ability and sub-abilities.
function upgradeAbilityAndAssociated(hero, abilityName)
  local ability = hero:FindAbilityByName(abilityName)
  if ability == nil then
    hero:AddAbility(abilityName)
    ability = hero:FindAbilityByName(abilityName)
    local subabilities = ability:GetAssociatedSecondaryAbilities()
    if (subabilities ~= nil) then
      for _, subability in pairs(split(subabilities, ";")) do
        upgradeAbilityAndAssociated(hero, subability)
      end
    end
  end
  if (ability:GetLevel() < ability:GetMaxLevel()) then
    ability:UpgradeAbility(false)
  end
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
end