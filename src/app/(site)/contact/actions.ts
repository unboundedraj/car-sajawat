"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { enquirySchema } from "@/lib/schemas";
import { adminDb, isAdminStorageConfigured } from "@/lib/supabase";

export type EnquiryState = { status: "idle" | "success" | "error"; message?: string; fieldErrors?: Record<string, string> };

const recent = new Map<string, number[]>();

export async function submitEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  // Honeypot: real users never fill this hidden field
  if (formData.get("company")) return { status: "success", message: "Thanks! We'll be in touch shortly." };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const times = (recent.get(ip) ?? []).filter((t) => now - t < 60 * 60 * 1000);
  if (times.length >= 5) {
    return { status: "error", message: "You've sent several enquiries already. Please reach us on WhatsApp or call." };
  }

  const parsed = enquirySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [k, v] of Object.entries(z.flattenError(parsed.error).fieldErrors)) {
      if (v?.[0]) fieldErrors[k] = v[0];
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  if (!isAdminStorageConfigured()) {
    return { status: "error", message: "Online enquiries aren't set up yet. Please message us on WhatsApp." };
  }

  const data = parsed.data;
  const { error } = await adminDb()
    .from("enquiries")
    .insert({
      ...data,
      vehicle: data.vehicle || null,
      interest: data.interest || null,
      message: data.message || null,
    });
  if (error) {
    console.error("[enquiry]", error.message);
    return { status: "error", message: "Something went wrong. Please try WhatsApp or call us." };
  }

  times.push(now);
  recent.set(ip, times);
  return { status: "success", message: "Thanks! Our team will call you back shortly." };
}
