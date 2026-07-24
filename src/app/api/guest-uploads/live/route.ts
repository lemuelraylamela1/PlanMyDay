import { db } from "@/lib/db";
import { getCurrentWedding } from "@/lib/wedding-context";
import { requireWeddingOwner } from "@/lib/authz";
import { subscribeGuestUploadEvents } from "@/lib/guest-upload-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getUploadSignature(weddingId: string) {
  const [count, latest] = await Promise.all([
    db.guestMediaUpload.count({
      where: { weddingId, deletedAt: null },
    }),
    db.guestMediaUpload.findFirst({
      where: { weddingId, deletedAt: null },
      orderBy: { uploadedAt: "desc" },
      select: { uploadedAt: true, id: true },
    }),
  ]);
  return `${count}:${latest?.id ?? ""}:${latest?.uploadedAt?.toISOString() ?? ""}`;
}

/**
 * Server-Sent Events stream for the guest-upload gallery.
 * Sends `refresh` when data changes so the client fetches the list once —
 * instead of polling the full list API every few seconds.
 */
export async function GET(request: Request) {
  let wedding;
  try {
    ({ wedding } = await getCurrentWedding());
    await requireWeddingOwner(wedding.id);
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  const weddingId = wedding.id;
  const encoder = new TextEncoder();
  let lastSignature = await getUploadSignature(weddingId);
  let interval: ReturnType<typeof setInterval> | undefined;
  let unsubscribe: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      send({ type: "connected" });

      unsubscribe = subscribeGuestUploadEvents(weddingId, () => {
        try {
          send({ type: "refresh" });
        } catch {
          // Stream may already be closed.
        }
      });

      // Heartbeat + cross-instance fallback (tiny signature query, not full gallery).
      interval = setInterval(() => {
        void (async () => {
          try {
            send({ type: "ping" });
            const signature = await getUploadSignature(weddingId);
            if (signature !== lastSignature) {
              lastSignature = signature;
              send({ type: "refresh" });
            }
          } catch {
            // Ignore; client reconnects if the stream ends.
          }
        })();
      }, 20_000);

      const onAbort = () => {
        if (interval) clearInterval(interval);
        unsubscribe?.();
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      request.signal.addEventListener("abort", onAbort);
    },
    cancel() {
      if (interval) clearInterval(interval);
      unsubscribe?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
