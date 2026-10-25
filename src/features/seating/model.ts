import { formatGuestDisplayName, GUEST_TITLE_OPTIONS } from "@/features/guests/display-name";

export type GuestSide = "BRIDE" | "GROOM" | "BOTH";
export type RsvpStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "TENTATIVE";
export type TableShape = "round" | "rectangle" | "square";
export type SideFilter = "ALL" | GuestSide;

export interface SeatGuest {
  id: string;
  name: string;
  side: GuestSide;
  rsvpStatus: RsvpStatus;
  groupId: string | null;
  groupName: string | null;
  mealPreference: string | null;
  dietaryRestrictions: string | null;
  plusOneName: string | null;
}

export interface SeatingTableData {
  id: string;
  name: string;
  capacity: number;
  shape: TableShape;
  guests: SeatGuest[];
}

export interface BoardState {
  tables: SeatingTableData[];
  unassigned: SeatGuest[];
}

export interface SeatGuestSource {
  id: string;
  title?: string | null;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
  side: GuestSide;
  rsvpStatus: RsvpStatus;
  groupId?: string | null;
  group?: { name: string; deletedAt?: Date | string | null } | null;
  mealPreference?: string | null;
  dietaryRestrictions?: string | null;
  plusOneName?: string | null;
}

export interface GuestSection {
  key: string;
  title: string | null;
  guests: SeatGuest[];
}

export interface SeatSlot {
  key: string;
  initials: string;
  name: string;
  side: GuestSide | null;
  filled: boolean;
  plusOne: boolean;
  over: boolean;
}

const TITLE_WORDS = new Set(
  GUEST_TITLE_OPTIONS.map((title) => title.toLowerCase().replace(/\./g, "")),
);

export const UNASSIGNED_DROP_ID = "unassigned";

export const SIDE_FILTERS: { value: SideFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "BRIDE", label: "Bride" },
  { value: "GROOM", label: "Groom" },
  { value: "BOTH", label: "Both" },
];

export function tableDropId(tableId: string) {
  return `table:${tableId}`;
}

export function tableIdFromDropId(dropId: string) {
  return dropId.startsWith("table:") ? dropId.slice("table:".length) : null;
}

export function asTableShape(value: string): TableShape {
  if (value === "rectangle" || value === "square" || value === "round") return value;
  return "round";
}

export function shapeLabel(shape: TableShape) {
  if (shape === "rectangle") return "Rectangle";
  if (shape === "square") return "Square";
  return "Round";
}

export function sideLabel(side: GuestSide) {
  if (side === "BRIDE") return "Bride";
  if (side === "GROOM") return "Groom";
  return "Both";
}

export function sideDotClass(side: GuestSide) {
  if (side === "BRIDE") return "bg-rose-500";
  if (side === "GROOM") return "bg-sky-500";
  return "bg-amber-500";
}

export function partySize(guest: { plusOneName?: string | null }) {
  return guest.plusOneName?.trim() ? 2 : 1;
}

export function occupiedSeats(guests: { plusOneName?: string | null }[]) {
  return guests.reduce((total, guest) => total + partySize(guest), 0);
}

export function openSeats(table: { capacity: number; guests: { plusOneName?: string | null }[] }) {
  return table.capacity - occupiedSeats(table.guests);
}

export function openSeatsFor(table: { capacity: number; guests: SeatGuest[] }, guestId: string) {
  return table.capacity - occupiedSeats(table.guests.filter((guest) => guest.id !== guestId));
}

export function canPlaceGuest(table: SeatingTableData, guest: SeatGuest) {
  return openSeatsFor(table, guest.id) >= partySize(guest);
}

export function occupancyLabel(open: number) {
  if (open < 0) return `${Math.abs(open)} over`;
  if (open === 0) return "Full";
  return `${open} open`;
}

export function compareGuests(a: SeatGuest, b: SeatGuest) {
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

function blankToNull(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function toSeatGuest(guest: SeatGuestSource): SeatGuest {
  const group = guest.group && !guest.group.deletedAt ? guest.group : null;
  return {
    id: guest.id,
    name: formatGuestDisplayName(guest),
    side: guest.side,
    rsvpStatus: guest.rsvpStatus,
    groupId: group ? (guest.groupId ?? null) : null,
    groupName: group ? group.name : null,
    mealPreference: blankToNull(guest.mealPreference),
    dietaryRestrictions: blankToNull(guest.dietaryRestrictions),
    plusOneName: blankToNull(guest.plusOneName),
  };
}

export function guestInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => {
      const normalized = part.toLowerCase().replace(/\./g, "");
      return normalized.length > 0 && !TITLE_WORDS.has(normalized);
    });
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : (parts[0]?.[1] ?? "");
  return `${first}${last}`.toUpperCase();
}

export function guestStatusLabel(guest: SeatGuest) {
  if (guest.rsvpStatus === "DECLINED") return "Declined";
  if (guest.rsvpStatus === "TENTATIVE") return "Tentative";
  if (guest.rsvpStatus === "PENDING") return "Pending";
  return null;
}

export function guestDetail(guest: SeatGuest) {
  const parts: string[] = [];
  if (guest.plusOneName) parts.push(`with ${guest.plusOneName}`);
  if (guest.groupName) parts.push(guest.groupName);
  if (guest.mealPreference) parts.push(guest.mealPreference);
  if (guest.dietaryRestrictions) parts.push(guest.dietaryRestrictions);
  return parts.join(" · ");
}

function searchableText(guest: SeatGuest) {
  return [
    guest.name,
    sideLabel(guest.side),
    guestStatusLabel(guest),
    guest.groupName,
    guest.mealPreference,
    guest.dietaryRestrictions,
    guest.plusOneName,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();
}

export function guestMatchesQuery(guest: SeatGuest, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return searchableText(guest).includes(needle);
}

export function guestHighlighted(guest: SeatGuest, query: string) {
  return query.trim().length > 0 && guestMatchesQuery(guest, query);
}

export function tableHighlighted(table: SeatingTableData, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return false;
  return (
    table.name.toLowerCase().includes(needle) ||
    table.guests.some((guest) => guestMatchesQuery(guest, needle))
  );
}

export function groupUnassigned(guests: SeatGuest[], grouped: boolean): GuestSection[] {
  const sorted = [...guests].sort(compareGuests);
  if (!grouped) return [{ key: "results", title: null, guests: sorted }];

  const byGroup = new Map<string, SeatGuest[]>();
  for (const guest of sorted) {
    if (!guest.groupId) continue;
    const members = byGroup.get(guest.groupId) ?? [];
    members.push(guest);
    byGroup.set(guest.groupId, members);
  }

  const sections: GuestSection[] = [];
  for (const [key, members] of byGroup) {
    if (members.length < 2) continue;
    sections.push({
      key,
      title: members[0]?.groupName ?? "Group",
      guests: members,
    });
  }
  sections.sort((a, b) =>
    (a.title ?? "").localeCompare(b.title ?? "", undefined, { sensitivity: "base" }),
  );

  const individuals = sorted.filter((guest) => {
    if (!guest.groupId) return true;
    return (byGroup.get(guest.groupId)?.length ?? 0) < 2;
  });
  if (individuals.length > 0) {
    sections.push({
      key: "individuals",
      title: sections.length > 0 ? "Individual guests" : null,
      guests: individuals,
    });
  }

  return sections;
}

export function buildSeatSlots(guests: SeatGuest[], capacity: number): SeatSlot[] {
  const slots: SeatSlot[] = [];
  for (const guest of [...guests].sort(compareGuests)) {
    slots.push({
      key: guest.id,
      initials: guestInitials(guest.name),
      name: guest.name,
      side: guest.side,
      filled: true,
      plusOne: false,
      over: false,
    });
    if (guest.plusOneName) {
      slots.push({
        key: `${guest.id}:plus`,
        initials: guestInitials(guest.plusOneName),
        name: guest.plusOneName,
        side: guest.side,
        filled: true,
        plusOne: true,
        over: false,
      });
    }
  }

  const total = Math.max(capacity, slots.length);
  for (let index = slots.length; index < total; index += 1) {
    slots.push({
      key: `empty-${index}`,
      initials: "",
      name: "Open seat",
      side: null,
      filled: false,
      plusOne: false,
      over: false,
    });
  }

  return slots.map((slot, index) => ({ ...slot, over: slot.filled && index >= capacity }));
}

function perimeterPoint(progress: number, inset: number) {
  const loop = ((progress % 1) + 1) % 1;
  const side = Math.floor(loop * 4);
  const along = loop * 4 - side;
  const start = inset;
  const end = 100 - inset;
  const position = start + along * (end - start);
  if (side === 0) return { left: position, top: start };
  if (side === 1) return { left: end, top: position };
  if (side === 2) return { left: end - (position - start), top: end };
  return { left: start, top: end - (position - start) };
}

export function seatPositions(count: number, shape: TableShape) {
  if (count <= 0) return [];
  if (shape === "round") {
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
      return {
        left: 50 + 40 * Math.cos(angle),
        top: 50 + 40 * Math.sin(angle),
      };
    });
  }
  if (shape === "square") {
    return Array.from({ length: count }, (_, index) => perimeterPoint((index + 0.5) / count, 16));
  }

  const topCount = Math.ceil(count / 2);
  const bottomCount = count - topCount;
  const top = Array.from({ length: topCount }, (_, index) => ({
    left: ((index + 1) / (topCount + 1)) * 100,
    top: 14,
  }));
  const bottom = Array.from({ length: bottomCount }, (_, index) => ({
    left: ((index + 1) / (bottomCount + 1)) * 100,
    top: 86,
  }));
  return [...top, ...bottom];
}

export function findGuest(state: BoardState, guestId: string) {
  const unassigned = state.unassigned.find((guest) => guest.id === guestId);
  if (unassigned) return unassigned;
  for (const table of state.tables) {
    const guest = table.guests.find((item) => item.id === guestId);
    if (guest) return guest;
  }
  return undefined;
}

function guestTableId(state: BoardState, guestId: string) {
  if (state.unassigned.some((guest) => guest.id === guestId)) return null;
  return state.tables.find((table) => table.guests.some((guest) => guest.id === guestId))?.id;
}

export function moveGuest(
  state: BoardState,
  guestId: string,
  toTableId: string | null,
): BoardState | "missing" | "full" {
  const guest = findGuest(state, guestId);
  const fromTableId = guestTableId(state, guestId);
  if (!guest || fromTableId === undefined) return "missing";
  if (fromTableId === toTableId) return state;

  const tables = state.tables.map((table) => ({
    ...table,
    guests: table.guests.filter((item) => item.id !== guestId),
  }));
  const unassigned = state.unassigned.filter((item) => item.id !== guestId);

  if (toTableId === null) {
    return {
      tables,
      unassigned: [...unassigned, guest].sort(compareGuests),
    };
  }

  const target = tables.find((table) => table.id === toTableId);
  if (!target) return "missing";
  if (occupiedSeats(target.guests) + partySize(guest) > target.capacity) return "full";

  return {
    tables: tables.map((table) =>
      table.id === toTableId
        ? { ...table, guests: [...table.guests, guest].sort(compareGuests) }
        : table,
    ),
    unassigned,
  };
}

export function moveGuests(
  state: BoardState,
  guestIds: string[],
  toTableId: string,
): BoardState | "missing" | "full" {
  let next = state;
  for (const guestId of guestIds) {
    const result = moveGuest(next, guestId, toTableId);
    if (result === "full" || result === "missing") return result;
    next = result;
  }
  return next;
}
