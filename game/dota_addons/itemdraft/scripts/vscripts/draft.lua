--
-- Handles the drafting stage for items.
--

require("utility")

levelGold = 15000

-- Register the listeners for events to do with drafting.
function registerDraftCallbacks()
  CustomGameEventManager:RegisterListener("draft", draft)
end

-- Load the relevant data for the draft.
function loadDraft()
  local draftingRules = LoadKeyValues("scripts/data/item_drafting_rules.txt")
  parseItems(draftingRules)
end

-- Start a draft.
function startDraft()
  PauseGame(true)

  local players = {}
  players[DOTA_TEAM_GOODGUYS] = {}
  players[DOTA_TEAM_BADGUYS] = {}
  for teamNumber, players in pairs(players) do
    local playerCount = PlayerResource:GetPlayerCountForTeam(teamNumber)
    if playerCount ~= 0 then
      for i = 1, playerCount do
        local playerId = PlayerResource:GetNthPlayerIDOnTeam(teamNumber, i)
        players[#players + 1] = playerId
        CustomNetTables:SetTableValue("draft", tostring(playerId), {
          id = playerId,
          gold = levelGold,
          draft = {}
        })
        CustomNetTables:SetTableValue("game", tostring(playerId), {gold = 0})
      end
    end
  end
  local draftOrder = computeDraftOrder(players)
  CustomNetTables:SetTableValue("draft", "draft", {order = draftOrder})
end

-- Finish the draft.
function finishDraft()
  PauseGame(false)
end

-- Parses the item list to pull out information we need, populating the item net table.
function parseItems(draftingRules)
  local exclude = draftingRules["undrafted"]
  local items = LoadKeyValues("scripts/data/items.txt")
  local parsedItems = {}

  for itemName, item in pairs(items) do
    if type(item) == "table" and item["ItemPurchasable"] ~= 0 and
        item["ItemCost"] ~= 0 and item["ItemRecipe"] ~= 1 and
        not exclude[itemName] then
      itemDetails = {
        cost = item["ItemCost"]
      }
      parsedItems[itemName] = itemDetails
    end
  end

  for itemName, item in pairs(items) do
    if type(item) == "table" and item["ItemPurchasable"] ~= 0 and
        item["ItemRecipe"] == 1 then
      key, value = next(item["ItemRequirements"])
      if (item["ItemCost"] ~= 0) then
        req = value .. ";" .. itemName
      else
        req = value
      end
      parsedItems[item["ItemResult"]]["requires"] = req
    end
  end

  for itemName, itemDetails in pairs(parsedItems) do
    CustomNetTables:SetTableValue("items", itemName, itemDetails)
  end
end

-- Handles draft events from clients.
function draft(_, args)
  local playerId = args["PlayerID"]
  local draftedItem = decodeFromKey(args["draft"])

  local draftOrder = destringTable(CustomNetTables:GetTableValue("draft", "draft")["order"])
  local itemDetails = CustomNetTables:GetTableValue("items", draftedItem)
  local playerInfo = CustomNetTables:GetTableValue("draft", tostring(playerId))
  local gold = tonumber(playerInfo["gold"])
  local cost = tonumber(itemDetails["cost"])

  if #draftOrder == 0 then
    return
  end
  if tostring(playerId) == draftOrder[1] then
    return
  end
  if gold < cost then
    return
  end
  if gold < 50 then
    return
  end

  local draft = destringTable(playerInfo["draft"])
  draft[#draft + 1] = draftedItem
  playerInfo["draft"] = draft
  playerInfo["gold"] = gold - cost
  CustomNetTables:SetTableValue("draft", tostring(playerId), playerInfo)

  if gold - cost < 50 then
    if (removeFromDraft(playerId)) then
      finishDraft()
      return
    end
  end
  advanceDraft()
end

-- Advance the draft by one, return the new current drafter.
function advanceDraft()
  local draftOrder = destringTable(CustomNetTables:GetTableValue("draft", "draft")["order"])
  local previous = table.remove(draftOrder, 1)
  table.insert(draftOrder, previous)
  CustomNetTables:SetTableValue("draft", "draft", {order = draftOrder})
  return draftOrder[1]
end

-- Removes someone from the draft, and returns if the draft is done.
function removeFromDraft(id)
  local draftOrder = destringTable(CustomNetTables:GetTableValue("draft", "draft")["order"])
  local newDraftOrder = {}
  for _, value in ipairs(draftOrder) do
    if id ~= value then
      newDraftOrder[#newDraftOrder + 1] = value
    end
  end
  CustomNetTables:SetTableValue("draft", "draft", {order = newDraftOrder})
  return #newDraftOrder == 0
end

-- Compute a draft order for the given players (given as teams).
-- Ugly as sin, fix up at some point.
function computeDraftOrder(players)
  local draftOrder = {}
  local pickFrom = DOTA_TEAM_GOODGUYS
  local pickState = {[DOTA_TEAM_GOODGUYS]=1, [DOTA_TEAM_BADGUYS]=1}
  local total = 0
  for _, players in pairs(players) do
    total = total + #players
  end
  for i = 1, total do
    draftOrder[#draftOrder + 1] = players[pickFrom][pickState[pickFrom]]
    pickState[pickFrom] = pickState[pickFrom] + 1
    pickFrom = flipPickFrom(pickFrom)
  end
  pickFrom = flipPickFrom(pickFrom)
  for i = 1, total do
    pickState[pickFrom] = pickState[pickFrom] - 1
    draftOrder[#draftOrder + 1] = players[pickFrom][pickState[pickFrom]]
    pickFrom = flipPickFrom(pickFrom)
  end
  return draftOrder
end

-- Flip the picking side.
function flipPickFrom(pickFrom)
  if pickFrom == DOTA_TEAM_GOODGUYS then
    return DOTA_TEAM_BADGUYS
  else
    return DOTA_TEAM_GOODGUYS
  end
end