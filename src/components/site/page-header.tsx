import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/reveal";

/** Banner used at the top of inner pages (services, gallery, contact). */
export function PageHeader({
  eyebrow,
  title,
  description,
  watermark,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  watermark?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line pt-32 pb-14 sm:pt-40 sm:pb-20">
      <div aria-hidden className="grid-bg absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div aria-hidden className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-accent/20 blur-[110px]" />
      <div aria-hidden className="absolute -top-24 right-0 h-96 w-[32rem] rounded-full bg-navy-2/35 blur-[120px]" />
      <div aria-hidden className="gold-rule absolute inset-x-0 bottom-0 opacity-60" />
      {watermark && (
        <p aria-hidden className="display text-outline pointer-events-none absolute right-0 bottom-0 translate-y-1/4 text-[22vw] font-bold leading-none select-none lg:text-[14rem]">
          {watermark}
        </p>
      )}
      <Reveal className="container-x relative">
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h1 className="display max-w-4xl text-5xl font-bold sm:text-7xl lg:text-8xl">{title}</h1>
        {description && <p className="mt-5 max-w-2xl text-muted sm:text-lg">{description}</p>}
        {children}
      </Reveal>
    </section>
  );
}
