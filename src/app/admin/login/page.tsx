import type { Metadata } from "next";
import { Logo } from "@/components/ui/brand-icons";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4">
      <div aria-hidden className="grid-bg absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div aria-hidden className="absolute top-1/2 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-[120px]" />
      <div className="card relative w-full max-w-sm p-8 shadow-2xl">
        <Logo size={52} />
        <h1 className="display mt-8 text-3xl font-bold">Admin panel</h1>
        <p className="mt-1 text-sm text-muted">Enter the admin password to manage the website.</p>
        <LoginForm />
      </div>
    </main>
  );
}
