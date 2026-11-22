import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/* Les pages publiques à faire connaître aux moteurs de recherche */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { chemin: string; priorite: number }[] = [
    { chemin: "", priorite: 1 },
    { chemin: "/billets", priorite: 0.9 },
    { chemin: "/prix", priorite: 0.8 },
    { chemin: "/don", priorite: 0.8 },
    { chemin: "/commanditaires", priorite: 0.6 },
    { chemin: "/confidentialite", priorite: 0.2 },
  ];
  return pages.map(({ chemin, priorite }) => ({
    url: `${SITE_URL}${chemin}`,
    changeFrequency: "weekly",
    priority: priorite,
  }));
}
