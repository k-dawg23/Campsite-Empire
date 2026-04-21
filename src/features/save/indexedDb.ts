import type { GameState } from '../simulation/types';
import { saveSchemaVersion } from '../simulation/types';

const dbName = 'campsite-empire-v2';
const storeName = 'saves';
const saveKey = 'autosave';

interface SaveEnvelope {
  schemaVersion: number;
  savedAt: string;
  state: GameState;
}

export async function saveGameState(state: GameState): Promise<void> {
  const db = await openDatabase();
  const envelope: SaveEnvelope = {
    schemaVersion: saveSchemaVersion,
    savedAt: new Date().toISOString(),
    state
  };
  await requestToPromise(db.transaction(storeName, 'readwrite').objectStore(storeName).put(envelope, saveKey));
  db.close();
}

export async function loadGameState(): Promise<GameState | undefined> {
  const db = await openDatabase();
  const envelope = await requestToPromise<SaveEnvelope | undefined>(
    db.transaction(storeName, 'readonly').objectStore(storeName).get(saveKey)
  );
  db.close();
  if (!envelope || envelope.schemaVersion !== saveSchemaVersion) return undefined;
  return envelope.state;
}

export async function clearSavedGame(): Promise<void> {
  const db = await openDatabase();
  await requestToPromise(db.transaction(storeName, 'readwrite').objectStore(storeName).delete(saveKey));
  db.close();
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) db.createObjectStore(storeName);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestToPromise<T = unknown>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
