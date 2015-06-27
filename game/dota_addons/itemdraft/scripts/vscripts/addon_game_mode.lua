require("ability_shop")

levelGold = 15000

if ItemDraftGameMode == nil then
	ItemDraftGameMode = class({})
end

function Precache(context)
end

function Activate()
	GameRules.ItemDraft = ItemDraftGameMode()
	GameRules.ItemDraft:InitGameMode()
end

function ItemDraftGameMode:InitGameMode()
	print("ItemDraft Loaded")
	GameRules:EnableCustomGameSetupAutoLaunch(false)
	self.gameMode = GameRules:GetGameModeEntity()
	self.gameMode:SetThink("OnThink", self, "GlobalThink", 2)
	self.draftSetup = false

  local draftingRules = LoadKeyValues("scripts/data/item_drafting_rules.txt")

	loadShop()
	parseItems(draftingRules)

	CustomGameEventManager:RegisterListener("draft", draft)
	CustomGameEventManager:RegisterListener("item", item)

	ListenToGameEvent("dota_player_pick_hero", heroPicked, nil)
	ListenToGameEvent("dota_player_gained_level", heroGainedLevel, nil)
end

function ItemDraftGameMode:OnThink()
	if GameRules:State_Get() == DOTA_GAMERULES_STATE_HERO_SELECTION then
		if not self.draftSetup then
			self:SetupDraft()
			self.draftSetup = true
			PauseGame(true)
		end
	elseif GameRules:State_Get() == DOTA_GAMERULES_STATE_GAME_IN_PROGRESS then
		-- Debug
	elseif GameRules:State_Get() >= DOTA_GAMERULES_STATE_POST_GAME then
		return nil
	end
	return 1
end

function ItemDraftGameMode:SetupDraft()
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

-- An item event was recieved from the user.
function item(eventSourceIndex, args)
	local playerId = args["PlayerID"]
	local item = decodeFromKey(args["item"])

	-- TODO: Check valid.

	local player = PlayerResource:GetPlayer(playerId)
	local hero = player:GetAssignedHero()
	local item = CreateItem(item, hero, hero)
	hero:AddItem(item)
end

-- Ugh, so apparently there is no better way to do this. We add items to fill
-- the inventory out, then remove them later.
-- Doesn't account for stacks of consumables.
function addItemToStash(hero, item)
	for i = 0, 5 do
		item = GetItemInSlot(i)
	end
	buffer = 5 - hero:GetNumItemsInInventory()
	if buffer > 0 then
		spacers = {}
		for i = 0, buffer do
			-- Doesn't build into anything or stack.
			spacer = CreateItem("item_blink", hero, hero)
			hero:AddItem(spacer)
			spacers[#spacers + 1] = spacer
		end
	end
	hero:AddItem(item)
	for _, spacer in pairs(spacers) do
		hero:RemoveItem(spacer)
	end
end

-- A draft event was recieved from the user.
function draft(eventSourceIndex, args)
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

function finishDraft()
	PauseGame(false)
end

function levelUp(playerId)
	local value = CustomNetTables:GetTableValue("game", tostring(playerId))
	value["gold"] = value["gold"] + levelGold / 25
	CustomNetTables:SetTableValue("game", tostring(playerId), value)
end

function heroPicked(event)
	local player = EntIndexToHScript(event.player)
	local hero = EntIndexToHScript(event.heroindex)
	hero:SetAbilityPoints(0)
	levelUp(player:GetPlayerID())
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

function heroGainedLevel(event)
	local player = EntIndexToHScript(event.player)
	local hero = player:GetAssignedHero()
	hero:SetAbilityPoints(0)
	levelUp(player:GetPlayerID())
end

-- Events seem to lose all values, so we encode stuff as keys.
function decodeFromKey(table)
	local key, value = next(table)
	return key
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

-- Takes a table with string keys and makes them numbers.
-- Useful after one has gone into a net table.
function destringTable(table)
	local destringed = {}
	for k, v in pairs(table) do
		destringed[tonumber(k)] = v
	end
	return destringed
end

-- Compute a draft order for the given players (given as teams).
-- Ugly as sin, fix up at some point.
function computeDraftOrder(players)
	local draftOrder = {}
	local pickFrom = DOTA_TEAM_GOODGUYS
	local pickState = {[DOTA_TEAM_GOODGUYS]=1, [DOTA_TEAM_BADGUYS]=1}
	local total = 0
	for teamNumber, players in pairs(players) do
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
