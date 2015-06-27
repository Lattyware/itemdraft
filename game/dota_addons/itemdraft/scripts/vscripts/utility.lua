--
-- Utility functions.
--

-- Takes a table with string keys and makes them numbers.
-- Useful after one has gone into a net table.
function destringTable(table)
  local destringed = {}
  for k, v in pairs(table) do
    destringed[tonumber(k)] = v
  end
  return destringed
end

-- Events seem to lose all values, so we encode data as keys.
function decodeFromKey(table)
  local key, _ = next(table)
  return key
end