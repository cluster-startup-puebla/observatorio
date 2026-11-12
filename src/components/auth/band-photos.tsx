const photos = ["/auth/puebla-2.webp", "/auth/puebla-1.webp", "/auth/puebla-3.webp"];

export function BandPhotos() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {photos.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          className="band-photo absolute inset-0 size-full object-cover"
          style={{ animationDelay: `${index * 6 - 1.2}s` }}
          fetchPriority={index === 0 ? "high" : "auto"}
          decoding="async"
        />
      ))}
      <div className="band-veil absolute inset-0" />
    </div>
  );
}
