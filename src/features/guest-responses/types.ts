export type GuestResponseRow = {
  id: string;
  guestId: string;
  name: string;
  status: "ACCEPTED" | "DECLINED" | "TENTATIVE";
  attending: boolean;
  mealPreference: string | null;
  dietaryRestrictions: string | null;
  message: string;
  hashtags: string;
  submittedAt: Date;
};
