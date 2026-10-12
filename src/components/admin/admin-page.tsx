import { Suspense, type ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { isAdminStorageConfigured } from "@/lib/supabase";

export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display text-4xl font-bold sm:text-5xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function SetupNotice() {
  return (
    <div className="card flex gap-4 border-amber/40 p-6">
      <AlertTriangle className="size-6 shrink-0 text-amber" />
      <div className="text-sm">
        <p className="font-semibold">Supabase isn&apos;t connected yet</p>
        <p className="mt-1 text-muted">
          Add <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> and{" "}
          <code>SUPABASE_SECRET_KEY</code> to <code>.env.local</code>, and run <code>supabase/schema.sql</code> in the Supabase SQL editor. See the README for details.
        </p>
      </div>
    </div>
  );
}

/** Wraps request-time admin data in Suspense, and shows setup help when Supabase is missing. */
export function AdminData({ children }: { children: ReactNode }) {
  if (!isAdminStorageConfigured()) return <SetupNotice />;
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2 py-20 text-muted">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
