"use client";

import { BadgeCheck, ReceiptText, Smartphone } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { buttonClasses } from "@/components/ui/button";
import { CopyIcon, CopyText, useCopy } from "@/components/ui/copy-text";
import { SmartImage } from "@/components/ui/smart-image";
import type { PaymentContent } from "@/lib/types";
import { formatPhone, whatsappLink } from "@/lib/utils";

/** Advance-payment card: UPI QR to scan, the UPI ID to copy, and (on phones) a button that opens a UPI app. */
export function PaymentCard({
  payment,
  businessName,
  whatsapp,
}: {
  payment: PaymentContent;
  businessName: string;
  whatsapp: string;
}) {
  const phone = formatPhone(whatsapp);
  const { copied, copy } = useCopy(payment.upiId);

  // A phone can't scan its own screen, so offer a link that opens the visitor's UPI app
  const upiLink = payment.upiId
    ? `upi://pay?pa=${encodeURIComponent(payment.upiId)}${payment.payeeName ? `&pn=${encodeURIComponent(payment.payeeName)}` : ""}&cu=INR&tn=${encodeURIComponent(`Advance booking - ${businessName}`)}`
    : "";

  return (
    <section
      aria-labelledby="pay-title"
      className="card relative mt-8 overflow-hidden p-6 sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-gold/10 blur-3xl"
      />
      <div className="relative grid items-center gap-8 md:grid-cols-[auto_1fr] md:gap-10">
        {payment.qrImage && (
          <div className="mx-auto w-full max-w-[17rem] md:mx-0">
            {/* unoptimized: serve the QR's exact pixels, never a re-compressed copy */}
            <div className="rounded-2xl border border-gold/40 bg-white p-3 shadow-[0_20px_50px_-25px_var(--gold-glow)]">
              <SmartImage
                src={payment.qrImage}
                alt={`UPI QR code to pay ${businessName}`}
                width={640}
                height={640}
                sizes="272px"
                unoptimized
                className="h-auto w-full rounded-lg"
              />
            </div>
            <p className="mt-3 text-center text-xs text-muted">
              Scan with any UPI app
            </p>
          </div>
        )}

        <div>
          <p className="eyebrow mb-3">Advance payment</p>
          <h2 id="pay-title" className="display text-3xl font-bold sm:text-4xl">
            {payment.title}
          </h2>
          {payment.note && (
            <p className="mt-3 max-w-xl text-muted">{payment.note}</p>
          )}

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-bg p-4">
              <dt className="text-[11px] font-semibold tracking-widest text-muted uppercase">
                Pay to
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 font-semibold">
                <BadgeCheck className="size-4 text-gold" /> {businessName}
              </dd>
            </div>
            {payment.upiId && (
              <div className="rounded-xl border border-line bg-bg p-4">
                <dt className="text-[11px] font-semibold tracking-widest text-muted uppercase">
                  UPI ID
                </dt>
                <dd className="mt-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-sm break-all">
                    {payment.upiId}
                  </span>
                  <button
                    type="button"
                    onClick={copy}
                    aria-label={copied ? "UPI ID copied" : "Copy UPI ID"}
                    className="grid size-8 shrink-0 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-gold hover:text-gold"
                  >
                    <CopyIcon copied={copied} />
                  </button>
                </dd>
              </div>
            )}
          </dl>

          {upiLink && (
            <a
              href={upiLink}
              className={buttonClasses({
                className: "mt-5 w-full sm:w-auto md:hidden",
              })}
            >
              <Smartphone className="size-4" /> Open UPI app to pay
            </a>
          )}

          <div className="mt-6 rounded-xl border border-gold/30 bg-gold/5 p-4">
            <p className="flex items-start gap-2.5 text-sm">
              <ReceiptText className="mt-0.5 size-5 shrink-0 text-gold" />
              <span>
                <strong>Paid the advance?</strong> Share a screenshot of the
                payment on our WhatsApp number
                {phone ? (
                  <>
                    {" "}
                    <CopyText
                      value={phone}
                      label="phone number"
                      className="font-semibold text-fg"
                    >
                      {phone}
                    </CopyText>
                  </>
                ) : null}{" "}
                and we&apos;ll take care of your car from there.
              </span>
            </p>
            {whatsapp && (
              <a
                href={whatsappLink(
                  whatsapp,
                  `Hi ${businessName}! 👋\nI've paid the advance. Sharing the payment screenshot here.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({
                  variant: "whatsapp",
                  size: "sm",
                  className: "mt-3",
                })}
              >
                <WhatsAppIcon className="size-4" /> Send payment screenshot
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
