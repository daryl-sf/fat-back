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

  const hashedPassword = await bcrypt.hash("daryliscool", 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "marina@remix.run",
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
      leagueAdmins: {
        create: {
          userId: user.id,
        },
      },
      leagueUsers: {
        create: {
          userId: user.id,
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
          relegated: team.relegated,
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
