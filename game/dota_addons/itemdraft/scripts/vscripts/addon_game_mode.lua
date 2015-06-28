--
-- Main script and entry point for the item draft game mode.
--

require("draft")
require("level")
require("shop")

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
	GameRules:EnableCustomGameSetupAutoLaunch(false)
	self.gameMode = GameRules:GetGameModeEntity()
	self.gameMode:SetThink("OnThink", self, "GlobalThink", 2)
	self.draftSetup = false

  loadDraft()
	loadShop()

  registerDraftCallbacks()
  registerLevelCallbacks()
	registerShopCallbacks()

  ListenToGameEvent("game_rules_state_change", self.StateChange, nil)
end

function ItemDraftGameMode:StateChange()
  if GameRules:State_Get() == DOTA_GAMERULES_STATE_HERO_SELECTION then
    startDraft()
  end
end

function ItemDraftGameMode:OnThink()
	if GameRules:State_Get() == DOTA_GAMERULES_STATE_GAME_IN_PROGRESS then
		-- Debug
	elseif GameRules:State_Get() >= DOTA_GAMERULES_STATE_POST_GAME then
		return nil
	end
	return 1
end