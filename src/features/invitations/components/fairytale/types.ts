export type RsvpStatusValue = "PENDING" | "ACCEPTED" | "DECLINED" | "TENTATIVE";

export interface InvitationGuest {
  name: string;
  plusOneAllowed: boolean;
  rsvpStatus: RsvpStatusValue;
}

export interface InvitationResponse {
  attending: boolean;
  partySize: number;
  mealPreference: string | null;
  dietaryRestrictions: string | null;
  plusOneName: string | null;
  message: string | null;
}

export interface InvitationWedding {
  coupleNames: string;
  partner1Name: string | null;
  partner2Name: string | null;
  monogram: string;
  dateLabel: string | null;
  /** ISO timestamp used for the live countdown (ceremony time, else wedding date). */
  countdownTargetIso: string | null;
  ceremonyTimeLabel: string | null;
  receptionTimeLabel: string | null;
  venueName: string | null;
  venueAddress: string | null;
  /** From wedding settings; omit on the invite when blank. */
  dressCode: string | null;
  /** Love story from wedding settings. Blank lines become separate paragraphs. */
  story: string | null;
}
