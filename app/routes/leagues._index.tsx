import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, Form, useActionData } from "@remix-run/react";
import { useRef } from "react";

import { joinLeague } from "~/models/league.server";
import { requireUserId } from "~/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const inviteCode = formData.get("inviteCode");

  if (typeof inviteCode !== "string" || inviteCode.length === 0) {
    return json(
      { errors: { body: null, inviteCode: "inviteCode is required" } },
      { status: 400 },
    );
  }

  const { leagueId } = await joinLeague({ inviteCode, userId });

  return redirect(`/leagues/${leagueId}`);
};

export default function LeagueIndexPage() {
  const actionData = useActionData<typeof action>();
  const inviteCodeRef = useRef<HTMLInputElement>(null);

  return (
    <Form
      method="POST"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div>
        <p>
          No league selected. Select a league on the left, or{" "}
          <Link to="new" className="text-blue-500 underline">
            create a new league.
          </Link>
        </p>

        <div className="flex gap-3 items-end">
          <label className="flex flex-col gap-1 w-80">
            <span>Invite Code: </span>
            <input
              ref={inviteCodeRef}
              name="inviteCode"
              className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
              aria-invalid={actionData?.errors?.inviteCode ? true : undefined}
              aria-errormessage={
                actionData?.errors?.inviteCode ? "inviteCode-error" : undefined
              }
            />
          </label>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md h-10"
          >
            Join League
          </button>
        </div>

        {actionData?.errors?.inviteCode ? (
          <div
            id="inviteCode-error"
            className="text-red-500 text-sm font-semibold"
          >
            {actionData.errors.inviteCode}
          </div>
        ) : null}
      </div>
    </Form>
  );
}
