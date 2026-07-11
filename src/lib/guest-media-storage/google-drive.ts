import "server-only";

import { Readable } from "stream";

import { google } from "googleapis";

import { env } from "@/lib/env";
import { normalizePrivateKey } from "@/lib/google-credentials";

import type {
  GuestMediaStorageProvider,
  GuestMediaUploadMeta,
  StoredGuestMedia,
  WeddingFolders,
} from "./types";

const folderCache = new Map<string, WeddingFolders>();

function getDriveClient() {
  const email = env.googleDriveServiceAccountEmail;
  const key = normalizePrivateKey(env.googleDriveServiceAccountPrivateKey);
  if (!email || !key) {
    throw new Error("Google Drive is not configured. Set service account credentials.");
  }
  if (!key.includes("-----BEGIN") || !key.includes("-----END")) {
    throw new Error("Google Drive private key is malformed. Check GOOGLE_DRIVE_SERVICE_ACCOUNT_PRIVATE_KEY.");
  }

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
}

function sanitizeFolderName(name: string) {
  return name.replace(/[^\w\s-]/g, "").trim().slice(0, 60) || "Wedding";
}

async function findOrCreateFolder(
  drive: ReturnType<typeof getDriveClient>,
  name: string,
  parentId: string,
): Promise<string> {
  const query = [
    `'${parentId}' in parents`,
    `name = '${name.replace(/'/g, "\\'")}'`,
    "mimeType = 'application/vnd.google-apps.folder'",
    "trashed = false",
  ].join(" and ");

  const existing = await drive.files.list({
    q: query,
    fields: "files(id)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const found = existing.data.files?.[0]?.id;
  if (found) return found;

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
    supportsAllDrives: true,
  });

  if (!created.data.id) throw new Error("Failed to create Drive folder.");
  return created.data.id;
}

export class GoogleDriveGuestMediaStorage implements GuestMediaStorageProvider {
  private driveClient: ReturnType<typeof getDriveClient> | null = null;

  private get drive() {
    if (!this.driveClient) {
      this.driveClient = getDriveClient();
    }
    return this.driveClient;
  }

  async ensureWeddingFolders(weddingId: string, weddingTitle: string): Promise<WeddingFolders> {
    const cached = folderCache.get(weddingId);
    if (cached) return cached;

    const rootId = env.googleDriveRootFolderId;
    if (!rootId) throw new Error("GOOGLE_DRIVE_ROOT_FOLDER_ID is not configured.");

    const weddingFolderName = `${weddingId.slice(0, 8)}-${sanitizeFolderName(weddingTitle)}`;
    const weddingFolderId = await findOrCreateFolder(this.drive, weddingFolderName, rootId);
    const photosFolderId = await findOrCreateFolder(this.drive, "Photos", weddingFolderId);
    const videosFolderId = await findOrCreateFolder(this.drive, "Videos", weddingFolderId);

    const folders = { photosFolderId, videosFolderId };
    folderCache.set(weddingId, folders);
    return folders;
  }

  async upload(file: Buffer, meta: GuestMediaUploadMeta): Promise<StoredGuestMedia> {
    const folders = await this.ensureWeddingFolders(meta.weddingId, meta.weddingTitle);
    const parentId = meta.mediaType === "IMAGE" ? folders.photosFolderId : folders.videosFolderId;

    const response = await this.drive.files.create({
      requestBody: {
        name: meta.fileName,
        parents: [parentId],
      },
      media: {
        mimeType: meta.mimeType,
        body: Readable.from(file),
      },
      fields: "id, name, mimeType, size, thumbnailLink",
      supportsAllDrives: true,
    });

    const fileId = response.data.id;
    if (!fileId) throw new Error("Drive upload failed.");

    return {
      fileId,
      fileName: response.data.name ?? meta.fileName,
      mimeType: response.data.mimeType ?? meta.mimeType,
      fileSize: Number(response.data.size ?? file.length),
      mediaType: meta.mediaType,
      thumbnailUrl: response.data.thumbnailLink ?? undefined,
    };
  }

  async getFileStream(fileId: string) {
    const meta = await this.drive.files.get({
      fileId,
      fields: "name, mimeType",
      supportsAllDrives: true,
    });

    const response = await this.drive.files.get(
      { fileId, alt: "media", supportsAllDrives: true },
      { responseType: "stream" },
    );

    return {
      stream: response.data as NodeJS.ReadableStream,
      mimeType: meta.data.mimeType ?? "application/octet-stream",
      fileName: meta.data.name ?? "download",
    };
  }

  async delete(fileId: string): Promise<void> {
    await this.drive.files.delete({ fileId, supportsAllDrives: true });
  }
}
