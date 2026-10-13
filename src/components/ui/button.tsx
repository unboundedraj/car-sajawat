import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "whatsapp" | "gold";
type Size = "sm" | "md" | "lg";

const base =
  "group relative inline-flex select-none items-center whitespace-nowrap justify-center gap-2 overflow-hidden rounded-full font-semibold tracking-wide transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-fg shadow-[0_10px_30px_-10px_var(--glow)] hover:bg-accent-hot hover:shadow-[0_14px_40px_-8px_var(--glow)] hover:-translate-y-0.5",
  outline: "border border-line-strong text-fg hover:border-accent hover:text-accent",
  ghost: "text-fg hover:bg-surface-2",
  whatsapp: "bg-[#25D366] text-[#05290f] hover:bg-[#2ee676] hover:-translate-y-0.5",
  gold: "gold-orbit",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

/** Light sweep shown on hover for primary buttons */
function Sheen({ variant }: { variant: Variant }) {
  if (variant !== "primary") return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[150%] skew-x-[-20deg] bg-white/25 transition-transform duration-700 group-hover:translate-x-[350%]"
    />
  );
}

type CommonProps = { variant?: Variant; size?: Size; children: ReactNode; className?: string };

export function Button({
  variant = "primary",
  size,
  className,
  children,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button className={buttonClasses({ variant, size, className })} {...props}>
      <Sheen variant={variant} />
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size,
  className,
  children,
  href,
  ...props
}: CommonProps & Omit<ComponentProps<"a">, "href"> & { href: string }) {
  const classes = buttonClasses({ variant, size, className });
  const external = /^(https?:|tel:|mailto:)/.test(href);
  if (external) {
    return (
      <a
        href={href}
        className={classes}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        <Sheen variant={variant} />
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...props}>
      <Sheen variant={variant} />
      {children}
    </Link>
  );
}
