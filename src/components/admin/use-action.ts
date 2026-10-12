"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/app/admin/actions";

/** Runs a Server Action in a transition and reports the result as a toast. */
export function useAdminAction() {
  const [pending, startTransition] = useTransition();
  function run<T>(action: () => Promise<ActionResult<T>>, success: string, onSuccess?: () => void) {
    startTransition(async () => {
      const res = await action();
      if (res.ok) {
        toast.success(success);
        onSuccess?.();
      } else toast.error(res.error);
    });
  }
  return { pending, run };
}

export function confirmDelete(what: string) {
  return window.confirm(`Delete ${what}? This can't be undone.`);
}
