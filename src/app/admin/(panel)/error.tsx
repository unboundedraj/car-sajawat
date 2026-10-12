"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Catches data errors in the admin panel (e.g. the database tables not existing yet)
export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const missingTables = /schema cache|does not exist|relation .* not found/i.test(error.message);

  return (
    <div className="card mx-auto mt-10 max-w-2xl p-8">
      <AlertTriangle className="size-8 text-amber" />
      <h1 className="display mt-4 text-3xl font-bold">
        {missingTables ? "Database tables not found" : "Something went wrong"}
      </h1>
      {missingTables ? (
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">
          <li>Open your Supabase project → <strong className="text-fg">SQL Editor</strong> → New query.</li>
          <li>
            Paste the contents of <code className="text-fg">supabase/schema.sql</code> from this project and click <strong className="text-fg">Run</strong>.
          </li>
          <li>Come back here and press “Try again”.</li>
        </ol>
      ) : (
        <p className="mt-3 text-sm text-muted">
          The admin data couldn&apos;t be loaded. Check your Supabase keys, and make sure <code className="text-fg">supabase/schema.sql</code> has been run in
          the Supabase SQL Editor, then try again.
        </p>
      )}
      {process.env.NODE_ENV !== "production" && (
        <pre className="mt-5 overflow-x-auto rounded-xl bg-surface-2 p-3 text-xs text-muted">{error.message}</pre>
      )}
      <Button className="mt-6" size="sm" onClick={() => retry()}>
        <RotateCcw className="size-4" /> Try again
      </Button>
    </div>
  );
}
