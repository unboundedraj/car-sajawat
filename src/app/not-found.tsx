import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 text-center">
      <div aria-hidden className="grid-bg absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div className="relative">
        <p className="display text-outline text-[40vw] font-bold leading-none sm:text-[16rem]">404</p>
        <h1 className="display -mt-4 text-4xl font-bold sm:text-5xl">Wrong turn</h1>
        <p className="mt-3 text-muted">This page took a detour. Let&apos;s get you back on the road.</p>
        <Link href="/" className={buttonClasses({ className: "mt-8" })}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
