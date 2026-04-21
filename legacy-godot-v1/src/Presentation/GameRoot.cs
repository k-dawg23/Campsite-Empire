using System;
using System.Linq;
using System.Threading.Tasks;
using CampsiteEmpire.AI;
using CampsiteEmpire.Persistence;
using CampsiteEmpire.Simulation;
using Godot;

namespace CampsiteEmpire.Presentation;

public partial class GameRoot : Node2D
{
    private const int TileWidth = 72;
    private const int TileHeight = 36;
    private readonly Vector2 _mapOrigin = new(580, 70);

    private GameState _state = GameState.NewGame();
    private CampgroundSimulator _simulator = null!;
    private SqliteSaveRepository _saveRepository = null!;
    private StructureType _selectedBuild = StructureType.TentSite;
    private Vector2I? _hoverTile;
    private Node2D _mapVisual = null!;
    private TileMapLayer _tileMapLayer = null!;
    private Label _status = null!;
    private Label _eventLabel = null!;
    private Label _inspector = null!;
    private RichTextLabel _feed = null!;
    private double _speed = 1;
    private double _tickAccumulator;
    private double _saveAccumulator;
    private int _ticksAdvanced;
    private bool _isTicking;
    private bool _isSaving;

    public override async void _Ready()
    {
        _simulator = new CampgroundSimulator(new LocalAiService());
        _saveRepository = new SqliteSaveRepository(ProjectSettings.GlobalizePath("user://campsite_empire.sqlite"));
        _state = await _saveRepository.LoadOrCreateAsync();
        _state.LastEvent = "Simulation running at 1x.";

        BuildScene();
        RedrawMap();
        RefreshUi();
    }

    public override async void _Process(double delta)
    {
        if (_speed > 0 && !_isTicking)
        {
            _tickAccumulator += delta * _speed;
            if (_tickAccumulator >= 1.0)
            {
                _tickAccumulator = 0;
                _isTicking = true;
                await _simulator.TickAsync(_state);
                _ticksAdvanced++;
                RedrawMap();
                RefreshUi();
                await SaveNowAsync();
                _isTicking = false;
            }
        }

        _saveAccumulator += delta;
        if (_saveAccumulator >= 4.0)
        {
            _saveAccumulator = 0;
            await SaveNowAsync();
        }
    }

    public override void _Input(InputEvent @event)
    {
        if (@event is not InputEventKey { Pressed: true, Echo: false } key) return;
        switch (key.Keycode)
        {
            case Key.Key0:
            case Key.Space:
                SetSpeed(0);
                break;
            case Key.Key1:
                SetSpeed(1);
                break;
            case Key.Key2:
                SetSpeed(2);
                break;
            case Key.Key5:
                SetSpeed(5);
                break;
        }
    }

    public override async void _UnhandledInput(InputEvent @event)
    {
        if (@event is InputEventMouseMotion motion)
        {
            var hovered = ScreenToTile(motion.Position);
            if (hovered.X >= 0 && hovered.X < GameState.MapSize && hovered.Y >= 0 && hovered.Y < GameState.MapSize)
            {
                _hoverTile = hovered;
                RedrawMap();
                RefreshUi(hovered.X, hovered.Y);
            }
            return;
        }

        if (@event is not InputEventMouseButton { Pressed: true, ButtonIndex: MouseButton.Left } mouse) return;
        var tile = ScreenToTile(mouse.Position);
        if (tile.X < 0 || tile.X >= GameState.MapSize || tile.Y < 0 || tile.Y >= GameState.MapSize) return;

        if (_simulator.TryBuild(_state, _selectedBuild, tile.X, tile.Y, out var message))
        {
            await SaveNowAsync();
            RedrawMap();
        }
        _state.LastEvent = message;
        RefreshUi(tile.X, tile.Y);
    }

    private void BuildScene()
    {
        _tileMapLayer = new TileMapLayer { Name = "IsometricTileMapLayer" };
        AddChild(_tileMapLayer);

        _mapVisual = new Node2D { Name = "IsometricMapVisual" };
        AddChild(_mapVisual);

        var ui = new CanvasLayer { Name = "ManagementUi" };
        AddChild(ui);

        var root = new Control
        {
            AnchorRight = 1,
            AnchorBottom = 1,
            MouseFilter = Control.MouseFilterEnum.Pass
        };
        ui.AddChild(root);

        var leftPanel = Panel(16, 16, 260, 760);
        root.AddChild(leftPanel);
        var left = VBox(12);
        leftPanel.AddChild(left);

        left.AddChild(Title("Build"));
        foreach (var definition in Buildables.All.Values)
        {
            var button = new Button
            {
                Text = $"{definition.DisplayName} ${definition.BuildCost:0}",
                TooltipText = $"{definition.DisplayName}: build ${definition.BuildCost:0}, maintenance ${definition.MaintenanceCost:0}/day",
                ToggleMode = true,
                ButtonPressed = definition.Type == _selectedBuild,
                CustomMinimumSize = new Vector2(220, 34)
            };
            var type = definition.Type;
            button.Pressed += () =>
            {
                _selectedBuild = type;
                foreach (var child in left.GetChildren().OfType<Button>()) child.ButtonPressed = false;
                button.ButtonPressed = true;
                RefreshUi();
            };
            left.AddChild(button);
        }

        left.AddChild(Title("Prices"));
        left.AddChild(PriceRow("Tent", StructureType.TentSite));
        left.AddChild(PriceRow("Camper", StructureType.CampervanSpot));
        left.AddChild(PriceRow("RV", StructureType.RvHookup));

        left.AddChild(Title("Speed"));
        var speeds = new HBoxContainer { CustomMinimumSize = new Vector2(220, 36) };
        left.AddChild(speeds);
        AddSpeedButton(speeds, "Pause", 0);
        AddSpeedButton(speeds, "1x", 1);
        AddSpeedButton(speeds, "2x", 2);
        AddSpeedButton(speeds, "5x", 5);

        _status = new Label { AutowrapMode = TextServer.AutowrapMode.WordSmart };
        left.AddChild(_status);

        var rightPanel = Panel(1130, 16, 292, 830);
        root.AddChild(rightPanel);
        var right = VBox(10);
        rightPanel.AddChild(right);
        right.AddChild(Title("Inspector"));
        _inspector = new Label { AutowrapMode = TextServer.AutowrapMode.WordSmart, CustomMinimumSize = new Vector2(250, 140) };
        right.AddChild(_inspector);
        right.AddChild(Title("Camp Feed"));
        _feed = new RichTextLabel
        {
            BbcodeEnabled = false,
            FitContent = false,
            CustomMinimumSize = new Vector2(250, 540),
            ScrollFollowing = true
        };
        right.AddChild(_feed);

        _eventLabel = new Label
        {
            Position = new Vector2(312, 810),
            Size = new Vector2(780, 34),
            AutowrapMode = TextServer.AutowrapMode.WordSmart
        };
        root.AddChild(_eventLabel);
    }

    private Control PriceRow(string label, StructureType type)
    {
        var row = new HBoxContainer { CustomMinimumSize = new Vector2(220, 34) };
        row.AddChild(new Label { Text = label, CustomMinimumSize = new Vector2(76, 28) });
        var minus = new Button { Text = "-", CustomMinimumSize = new Vector2(34, 28) };
        var price = new Label { CustomMinimumSize = new Vector2(62, 28) };
        var plus = new Button { Text = "+", CustomMinimumSize = new Vector2(34, 28) };
        minus.TooltipText = $"Lower {label} nightly price";
        plus.TooltipText = $"Raise {label} nightly price";
        minus.Pressed += () => { _state.Pricing.Adjust(type, -2); RefreshUi(); };
        plus.Pressed += () => { _state.Pricing.Adjust(type, 2); RefreshUi(); };
        row.AddChild(minus);
        row.AddChild(price);
        row.AddChild(plus);
        row.SetMeta("price_label", price);
        row.SetMeta("price_type", type.ToString());
        return row;
    }

    private void AddSpeedButton(HBoxContainer parent, string text, double speed)
    {
        var button = new Button { Text = text, CustomMinimumSize = new Vector2(50, 28) };
        button.Pressed += () => SetSpeed(speed);
        parent.AddChild(button);
    }

    private void SetSpeed(double speed)
    {
        _speed = speed;
        _tickAccumulator = 0;
        _state.LastEvent = speed == 0 ? "Simulation paused." : $"Simulation running at {speed:0}x.";
        GD.Print($"Campsite Empire speed set to {_speed:0}x");
        RefreshUi();
    }

    private static Label Title(string text)
    {
        return new Label
        {
            Text = text,
            ThemeTypeVariation = "HeaderSmall",
            CustomMinimumSize = new Vector2(220, 30)
        };
    }

    private static PanelContainer Panel(float x, float y, float width, float height)
    {
        return new PanelContainer
        {
            Position = new Vector2(x, y),
            Size = new Vector2(width, height),
            MouseFilter = Control.MouseFilterEnum.Stop
        };
    }

    private static VBoxContainer VBox(int spacing)
    {
        return new VBoxContainer
        {
            Position = new Vector2(14, 14),
            Size = new Vector2(230, 720),
            Theme = new Theme(),
            MouseFilter = Control.MouseFilterEnum.Stop
        };
    }

    private void RedrawMap()
    {
        foreach (var child in _mapVisual.GetChildren()) child.QueueFree();

        foreach (var tile in _state.Tiles.OrderBy(t => t.X + t.Y).ThenBy(t => t.X))
        {
            var center = TileToScreen(tile.X, tile.Y);
            var polygon = new Polygon2D
            {
                Polygon = new[]
                {
                    new Vector2(center.X, center.Y - TileHeight / 2f),
                    new Vector2(center.X + TileWidth / 2f, center.Y),
                    new Vector2(center.X, center.Y + TileHeight / 2f),
                    new Vector2(center.X - TileWidth / 2f, center.Y)
                },
                Color = TileColor(tile)
            };
            _mapVisual.AddChild(polygon);

            var border = new Line2D
            {
                Width = 1.2f,
                DefaultColor = new Color(0, 0, 0, 0.22f),
                Points = new[]
                {
                    new Vector2(center.X, center.Y - TileHeight / 2f),
                    new Vector2(center.X + TileWidth / 2f, center.Y),
                    new Vector2(center.X, center.Y + TileHeight / 2f),
                    new Vector2(center.X - TileWidth / 2f, center.Y),
                    new Vector2(center.X, center.Y - TileHeight / 2f)
                }
            };
            _mapVisual.AddChild(border);

            var structure = _state.StructureAt(tile.X, tile.Y);
            if (structure is not null)
            {
                var marker = new Label
                {
                    Text = StructureSymbol(structure),
                    Position = center + new Vector2(-18, -30),
                    Size = new Vector2(44, 28),
                    HorizontalAlignment = HorizontalAlignment.Center,
                    Modulate = StructureLabelColor(structure)
                };
                _mapVisual.AddChild(marker);
            }
        }
    }

    private void RefreshUi(int? selectedX = null, int? selectedY = null)
    {
        var occupied = _state.Structures.Count(s => s.IsOccupied);
        var plots = _state.Structures.Count(s => Buildables.All[s.Type].IsPlot);
        var speedLabel = _speed == 0 ? "Paused" : $"{_speed:0}x";
        _status.Text = $"Day {_state.Day}, {_state.Hour:00}:00\nSpeed: {speedLabel}\nTicks: {_ticksAdvanced}\n{_state.Season} / {_state.Weather}\nMoney: ${_state.Money:0}\nReputation: {_state.Reputation:0.0} stars\nDemand: {_state.Demand:0.00}x\nOccupancy: {occupied}/{plots}\nSelected: {Buildables.All[_selectedBuild].DisplayName}";
        _eventLabel.Text = _state.LastEvent;

        foreach (var row in GetTree().Root.FindChildren("*", "HBoxContainer", true, false).OfType<HBoxContainer>())
        {
            if (!row.HasMeta("price_label") || !row.HasMeta("price_type")) continue;
            var priceLabel = row.GetMeta("price_label").As<Label>();
            var type = Enum.Parse<StructureType>(row.GetMeta("price_type").AsString());
            priceLabel.Text = $"${_state.Pricing.GetPrice(type):0}";
        }

        _inspector.Text = selectedX.HasValue && selectedY.HasValue
            ? InspectTile(selectedX.Value, selectedY.Value)
            : "Click a tile to inspect it or place the selected build item.";

        var recentChatter = _state.Chatter.TakeLast(8).Select(c => $"[{c.Day} {c.Hour:00}:00] {c.Text}");
        var recentReviews = _state.Reviews.TakeLast(5).Select(r => $"Review {r.Stars}/5: {r.Text}");
        var recentLedger = _state.Ledger.TakeLast(5).Select(e => $"{e.Kind}: {e.Amount:+0;-0;0} {e.Description}");
        _feed.Text = string.Join("\n\n", recentChatter.Concat(recentReviews).Concat(recentLedger));
    }

    private string InspectTile(int x, int y)
    {
        var tile = _state.TileAt(x, y);
        if (tile is null) return "Outside the campground.";
        var structure = _state.StructureAt(x, y);
        if (structure is null)
        {
            var canBuild = Buildables.All[_selectedBuild].AllowedTerrain.Contains(tile.Terrain) && !tile.StructureId.HasValue;
            return $"Tile {x},{y}\nTerrain: {tile.Terrain}\nBuild preview: {Buildables.All[_selectedBuild].DisplayName}\n{(canBuild ? "Placement allowed." : "Placement blocked.")}";
        }

        var definition = Buildables.All[structure.Type];
        var tourist = structure.TouristId.HasValue ? _state.Tourists.FirstOrDefault(t => t.Id == structure.TouristId.Value) : null;
        var guestLine = tourist is null ? "Vacant" : $"{tourist.Name}, {tourist.Satisfaction:0}% satisfied";
        var priceLine = definition.IsPlot ? $"\nNightly price: ${_state.Pricing.GetPrice(structure.Type):0}" : "";
        return $"{definition.DisplayName}\nTile {x},{y}\nStatus: {guestLine}{priceLine}\nMaintenance: ${definition.MaintenanceCost:0}/day";
    }

    private async Task SaveNowAsync()
    {
        if (_isSaving) return;
        _isSaving = true;
        await _saveRepository.SaveAsync(_state);
        _isSaving = false;
    }

    private Vector2 TileToScreen(int x, int y)
    {
        return new Vector2((x - y) * TileWidth / 2f, (x + y) * TileHeight / 2f) + _mapOrigin;
    }

    private Vector2I ScreenToTile(Vector2 screen)
    {
        var local = screen - _mapOrigin;
        var a = local.X / (TileWidth / 2f);
        var b = local.Y / (TileHeight / 2f);
        var x = Mathf.FloorToInt((a + b) / 2f + 0.5f);
        var y = Mathf.FloorToInt((b - a) / 2f + 0.5f);
        return new Vector2I(x, y);
    }

    private static Color TerrainColor(TerrainType terrain)
    {
        return terrain switch
        {
            TerrainType.Grass => new Color("#4f9a5f"),
            TerrainType.Water => new Color("#3f8fbf"),
            TerrainType.Trees => new Color("#2f6042"),
            TerrainType.Path => new Color("#9a8f73"),
            TerrainType.Sand => new Color("#d8c27a"),
            _ => Colors.White
        };
    }

    private Color TileColor(TileState tile)
    {
        var baseColor = TerrainColor(tile.Terrain);
        if (_hoverTile is not { } hover || hover.X != tile.X || hover.Y != tile.Y) return baseColor;
        var canBuild = !tile.StructureId.HasValue && Buildables.All[_selectedBuild].AllowedTerrain.Contains(tile.Terrain);
        return canBuild ? baseColor.Lightened(0.22f) : new Color("#b94b55");
    }

    private string StructureSymbol(StructureState structure)
    {
        var symbol = structure.Type switch
        {
            StructureType.TentSite => "T",
            StructureType.CampervanSpot => "V",
            StructureType.RvHookup => "RV",
            StructureType.Restroom => "WC",
            StructureType.Shower => "SH",
            StructureType.FirePit => "FP",
            StructureType.Playground => "PG",
            StructureType.CampStore => "ST",
            _ => "?"
        };
        if (structure.TouristId.HasValue)
        {
            var tourist = _state.Tourists.FirstOrDefault(t => t.Id == structure.TouristId.Value);
            if (tourist is { Satisfaction: < 42 }) symbol = $"!{symbol}";
        }
        return structure.IsOccupied ? $"[{symbol}]" : symbol;
    }

    private Color StructureLabelColor(StructureState structure)
    {
        if (!structure.TouristId.HasValue) return Colors.White;
        var tourist = _state.Tourists.FirstOrDefault(t => t.Id == structure.TouristId.Value);
        return tourist is { Satisfaction: < 42 } ? new Color("#ffcf5a") : Colors.White;
    }
}
