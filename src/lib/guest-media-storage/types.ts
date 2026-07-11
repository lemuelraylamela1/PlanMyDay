export type GuestMediaType = "IMAGE" | "VIDEO";

export interface StoredGuestMedia {
  fileId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  mediaType: GuestMediaType;
  thumbnailUrl?: string;
}

export interface GuestMediaUploadMeta {
  weddingId: string;
  weddingTitle: string;
  fileName: string;
  mimeType: string;
  mediaType: GuestMediaType;
}

export interface WeddingFolders {
  photosFolderId: string;
  videosFolderId: string;
}

export interface GuestMediaStorageProvider {
  ensureWeddingFolders(weddingId: string, weddingTitle: string): Promise<WeddingFolders>;
  upload(file: Buffer, meta: GuestMediaUploadMeta): Promise<StoredGuestMedia>;
  getFileStream(fileId: string): Promise<{ stream: NodeJS.ReadableStream; mimeType: string; fileName: string }>;
  delete(fileId: string): Promise<void>;
}
