"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { submitEnquiry, type EnquiryState } from "@/app/(site)/contact/actions";
import { Button } from "@/components/ui/button";
import { ENQUIRY_INTERESTS } from "@/lib/interests";
import { cn } from "@/lib/utils";

const field =
  "mt-1.5 w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent";

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={name} className="block text-xs font-semibold uppercase tracking-wider text-muted">
      {label}
      {children}
      {error && <span className="mt-1 block text-xs font-normal normal-case tracking-normal text-accent">{error}</span>}
    </label>
  );
}

export function EnquiryForm() {
  const [state, action, pending] = useActionState<EnquiryState, FormData>(submitEnquiry, { status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  const err = state.fieldErrors ?? {};

  return (
    <form id="enquiry" ref={formRef} action={action} className="card relative scroll-mt-28 space-y-4 p-6 sm:p-8" noValidate>
      <h2 className="display text-3xl font-bold">Request a callback</h2>
      <p className="-mt-2 text-sm text-muted">Tell us about your car and we&apos;ll get back with options and pricing.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name *" name="name" error={err.name}>
          <input id="name" name="name" required autoComplete="name" className={cn(field, err.name && "border-accent")} placeholder="Your name" />
        </Field>
        <Field label="Phone *" name="phone" error={err.phone}>
          <input id="phone" name="phone" type="tel" required autoComplete="tel" inputMode="tel" className={cn(field, err.phone && "border-accent")} placeholder="+91 98xxx xxxxx" />
        </Field>
        <Field label="Car make & model" name="vehicle" error={err.vehicle}>
          <input id="vehicle" name="vehicle" className={field} placeholder="e.g. Hyundai Creta 2024" />
        </Field>
        <Field label="Interested in" name="interest">
          <select id="interest" name="interest" className={field} defaultValue="">
            <option value="">Select (optional)</option>
            {Object.entries(ENQUIRY_INTERESTS).map(([group, options]) => (
              <optgroup key={group} label={group}>
                {options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value="Other">Something else</option>
          </select>
        </Field>
      </div>
      <Field label="Message" name="message" error={err.message}>
        <textarea id="message" name="message" rows={4} className={cn(field, "resize-y")} placeholder="Anything we should know?" />
      </Field>
      {/* honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div aria-live="polite">
        {state.status === "success" && (
          <p className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4" /> {state.message}
          </p>
        )}
        {state.status === "error" && state.message && <p className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent">{state.message}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {pending ? "Sending…" : "Send enquiry"}
      </Button>
    </form>
  );
}
