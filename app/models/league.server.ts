import type { User, League } from "@prisma/client";

import { prisma } from "~/db.server";
import { generateInviteCode } from "~/utils";

import { getUserById } from "./user.server";

export type { League, LeagueMember } from "@prisma/client";

export async function getLeagueById({
  id,
  userId,
}: Pick<League, "id"> & {
  userId: User["id"];
}) {
  const league = prisma.league.findFirst({
    where: { id, members: { some: { userId } } },
    include: {
      members: {
        select: {
          userId: true,
          isAdmin: true,
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
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
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const league = await prisma.league.findFirst({
    where: { id },
    include: {
      members: {
        select: {
          userId: true,
          isAdmin: true,
        },
      },
    },
  });

  if (!league) {
    throw new Error("League not found");
  }

  if (user.roles.some(({ role }) => role.name === "ADMIN")) {
    // App admins can delete any league
    return prisma.league.delete({ where: { id: league.id } });
  }

  if (
    !league.members.some(({ userId, isAdmin }) => userId === user.id && isAdmin)
  ) {
    throw new Error("User is not an admin");
  }

  return prisma.league.delete({ where: { id: league.id } });
}

export async function getLeagueListItems({ userId }: { userId: User["id"] }) {
  return prisma.league.findMany({
    where: { members: { some: { userId } } },
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
      members: {
        create: {
          userId,
          isAdmin: true,
          joinedAt: new Date(),
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

  return prisma.leagueMember.create({
    data: {
      leagueId: league.id,
      userId,
      joinedAt: new Date(),
    },
  });
}

export function leaveLeague({
  id,
  userId,
}: Pick<League, "id"> & {
  userId: User["id"];
}) {
  return prisma.leagueMember.deleteMany({
    where: { leagueId: id, userId },
  });
}
