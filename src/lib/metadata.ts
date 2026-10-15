import type { Metadata } from "next";

export const siteName = "Observatorio Tecnológico de Puebla";

export const siteDescription =
  "Reserva tu lugar en la sesión de tu sector y ayuda a construir el primer Observatorio Tecnológico del estado.";

export const ogImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Observatorio Tecnológico de Puebla. Levantamiento de necesidades.",
} as const;

const titleTemplate = `%s · ${siteName}`;

function metadataBase() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return new URL(configured);

  if (process.env.VERCEL_URL) return new URL(`https://${process.env.VERCEL_URL}`);

  const port = process.env.PORT || "3000";
  return new URL(`http://localhost:${port}`);
}

const socialDefaults = {
  siteName,
  locale: "es_MX",
  type: "website" as const,
  images: [ogImage],
};

export const rootMetadata: Metadata = {
  metadataBase: metadataBase(),
  title: {
    default: siteName,
    template: titleTemplate,
  },
  description: siteDescription,
  applicationName: siteName,
  openGraph: {
    ...socialDefaults,
    title: {
      default: siteName,
      template: titleTemplate,
    },
    description: siteDescription,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: siteName,
      template: titleTemplate,
    },
    description: siteDescription,
    images: [ogImage.url],
  },
};

function imageFor(path: string, alt: string) {
  return {
    ...ogImage,
    url: path === "/" ? "/opengraph-image" : `${path}/opengraph-image`,
    alt,
  };
}

export function pageMetadata({
  title,
  description,
  path,
  absolute = false,
}: {
  title: string;
  description: string;
  path: string;
  absolute?: boolean;
}): Metadata {
  const image = imageFor(path, `${title}. ${description}`);
  const socialTitle = absolute ? { absolute: title } : title;

  return {
    title: socialTitle,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...socialDefaults,
      title: socialTitle,
      description,
      url: path,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [image.url],
    },
  };
}
