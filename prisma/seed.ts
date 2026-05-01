import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });



async function main() {
  console.log("🌱 Seeding database...");

  // Clean up
  await prisma.attendance.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.member.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.gym.deleteMany();

  const ownerHash = await bcrypt.hash("demo1234", 10);

  const gym = await prisma.gym.create({
    data: {
      name: "Iron Paradise Gym",
      tagline: "Forge Your Legacy",
      address: "12, Fitness Nagar, Andheri West, Mumbai - 400053",
      phone: "+91 98765 43210",
      email: "ironparadise@gym.in",
      ownerName: "Raj Malhotra",
      ownerEmail: "owner@jacked.gym",
      passwordHash: ownerHash,
    },
  });

  // Plans
  const monthly = await prisma.plan.create({
    data: {
      gymId: gym.id,
      name: "Monthly",
      durationDays: 30,
      price: 1500,
      features: JSON.stringify(["Full Gym Access", "Locker Room", "Free WiFi"]),
    },
  });

  const quarterly = await prisma.plan.create({
    data: {
      gymId: gym.id,
      name: "Quarterly",
      durationDays: 90,
      price: 3999,
      features: JSON.stringify([
        "Full Gym Access",
        "Locker Room",
        "Free WiFi",
        "1 Personal Training Session",
        "Diet Plan",
      ]),
    },
  });

  const annual = await prisma.plan.create({
    data: {
      gymId: gym.id,
      name: "Annual",
      durationDays: 365,
      price: 12999,
      features: JSON.stringify([
        "Full Gym Access",
        "Locker Room",
        "Free WiFi",
        "4 Personal Training Sessions/Month",
        "Diet Plan",
        "Body Composition Analysis",
        "Supplement Discount",
      ]),
    },
  });

  // Announcements
  await prisma.announcement.create({
    data: {
      gymId: gym.id,
      title: "New Batch Timings",
      body: "Morning batch now starts at 5:30 AM. Evening batch at 6:00 PM–9:00 PM.",
    },
  });

  await prisma.announcement.create({
    data: {
      gymId: gym.id,
      title: "Independence Day Special",
      body: "Flat 20% off on Quarterly and Annual plans this month. Hurry!",
    },
  });

  // Members
  const now = new Date();
  const members = [
    {
      name: "Arjun Sharma",
      phone: "9876543210",
      email: "arjun@example.com",
      planId: annual.id,
      daysOffset: 200,
      pin: "1234",
      weight: 78,
      height: 178,
    },
    {
      name: "Priya Patel",
      phone: "9123456789",
      email: "priya@example.com",
      planId: quarterly.id,
      daysOffset: 45,
      pin: "2345",
      weight: 62,
      height: 165,
    },
    {
      name: "Vikram Singh",
      phone: "9988776655",
      email: "vikram@example.com",
      planId: monthly.id,
      daysOffset: 5,
      pin: "3456",
      weight: 85,
      height: 182,
    },
    {
      name: "Sneha Reddy",
      phone: "9765432109",
      email: "sneha@example.com",
      planId: quarterly.id,
      daysOffset: -3, // expired
      pin: "4567",
      weight: 58,
      height: 162,
    },
    {
      name: "Karan Mehta",
      phone: "9654321098",
      email: "karan@example.com",
      planId: monthly.id,
      daysOffset: 12,
      pin: "5678",
      weight: 90,
      height: 175,
    },
  ];

  for (const m of members) {
    const plan = [monthly, quarterly, annual].find((p) => p.id === m.planId)!;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - (plan.durationDays - m.daysOffset));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const pinHash = await bcrypt.hash(m.pin, 10);

    const member = await prisma.member.create({
      data: {
        gymId: gym.id,
        planId: m.planId,
        name: m.name,
        phone: m.phone,
        email: m.email,
        weight: m.weight,
        height: m.height,
        startDate,
        endDate,
        isActive: m.daysOffset > 0,
        passwordHash: pinHash,
      },
    });

    // Payment record
    await prisma.payment.create({
      data: {
        memberId: member.id,
        planId: m.planId,
        amount: plan.price,
        method: "cash",
        paidAt: startDate,
      },
    });

    // Attendance last 30 days (random ~70% attendance)
    for (let d = 30; d >= 1; d--) {
      if (Math.random() > 0.3) {
        const date = new Date(now);
        date.setDate(date.getDate() - d);
        await prisma.attendance.create({
          data: { memberId: member.id, date },
        });
      }
    }
  }

  console.log("✅ Seed complete!");
  console.log("   Owner login: owner@jacked.gym / demo1234");
  console.log("   Member login example: phone=9876543210 / pin=1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
