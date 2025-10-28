import { openDB } from 'idb';

const DB_NAME = 'audio-cache';
const STORE_NAME = 'tracks';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

export const saveTrack = async (id, blob) => {
  const db = await initDB();
  await db.put(STORE_NAME, { id, blob });
};

export const getTrack = async (id) => {
  const db = await initDB();
  return db.get(STORE_NAME, id);
};

export const clearTracks = async () => {
  const db = await initDB();
  await db.clear(STORE_NAME);
};
