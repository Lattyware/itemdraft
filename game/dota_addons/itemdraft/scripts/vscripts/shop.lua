--
-- Handles the shop for abilities.
--

-- Register the listeners for events to do with drafting.
function registerShopCallbacks()
  CustomGameEventManager:RegisterListener("ability", ability)
end

-- Load the relevant data for the shop.
function loadShop()
  abilities = LoadKeyValues("scripts/data/abilities.txt")
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
  local ability = hero:FindAbilityByName(purchasedAbility)
  if ability == nil then
    hero:AddAbility(purchasedAbility)
    ability = hero:FindAbilityByName(purchasedAbility)
  end
  ability:UpgradeAbility(false)
  hero:SpendGold(cost, DOTA_ModifyGold_PurchaseItem)
end