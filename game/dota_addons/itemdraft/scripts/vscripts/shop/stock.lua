--
-- Handles stock control for the shop.
--

require("libs/timers")

teams = {DOTA_TEAM_GOODGUYS, DOTA_TEAM_BADGUYS}
restocking = {}

function loadStock()
  local stockRules = LoadKeyValues("scripts/data/stock_rules.txt")

  for item, rules in pairs(stockRules) do
    local itemInfo = {
      max = rules["max"],
      restock = rules["restock"],
    }
    for _, team in pairs(teams) do
      itemInfo[team] = rules["initial"]
    end
    CustomNetTables:SetTableValue("stock", item, itemInfo)
    for _, team in pairs(teams) do
      team = tostring(team)
      restocking[team] = {}
      restocking[team][item] = false
      incrementStockAfterRestockTime(team, item)
    end
  end
end

function reduceStock(team, item)
  team = tostring(team)
  local rules = CustomNetTables:GetTableValue("stock", item)
  if rules ~= nil then
    if rules[team] < 1 then
      return false
    end
    rules[team] = rules[team] - 1
    CustomNetTables:SetTableValue("stock", item, rules)
    incrementStockAfterRestockTime(team, item)
  end
  return true
end

function incrementStockAfterRestockTime(team, item)
  team = tostring(team)
  local rules = CustomNetTables:GetTableValue("stock", item)
  if (not restocking[team][item]) and rules[team] < rules["max"] then
    restocking[team][item] = true
    Timers:CreateTimer(rules["restock"], function()
      incrementStock(team, item)
    end)
  end
end

function incrementStock(team, item)
  team = tostring(team)
  local rules = CustomNetTables:GetTableValue("stock", item)
  restocking[team][item] = false
  rules[team] = rules[team] + 1
  CustomNetTables:SetTableValue("stock", item, rules)
  incrementStockAfterRestockTime(team, item)
end