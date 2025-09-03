// utils/storage.ts

export function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getFromStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null; // seguridad SSR

  const data = localStorage.getItem(key);
  if (!data) return null;

  try {
    return JSON.parse(data) as T;
  } catch (err) {
    console.warn(`⚠️ Valor inválido en localStorage para "${key}":`, data);

    // OPCIÓN 1: lo borras para no volver a fallar
    localStorage.removeItem(key);
    return null;

    // OPCIÓN 2: en vez de borrar, devuelves el string crudo
    // return data as unknown as T;
  }
}




export function removeFromStorage(key: string): void {
  localStorage.removeItem(key);
}
