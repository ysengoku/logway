const LOCK_NAME = 'logway-db';

let acquired: Promise<boolean> | null = null;

// The OPFS database (opfs-sahpool) can only be opened by one tab at a time.
// The first tab holds this lock until it closes; later tabs get `false`.
export function acquireTabLock(): Promise<boolean> {
  acquired ??= new Promise((resolve) => {
    if (!('locks' in navigator)) {
      resolve(true);
      return;
    }
    navigator.locks
      // Wait briefly, since the previous page may still hold the lock right after navigating.
      .request(LOCK_NAME, { signal: AbortSignal.timeout(1500) }, () => {
        resolve(true);
        return new Promise<never>(() => {});
      })
      .catch(() => resolve(false));
  });
  return acquired;
}
