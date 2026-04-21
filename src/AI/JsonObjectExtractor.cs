using System;
using System.Text.Json;

namespace CampsiteEmpire.AI;

public static class JsonObjectExtractor
{
    public static JsonDocument? ParseFirstObject(string response)
    {
        if (string.IsNullOrWhiteSpace(response)) return null;

        for (var start = response.IndexOf('{'); start >= 0; start = response.IndexOf('{', start + 1))
        {
            var depth = 0;
            var inString = false;
            var escaped = false;
            for (var i = start; i < response.Length; i++)
            {
                var c = response[i];
                if (inString)
                {
                    if (escaped) escaped = false;
                    else if (c == '\\') escaped = true;
                    else if (c == '"') inString = false;
                    continue;
                }

                if (c == '"') inString = true;
                else if (c == '{') depth++;
                else if (c == '}')
                {
                    depth--;
                    if (depth == 0)
                    {
                        var candidate = response.Substring(start, i - start + 1);
                        try
                        {
                            return JsonDocument.Parse(candidate);
                        }
                        catch (JsonException)
                        {
                            break;
                        }
                    }
                }
            }
        }

        return null;
    }
}
