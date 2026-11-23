import Image, { type ImageProps } from "next/image";

type BlogCoverImageProps = Omit<ImageProps, "src"> & {
  src: string;
  /* Gemelo claro; sin él la portada es la misma en los dos temas. */
  lightSrc: string | null;
};

/* Portada con tema: `display: none` saca la variante oculta del árbol accesible. */
export function BlogCoverImage({
  src,
  lightSrc,
  className,
  alt,
  ...props
}: BlogCoverImageProps) {
  if (!lightSrc)
    return <Image src={src} alt={alt} className={className} {...props} />;
  const cls = (extra: string) => [className, extra].filter(Boolean).join(" ");
  return (
    <>
      <Image
        src={lightSrc}
        alt={alt}
        className={cls("dark:hidden")}
        {...props}
      />
      <Image
        src={src}
        alt={alt}
        className={cls("hidden dark:block")}
        {...props}
      />
    </>
  );
}
