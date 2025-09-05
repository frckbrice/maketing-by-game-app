import { MetadataRoute } from 'next';
import { getAllSitemapEntries, generateSitemap } from '@/lib/seo/sitemap';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getAllSitemapEntries();
  return generateSitemap(entries);
}
