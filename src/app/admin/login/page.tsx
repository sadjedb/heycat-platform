import { redirect } from "next/navigation";
import { Logo } from "@/components/brand";
import { Button, Field, Flash, Input } from "@/components/admin/ui";
import { getSessionAdmin, hasAnyAdmin } from "@/lib/auth";
import { loginAction, setupAction } from "../actions";

export const metadata = { title: "Sign in" };

/*
 * One page, two states.
 *
 * With no admin rows at all this is first-run setup; otherwise it is the login
 * form. Both post to actions that re-check the condition server-side — the form
 * that happens to be rendered is never the authorisation.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  if (await getSessionAdmin()) redirect("/admin");

  const { error, ok } = await searchParams;
  const needsSetup = !(await hasAnyAdmin());

  return (
    <div className="w-full max-w-sm">
      <div className="mb-10 flex justify-center text-[2.4rem]">
        <Logo />
      </div>

      <div className="rounded-xl border border-sand bg-white p-6 sm:p-7">
        <h1 className="font-display text-[1.4rem]">
          {needsSetup ? "Create the owner account" : "Sign in"}
        </h1>
        <p className="mt-1.5 text-[0.84rem] leading-relaxed text-taupe">
          {needsSetup
            ? "No account exists yet. This first one becomes the café's owner."
            : "Manage the menu, the cats, reservations and the café's details."}
        </p>

        <div className="mt-5 space-y-4">
          <Flash ok={ok} error={error} />

          <form action={needsSetup ? setupAction : loginAction} className="space-y-4">
            {needsSetup ? (
              <Field label="Your name" required>
                <Input name="name" autoComplete="name" required maxLength={80} />
              </Field>
            ) : null}

            <Field label="Email" required>
              <Input
                type="email"
                name="email"
                autoComplete="username"
                required
                autoFocus
                maxLength={160}
              />
            </Field>

            <Field
              label="Password"
              required
              hint={needsSetup ? "10 characters or more" : undefined}
            >
              <Input
                type="password"
                name="password"
                autoComplete={needsSetup ? "new-password" : "current-password"}
                required
                minLength={needsSetup ? 10 : 1}
                maxLength={200}
              />
            </Field>

            <Button type="submit" className="w-full">
              {needsSetup ? "Create account" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>

      <p className="mt-6 text-center text-[0.76rem] leading-relaxed text-mist">
        HEYCAT admin. Signing in sets a session cookie that lasts 14 days.
      </p>
    </div>
  );
}
