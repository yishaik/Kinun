/** Local-only portrait for the sign-in screen. Never uploaded — Spark has no Storage. */

export const PHOTO_DB = 'kinun-local';
export const PHOTO_STORE = 'photos';
export const SIGNIN_PHOTO_KEY = 'signin-portrait';
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
export const MAX_PHOTO_EDGE = 1280;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(PHOTO_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) db.createObjectStore(PHOTO_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB לא זמין'));
  });
}

export async function loadLocalPhoto(key = SIGNIN_PHOTO_KEY): Promise<Blob | null> {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const req = db.transaction(PHOTO_STORE, 'readonly').objectStore(PHOTO_STORE).get(key);
      req.onsuccess = () => {
        const value = req.result;
        resolve(value instanceof Blob ? value : null);
      };
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

export async function saveLocalPhoto(blob: Blob, key = SIGNIN_PHOTO_KEY): Promise<void> {
  if (blob.size > MAX_PHOTO_BYTES) throw new Error('התמונה גדולה מדי לשמירה במכשיר');
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const req = db.transaction(PHOTO_STORE, 'readwrite').objectStore(PHOTO_STORE).put(blob, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

export async function clearLocalPhoto(key = SIGNIN_PHOTO_KEY): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const req = db.transaction(PHOTO_STORE, 'readwrite').objectStore(PHOTO_STORE).delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

/** Resize and compress a user-chosen image so it stays small on the device. */
export async function prepareLocalPhoto(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('צריך קובץ תמונה');
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_PHOTO_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('לא ניתן לעבד את התמונה');
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.8));
    if (!blob) throw new Error('לא ניתן לשמור את התמונה');
    if (blob.size > MAX_PHOTO_BYTES) throw new Error('התמונה גדולה מדי לשמירה במכשיר');
    return blob;
  } finally {
    bitmap.close();
  }
}
