import type { Team } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Team };

export async function getTeamById({ id }: Pick<Team, "id">) {
  const team = prisma.team.findFirst({
    where: { id },
  });

  return team;
}

export async function getTeamByName({ name }: Pick<Team, "name">) {
  const team = prisma.team.findFirst({
    where: { name },
  });

  return team;
}

export async function getTeamListItems() {
  return prisma.team.findMany({
    select: {
      id: true,
      name: true,
      active: true,
      imageUrl: true,
      primaryColor: true,
    },
    where: { active: true },
    orderBy: { name: "asc" },
  });
}
