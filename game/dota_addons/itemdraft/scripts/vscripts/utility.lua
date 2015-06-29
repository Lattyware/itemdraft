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