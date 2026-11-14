/** Marker used when guests submit a note + suggested hashtags in one message field. */
export const RSVP_HASHTAG_MARKER = "Suggested hashtags:";

export function splitRsvpMessage(raw: string | null | undefined) {
  if (!raw) return { note: "", hashtags: "" };
  const idx = raw.lastIndexOf(RSVP_HASHTAG_MARKER);
  if (idx === -1) return { note: raw, hashtags: "" };
  return {
    note: raw.slice(0, idx).trim(),
    hashtags: raw.slice(idx + RSVP_HASHTAG_MARKER.length).trim(),
  };
}

export function joinRsvpMessage(note: string, hashtags: string) {
  const cleanedNote = note.trim();
  const cleanedTags = hashtags.trim();
  if (!cleanedTags) return cleanedNote || null;
  if (!cleanedNote) return `${RSVP_HASHTAG_MARKER} ${cleanedTags}`;
  return `${cleanedNote}\n\n${RSVP_HASHTAG_MARKER} ${cleanedTags}`;
}
