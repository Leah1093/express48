// דמו פשוט – החליפי בקריאות API אמיתיות כשיהיה מוכן

export async function getStoreBySlug(slug) {
  await pause(300);
  if (!slug) return null;
  return {
    id: 's1',
    slug,
    name: 'WEBMASTER',
    logoUrl: 'https://via.placeholder.com/120x120.png?text=Logo',
    namePlacement: 'header', // 'hero' | 'header'
    hero: {
      type: 'image', // 'video' | 'slider'
      imageUrl: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=1920&auto=format&fit=crop',
      overlay: 0.25,
    },
    mobileHero: {
      type: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1516259762381-cf12f4a1d7d5?q=80&w=1200&auto=format&fit=crop',
      overlay: 0.2,
    },
    listBanner: { imageUrl: 'https://via.placeholder.com/600x200.png?text=Store+Banner' },
    contact: {
      showEmail: true,  email: 'seller@example.com',
      showPhone: true,  phone: '03-5551234',
      showAddress: false, address: '',
    },
    about: { showAbout: true, text: 'אנחנו חנות מומחית לגאדג׳טים ואביזרים חכמים.' },
    rating: { average: 4.5, count: 37 },
  };
}

export async function getProducts({ slug, page = 1, sort = 'popular', inStockOnly = false }) {
  await pause(250);
  if (!slug) return { items: [], pagination: { page: 1, pageSize: 8, total: 0, totalPages: 1 } };

  const all = [
    { id: 'p1', title: 'פעמון דלת חכם 1080p', brand: 'Qualtags', price: 289, inStock: true,  image: 'https://via.placeholder.com/600x450?text=Doorbell' },
    { id: 'p2', title: 'מצלמת אבטחה Wi-Fi',  brand: 'Qualtags', price: 199, inStock: false, image: 'https://via.placeholder.com/600x450?text=Camera' },
    { id: 'p3', title: 'נורת לד חכמה E27',   brand: 'SmartCo',  price: 49,  inStock: true,  image: 'https://via.placeholder.com/600x450?text=Bulb' },
    { id: 'p4', title: 'שקע חכם Zigbee',     brand: 'SmartCo',  price: 79,  inStock: true,  image: 'https://via.placeholder.com/600x450?text=Plug' },
    { id: 'p5', title: 'סטריפ לד חכם 5m',    brand: 'Glow',     price: 119, inStock: true,  image: 'https://via.placeholder.com/600x450?text=LED+Strip' },
    { id: 'p6', title: 'נתב Mesh דו-פסי',     brand: 'NetX',     price: 399, inStock: true,  image: 'https://via.placeholder.com/600x450?text=Router' },
  ];

  let items = inStockOnly ? all.filter(x => x.inStock) : all.slice();
  if (sort === 'priceLow') items.sort((a, b) => a.price - b.price);
  if (sort === 'priceHigh') items.sort((a, b) => b.price - a.price);
  // popular/new – דמו

  const pageSize = 8;
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return {
    items: pageItems,
    pagination: {
      page,
      pageSize,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
    },
  };
}

function pause(ms) { return new Promise(r => setTimeout(r, ms)); }
