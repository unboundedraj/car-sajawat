"use client";

import { useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { suggestDescription } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

type SuggestInput = {
  target: "service" | "product" | "category" | "team";
  categoryKind?: "service" | "product";
  name: string;
  category?: string;
  tagline?: string;
  /** Team members: their job title */
  role?: string;
};

/** "Write with AI": sends the title to Gemini and fills in a suggested description. */
export function AiSuggestButton({
  input,
  current,
  onResult,
}: {
  input: SuggestInput;
  /** Current field value, so we can confirm before overwriting */
  current: string;
  onResult: (text: string) => void;
}) {
  const [pending, startTransition] = useTransition();

  function run() {
    const isTeam = input.target === "team";
    if (input.name.trim().length < 2) {
      toast.error(isTeam ? "Enter the person's name first." : "Enter a name first. AI writes the description from it.");
      return;
    }
    if (isTeam && !input.role?.trim()) {
      toast.error("Enter the role first. The bio is written from the name and role.");
      return;
    }
    if (current.trim() && !window.confirm(`Replace the current ${isTeam ? "bio" : "description"} with an AI suggestion?`)) return;
    startTransition(async () => {
      const res = await suggestDescription(input);
      if (res.ok && res.data) {
        onResult(res.data.text);
        toast.success("Suggestion added. Review and edit it before saving.");
      } else if (!res.ok) {
        toast.error(res.error);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={pending}
      title={input.target === "team" ? "Generate a short bio from the name and role with Gemini" : "Generate a description from the name with Gemini"}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs font-semibold normal-case tracking-normal transition-colors",
        "hover:border-transparent hover:bg-linear-to-r hover:from-[#4285f4] hover:via-[#9b72cb] hover:to-[#d96570] hover:text-white",
        "disabled:cursor-wait disabled:opacity-70",
      )}
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Sparkles className="size-3.5 text-[#9b72cb] transition-colors group-hover:text-white" />
      )}
      {pending ? "Writing…" : "Write with AI"}
    </button>
  );
}
