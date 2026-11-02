import jsQR from "jsqr";

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats?: string[] }) => {
      detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>;
    };
  }
}

export function cameraSupportMessage(): string | null {
  if (typeof window === "undefined") return null;
  if (!window.isSecureContext) {
    return "Camera needs a secure link (https:// or localhost). Open the coordinator link from the dashboard on this device.";
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return "This browser cannot access the camera. Try Chrome or Edge, or upload a QR image.";
  }
  return null;
}

export async function requestCameraStream(): Promise<MediaStream> {
  const supportError = cameraSupportMessage();
  if (supportError) throw new Error(supportError);

  const attempts: MediaStreamConstraints[] = [
    { audio: false, video: { facingMode: { ideal: "environment" } } },
    { audio: false, video: { facingMode: "environment" } },
    { audio: false, video: { facingMode: "user" } },
    { audio: false, video: true },
  ];

  let lastError: unknown;
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      lastError = error;
    }
  }

  const name =
    lastError && typeof lastError === "object" && "name" in lastError
      ? String((lastError as { name?: string }).name)
      : "";

  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    throw new Error("Camera permission was blocked. Allow camera access for this site, then try again.");
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    throw new Error("No camera was found on this device. Use Upload QR image instead.");
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    throw new Error("Camera is in use by another app. Close it and try again.");
  }

  throw new Error("Could not start the camera. Try Chrome/Edge, or upload a QR image.");
}

async function detectWithBarcodeDetector(source: ImageBitmapSource): Promise<string | null> {
  if (!window.BarcodeDetector) return null;
  try {
    const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
    const codes = await detector.detect(source);
    return codes[0]?.rawValue?.trim() || null;
  } catch {
    return null;
  }
}

function detectWithJsQrFromImageData(imageData: ImageData): string | null {
  const result = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "dontInvert",
  });
  return result?.data?.trim() || null;
}

export async function decodeQrFromVideo(video: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<string | null> {
  const fromDetector = await detectWithBarcodeDetector(video);
  if (fromDetector) return fromDetector;

  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) return null;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, width, height);
  return detectWithJsQrFromImageData(ctx.getImageData(0, 0, width, height));
}

export async function decodeQrFromFile(file: File): Promise<string | null> {
  const bitmap = await createImageBitmap(file);
  try {
    const fromDetector = await detectWithBarcodeDetector(bitmap);
    if (fromDetector) return fromDetector;

    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0);
    return detectWithJsQrFromImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
  } finally {
    bitmap.close();
  }
}
