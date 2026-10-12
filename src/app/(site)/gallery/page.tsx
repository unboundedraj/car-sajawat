import type { Metadata } from "next";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { PageHeader } from "@/components/site/page-header";
import { getMedia } from "@/lib/data";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos and videos of PPF, ceramic coating, wraps and custom builds from the Car Sajawat studio in Ulhasnagar.",
};

export default async function GalleryPage() {
  const media = await getMedia();
  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title={
          <>
            The <span className="text-accent">work</span> speaks
          </>
        }
        description="Recent builds, before-and-afters and studio videos from our team."
        watermark="Builds"
      />
      <section className="py-16 sm:py-20">
        <div className="container-x">
          <GalleryGrid media={media} />
        </div>
      </section>
    </>
  );
}
