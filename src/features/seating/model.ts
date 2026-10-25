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
  seatNumber: number | null;
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
  index: number;
  guestId: string | null;
  initials: string;
  name: string;
  side: GuestSide | null;
  filled: boolean;
  plusOne: boolean;
  over: boolean;
}

type SeatPerson = {
  id: string;
  name: string;
  plusOneName?: string | null;
  seatNumber?: number | null;
};

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

export function seatSlotDropId(tableId: string, index: number) {
  return `slot:${tableId}:${index}`;
}

export function seatDragId(guestId: string, plusOne: boolean) {
  return plusOne ? `seat-icon:${guestId}:plus` : `seat-icon:${guestId}`;
}

export function parseSeatSlotDropId(dropId: string) {
  if (!dropId.startsWith("slot:")) return null;
  const rest = dropId.slice("slot:".length);
  const splitAt = rest.lastIndexOf(":");
  if (splitAt <= 0) return null;
  const tableId = rest.slice(0, splitAt);
  const index = Number(rest.slice(splitAt + 1));
  if (!tableId || !Number.isInteger(index) || index < 0) return null;
  return { tableId, index };
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

export function compareGuests(a: { name: string }, b: { name: string }) {
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

export function compareSeatOrder(a: SeatGuest, b: SeatGuest) {
  const aSeat = a.seatNumber ?? Number.POSITIVE_INFINITY;
  const bSeat = b.seatNumber ?? Number.POSITIVE_INFINITY;
  if (aSeat !== bSeat) return aSeat - bSeat;
  return compareGuests(a, b);
}

function blankToNull(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function toSeatGuest(guest: SeatGuestSource, seatNumber?: number | null): SeatGuest {
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
    seatNumber: seatNumber ?? null,
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

function personOrder(a: SeatPerson, b: SeatPerson) {
  const aSeat = a.seatNumber ?? Number.POSITIVE_INFINITY;
  const bSeat = b.seatNumber ?? Number.POSITIVE_INFINITY;
  if (aSeat !== bSeat) return aSeat - bSeat;
  return compareGuests(a, b);
}

export function seatLayout(people: SeatPerson[], capacity: number) {
  const span = Math.max(capacity, occupiedSeats(people), 1);
  const seats: ({ id: string; plusOne: boolean } | null)[] = Array.from(
    { length: span },
    () => null,
  );

  function fits(start: number, size: number) {
    if (start < 0 || start + size > seats.length) return false;
    for (let offset = 0; offset < size; offset += 1) {
      if (seats[start + offset]) return false;
    }
    return true;
  }

  function firstFit(size: number) {
    for (let index = 0; index <= seats.length - size; index += 1) {
      if (fits(index, size)) return index;
    }
    const start = seats.length;
    while (seats.length < start + size) seats.push(null);
    return start;
  }

  for (const person of [...people].sort(personOrder)) {
    const size = partySize(person);
    const preferred = person.seatNumber;
    const start = preferred != null && fits(preferred, size) ? preferred : firstFit(size);
    seats[start] = { id: person.id, plusOne: false };
    if (size === 2) seats[start + 1] = { id: person.id, plusOne: true };
  }

  return seats;
}

export function allocateSeatNumbers(people: SeatPerson[], capacity: number) {
  const assigned: { id: string; seatNumber: number }[] = [];
  seatLayout(people, capacity).forEach((seat, index) => {
    if (seat && !seat.plusOne) assigned.push({ id: seat.id, seatNumber: index });
  });
  return assigned;
}

export function applySeatNumbers<T extends SeatPerson>(people: T[], capacity: number): T[] {
  const numbers = new Map(
    allocateSeatNumbers(people, capacity).map((seat) => [seat.id, seat.seatNumber]),
  );
  return people
    .map((person) => ({ ...person, seatNumber: numbers.get(person.id) ?? null }))
    .sort(personOrder);
}

export function buildSeatSlots(guests: SeatGuest[], capacity: number): SeatSlot[] {
  const byId = new Map(guests.map((guest) => [guest.id, guest]));
  return seatLayout(guests, capacity).map((seat, index) => {
    const guest = seat ? byId.get(seat.id) : undefined;
    const name = seat?.plusOne ? (guest?.plusOneName ?? "Guest") : (guest?.name ?? "Open seat");
    return {
      key: seat ? (seat.plusOne ? `${seat.id}:plus` : seat.id) : `empty-${index}`,
      index,
      guestId: seat?.id ?? null,
      initials: seat && guest ? guestInitials(name) : "",
      name,
      side: guest?.side ?? null,
      filled: Boolean(seat && guest),
      plusOne: Boolean(seat?.plusOne),
      over: index >= capacity,
    };
  });
}

export function moveGuestToSeat(
  guests: SeatGuest[],
  guestId: string,
  toIndex: number,
  capacity: number,
  draggingPlusOne = false,
): { guests: SeatGuest[] } | "same" | "blocked" {
  const guest = guests.find((item) => item.id === guestId);
  if (!guest) return "blocked";

  const layout = seatLayout(guests, capacity);
  const resolved = new Map<string, number>();
  layout.forEach((seat, index) => {
    if (seat && !seat.plusOne) resolved.set(seat.id, index);
  });

  const fromIndex = resolved.get(guestId);
  if (fromIndex == null) return "blocked";
  const size = partySize(guest);
  const target = layout[toIndex];
  if (toIndex < 0 || toIndex >= layout.length) return "blocked";
  if (target?.id === guestId) return "same";

  const start = draggingPlusOne && size === 2 ? Math.max(0, toIndex - 1) : toIndex;
  const occupied = new Set<number>();
  for (const [id, seatNumber] of resolved) {
    if (id === guestId) continue;
    const other = guests.find((item) => item.id === id);
    const length = other ? partySize(other) : 1;
    if (target?.id === id) continue;
    for (let offset = 0; offset < length; offset += 1) occupied.add(seatNumber + offset);
  }

  function rangeFits(rangeStart: number, length: number) {
    if (rangeStart < 0 || rangeStart + length > capacity) return false;
    for (let offset = 0; offset < length; offset += 1) {
      if (occupied.has(rangeStart + offset)) return false;
    }
    return true;
  }

  if (!target) {
    if (!rangeFits(start, size)) return "blocked";
    resolved.set(guestId, start);
  } else {
    const other = guests.find((item) => item.id === target.id);
    const otherStart = resolved.get(target.id);
    if (!other || otherStart == null) return "blocked";
    const otherSize = partySize(other);
    if (!rangeFits(start, size)) return "blocked";
    occupied.add(start);
    for (let offset = 0; offset < size; offset += 1) occupied.add(start + offset);
    const otherDestination = fromIndex;
    let otherFits = true;
    if (otherDestination < 0 || otherDestination + otherSize > capacity) otherFits = false;
    for (let offset = 0; offset < otherSize && otherFits; offset += 1) {
      if (occupied.has(otherDestination + offset)) otherFits = false;
    }
    if (!otherFits) return "blocked";
    resolved.set(guestId, start);
    resolved.set(other.id, otherDestination);
  }

  const next = guests
    .map((item) => ({ ...item, seatNumber: resolved.get(item.id) ?? item.seatNumber }))
    .sort(compareSeatOrder);
  const moved = next.find((item) => item.id === guestId);
  if (moved?.seatNumber === fromIndex && !draggingPlusOne) return "same";
  return { guests: next };
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
        left: 50 + 36 * Math.cos(angle),
        top: 50 + 36 * Math.sin(angle),
      };
    });
  }
  if (shape === "square") {
    return Array.from({ length: count }, (_, index) => perimeterPoint((index + 0.5) / count, 14));
  }

  const topCount = Math.ceil(count / 2);
  const bottomCount = count - topCount;
  const top = Array.from({ length: topCount }, (_, index) => ({
    left: ((index + 1) / (topCount + 1)) * 100,
    top: 22,
  }));
  const bottom = Array.from({ length: bottomCount }, (_, index) => ({
    left: ((index + 1) / (bottomCount + 1)) * 100,
    top: 78,
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
      unassigned: [...unassigned, { ...guest, seatNumber: null }].sort(compareGuests),
    };
  }

  const target = tables.find((table) => table.id === toTableId);
  if (!target) return "missing";
  if (occupiedSeats(target.guests) + partySize(guest) > target.capacity) return "full";

  return {
    tables: tables.map((table) =>
      table.id === toTableId
        ? {
            ...table,
            guests: applySeatNumbers(
              [...table.guests, { ...guest, seatNumber: null }],
              table.capacity,
            ),
          }
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
