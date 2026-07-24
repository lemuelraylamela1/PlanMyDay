import "server-only";

export type GuestUploadLiveEvent = {
  type: "created" | "deleted" | "changed";
};

type Listener = (event: GuestUploadLiveEvent) => void;

const listenersByWedding = new Map<string, Set<Listener>>();

/** Subscribe to guest-upload changes for a wedding (same Node process). */
export function subscribeGuestUploadEvents(weddingId: string, listener: Listener) {
  let set = listenersByWedding.get(weddingId);
  if (!set) {
    set = new Set();
    listenersByWedding.set(weddingId, set);
  }
  set.add(listener);

  return () => {
    set!.delete(listener);
    if (set!.size === 0) listenersByWedding.delete(weddingId);
  };
}

/** Notify open gallery SSE connections that data changed. */
export function publishGuestUploadEvent(weddingId: string, type: GuestUploadLiveEvent["type"]) {
  const set = listenersByWedding.get(weddingId);
  if (!set || set.size === 0) return;
  const event: GuestUploadLiveEvent = { type };
  for (const listener of set) {
    try {
      listener(event);
    } catch {
      // Ignore broken listeners.
    }
  }
}
