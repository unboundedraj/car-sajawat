"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
        Password
        <div className="relative mt-1.5">
          <input
            name="password"
            type={show ? "text" : "password"}
            required
            autoFocus
            autoComplete="current-password"
            className="w-full rounded-xl border border-line bg-bg px-4 py-3 pr-11 text-sm outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted hover:text-fg"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </label>
      {state?.error && <p className="rounded-xl bg-accent/10 px-4 py-2.5 text-sm text-accent">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
        Sign in
      </Button>
    </form>
  );
}
