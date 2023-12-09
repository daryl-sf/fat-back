import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { createLeague } from "~/models/league.server";
import { requireUserId } from "~/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("leagueName");

  if (typeof name !== "string" || name.length === 0) {
    return json(
      { errors: { body: null, leagueName: "leagueName is required" } },
      { status: 400 },
    );
  }

  const { id } = await createLeague({ name, userId });

  return redirect(`/leagues/${id}`);
};

export default function NewNotePage() {
  const actionData = useActionData<typeof action>();
  const leagueNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.leagueName) {
      leagueNameRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>League Name: </span>
          <input
            ref={leagueNameRef}
            name="leagueName"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.leagueName ? true : undefined}
            aria-errormessage={
              actionData?.errors?.leagueName ? "leagueName-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.leagueName ? (
          <div className="pt-1 text-red-700" id="leagueName-error">
            {actionData.errors.leagueName}
          </div>
        ) : null}
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
}
