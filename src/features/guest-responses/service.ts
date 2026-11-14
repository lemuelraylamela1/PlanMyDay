import "server-only";

import { db } from "@/lib/db";
import { formatGuestDisplayName } from "@/features/guests/display-name";
import { splitRsvpMessage } from "@/features/invitations/rsvp-message";
import type { GuestResponseRow } from "@/features/guest-responses/types";

export type { GuestResponseRow };

/** Latest non-pending RSVP per guest for the wedding dashboard. */
export async function listGuestResponses(weddingId: string): Promise<GuestResponseRow[]> {
  const responses = await db.rsvpResponse.findMany({
    where: {
      weddingId,
      status: { not: "PENDING" },
      guest: {
        deletedAt: null,
        // Match Guests table: hide responses when the guest is still Pending.
        rsvpStatus: { not: "PENDING" },
      },
    },
    orderBy: { submittedAt: "desc" },
    include: {
      guest: {
        select: {
          id: true,
          title: true,
          firstName: true,
          lastName: true,
          preferredName: true,
          deletedAt: true,
          rsvpStatus: true,
        },
      },
    },
  });

  const latestByGuest = new Map<string, (typeof responses)[number]>();
  for (const response of responses) {
    if (latestByGuest.has(response.guestId)) continue;
    latestByGuest.set(response.guestId, response);
  }

  return Array.from(latestByGuest.values()).map((response) => {
    const { note, hashtags } = splitRsvpMessage(response.message);

    return {
      id: response.id,
      guestId: response.guestId,
      name: formatGuestDisplayName(response.guest),
      status: response.status as GuestResponseRow["status"],
      attending: response.attending,
      mealPreference: response.mealPreference,
      dietaryRestrictions: response.dietaryRestrictions,
      message: note,
      hashtags,
      submittedAt: response.submittedAt,
    };
  });
}
