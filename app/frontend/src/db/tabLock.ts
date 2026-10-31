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
    void navigator.locks.request(LOCK_NAME, { ifAvailable: true }, (lock) => {
      resolve(lock !== null);
      // Returning a pending promise keeps the lock held for the tab's lifetime.
      return lock ? new Promise<never>(() => {}) : undefined;
    });
  });
  return acquired;
}
