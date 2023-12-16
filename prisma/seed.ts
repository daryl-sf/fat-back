import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import plTeams from "~/plTeams.json";
import { generateInviteCode } from "~/utils";

const prisma = new PrismaClient();

async function seed() {
  const email = "daryl@remix.run";

  // cleanup the existing database
  await prisma.user.deleteMany({}).catch(() => {
    // no worries if it doesn't exist yet
  });
  await prisma.league.deleteMany({}).catch(() => {
    // no worries if it doesn't exist yet
  });
  await prisma.team.deleteMany({}).catch(() => {
    // no worries if it doesn't exist yet
  });

  const adminRole = await prisma.role.create({
    data: {
      name: "ADMIN",
    },
  });

  const hashedPassword = await bcrypt.hash("daryliscool", 10);

  const user = await prisma.user.create({
    data: {
      email,
      displayName: "Daryl",
      password: {
        create: {
          hash: hashedPassword,
        },
      },
      roles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "marina@remix.run",
      displayName: "Marina",
      password: {
        create: {
          hash: await bcrypt.hash("marinaiscool", 10),
        },
      },
    },
  });

  await prisma.league.create({
    data: {
      name: "My League",
      inviteCode: generateInviteCode(),
      members: {
        create: {
          userId: user.id,
          joinedAt: new Date(),
          isAdmin: true,
        },
      },
    },
  });

  await Promise.all(
    plTeams.map((team) =>
      prisma.team.create({
        data: {
          name: team.name,
          shortName: team.shortName,
          imageUrl: team.imageUrl,
          active: true,
          primaryColor: team.primaryColor,
        },
      }),
    ),
  );

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
