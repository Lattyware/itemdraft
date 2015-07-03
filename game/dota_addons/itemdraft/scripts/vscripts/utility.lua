--
-- Utility functions.
--

-- Takes a table with string keys and makes them numbers.
-- Useful after one has gone into a net table.
function destringTable(tbl)
  local destringed = {}
  for k, v in pairs(tbl) do
    destringed[tonumber(k)] = v
  end
  return destringed
end

-- Events seem to lose all values, so we encode data as keys.
function decodeFromKey(tbl)
  local key, _ = next(tbl)
  return key
end

-- Split a string
function split(str, sSeparator, nMax, bRegexp)
  assert(sSeparator ~= '')
  assert(nMax == nil or nMax >= 1)

  local aRecord = {}

  if str:len() > 0 then
    local bPlain = not bRegexp
    nMax = nMax or -1

    local nField, nStart = 1, 1
    local nFirst,nLast = str:find(sSeparator, nStart, bPlain)
    while nFirst and nMax ~= 0 do
      aRecord[nField] = str:sub(nStart, nFirst-1)
      nField = nField+1
      nStart = nLast+1
      nFirst,nLast = str:find(sSeparator, nStart, bPlain)
      nMax = nMax-1
    end
    aRecord[nField] = str:sub(nStart)
  end

  return aRecord
end

-- A shallow copy.
function shallowCopy(tbl)
  local copied = {}
  for key, value in pairs(tbl) do
    copied[key] = value
  end
  return copied
end

-- Debug print for tables.
function printTable(tbl, indent)
  if not indent then indent = 0 end
  for k, v in pairs(tbl) do
    local formatting = string.rep("  ", indent) .. k .. ": "
    if type(v) == "table" then
      print(formatting)
      printTable(v, indent+1)
    else
      print(formatting .. tostring(v))
    end
  end
end

-- Count the number of times a value occurs in a table
function count(tbl, item)
  local count = 0
  for _, value in pairs(tbl) do
    if item == value then
      count = count + 1
    end
  end
  return count
end

-- The table without the given set of keys.
function excluding(tbl, excluding)
  local without = {}
  for key, value in pairs(tbl) do
    if not excluding[key] then
      without[key] = value
    end
  end
  return without
end

-- Make a set from the values.
function setOf(tbl)
  local newSet = {}
  for _, value in pairs(tbl) do
    newSet[value] = true
  end
  return newSet
end

-- Set of keys from value
function keys(tbl, item)
  local keys = {}
  for key, value in pairs(tbl) do
    if item == value then
      keys[key] = true
    end
  end
  return keys
end