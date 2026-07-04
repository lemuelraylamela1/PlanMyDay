import { PrismaClient, TaskPriority } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

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

async function main() {
  console.log("Seeding task templates...");
  for (const t of taskTemplates) {
    await db.taskTemplate.create({ data: t });
  }

  const email = "demo@planmyday.app";
  const existing = await db.user.findUnique({ where: { email } });
  if (!existing) {
    console.log("Creating demo couple account...");
    const passwordHash = await bcrypt.hash("password123", 10);
    const user = await db.user.create({
      data: {
        email,
        name: "Demo Couple",
        passwordHash,
        emailVerified: new Date(),
      },
    });

    const wedding = await db.wedding.create({
      data: {
        ownerId: user.id,
        title: "Our Wedding",
        status: "ACTIVE",
        settings: { create: {} },
        websiteSettings: { create: {} },
        members: { create: { userId: user.id, role: "OWNER" } },
      },
    });
    console.log(`Created demo wedding ${wedding.id}`);
  }

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
