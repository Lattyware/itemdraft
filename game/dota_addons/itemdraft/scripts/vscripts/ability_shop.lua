function loadShop()
  abilities = LoadKeyValues("scripts/data/abilities.txt")
  for hero, skills in pairs(abilities) do
    CustomNetTables:SetTableValue("abilities", hero, skills)
  end
end
