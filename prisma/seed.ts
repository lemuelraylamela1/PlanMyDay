import {
  PrismaClient,
  TaskPriority,
  RsvpStatus,
  InvitationStatus,
  GuestSide,
  SupplierStatus,
  PaymentStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const DEMO_EMAIL = "demo@planmyday.app";
const DEMO_PASSWORD = "password123";

const taskTemplates = [
  { title: "Set your wedding budget", category: "Planning", monthsBefore: 12, priority: TaskPriority.HIGH },
  { title: "Draft your guest list", category: "Guests", monthsBefore: 11, priority: TaskPriority.HIGH },
  { title: "Book your venue", category: "Venue", monthsBefore: 10, priority: TaskPriority.URGENT },
  { title: "Hire a photographer", category: "Suppliers", monthsBefore: 9, priority: TaskPriority.HIGH },
  { title: "Choose wedding attire", category: "Attire", monthsBefore: 8, priority: TaskPriority.MEDIUM },
  { title: "Send save-the-dates", category: "Invitations", monthsBefore: 6, priority: TaskPriority.MEDIUM },
  { title: "Plan the menu with caterer", category: "Suppliers", monthsBefore: 5, priority: TaskPriority.MEDIUM },
  { title: "Send invitations", category: "Invitations", monthsBefore: 3, priority: TaskPriority.HIGH },
  { title: "Finalize seating chart", category: "Guests", monthsBefore: 1, priority: TaskPriority.HIGH },
  { title: "Confirm final headcount", category: "Guests", monthsBefore: 1, priority: TaskPriority.URGENT },
];

function monthsFromNow(months: number) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  d.setHours(15, 0, 0, 0);
  return d;
}

function atTime(base: Date, hours: number, minutes = 0) {
  const d = new Date(base);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

async function seedTaskTemplates() {
  console.log("Seeding task templates...");
  const count = await db.taskTemplate.count();
  if (count > 0) {
    console.log("Task templates already present, skipping.");
    return;
  }
  for (const t of taskTemplates) {
    await db.taskTemplate.create({ data: t });
  }
}

async function ensureDemoAccount() {
  console.log("Ensuring demo interviewer account...");
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const weddingDate = monthsFromNow(4);

  const user = await db.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      name: "Demo Couple",
      passwordHash,
      emailVerified: new Date(),
      deletedAt: null,
    },
    create: {
      email: DEMO_EMAIL,
      name: "Demo Couple",
      passwordHash,
      emailVerified: new Date(),
    },
  });

  let wedding = await db.wedding.findFirst({
    where: { ownerId: user.id, deletedAt: null },
    orderBy: { createdAt: "asc" },
  });

  if (!wedding) {
    wedding = await db.wedding.create({
      data: {
        ownerId: user.id,
        title: "Alex & Jordan",
        subtitle: "A garden celebration",
        partner1Name: "Alex Rivera",
        partner2Name: "Jordan Chen",
        date: weddingDate,
        ceremonyTime: atTime(weddingDate, 15, 0),
        receptionTime: atTime(weddingDate, 18, 0),
        venueName: "The Glasshouse Gardens",
        venueAddress: "120 Orchid Lane, Makati City",
        currency: "PHP",
        status: "ACTIVE",
        rsvpDeadline: monthsFromNow(3),
        settings: {
          create: {
            dressCode: "Garden formal",
            story:
              "We met over iced coffee, stayed for the conversation, and somehow ended up planning a wedding under the trees.",
            contactEmail: DEMO_EMAIL,
            themeKey: "classic",
          },
        },
        websiteSettings: {
          create: {
            isPublished: true,
            publishedAt: new Date(),
            seoTitle: "Alex & Jordan — Wedding",
            seoDescription: "Join us for our garden celebration.",
          },
        },
        members: { create: { userId: user.id, role: "OWNER" } },
      },
    });
    console.log(`Created demo wedding ${wedding.id}`);
  } else {
    wedding = await db.wedding.update({
      where: { id: wedding.id },
      data: {
        title: "Alex & Jordan",
        subtitle: "A garden celebration",
        partner1Name: "Alex Rivera",
        partner2Name: "Jordan Chen",
        date: wedding.date ?? weddingDate,
        ceremonyTime: wedding.ceremonyTime ?? atTime(weddingDate, 15, 0),
        receptionTime: wedding.receptionTime ?? atTime(weddingDate, 18, 0),
        venueName: wedding.venueName ?? "The Glasshouse Gardens",
        venueAddress: wedding.venueAddress ?? "120 Orchid Lane, Makati City",
        status: "ACTIVE",
        rsvpDeadline: wedding.rsvpDeadline ?? monthsFromNow(3),
      },
    });

    await db.weddingMember.upsert({
      where: { weddingId_userId: { weddingId: wedding.id, userId: user.id } },
      update: { role: "OWNER" },
      create: { weddingId: wedding.id, userId: user.id, role: "OWNER" },
    });

    await db.weddingSettings.upsert({
      where: { weddingId: wedding.id },
      update: {},
      create: {
        weddingId: wedding.id,
        dressCode: "Garden formal",
        story:
          "We met over iced coffee, stayed for the conversation, and somehow ended up planning a wedding under the trees.",
        contactEmail: DEMO_EMAIL,
      },
    });

    await db.weddingWebsiteSettings.upsert({
      where: { weddingId: wedding.id },
      update: {},
      create: {
        weddingId: wedding.id,
        isPublished: true,
        publishedAt: new Date(),
        seoTitle: "Alex & Jordan — Wedding",
        seoDescription: "Join us for our garden celebration.",
      },
    });
  }

  const guestCount = await db.guest.count({
    where: { weddingId: wedding.id, deletedAt: null },
  });
  if (guestCount === 0) {
    await seedDemoWeddingContent(wedding.id, wedding.date ?? weddingDate);
  } else {
    console.log("Demo wedding already has guests, leaving sample data as-is.");
  }

  console.log(`Demo login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  return wedding;
}

async function seedDemoWeddingContent(weddingId: string, weddingDate: Date) {
  console.log("Seeding demo wedding sample data...");

  const family = await db.guestGroup.create({
    data: { weddingId, name: "Family" },
  });
  const friends = await db.guestGroup.create({
    data: { weddingId, name: "Friends" },
  });
  const work = await db.guestGroup.create({
    data: { weddingId, name: "Work" },
  });

  const guestSpecs: Array<{
    firstName: string;
    lastName: string;
    email: string;
    side: GuestSide;
    groupId: string;
    rsvpStatus: RsvpStatus;
    invitationStatus: InvitationStatus;
    mealPreference?: string;
    plusOneAllowed?: boolean;
    plusOneName?: string;
  }> = [
    {
      firstName: "Mia",
      lastName: "Rivera",
      email: "mia.rivera@example.com",
      side: GuestSide.BRIDE,
      groupId: family.id,
      rsvpStatus: RsvpStatus.ACCEPTED,
      invitationStatus: InvitationStatus.RESPONDED,
      mealPreference: "Chicken",
    },
    {
      firstName: "Noah",
      lastName: "Rivera",
      email: "noah.rivera@example.com",
      side: GuestSide.BRIDE,
      groupId: family.id,
      rsvpStatus: RsvpStatus.ACCEPTED,
      invitationStatus: InvitationStatus.RESPONDED,
      mealPreference: "Fish",
    },
    {
      firstName: "Elena",
      lastName: "Chen",
      email: "elena.chen@example.com",
      side: GuestSide.GROOM,
      groupId: family.id,
      rsvpStatus: RsvpStatus.ACCEPTED,
      invitationStatus: InvitationStatus.RESPONDED,
      mealPreference: "Vegetarian",
      plusOneAllowed: true,
      plusOneName: "Sam Chen",
    },
    {
      firstName: "Priya",
      lastName: "Santos",
      email: "priya.santos@example.com",
      side: GuestSide.BOTH,
      groupId: friends.id,
      rsvpStatus: RsvpStatus.ACCEPTED,
      invitationStatus: InvitationStatus.RESPONDED,
      mealPreference: "Chicken",
    },
    {
      firstName: "Marcus",
      lastName: "Lee",
      email: "marcus.lee@example.com",
      side: GuestSide.BOTH,
      groupId: friends.id,
      rsvpStatus: RsvpStatus.TENTATIVE,
      invitationStatus: InvitationStatus.OPENED,
    },
    {
      firstName: "Ava",
      lastName: "Nguyen",
      email: "ava.nguyen@example.com",
      side: GuestSide.BRIDE,
      groupId: friends.id,
      rsvpStatus: RsvpStatus.DECLINED,
      invitationStatus: InvitationStatus.RESPONDED,
    },
    {
      firstName: "Chris",
      lastName: "Patel",
      email: "chris.patel@example.com",
      side: GuestSide.GROOM,
      groupId: work.id,
      rsvpStatus: RsvpStatus.PENDING,
      invitationStatus: InvitationStatus.SENT,
    },
    {
      firstName: "Sofia",
      lastName: "Reyes",
      email: "sofia.reyes@example.com",
      side: GuestSide.BOTH,
      groupId: work.id,
      rsvpStatus: RsvpStatus.PENDING,
      invitationStatus: InvitationStatus.NOT_SENT,
    },
  ];

  const guests = [];
  for (const g of guestSpecs) {
    guests.push(
      await db.guest.create({
        data: {
          weddingId,
          firstName: g.firstName,
          lastName: g.lastName,
          email: g.email,
          side: g.side,
          groupId: g.groupId,
          rsvpStatus: g.rsvpStatus,
          invitationStatus: g.invitationStatus,
          mealPreference: g.mealPreference,
          plusOneAllowed: g.plusOneAllowed ?? false,
          plusOneName: g.plusOneName,
        },
      }),
    );
  }

  const headTable = await db.seatingTable.create({
    data: { weddingId, name: "Head Table", capacity: 8, shape: "rectangular", posX: 200, posY: 80 },
  });
  const tableOne = await db.seatingTable.create({
    data: { weddingId, name: "Table 1", capacity: 8, shape: "round", posX: 80, posY: 240 },
  });
  const tableTwo = await db.seatingTable.create({
    data: { weddingId, name: "Table 2", capacity: 8, shape: "round", posX: 320, posY: 240 },
  });

  const seated = [
    { guest: guests[0]!, table: headTable, seat: 1 },
    { guest: guests[1]!, table: headTable, seat: 2 },
    { guest: guests[2]!, table: headTable, seat: 3 },
    { guest: guests[3]!, table: tableOne, seat: 1 },
    { guest: guests[4]!, table: tableTwo, seat: 1 },
  ];
  for (const s of seated) {
    await db.seatAssignment.create({
      data: {
        weddingId,
        guestId: s.guest.id,
        tableId: s.table.id,
        seatNumber: s.seat,
      },
    });
  }

  const venueCat = await db.supplierCategory.create({ data: { weddingId, name: "Venue" } });
  const photoCat = await db.supplierCategory.create({ data: { weddingId, name: "Photography" } });
  const cateringCat = await db.supplierCategory.create({ data: { weddingId, name: "Catering" } });

  await db.supplier.createMany({
    data: [
      {
        weddingId,
        categoryId: venueCat.id,
        company: "The Glasshouse Gardens",
        contactPerson: "Lena Cruz",
        phone: "+63 917 555 0101",
        email: "events@glasshouse.example",
        contractAmount: 180000,
        downPayment: 60000,
        status: SupplierStatus.BOOKED,
        paymentStatus: PaymentStatus.PARTIAL,
        notes: "Includes ceremony lawn and reception pavilion.",
      },
      {
        weddingId,
        categoryId: photoCat.id,
        company: "Golden Hour Studio",
        contactPerson: "Diego Marquez",
        phone: "+63 918 555 0202",
        email: "hello@goldenhour.example",
        contractAmount: 65000,
        downPayment: 20000,
        status: SupplierStatus.BOOKED,
        paymentStatus: PaymentStatus.PARTIAL,
      },
      {
        weddingId,
        categoryId: cateringCat.id,
        company: "Harvest & Hive Catering",
        contactPerson: "Nina Flores",
        phone: "+63 919 555 0303",
        email: "bookings@harvest.example",
        contractAmount: 120000,
        downPayment: 0,
        status: SupplierStatus.CONTACTED,
        paymentStatus: PaymentStatus.UNPAID,
      },
    ],
  });

  const venueBudget = await db.budgetCategory.create({
    data: { weddingId, name: "Venue", estimatedCost: 180000 },
  });
  const foodBudget = await db.budgetCategory.create({
    data: { weddingId, name: "Food & Drink", estimatedCost: 140000 },
  });
  const photoBudget = await db.budgetCategory.create({
    data: { weddingId, name: "Photo & Video", estimatedCost: 80000 },
  });

  await db.budgetItem.createMany({
    data: [
      {
        weddingId,
        categoryId: venueBudget.id,
        name: "Venue package",
        estimatedCost: 180000,
        actualCost: 180000,
        paidAmount: 60000,
      },
      {
        weddingId,
        categoryId: foodBudget.id,
        name: "Catering for 80 guests",
        estimatedCost: 120000,
        actualCost: 0,
        paidAmount: 0,
      },
      {
        weddingId,
        categoryId: foodBudget.id,
        name: "Open bar",
        estimatedCost: 20000,
        actualCost: 0,
        paidAmount: 0,
      },
      {
        weddingId,
        categoryId: photoBudget.id,
        name: "Photography package",
        estimatedCost: 65000,
        actualCost: 65000,
        paidAmount: 20000,
      },
      {
        weddingId,
        categoryId: photoBudget.id,
        name: "Same-day edit",
        estimatedCost: 15000,
        actualCost: 0,
        paidAmount: 0,
      },
    ],
  });

  await db.task.createMany({
    data: [
      {
        weddingId,
        title: "Confirm florist delivery window",
        category: "Suppliers",
        priority: TaskPriority.HIGH,
        deadline: monthsFromNow(1),
        completed: false,
        assignedPerson: "Alex",
      },
      {
        weddingId,
        title: "Send remaining invitations",
        category: "Invitations",
        priority: TaskPriority.URGENT,
        deadline: monthsFromNow(0),
        completed: false,
        assignedPerson: "Jordan",
      },
      {
        weddingId,
        title: "Book venue",
        category: "Venue",
        priority: TaskPriority.URGENT,
        deadline: monthsFromNow(-2),
        completed: true,
        completedAt: monthsFromNow(-2),
        assignedPerson: "Alex",
      },
      {
        weddingId,
        title: "Taste-test cake flavors",
        category: "Suppliers",
        priority: TaskPriority.MEDIUM,
        deadline: monthsFromNow(2),
        completed: false,
      },
      {
        weddingId,
        title: "Finalize seating chart",
        category: "Guests",
        priority: TaskPriority.HIGH,
        deadline: monthsFromNow(3),
        completed: false,
        assignedPerson: "Jordan",
      },
    ],
  });

  const day = weddingDate;
  await db.timelineEvent.createMany({
    data: [
      {
        weddingId,
        title: "Guest arrival",
        description: "Welcome drinks on the lawn",
        location: "Garden entrance",
        startTime: atTime(day, 14, 0),
        endTime: atTime(day, 14, 45),
        order: 1,
      },
      {
        weddingId,
        title: "Ceremony",
        description: "Exchange of vows",
        location: "Ceremony lawn",
        startTime: atTime(day, 15, 0),
        endTime: atTime(day, 15, 45),
        order: 2,
      },
      {
        weddingId,
        title: "Cocktail hour",
        location: "Pavilion terrace",
        startTime: atTime(day, 16, 0),
        endTime: atTime(day, 17, 30),
        order: 3,
      },
      {
        weddingId,
        title: "Reception & dinner",
        location: "Main pavilion",
        startTime: atTime(day, 18, 0),
        endTime: atTime(day, 21, 0),
        order: 4,
      },
      {
        weddingId,
        title: "First dance & party",
        location: "Main pavilion",
        startTime: atTime(day, 21, 0),
        endTime: atTime(day, 23, 0),
        order: 5,
      },
    ],
  });

  await db.faq.createMany({
    data: [
      {
        weddingId,
        question: "What should I wear?",
        answer: "Garden formal — think soft neutrals and comfortable shoes for the lawn.",
        order: 1,
      },
      {
        weddingId,
        question: "Are kids welcome?",
        answer: "Yes, children are welcome. A quiet room will be available during the ceremony.",
        order: 2,
      },
      {
        weddingId,
        question: "Where should guests stay?",
        answer: "We recommend the nearby Oak & Ivy Hotel — a shuttle will run to the venue.",
        order: 3,
      },
    ],
  });

  await db.giftRegistryItem.createMany({
    data: [
      {
        weddingId,
        title: "Weekend getaway fund",
        description: "Help us start married life with a short trip.",
        price: 5000,
        order: 1,
      },
      {
        weddingId,
        title: "Espresso machine",
        url: "https://example.com/espresso",
        price: 12000,
        order: 2,
      },
      {
        weddingId,
        title: "Dinnerware set",
        url: "https://example.com/dinnerware",
        price: 8500,
        isReserved: true,
        order: 3,
      },
    ],
  });

  console.log("Demo wedding sample data ready.");
}

async function main() {
  await seedTaskTemplates();
  await ensureDemoAccount();
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
