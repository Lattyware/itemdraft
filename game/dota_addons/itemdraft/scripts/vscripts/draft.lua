--
-- Handles the drafting stage for items.
--

require("utility")
require("libs/timers")

levelGold = 15000

preDraftTime = 30
draftTime = 5

draftTurn = 0

draftStarted = false
draftEnded = false

itemGrouping = LoadKeyValues("scripts/data/item_grouping.txt")["draft"]

-- Register the listeners for events to do with drafting.
function registerDraftCallbacks()
  CustomGameEventManager:RegisterListener("draft", draft)
end

-- Load the relevant data for the draft.
function loadDraft()
  parseItems()
end

-- Start a draft.
function startDraft()
  PauseGame(true)

  local teams = {DOTA_TEAM_GOODGUYS, DOTA_TEAM_BADGUYS}
  for _, team in ipairs(teams) do
    local playerCount = PlayerResource:GetPlayerCountForTeam(team)
    if playerCount ~= 0 then
      for i = 1, playerCount do
        local playerId = PlayerResource:GetNthPlayerIDOnTeam(team, i)
      end
    end
  end

  local teams = {}
  teams[DOTA_TEAM_GOODGUYS] = {}
  teams[DOTA_TEAM_BADGUYS] = {}
  for teamNumber, teamPlayers in pairs(teams) do
    local playerCount = PlayerResource:GetPlayerCountForTeam(teamNumber)
    if playerCount ~= 0 then
      for i = 1, playerCount do
        local playerId = PlayerResource:GetNthPlayerIDOnTeam(teamNumber, i)
        teamPlayers[#teamPlayers + 1] = playerId
        CustomNetTables:SetTableValue("draft", tostring(playerId), {
          id = playerId,
          gold = levelGold,
          draft = {}
        })
        CustomNetTables:SetTableValue("game", tostring(playerId), {gold = 0, leveled = {}})
      end
    end
  end
  local draftOrder = computeDraftOrder(teams)

  Timers:CreateTimer({
    useGameTime = false,
    endTime = preDraftTime,
    callback = function()
      draftStarted = true
      CustomNetTables:SetTableValue("draft", "draft", {order = draftOrder})
      initialDraftTimer()
    end
  })
end

-- Finish the draft.
function finishDraft()
  draftEnded = true
  PauseGame(false)
end

-- Parses the item list to pull out information we need, populating the item net table.
function parseItems()
  local items = LoadKeyValues("scripts/data/items.txt")
  local parsedItems = {}

  for itemName, item in pairs(items) do
    if type(item) == "table" and item["ItemPurchasable"] ~= 0 and
        item["ItemCost"] ~= 0 and item["ItemRecipe"] ~= 1 then
      local itemDetails = {
        cost = item["ItemCost"]
      }
      parsedItems[itemName] = itemDetails
    end
  end

  for itemName, item in pairs(items) do
    if type(item) == "table" and item["ItemPurchasable"] ~= 0 and
        item["ItemRecipe"] == 1 then
      local _, value = next(item["ItemRequirements"])
      local req
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
  if draftStarted then
    local playerId = args["PlayerID"]
    local draftedItem = args["draft"]

    local draftOrder = destringTable(CustomNetTables:GetTableValue("draft", "draft")["order"])
    local itemDetails = CustomNetTables:GetTableValue("items", draftedItem)
    local playerInfo = CustomNetTables:GetTableValue("draft", tostring(playerId))
    local gold = tonumber(playerInfo["gold"])
    local cost = tonumber(itemDetails["cost"])

    -- TODO: Check valid draft item.
    if #draftOrder == 0 then return false end
    if playerId ~= draftOrder[1] then return false end
    if gold < cost then return false end
    if gold < 50 then return false end

    local draft = destringTable(playerInfo["draft"])
    draft[#draft + 1] = draftedItem
    playerInfo["draft"] = draft
    playerInfo["gold"] = gold - cost
    CustomNetTables:SetTableValue("draft", tostring(playerId), playerInfo)

    if gold - cost < 50 then
      if (removeFromDraft(playerId)) then
        finishDraft()
        return true
      end
    end
    advanceDraft()
    return true
  end
end

-- Draft a random item (for when the user doesn't draft in time).
function randomDraft(playerId)
  local groups = {}
  for _, items in pairs(itemGrouping) do
    groups[#groups + 1] = destringTable(items)
  end
  local group = groups[RandomInt(1, #groups)]
  local item = group[RandomInt(1, #group)]
  if not draft(nil, {PlayerID = playerId, draft = item}) then
    randomDraft(playerId)
  end
end

-- Advance the draft by one, return the new current drafter.
function advanceDraft()
  local draftOrder = destringTable(CustomNetTables:GetTableValue("draft", "draft")["order"])
  local previous = table.remove(draftOrder, 1)
  table.insert(draftOrder, previous)
  CustomNetTables:SetTableValue("draft", "draft", {order = draftOrder})
  draftTurn = draftTurn + 1
  local expectedDraftTurn = draftTurn
  local nextToDraft = draftOrder[1]
  Timers:CreateTimer({
    useGameTime = false,
    endTime = draftTime,
    callback = function()
      if (not draftEnded) and expectedDraftTurn == draftTurn then
        randomDraft(tonumber(nextToDraft))
      end
    end
  })
  return nextToDraft
end

-- Set up the first draft timer.
function initialDraftTimer()
  local draftOrder = destringTable(CustomNetTables:GetTableValue("draft", "draft")["order"])
  local nextToDraft = draftOrder[1]
  local expectedDraftTurn = draftTurn
  Timers:CreateTimer({
    useGameTime = false,
    endTime = draftTime,
    callback = function()
      if (not draftEnded) and expectedDraftTurn == draftTurn then
        randomDraft(tonumber(nextToDraft))
      end
    end
  })
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

-- Compute the draft order.
function computeDraftOrder(players)
  local teams = {}
  for _, values in pairs(players) do
    teams[#teams + 1] = values
  end
  local draftOrder = interleave(teams)

  local itemCount = #draftOrder
  for k, v in ipairs(draftOrder) do
    draftOrder[itemCount * 2 + 1 - k] = v
  end

  -- Repeat the draft order, this ensures the UI works when on one drafter.
  local itemCount = #draftOrder
  for i = 1, itemCount do
    draftOrder[itemCount + i] = draftOrder[i]
  end

  return draftOrder
end