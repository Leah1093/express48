// src/utils/urls.js
export function categoryUrl(fullSlug, opts = {}) {
  const base = `/products/by-category/${fullSlug}`;
  const page  = opts.page ?? 1;
  const limit = opts.limit ?? 24;
  return `${base}?page=${page}&limit=${limit}`;
}
