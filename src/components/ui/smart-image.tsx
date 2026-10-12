import Image, { type ImageProps } from "next/image";
import { canOptimizeImage } from "@/lib/media";

/**
 * next/image for hosts allowed in next.config.ts, plain <img> for anything
 * else an admin pastes in (so arbitrary URLs never break the page).
 */
export function SmartImage({ src, alt, ...props }: Omit<ImageProps, "src"> & { src: string }) {
  if (canOptimizeImage(src)) return <Image src={src} alt={alt} {...props} />;
  const { fill, className, sizes: _sizes, preload, ...rest } = props;
  void _sizes;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={preload ? "eager" : "lazy"}
      decoding="async"
      className={fill ? `absolute inset-0 size-full ${className ?? ""}` : className}
      width={typeof rest.width === "number" ? rest.width : undefined}
      height={typeof rest.height === "number" ? rest.height : undefined}
    />
  );
}
