import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const storage = multer.memoryStorage();

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];
const ALLOWED = [...IMAGE_TYPES, ...VIDEO_TYPES];

function fileFilter(_req, file, cb) {
  cb(ALLOWED.includes(file.mimetype) ? null : new Error("Unsupported file type"), ALLOWED.includes(file.mimetype));
}

export const uploadStoreMedia = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // עד 30MB, אפשר לשנות
  fileFilter,
}).fields([
  { name: "logo", maxCount: 1 },
  { name: "storeBanner", maxCount: 1 },
  { name: "mobileBanner", maxCount: 1 },
  { name: "listBanner", maxCount: 1 },
  { name: "slider", maxCount: 10 }, // סליידר = רק תמונות
]);

async function ensureUploadsDir() {
  const outDir = path.join(process.cwd(), "uploads");
  await fs.mkdir(outDir, { recursive: true });
  return outDir;
}

async function saveImageToWebp(buffer) {
  const outDir = await ensureUploadsDir();
  const id = crypto.randomBytes(8).toString("hex");
  const filename = `${id}.webp`;
  const abs = path.join(outDir, filename);

  await sharp(buffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(abs);

  return `/uploads/${filename}`;
}

async function saveVideoAsIs(buffer, originalMimetype) {
  const outDir = await ensureUploadsDir();
  const id = crypto.randomBytes(8).toString("hex");
  const ext = originalMimetype === "video/webm" ? "webm" : originalMimetype === "video/ogg" ? "ogv" : "mp4";
  const filename = `${id}.${ext}`;
  const abs = path.join(outDir, filename);
  await fs.writeFile(abs, buffer);
  return `/uploads/${filename}`;
}

// יעבד את כל השדות ויכתוב ל-req.processedMedia
export async function processStoreMedia(req, _res, next) {
  try {
    const files = req.files || {};
    const out = {
      logo: null,                   // { kind, url }
      storeBanner: null,            // { kind, url }
      mobileBanner: null,           // { kind, url }
      listBanner: null,             // { kind, url }
      slider: [],                   // [url,url,...] — תמונות בלבד
      _newUrls: [],                 // לניקוי במקרה של כשל
    };

    const handleSingle = async (field) => {
      const f = files[field]?.[0];
      if (!f) return null;

      if (IMAGE_TYPES.includes(f.mimetype)) {
        const url = await saveImageToWebp(f.buffer);
        out._newUrls.push(url);
        return { kind: "image", url };
      }
      if (VIDEO_TYPES.includes(f.mimetype)) {
        const url = await saveVideoAsIs(f.buffer, f.mimetype);
        out._newUrls.push(url);
        return { kind: "video", url };
      }
      throw new Error("Unsupported file type");
    }

    const handleManyImages = async (field) => {
      const arr = files[field] || [];
      const urls = [];
      for (const f of arr) {
        if (!IMAGE_TYPES.includes(f.mimetype)) {
          throw new Error("Slider accepts images only");
        }
        const url = await saveImageToWebp(f.buffer);
        out._newUrls.push(url);
        urls.push(url);
      }
      return urls;
    }

    out.logo = await handleSingle("logo");
    out.storeBanner = await handleSingle("storeBanner");
    out.mobileBanner = await handleSingle("mobileBanner");
    out.listBanner = await handleSingle("listBanner");
    out.slider = await handleManyImages("slider");

    // סוגי באנרים מגיעים כשדות טקסט של הטופס (multer שומר גם אותם)
    // bannerTypeStore: "static" | "video" | "slider"
    // bannerTypeList:  "static" | "video"
    const { bannerTypeStore, bannerTypeList, replaceSlider } = req.body || {};
    req.processedMedia = {
      ...out,
      bannerTypeStore: bannerTypeStore || "static",
      bannerTypeList: bannerTypeList || "static",
      replaceSlider: String(replaceSlider).toLowerCase() === "true",
    };

    next();
  } catch (err) {
    next(err);
  }
}
