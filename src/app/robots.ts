import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/panel/", "/api/", "/qeydiyyat/tamamla"],
      },
    ],
    sitemap: "https://archilink.az/sitemap.xml",
  };
}
