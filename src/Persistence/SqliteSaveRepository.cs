using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using CampsiteEmpire.Simulation;
using Microsoft.Data.Sqlite;

namespace CampsiteEmpire.Persistence;

public sealed class SqliteSaveRepository
{
    private readonly string _databasePath;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = false,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true
    };

    public SqliteSaveRepository(string databasePath)
    {
        _databasePath = databasePath;
    }

    public async Task<GameState> LoadOrCreateAsync()
    {
        Directory.CreateDirectory(Path.GetDirectoryName(_databasePath) ?? ".");
        await using var connection = new SqliteConnection($"Data Source={_databasePath}");
        await connection.OpenAsync();
        await EnsureSchemaAsync(connection);

        var command = connection.CreateCommand();
        command.CommandText = "SELECT json_state FROM save_metadata WHERE id = 1";
        var result = await command.ExecuteScalarAsync();
        if (result is string json && !string.IsNullOrWhiteSpace(json))
        {
            var loaded = JsonSerializer.Deserialize<GameState>(json, JsonOptions);
            if (loaded is not null) return loaded;
        }

        var state = GameState.NewGame();
        await SaveAsync(state);
        return state;
    }

    public async Task SaveAsync(GameState state)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(_databasePath) ?? ".");
        await using var connection = new SqliteConnection($"Data Source={_databasePath}");
        await connection.OpenAsync();
        await EnsureSchemaAsync(connection);

        await ExecuteAsync(connection, "DELETE FROM map_tiles");
        await ExecuteAsync(connection, "DELETE FROM structures");
        await ExecuteAsync(connection, "DELETE FROM pricing");
        await ExecuteAsync(connection, "DELETE FROM tourists");
        await ExecuteAsync(connection, "DELETE FROM stays");
        await ExecuteAsync(connection, "DELETE FROM reviews");
        await ExecuteAsync(connection, "DELETE FROM chatter");
        await ExecuteAsync(connection, "DELETE FROM economy_ledger");
        await ExecuteAsync(connection, "DELETE FROM weather_history");
        await ExecuteAsync(connection, "DELETE FROM simulation_clock");

        foreach (var tile in state.Tiles)
        {
            var cmd = connection.CreateCommand();
            cmd.CommandText = "INSERT INTO map_tiles (x, y, terrain, structure_id) VALUES ($x, $y, $terrain, $structure_id)";
            cmd.Parameters.AddWithValue("$x", tile.X);
            cmd.Parameters.AddWithValue("$y", tile.Y);
            cmd.Parameters.AddWithValue("$terrain", tile.Terrain.ToString());
            cmd.Parameters.AddWithValue("$structure_id", tile.StructureId?.ToString() ?? "");
            await cmd.ExecuteNonQueryAsync();
        }

        foreach (var structure in state.Structures)
        {
            var cmd = connection.CreateCommand();
            cmd.CommandText = "INSERT INTO structures (id, type, x, y, is_occupied, tourist_id) VALUES ($id, $type, $x, $y, $is_occupied, $tourist_id)";
            cmd.Parameters.AddWithValue("$id", structure.Id.ToString());
            cmd.Parameters.AddWithValue("$type", structure.Type.ToString());
            cmd.Parameters.AddWithValue("$x", structure.X);
            cmd.Parameters.AddWithValue("$y", structure.Y);
            cmd.Parameters.AddWithValue("$is_occupied", structure.IsOccupied ? 1 : 0);
            cmd.Parameters.AddWithValue("$tourist_id", structure.TouristId?.ToString() ?? "");
            await cmd.ExecuteNonQueryAsync();
        }

        var pricing = connection.CreateCommand();
        pricing.CommandText = "INSERT INTO pricing (plot_type, price) VALUES ('TentSite', $tent), ('CampervanSpot', $camper), ('RvHookup', $rv)";
        pricing.Parameters.AddWithValue("$tent", state.Pricing.TentSite);
        pricing.Parameters.AddWithValue("$camper", state.Pricing.CampervanSpot);
        pricing.Parameters.AddWithValue("$rv", state.Pricing.RvHookup);
        await pricing.ExecuteNonQueryAsync();

        foreach (var tourist in state.Tourists)
        {
            var cmd = connection.CreateCommand();
            cmd.CommandText = "INSERT INTO tourists (id, json_data) VALUES ($id, $json)";
            cmd.Parameters.AddWithValue("$id", tourist.Id.ToString());
            cmd.Parameters.AddWithValue("$json", JsonSerializer.Serialize(tourist, JsonOptions));
            await cmd.ExecuteNonQueryAsync();

            if (tourist.PlotId.HasValue)
            {
                var stay = connection.CreateCommand();
                stay.CommandText = "INSERT INTO stays (tourist_id, plot_id, nights_stayed, stay_nights, state) VALUES ($tourist_id, $plot_id, $nights_stayed, $stay_nights, $state)";
                stay.Parameters.AddWithValue("$tourist_id", tourist.Id.ToString());
                stay.Parameters.AddWithValue("$plot_id", tourist.PlotId.Value.ToString());
                stay.Parameters.AddWithValue("$nights_stayed", tourist.NightsStayed);
                stay.Parameters.AddWithValue("$stay_nights", tourist.StayNights);
                stay.Parameters.AddWithValue("$state", tourist.State.ToString());
                await stay.ExecuteNonQueryAsync();
            }
        }

        foreach (var review in state.Reviews)
        {
            var cmd = connection.CreateCommand();
            cmd.CommandText = "INSERT INTO reviews (id, tourist_id, day, stars, text, tags_json) VALUES ($id, $tourist_id, $day, $stars, $text, $tags_json)";
            cmd.Parameters.AddWithValue("$id", review.Id.ToString());
            cmd.Parameters.AddWithValue("$tourist_id", review.TouristId.ToString());
            cmd.Parameters.AddWithValue("$day", review.Day);
            cmd.Parameters.AddWithValue("$stars", review.Stars);
            cmd.Parameters.AddWithValue("$text", review.Text);
            cmd.Parameters.AddWithValue("$tags_json", JsonSerializer.Serialize(review.Tags, JsonOptions));
            await cmd.ExecuteNonQueryAsync();
        }

        foreach (var chatter in state.Chatter)
        {
            var cmd = connection.CreateCommand();
            cmd.CommandText = "INSERT INTO chatter (id, tourist_id, day, hour, mood, text) VALUES ($id, $tourist_id, $day, $hour, $mood, $text)";
            cmd.Parameters.AddWithValue("$id", chatter.Id.ToString());
            cmd.Parameters.AddWithValue("$tourist_id", chatter.TouristId.ToString());
            cmd.Parameters.AddWithValue("$day", chatter.Day);
            cmd.Parameters.AddWithValue("$hour", chatter.Hour);
            cmd.Parameters.AddWithValue("$mood", chatter.Mood);
            cmd.Parameters.AddWithValue("$text", chatter.Text);
            await cmd.ExecuteNonQueryAsync();
        }

        foreach (var entry in state.Ledger)
        {
            var cmd = connection.CreateCommand();
            cmd.CommandText = "INSERT INTO economy_ledger (id, day, hour, kind, description, amount) VALUES ($id, $day, $hour, $kind, $description, $amount)";
            cmd.Parameters.AddWithValue("$id", entry.Id.ToString());
            cmd.Parameters.AddWithValue("$day", entry.Day);
            cmd.Parameters.AddWithValue("$hour", entry.Hour);
            cmd.Parameters.AddWithValue("$kind", entry.Kind);
            cmd.Parameters.AddWithValue("$description", entry.Description);
            cmd.Parameters.AddWithValue("$amount", entry.Amount);
            await cmd.ExecuteNonQueryAsync();
        }

        var weather = connection.CreateCommand();
        weather.CommandText = "INSERT INTO weather_history (day, weather, season, demand) VALUES ($day, $weather, $season, $demand)";
        weather.Parameters.AddWithValue("$day", state.Day);
        weather.Parameters.AddWithValue("$weather", state.Weather.ToString());
        weather.Parameters.AddWithValue("$season", state.Season.ToString());
        weather.Parameters.AddWithValue("$demand", state.Demand);
        await weather.ExecuteNonQueryAsync();

        var clock = connection.CreateCommand();
        clock.CommandText = "INSERT INTO simulation_clock (id, day, hour, season, weather, money, reputation, demand) VALUES (1, $day, $hour, $season, $weather, $money, $reputation, $demand)";
        clock.Parameters.AddWithValue("$day", state.Day);
        clock.Parameters.AddWithValue("$hour", state.Hour);
        clock.Parameters.AddWithValue("$season", state.Season.ToString());
        clock.Parameters.AddWithValue("$weather", state.Weather.ToString());
        clock.Parameters.AddWithValue("$money", state.Money);
        clock.Parameters.AddWithValue("$reputation", state.Reputation);
        clock.Parameters.AddWithValue("$demand", state.Demand);
        await clock.ExecuteNonQueryAsync();

        var snapshot = connection.CreateCommand();
        snapshot.CommandText = """
INSERT INTO save_metadata (id, schema_version, saved_at_utc, json_state)
VALUES (1, $schema_version, $saved_at_utc, $json_state)
ON CONFLICT(id) DO UPDATE SET
  schema_version = excluded.schema_version,
  saved_at_utc = excluded.saved_at_utc,
  json_state = excluded.json_state
""";
        snapshot.Parameters.AddWithValue("$schema_version", state.SchemaVersion);
        snapshot.Parameters.AddWithValue("$saved_at_utc", DateTime.UtcNow.ToString("O"));
        snapshot.Parameters.AddWithValue("$json_state", JsonSerializer.Serialize(state, JsonOptions));
        await snapshot.ExecuteNonQueryAsync();
    }

    private static async Task EnsureSchemaAsync(SqliteConnection connection)
    {
        var schema = """
CREATE TABLE IF NOT EXISTS save_metadata (id INTEGER PRIMARY KEY, schema_version INTEGER NOT NULL, saved_at_utc TEXT NOT NULL, json_state TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS map_tiles (x INTEGER NOT NULL, y INTEGER NOT NULL, terrain TEXT NOT NULL, structure_id TEXT, PRIMARY KEY (x, y));
CREATE TABLE IF NOT EXISTS structures (id TEXT PRIMARY KEY, type TEXT NOT NULL, x INTEGER NOT NULL, y INTEGER NOT NULL, is_occupied INTEGER NOT NULL, tourist_id TEXT);
CREATE TABLE IF NOT EXISTS pricing (plot_type TEXT PRIMARY KEY, price REAL NOT NULL);
CREATE TABLE IF NOT EXISTS tourists (id TEXT PRIMARY KEY, json_data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS stays (tourist_id TEXT NOT NULL, plot_id TEXT NOT NULL, nights_stayed INTEGER NOT NULL, stay_nights INTEGER NOT NULL, state TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, tourist_id TEXT NOT NULL, day INTEGER NOT NULL, stars INTEGER NOT NULL, text TEXT NOT NULL, tags_json TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS chatter (id TEXT PRIMARY KEY, tourist_id TEXT NOT NULL, day INTEGER NOT NULL, hour INTEGER NOT NULL, mood TEXT NOT NULL, text TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS economy_ledger (id TEXT PRIMARY KEY, day INTEGER NOT NULL, hour INTEGER NOT NULL, kind TEXT NOT NULL, description TEXT NOT NULL, amount REAL NOT NULL);
CREATE TABLE IF NOT EXISTS weather_history (day INTEGER PRIMARY KEY, weather TEXT NOT NULL, season TEXT NOT NULL, demand REAL NOT NULL);
CREATE TABLE IF NOT EXISTS simulation_clock (id INTEGER PRIMARY KEY, day INTEGER NOT NULL, hour INTEGER NOT NULL, season TEXT NOT NULL, weather TEXT NOT NULL, money REAL NOT NULL, reputation REAL NOT NULL, demand REAL NOT NULL);
""";
        await ExecuteAsync(connection, schema);
    }

    private static async Task ExecuteAsync(SqliteConnection connection, string sql)
    {
        var command = connection.CreateCommand();
        command.CommandText = sql;
        await command.ExecuteNonQueryAsync();
    }
}
