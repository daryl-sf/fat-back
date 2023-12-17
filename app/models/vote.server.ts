import type { Vote } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Vote };

export async function createVote({
  userId,
  leagueId,
  teamId,
  round,
}: Omit<Vote, "id">) {
  const vote = await prisma.vote.create({
    data: {
      userId,
      leagueId,
      teamId,
      round,
    },
  });

  return vote;
}
