import type { User, League } from "@prisma/client";

import { prisma } from "~/db.server";
import { generateInviteCode } from "~/utils";

export type { League } from "@prisma/client";

export async function getLeagueById({
  id,
  userId,
}: Pick<League, "id"> & {
  userId: User["id"];
}) {
  const league = prisma.league.findFirst({
    where: { id, leagueUsers: { some: { userId } } },
    include: {
      leagueAdmins: {
        select: {
          userId: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      },
      leagueUsers: {
        select: {
          userId: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  });

  return league;
}

export async function deleteLeague({
  id,
  userId,
}: Pick<League, "id"> & {
  userId: User["id"];
}) {
  return prisma.league.deleteMany({
    where: { id, leagueAdmins: { some: { userId } } },
  });
}

export async function getLeagueListItems({ userId }: { userId: User["id"] }) {
  return prisma.league.findMany({
    where: { leagueUsers: { some: { userId } } },
    select: { id: true, name: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createLeague({
  name,
  userId,
}: Pick<League, "name"> & {
  userId: User["id"];
}) {
  return prisma.league.create({
    data: {
      name,
      inviteCode: generateInviteCode(),
      leagueAdmins: {
        create: {
          userId,
        },
      },
      leagueUsers: {
        create: {
          userId,
        },
      },
    },
  });
}

export async function joinLeague({
  inviteCode,
  userId,
}: Pick<League, "inviteCode"> & {
  userId: User["id"];
}) {
  const league = await prisma.league.findFirst({
    where: { inviteCode },
  });

  if (!league) {
    throw new Error("Invalid invite code");
  }

  return prisma.leagueUser.create({
    data: {
      userId,
      leagueId: league.id,
    },
  });
}

export function leaveLeague({
  id,
  userId,
}: Pick<League, "id"> & {
  userId: User["id"];
}) {
  return prisma.leagueUser.deleteMany({
    where: { leagueId: id, userId },
  });
}
