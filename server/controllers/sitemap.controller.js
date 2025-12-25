// controllers/sitemap.controller.js
import { sitemapService } from "../services/sitemap.service.js";

class SitemapController {
  async getSitemap(req, res, next) {
    try {
      const baseUrl = process.env.CLIENT_BASE_URL || "https://express48.co.il";

      const { categories, products } = await sitemapService.getAllUrls();

      const urls = [];

      // --- עמוד הבית ---
      urls.push({
        loc: `${baseUrl}/`,
        priority: "1.0",
        changefreq: "daily",
        lastmod: new Date().toISOString(),
      });

      // --- קטגוריות ---
      for (const cat of categories) {
        const catPath = cat.fullSlug || cat.slug;
        if (!catPath) continue;

        urls.push({
          loc: `${baseUrl}/products/by-category/${catPath}`,
          priority: "0.7",
          changefreq: "weekly",
          lastmod: (cat.updatedAt || new Date()).toISOString(),
        });
      }

      // --- מוצרים ---
      for (const product of products) {
        if (!product.slug) continue;

        const storeSlug =
          product.storeId?.slug ||
          product.storeId?.storeSlug ||
          null;

        if (!storeSlug) continue;

        urls.push({
          loc: `${baseUrl}/products/${storeSlug}/${product.slug}`,
          priority: "0.6",
          changefreq: "weekly",
          lastmod: (product.updatedAt || new Date()).toISOString(),
        });
      }

      const xml = this.buildSitemapXml(urls);

      res.header("Content-Type", "application/xml; charset=utf-8");
      return res.status(200).send(xml);
    } catch (err) {
      next(err);
    }
  }

  buildSitemapXml(urls) {
    const urlsXml = urls
      .map(
        (u) => `
  <url>
    <loc>${this.escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
      )
      .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;
  }

  escapeXml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}

export const sitemapController = new SitemapController();
