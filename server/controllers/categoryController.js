import mongoose from "mongoose";
import { CategoryService } from "../service/categoryService.js";
import { CustomError } from "../utils/CustomError.js";

// נסה לייבא גם default וגם named כדי להיות עמיד לשתי הצורות:
import CategoryDefault, { Category as CategoryNamed } from "../models/category.js";
const Category = CategoryDefault || CategoryNamed;

export const service = new CategoryService();

// --- Helpers (פנימיים לקונטרולר) ---
function assertObjectId(id, field = "id") {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new CustomError(`Invalid ${field}`, 400);
    throw err;
  }
}
async function getCategoryOr404(id) {
  assertObjectId(id);
  const doc = await Category.findById(id).lean();
  if (!doc) throw new CustomError("Category not found", 404);
  return doc;
}
async function buildTree(rootId, maxDepth = 3) {
  const root = await getCategoryOr404(rootId);
  const nodes = await Category.find({
    fullSlug: { $regex: `^${root.fullSlug}(/|$)` },
    depth: { $lte: root.depth + maxDepth },
  })
    .sort({ depth: 1, order: 1 })
    .lean();

  const map = new Map(nodes.map((n) => [String(n._id), { ...n, children: [] }]));
  let treeRoot = null;

  for (const n of map.values()) {
    if (!n.parent) {
      if (String(n._id) === String(root._id)) treeRoot = n;
      continue;
    }
    const parent = map.get(String(n.parent));
    if (parent) parent.children.push(n);
  }
  return treeRoot || map.get(String(root._id));
}

export class CategoryController {
  // ---------- יצירה ----------
  async create(req, res, next) {
    try {
      const {
        name,
        slug,
        parent = null,
        order = 0,
        isActive = true,
        imageUrl = "",
        description = "",
      } = req.body;

      const icon = req.file
        ? `/uploads/icons/${req.file.filename}`
        : req.body.icon ?? "";

      const category = await service.create({
        name,
        slug,
        parent,
        order,
        isActive,
        icon,
        imageUrl,
        description,
      });

      res.status(201).json(category);
    } catch (e) {
      next(e);
    }
  }

  // ---------- רשימה ----------
  async list(req, res, next) {
    try {
      const { parent, depth, active } = req.query; // ?parent=<id|null>&depth=&active=true/false
      const categories = await service.list({ parent, depth, active });
      res.json(categories);
    } catch (e) {
      next(e);
    }
  }

  // ---------- שורשים ----------
  async getRoots(req, res, next) {
    try {
      const roots = await Category.find({ parent: null })
        .sort({ order: 1, name: 1 })
        .lean();
      res.json(roots);
    } catch (e) {
      next(e);
    }
  }

  // ---------- ילדים ישירים ----------
  // ---------- ילדים ישירים + hasChildren ----------
  async getChildren(req, res, next) {
    try {
      const { id } = req.params;
      assertObjectId(id);
      // משתמשים בסרוויס החדש שמחשב hasChildren לפי ancestors
      const children = await service.getChildrenWithHasChildren(id);
      res.json(children);
    } catch (e) {
      next(e);
    }
  }


  // ---------- לפי fullSlug ----------
getByFullSlug = async (req, res, next) => {
  try {
    const { fullSlug = "", page = 1, limit = 24, sort } = req.query;

    if (!fullSlug || typeof fullSlug !== "string") {
      return next(new CustomError("fullSlug חובה", 400));
    }

    const result = await productService.getByFullSlugService({
      fullSlug,
      page: Number(page) || 1,
      limit: Number(limit) || 24,
      sort,
    });

    res.json(result);
  } catch (err) {
    next(err instanceof CustomError ? err : new CustomError("שגיאה בשליפת מוצרים לפי קטגוריה", 500));
  }
};


  // ---------- עץ מקונן החל מ-id ----------
  async getTreeFrom(req, res, next) {
    try {
      const { id } = req.params;
      const maxDepth = Number(req.query.maxDepth ?? 3);
      const tree = await buildTree(id, maxDepth);
      res.json(tree);
    } catch (e) {
      next(e);
    }
  }

  // ---------- שליפה בודדת ----------
  async get(req, res, next) {
    try {
      const category = await service.getById(req.params.id);
      res.json(category);
    } catch (e) {
      next(e);
    }
  }

  // ---------- עדכון ----------
  async update(req, res, next) {
    try {
      const {
        name,
        slug,
        parent, // undefined (לא לשנות) | null (להפוך לשורש) | ObjectId כטקסט
        order,
        isActive,
        imageUrl,
        description,
        icon: iconFromBody,
      } = req.body;

      const patch = {
        ...(name !== undefined ? { name } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(parent !== undefined ? { parent } : {}),
        ...(order !== undefined ? { order: Number(order) } : {}),
        ...(isActive !== undefined
          ? { isActive: isActive === true || isActive === "true" }
          : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(description !== undefined ? { description } : {}),
      };

      if (req.file) {
        patch.icon = `/uploads/icons/${req.file.filename}`;
      } else if (iconFromBody !== undefined) {
        patch.icon = iconFromBody;
      }

      const category = await service.update(req.params.id, patch);
      res.json(category);
    } catch (e) {
      next(e);
    }
  }

  // ---------- מחיקה ----------
  async remove(req, res, next) {
    try {
      const cascade = String(req.query.cascade || "false") === "true";
      await service.remove(req.params.id, { cascade });
      res.json({ ok: true, cascade });
    } catch (e) {
      next(e);
    }
  }

  // ---------- העלאת אייקון ----------
  async uploadIcon(req, res, next) {
    try {
      if (!req.file) throw new CustomError("לא הועלתה תמונה", 400);
      const category = await service.uploadIcon(
        req.params.id,
        `/uploads/icons/${req.file.filename}`
      );
      res.json(category);
    } catch (e) {
      next(e);
    }
  }
}
