import "server-only";

import { GoogleDriveGuestMediaStorage } from "./google-drive";
import type { GuestMediaStorageProvider } from "./types";

let provider: GuestMediaStorageProvider | null = null;

export function getGuestMediaStorage(): GuestMediaStorageProvider {
  if (!provider) {
    const driver = process.env.GUEST_MEDIA_STORAGE_DRIVER ?? "google-drive";
    if (driver === "google-drive") {
      provider = new GoogleDriveGuestMediaStorage();
    } else {
      throw new Error(`Unsupported guest media storage driver: ${driver}`);
    }
  }
  return provider;
}

export type { GuestMediaStorageProvider, StoredGuestMedia, GuestMediaType } from "./types";
