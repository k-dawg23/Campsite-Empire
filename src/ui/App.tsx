import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { getAiConfig } from '../features/ai/client';
import { buildableOrder, buildables, plotTypes } from '../features/simulation/buildables';
import {
  adjustPrice,
  hydrateGame,
  markSaved,
  placeSelectedBuild,
  resetGame,
  runHourlyTick,
  selectBuild,
  selectTile,
  setSpeed
} from '../features/simulation/gameSlice';
import {
  priceFor,
  selectAiStatus,
  selectGame,
  selectOccupancy,
  selectVisibleFeed
} from '../features/simulation/selectors';
import type { GameState, StructureState, StructureType, TileState } from '../features/simulation/types';
import { clearSavedGame, loadGameState, saveGameState } from '../features/save/indexedDb';

const tileWidth = 72;
const tileHeight = 36;
const mapOrigin = { x: 575, y: 34 };

export function App() {
  const dispatch = useAppDispatch();
  const game = useAppSelector(selectGame);
  const occupancy = useAppSelector(selectOccupancy);
  const feed = useAppSelector(selectVisibleFeed);
  const ai = useAppSelector(selectAiStatus);
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | undefined>();
  const [loaded, setLoaded] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    getAiConfig();
    loadGameState()
      .then((saved) => {
        if (saved) dispatch(hydrateGame(saved));
      })
      .finally(() => setLoaded(true));
  }, [dispatch]);

  useEffect(() => {
    if (!loaded || game.speed === 0) return undefined;
    const interval = window.setInterval(() => {
      if (ticking.current) return;
      ticking.current = true;
      dispatch(runHourlyTick()).finally(() => {
        ticking.current = false;
      });
    }, 1000 / game.speed);
    return () => window.clearInterval(interval);
  }, [dispatch, game.speed, loaded]);

  useEffect(() => {
    if (!loaded) return undefined;
    const interval = window.setInterval(() => {
      saveGameState(game)
        .then(() => dispatch(markSaved()))
        .catch(() => undefined);
    }, 3500);
    return () => window.clearInterval(interval);
  }, [dispatch, game, loaded]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === ' ') dispatch(setSpeed(0));
      if (event.key === '1') dispatch(setSpeed(1));
      if (event.key === '2') dispatch(setSpeed(2));
      if (event.key === '5') dispatch(setSpeed(5));
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dispatch]);

  const selectedInfo = useMemo(() => describeSelection(game), [game]);

  async function startFreshGame() {
    await clearSavedGame();
    dispatch(resetGame());
  }

  return (
    <main className="min-h-screen bg-[#eef2e8] text-pine">
      <div className="flex min-h-screen flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-pine/10 bg-pine px-5 py-3 text-white">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">Campsite Empire</h1>
            <p className="text-sm text-white/75">v{game.version} · React + TypeScript + Redux</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Metric label="Money" value={`$${game.money.toFixed(0)}`} />
            <Metric label="Reputation" value={`${game.reputation.toFixed(1)}★`} />
            <Metric label="Occupancy" value={`${occupancy.occupied}/${occupancy.total}`} />
            <Metric label="Demand" value={`${game.demand.toFixed(2)}x`} />
          </div>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-4 p-4 xl:grid-cols-[280px_minmax(720px,1fr)_330px]">
          <aside className="space-y-4">
            <Panel title="Build">
              <div className="grid gap-2">
                {buildableOrder.map((type) => {
                  const item = buildables[type];
                  const active = game.selectedBuild === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition ${
                        active
                          ? 'border-pine bg-pine text-white'
                          : 'border-pine/15 bg-white hover:border-pine/40'
                      }`}
                      title={`${item.name}: build $${item.buildCost}, maintenance $${item.maintenanceCost}/day`}
                      onClick={() => dispatch(selectBuild(type))}
                    >
                      <span className="font-medium">{item.name}</span>
                      <span>{item.isPlot ? `$${priceFor(game, type)}/night` : `$${item.buildCost}`}</span>
                    </button>
                  );
                })}
              </div>
            </Panel>

            <Panel title="Prices">
              <div className="space-y-2">
                {plotTypes.map((type) => (
                  <PriceControl key={type} type={type} game={game} />
                ))}
              </div>
            </Panel>

            <Panel title="Speed">
              <div className="grid grid-cols-4 gap-2">
                {([0, 1, 2, 5] as const).map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    className={`rounded-md border px-2 py-2 text-sm font-semibold ${
                      game.speed === speed ? 'border-pine bg-pine text-white' : 'border-pine/15 bg-white'
                    }`}
                    onClick={() => dispatch(setSpeed(speed))}
                  >
                    {speed === 0 ? 'Pause' : `${speed}x`}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-pine/70">Day {game.day}, {game.hour.toString().padStart(2, '0')}:00 · {game.season} · {game.weather}</p>
            </Panel>
          </aside>

          <section className="min-h-[650px] overflow-hidden rounded-md border border-pine/10 bg-canvas shadow-panel">
            <IsometricMap game={game} hoveredTile={hoveredTile} onHover={setHoveredTile} />
          </section>

          <aside className="space-y-4">
            <Panel title="Inspector">
              <div className="whitespace-pre-line text-sm leading-6">{selectedInfo}</div>
              <button
                type="button"
                className="mt-4 w-full rounded-md border border-pine/20 bg-white px-3 py-2 text-sm font-semibold hover:border-pine/50"
                onClick={startFreshGame}
              >
                New Game
              </button>
            </Panel>

            <Panel title="AI Status">
              <div className="space-y-2 text-sm">
                <StatusLine label="Provider" value={ai.provider || 'fallback only'} />
                <StatusLine label="Model" value={ai.model} />
                <StatusLine label="Last" value={ai.lastSource === 'none' ? 'none yet' : `${ai.lastFeature}: ${ai.lastSource}`} />
                <StatusLine label="Local calls" value={String(ai.successCount)} />
                <StatusLine label="Fallbacks" value={String(ai.fallbackCount)} />
                {ai.lastError ? <p className="rounded-md bg-amber-100 px-3 py-2 text-amber-900">{ai.lastError}</p> : null}
              </div>
            </Panel>

            <Panel title="Camp Feed">
              <div className="max-h-[430px] space-y-3 overflow-auto pr-1 text-sm">
                {feed.chatter.map((item) => (
                  <FeedItem key={item.id} label={`${item.day} ${item.hour.toString().padStart(2, '0')}:00`} text={item.text} />
                ))}
                {feed.reviews.map((item) => (
                  <FeedItem key={item.id} label={`Review ${item.stars}/5`} text={item.text} />
                ))}
                {feed.ledger.map((item) => (
                  <FeedItem key={item.id} label={item.kind} text={`${item.amount >= 0 ? '+' : ''}$${item.amount.toFixed(0)} · ${item.description}`} />
                ))}
              </div>
            </Panel>
          </aside>
        </div>

        <footer className="border-t border-pine/10 bg-white px-5 py-3 text-sm text-pine/75">
          {game.lastEvent} · Ticks {game.ticksAdvanced} · Last save {game.lastSavedAt ? new Date(game.lastSavedAt).toLocaleTimeString() : 'pending'}
        </footer>
      </div>
    </main>
  );
}

function IsometricMap({
  game,
  hoveredTile,
  onHover
}: {
  game: GameState;
  hoveredTile?: { x: number; y: number };
  onHover: (tile: { x: number; y: number } | undefined) => void;
}) {
  const dispatch = useAppDispatch();
  const selectedBuild = buildables[game.selectedBuild];
  const sortedTiles = [...game.tiles].sort((left, right) => left.x + left.y - (right.x + right.y) || left.x - right.x);
  return (
    <svg viewBox="0 0 1120 690" className="h-full min-h-[650px] w-full" role="img" aria-label="Campsite map">
      <rect width="1120" height="690" fill="#f5efe2" />
      {sortedTiles.map((tile) => {
        const points = tilePoints(tile.x, tile.y);
        const structure = game.structures.find((candidate) => candidate.x === tile.x && candidate.y === tile.y);
        const canBuild = !tile.structureId && selectedBuild.allowedTerrain.includes(tile.terrain);
        const hovered = hoveredTile?.x === tile.x && hoveredTile.y === tile.y;
        const selected = game.selectedTile?.x === tile.x && game.selectedTile.y === tile.y;
        return (
          <g key={`${tile.x}-${tile.y}`}>
            <polygon
              points={points}
              fill={hovered ? (canBuild ? lighten(terrainColor(tile.terrain)) : '#b94b55') : terrainColor(tile.terrain)}
              stroke={selected ? '#10271e' : 'rgba(16,39,30,0.24)'}
              strokeWidth={selected ? 3 : 1}
              onMouseEnter={() => onHover({ x: tile.x, y: tile.y })}
              onMouseLeave={() => onHover(undefined)}
              onClick={() => dispatch(placeSelectedBuild({ x: tile.x, y: tile.y }))}
              className="cursor-pointer transition-colors"
            />
            {structure ? <StructureMarker structure={structure} game={game} /> : null}
          </g>
        );
      })}
    </svg>
  );
}

function StructureMarker({ structure, game }: { structure: StructureState; game: GameState }) {
  const center = tileCenter(structure.x, structure.y);
  const tourist = structure.touristId ? game.tourists.find((candidate) => candidate.id === structure.touristId) : undefined;
  const unhappy = tourist ? tourist.satisfaction < 42 : false;
  return (
    <g pointerEvents="none">
      <circle cx={center.x} cy={center.y - 16} r={15} fill={structure.isOccupied ? '#10271e' : '#ffffff'} stroke="#10271e" strokeWidth="2" />
      <text
        x={center.x}
        y={center.y - 11}
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill={structure.isOccupied ? '#ffffff' : '#10271e'}
      >
        {unhappy ? '!' : buildables[structure.type].symbol}
      </text>
    </g>
  );
}

function PriceControl({ type, game }: { type: StructureType; game: GameState }) {
  const dispatch = useAppDispatch();
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 text-sm">
      <span className="font-medium">{buildables[type].name}</span>
      <button className="rounded border border-pine/20 bg-white px-2 py-1" onClick={() => dispatch(adjustPrice({ type, delta: -2 }))}>-</button>
      <span className="w-12 text-center">${priceFor(game, type)}</span>
      <button className="rounded border border-pine/20 bg-white px-2 py-1" onClick={() => dispatch(adjustPrice({ type, delta: 2 }))}>+</button>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-md border border-pine/10 bg-white p-4 shadow-panel">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-pine/70">{title}</h2>
      {children}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white/10 px-3 py-2">
      <div className="text-[11px] uppercase text-white/60">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-pine/60">{label}</span>
      <span className="truncate text-right font-medium">{value}</span>
    </div>
  );
}

function FeedItem({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-md bg-[#f5efe2] px-3 py-2">
      <div className="text-xs font-semibold uppercase text-pine/55">{label}</div>
      <div>{text}</div>
    </div>
  );
}

function describeSelection(game: GameState): string {
  const selected = game.selectedTile;
  if (!selected) return 'Click a tile to inspect it or place the selected build item.';
  const tile = game.tiles.find((candidate) => candidate.x === selected.x && candidate.y === selected.y);
  if (!tile) return 'Outside the campground.';
  const structure = game.structures.find((candidate) => candidate.x === selected.x && candidate.y === selected.y);
  if (!structure) {
    const canBuild = !tile.structureId && buildables[game.selectedBuild].allowedTerrain.includes(tile.terrain);
    return `Tile ${selected.x},${selected.y}\nTerrain: ${tile.terrain}\nBuild preview: ${buildables[game.selectedBuild].name}\n${canBuild ? 'Placement allowed.' : 'Placement blocked.'}`;
  }
  const definition = buildables[structure.type];
  const tourist = structure.touristId ? game.tourists.find((candidate) => candidate.id === structure.touristId) : undefined;
  const guest = tourist ? `${tourist.name}, ${tourist.satisfaction.toFixed(0)}% satisfied` : 'Vacant';
  const price = definition.isPlot ? `\nNightly price: $${priceFor(game, structure.type)}` : '';
  return `${definition.name}\nTile ${selected.x},${selected.y}\nStatus: ${guest}${price}\nMaintenance: $${definition.maintenanceCost}/day`;
}

function tileCenter(x: number, y: number) {
  return {
    x: (x - y) * (tileWidth / 2) + mapOrigin.x,
    y: (x + y) * (tileHeight / 2) + mapOrigin.y
  };
}

function tilePoints(x: number, y: number): string {
  const center = tileCenter(x, y);
  return [
    `${center.x},${center.y - tileHeight / 2}`,
    `${center.x + tileWidth / 2},${center.y}`,
    `${center.x},${center.y + tileHeight / 2}`,
    `${center.x - tileWidth / 2},${center.y}`
  ].join(' ');
}

function terrainColor(terrain: TileState['terrain']): string {
  if (terrain === 'grass') return '#4f9a5f';
  if (terrain === 'water') return '#3f8fbf';
  if (terrain === 'trees') return '#2f6042';
  if (terrain === 'path') return '#9a8f73';
  return '#d8c27a';
}

function lighten(color: string): string {
  if (color === '#2f6042') return '#477d5b';
  if (color === '#3f8fbf') return '#65acd4';
  if (color === '#9a8f73') return '#b5aa8c';
  if (color === '#d8c27a') return '#ead58f';
  return '#70b87a';
}
