import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";

import {
  getLeagueById,
  deleteLeague,
  leaveLeague,
} from "~/models/league.server";
import { getTeamListItems } from "~/models/team.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.leagueId, "leagueId not found");

  const [league, teams] = await Promise.all([
    await getLeagueById({ id: params.leagueId, userId }),
    await getTeamListItems(),
  ]);

  if (!league) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ league, teams });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.leagueId, "leagueId not found");

  const formData = await request.formData();
  const deleteAction = formData.get("delete");
  const leaveAction = formData.get("leave");

  if (deleteAction === "true") {
    await deleteLeague({ id: params.leagueId, userId });
  }
  if (leaveAction === "true") {
    await leaveLeague({ id: params.leagueId, userId });
  }

  return redirect("/leagues");
};

export default function LeagueDetailsPage() {
  const { league, teams } = useLoaderData<typeof loader>();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  return (
    <div>
      <h3 className="text-2xl font-bold">{league.name}</h3>
      <p className="pt-6">Invite Code: {league.inviteCode}</p>
      <p className="py-6">
        Created: {new Date(league.createdAt).toLocaleDateString()}
      </p>
      <h4 className="text-xl font-semibold">Users:</h4>
      <ul className="pb-6">
        {league.members.map(({ user: { email, id }, isAdmin }) => (
          <li key={email}>
            {id} - {email} - {isAdmin ? "Admin" : "Member"}
          </li>
        ))}
      </ul>

      <h4 className="text-xl font-semibold mt-6 my-3">Pick a team:</h4>
      <div className="flex gap-3 flex-wrap mb-4">
        {teams.map((team) => (
          <button
            key={team.id}
            className={`w-64 flex gap-4 hover:drop-shadow-lg hover:scale-100 cursor-pointer transition-transform border rounded-md bg-slate-100 p-2 grow-0 items-center ${
              team.id === selectedTeamId
                ? "border-blue-500"
                : "border-transparent"
            }`}
            onClick={() => setSelectedTeamId(team.id)}
          >
            <div className="shrink-0">
              <img src={team.imageUrl} alt={team.name} className="h-10" />
            </div>
            <div>
              <p>{team.name}</p>
            </div>
          </button>
        ))}
      </div>

      <button
        type="submit"
        disabled={!selectedTeamId}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Confirm
      </button>

      <hr className="my-4" />
      <Form method="post" className="flex flex-row gap-4">
        <button
          type="submit"
          name="delete"
          value="true"
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:bg-red-400"
        >
          Delete
        </button>
        <button
          type="submit"
          name="leave"
          value="true"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Leave
        </button>
      </Form>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>League not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
