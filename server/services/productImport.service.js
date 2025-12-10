import { parse } from "csv-parse/sync";
import { Product } from "../models/Product.js";
import { CustomError } from "../utils/CustomError.js";
import { Category } from "../models/category.js";
import iconv from "iconv-lite";

const MAX_OVERVIEW_BLOCKS = 5;

function normalizeGtinValue(value) {
  if (value == null) return "";

  let raw = String(value).trim();

  if (!raw) return "";

  // אם אקסל שמר כפורמט מדעי (E+12)
  const sciRegex = /^[0-9.]+e[+-]?[0-9]+$/i;
  if (sciRegex.test(raw)) {
    const num = Number(raw);
    if (!Number.isNaN(num)) {
      // GTIN הוא עד 14 ספרות, אז אין בעיית דיוק במספר
      raw = num.toFixed(0); // מוריד את ה־E+12 והנקודה
    }
  }

  return raw;
}

export class ProductImportService {
  static async importFromCsv({ csvBuffer, sellerId, storeId }) {
    try {
      let text;

      // Check for UTF-8 BOM (0xEF 0xBB 0xBF)
      const hasUTF8BOM =
        csvBuffer.length >= 3 &&
        csvBuffer[0] === 0xef &&
        csvBuffer[1] === 0xbb &&
        csvBuffer[2] === 0xbf;

      if (hasUTF8BOM) {
        // יש BOM → הקובץ UTF-8 (הסר את ה-BOM)
        text = csvBuffer.toString("utf8");
      } else {
        // בלי BOM → נסה UTF-8 קודם, ואם לא עובד אז Windows-1255
        try {
          // Try to decode as UTF-8 first
          text = csvBuffer.toString("utf8");
          // Validate that UTF-8 decoding worked (Hebrew chars are multi-byte)
          // If all chars are valid UTF-8, proceed
          if (!text.includes("\ufffd")) {
            // No replacement character, UTF-8 is valid
            // But check if it looks like gibberish by counting non-ASCII chars
            const nonAsciiCount = (text.match(/[^\x00-\x7F]/g) || []).length;
            const hebrewCount = (text.match(/[\u0590-\u05FF]/g) || []).length;
            
            // If we have Hebrew-looking characters, use UTF-8
            if (hebrewCount > nonAsciiCount * 0.5) {
              // Likely valid Hebrew in UTF-8
            } else if (nonAsciiCount > 0) {
              // Has non-ASCII but doesn't look like Hebrew, try Win1255
              text = iconv.decode(csvBuffer, "win1255");
            }
          } else {
            // Has replacement chars, try Windows-1255
            text = iconv.decode(csvBuffer, "win1255");
          }
        } catch (e) {
          // If UTF-8 fails, fallback to Windows-1255
          text = iconv.decode(csvBuffer, "win1255");
        }
      }

      // ----- זיהוי delimiter בצורה חכמה -----
      const lines = text.split(/\r?\n/);
      const headerLine = lines.find((l) => l.trim().length > 0) || "";

      const candidates = [",", ";", "\t"];
      let delimiter = ",";
      let maxParts = 0;

      for (const d of candidates) {
        const parts = headerLine.split(d).length;
        if (parts > maxParts) {
          maxParts = parts;
          delimiter = d;
        }
      }

      console.log(
        "CSV IMPORT DEBUG:",
        "chosen delimiter =",
        JSON.stringify(delimiter),
        "| header =",
        headerLine
      );

      const records = parse(text, {
        columns: true, // שורה ראשונה = שמות העמודות
        skip_empty_lines: true,
        trim: true,
        delimiter,
      });

      console.log("CSV IMPORT DEBUG: parsed records count =", records.length);

      if (!records.length) {
        throw new CustomError("הקובץ ריק", 400);
      }

      const imported = [];
      const failed = [];

      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        const rowNumber = i + 2; // כי שורה 1 זה כותרות
        const allEmpty = Object.values(row).every((val) => {
          return val == null || String(val).trim() === "";
        });
        if (allEmpty) {
          console.log("CSV IMPORT: skip empty row", rowNumber);
          continue;
        }

        try {
          console.log("CSV IMPORT DEBUG: row", rowNumber, row);

          const productDoc = await this.mapRowToProductDoc({
            row,
            sellerId,
            storeId,
          });

          console.log("CSV IMPORT DEBUG: productDoc before save =", productDoc);

          // ✅ כאן מריצים את כל הולידציות של המודל (כמו בטופס רגיל)
          const product = new Product(productDoc);
          await product.save(); // אין validateBeforeSave:false

          imported.push({
            row: rowNumber,
            _id: product._id,
            sku: product.sku,
            title: product.title,
          });
        } catch (err) {
          // לא מפילים את כל הייבוא – רק מסמנות את השורה כ"נכשלה"
          let message = err?.message || "שגיאה לא ידועה";

          // ✅ פירוק יפה יותר של ValidationError של Mongoose
          if (err?.name === "ValidationError" && err?.errors) {
            const fieldMessages = Object.values(err.errors)
              .map((e) => e.message)
              .filter(Boolean);
            if (fieldMessages.length) {
              message = fieldMessages.join("; ");
            }
          }

          console.error(
            "CSV IMPORT ERROR at row",
            rowNumber,
            "->",
            err?.name,
            message
          );

          failed.push({
            row: rowNumber,
            error: message,
          });
        }
      }

      // גם אם היו כשלונות – מחזירים 200 עם פירוט מה הצליח / נכשל
      return {
        importedCount: imported.length,
        failedCount: failed.length,
        imported,
        failed,
      };
    } catch (err) {
      console.error("CSV IMPORT FATAL ERROR:", err);
      if (err instanceof CustomError) throw err;
      throw new CustomError("שגיאה בקריאת הקובץ", 500);
    }
  }

  static async mapRowToProductDoc({ row, sellerId, storeId }) {
    // ----- כותרת – לא חובה בייבוא -----
    const titleFromCsv = (
      row.title ||
      row.titleEn ||
      row.metaTitle ||
      row.sellerSku ||
      ""
    ).trim();

    const titleEn = (row.titleEn || "").trim();

    // ----- מחיר (price.amount) – לא חובה בייבוא -----
    const rawPrice =
      row.price !== undefined && row.price !== null
        ? row.price
        : row["price.amount"] !== undefined
        ? row["price.amount"]
        : "";

    let priceNumber = 0;

    if (rawPrice !== "" && rawPrice !== null && rawPrice !== undefined) {
      const priceClean = String(rawPrice).replace(/,/g, "").trim();

      const parsed = Number(priceClean);

      if (!Number.isNaN(parsed) && parsed >= 0) {
        priceNumber = parsed;
      }
      // אם זה לא מספר תקין – לא זורקים שגיאה, פשוט נשאר 0
    }

    // ----- מלאי -----
    const stockNumber = Number(row.stock ?? 0);

    // ----- תמונות כלליות (galery) -----
    const images = row.images
      ? String(row.images)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    // ----- description (תיאור קצר ליד הגלריה) -----
    const description = row.descriptionHtml || "";

    // ----- GTIN -----
    const rawGtin = normalizeGtinValue(row.gtin);
    let finalGtin;

    if (rawGtin) {
      const gtinDigits = rawGtin.replace(/\D/g, "");

      if (gtinDigits && !/^[0-9]{8,14}$/.test(gtinDigits)) {
        throw new CustomError(`GTIN לא חוקי: "${rawGtin}"`, 400);
      }

      finalGtin = gtinDigits || undefined;
    }

    // ----- slug -----
    const rawSlug = row.slug || titleEn || titleFromCsv;
    const slug = rawSlug
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");

    // ----- מטבע -----
    const currency = row.currency || "ILS";

    // ----- קטגוריה לפי categoryFullSlug – לא חובה בייבוא -----
    const categoryFullSlugFromCsv = (row.categoryFullSlug || "").trim();

    let leafCategory = null;
    let path = [];

    if (categoryFullSlugFromCsv) {
      leafCategory = await Category.findOne({
        fullSlug: categoryFullSlugFromCsv,
      }).lean();

      if (!leafCategory) {
        throw new CustomError(
          `categoryFullSlug לא קיים בעץ הקטגוריות: "${categoryFullSlugFromCsv}"`,
          400
        );
      }

      const ancestors = Array.isArray(leafCategory.ancestors)
        ? leafCategory.ancestors
        : [];

      path = [...ancestors, leafCategory];
    }

    const breadcrumbs = path.map((c) => ({
      id: c._id,
      name: c.name,
      slug: c.slug,
      fullSlug: c.fullSlug,
      depth: c.depth,
    }));

    const rootCategory = path[0] || null; // קטגוריה ראשית אם קיימת
    const lastCategory = leafCategory; // הקטגוריה הסופית אם קיימת

    // ----- סקירה לפי בלוקים ממוספרים -----
    const blocks = [];

    for (let i = 1; i <= MAX_OVERVIEW_BLOCKS; i++) {
      const typeKey = `overviewBlock${i}_type`;
      const valueKey = `overviewBlock${i}_value`;
      const providerKey = `overviewBlock${i}_provider`;

      const type = (row[typeKey] || "").trim().toLowerCase();
      const value = (row[valueKey] || "").trim();
      const provider = (row[providerKey] || "").trim();

      if (!type || !value) continue;

      if (type === "text") {
        blocks.push({
          type: "text",
          html: value,
        });
      } else if (type === "image") {
        blocks.push({
          type: "image",
          url: value,
          sourceType: "url",
        });
      } else if (type === "video") {
        blocks.push({
          type: "video",
          videoUrl: value,
          provider: provider || "youtube",
        });
      }
    }

    if (!blocks.length && row.overviewHtml) {
      blocks.push({
        type: "text",
        html: row.overviewHtml,
      });
    }

    const textParts = [];
    const overviewImages = [];
    const overviewVideos = [];

    for (const b of blocks) {
      if (!b || typeof b !== "object") continue;

      if (b.type === "text" && b.html) {
        textParts.push(b.html);
      } else if (b.type === "image" && b.url) {
        overviewImages.push(b.url);
      } else if (b.type === "video" && b.videoUrl) {
        overviewVideos.push(b.videoUrl);
      }
    }

    const overviewText = textParts.join("<br/><br/>");

    // ----- משלוח -----
    const deliveryCost = row.deliveryCost ? Number(row.deliveryCost) : 0;

    const doc = {
      supplier: row.supplier || "",
      sellerId,
      storeId,

      metaTitle: row.metaTitle || titleFromCsv,
      metaDescription: row.metaDescription || "",

      title: titleFromCsv,
      titleEn,

      description,
      brand: row.brand || "",
      category: rootCategory?.name || "",
      subCategory: lastCategory?.name || "",

      overview: {
        text: overviewText,
        images: overviewImages,
        videos: overviewVideos,
        blocks,
      },

      gtin: finalGtin,
      sellerSku: row.sellerSku,
      model: row.model || "",
      currency,

      price: {
        amount: priceNumber,
      },
      stock: stockNumber,
      inStock: stockNumber > 0,

      images,
      video: row.video || "",

      ratings: {
        breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        sum: 0,
        avg: 0,
        count: 0,
      },

      primaryCategoryId: leafCategory ? leafCategory._id : undefined,
      categoryPathIds: path.map((c) => c._id),
      categoryFullSlug: leafCategory ? leafCategory.fullSlug : undefined,
      breadcrumbs,

      // 🔹 ייבוא כטיוטה, לא מפורסם
      status: "draft",
      visibility: "private",

      warranty: row.warranty || "",
      shipping: {
        dimensions: {
          length: Number(row.length ?? 0),
          width: Number(row.width ?? 0),
          height: Number(row.height ?? 0),
        },
        from: row.shippingFrom || "IL",
        weightKg: Number(row.weightKg ?? 0),
      },
      delivery: {
        requiresDelivery: true,
        cost: deliveryCost,
        notes: row.deliveryNotes || "",
      },

      isDeleted: false,
      tags: [],
      aliases: [],
      badges: {
        isBestSeller: false,
        isRecommended: false,
      },
      wishlistCount: 0,
      variations: [],
      slug,
    };

    return doc;
  }
}
