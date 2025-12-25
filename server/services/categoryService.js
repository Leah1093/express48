import mongoose from "mongoose";
import Category from "../models/category.js";
import { CustomError } from "../utils/CustomError.js";
import { Product } from "../models/Product.js";

function isValidObjectId(id) {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
}

function computeFields({ slug, parentDoc }) {
  if (!parentDoc) {
    return {
      depth: 0,
      fullSlug: slug,
      pathSlugs: [slug],
      ancestors: [],
    };
  }
  const depth = (parentDoc.depth || 0) + 1;
  return {
    depth,
    fullSlug: `${parentDoc.fullSlug}/${slug}`,
    pathSlugs: [...(parentDoc.pathSlugs || []), slug],
    ancestors: [...(parentDoc.ancestors || []), parentDoc._id],
  };
}

export class CategoryService {
  // -------- CREATE --------
  async create(data) {
    try {
      let {
        name,
        slug,
        parent = null,
        order = 0,
        isActive = true,
        icon = "",
        imageUrl = "",
        description = "",
      } = data;

      if (!name || !slug) {
        throw new CustomError("name and slug are required", 400);
      }

      slug = String(slug).trim().toLowerCase();

      let parentDoc = null;
      if (parent) {
        if (!isValidObjectId(parent)) throw new CustomError("Invalid parent id", 400);
        parentDoc = await Category.findById(parent);
        if (!parentDoc) throw new CustomError("Parent not found", 400);
      } else {
        parent = null;
      }

      // מניעת כפילות (parent, slug)
      const dup = await Category.findOne({ parent, slug }).lean();
      if (dup) throw new CustomError("Category slug already exists under this parent", 409);

      const computed = computeFields({ slug, parentDoc });

      const created = await Category.create({
        name,
        slug,
        parent,
        order,
        isActive,
        icon,
        imageUrl,
        description,
        ...computed,
      });

      return created;
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError(err.message || "Failed to create category", 500);
    }
  }

  // -------- LIST --------
  async list({ parent, depth, active } = {}) {
    try {
      const filter = {};
      if (typeof depth !== "undefined") filter.depth = Number(depth);
      if (typeof parent !== "undefined") {
        if (parent === null || parent === "null") filter.parent = null;
        else {
          if (!isValidObjectId(parent)) throw new CustomError("Invalid parent id", 400);
          filter.parent = parent;
        }
      }
      if (active === "true") filter.isActive = true;
      if (active === "false") filter.isActive = false;

      return await Category.find(filter).sort({ depth: 1, order: 1, name: 1 }).lean();
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError("Failed to fetch categories", 500);
    }
  }

  // -------- GET --------
  async getById(id) {
    try {
      if (!isValidObjectId(id)) throw new CustomError("Invalid id", 400);
      const category = await Category.findById(id).lean();
      if (!category) throw new CustomError("Category not found", 404);
      return category;
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError("Failed to fetch category", 500);
    }
  }

 // -------- UPDATE --------
  async update(id, data) {
    try {
      if (!isValidObjectId(id)) throw new CustomError("Invalid id", 400);
      const current = await Category.findById(id);
      if (!current) throw new CustomError("Category not found", 404);

      const patch = { ...data };

      // הכנות ל-parent / slug חדשים
      let newParentDoc = null;
      let parentChanged = false;

      if ("parent" in patch) {
        if (patch.parent === null || patch.parent === "null") {
          parentChanged = String(current.parent) !== "null" && current.parent !== null;
          patch.parent = null;
        } else {
          if (!isValidObjectId(patch.parent)) throw new CustomError("Invalid parent id", 400);
          if (String(patch.parent) === String(id)) {
            throw new CustomError("Category cannot be its own parent", 400);
          }
          newParentDoc = await Category.findById(patch.parent);
          if (!newParentDoc) throw new CustomError("Parent not found", 400);
          parentChanged = String(current.parent ?? "") !== String(patch.parent);

          // מניעת העברת קטגוריה לתוך הצאצאים שלה (יצירת לולאה)
          const isDescendant = await Category.exists({
            fullSlug: { $regex: `^${current.fullSlug}(/|$)` },
            _id: patch.parent,
          });
          if (isDescendant) throw new CustomError("Cannot move category under its descendant", 400);
        }
      }

      // slug חדש (אם קיים) — normalize
      let newSlug = current.slug;
      let slugChanged = false;
      if ("slug" in patch && typeof patch.slug === "string") {
        newSlug = patch.slug.trim().toLowerCase();
        slugChanged = newSlug !== current.slug;
      }

      // מניעת כפילות (parent, slug)
      if (parentChanged || slugChanged) {
        const parentKey = "parent" in patch ? (patch.parent ?? null) : (current.parent ?? null);
        const dup = await Category.findOne({
          parent: parentKey,
          slug: newSlug,
          _id: { $ne: id },
        }).lean();
        if (dup) throw new CustomError("Category slug already exists under this parent", 409);
      }

      // חישוב שדות חדשים לקטגוריה עצמה
      const baseParentDoc =
        "parent" in patch
          ? newParentDoc
          : current.parent
          ? await Category.findById(current.parent)
          : null;

      const computed = computeFields({ slug: newSlug, parentDoc: baseParentDoc });

      // עדכון הקטגוריה עצמה
      const selfUpdate = {
        name: "name" in patch ? patch.name : current.name,
        slug: newSlug,
        parent: "parent" in patch ? (patch.parent ?? null) : current.parent,
        isActive: "isActive" in patch ? !!patch.isActive : current.isActive,
        order: "order" in patch ? Number(patch.order) : current.order,
        icon: "icon" in patch ? patch.icon : current.icon,
        imageUrl: "imageUrl" in patch ? patch.imageUrl : current.imageUrl,
        description: "description" in patch ? patch.description : current.description,
        ...computed,
      };

      const updated = await Category.findByIdAndUpdate(
        id,
        { $set: selfUpdate },
        { new: true, runValidators: true }
      );

      // אם לא שינינו parent/slug — אין צורך בקסקדה
      if (!(parentChanged || slugChanged)) {
        return updated;
      }

      // ---- Cascade לכל הצאצאים (עדכון fullSlug/pathSlugs/ancestors/depth) ----
      const oldFull = current.fullSlug;
      const newFull = updated.fullSlug;

      const oldPathSlugs = current.pathSlugs;
      const newPathSlugs = updated.pathSlugs;

      const oldAncestorsLen = current.ancestors.length + 1; // + current._id
      const descendants = await Category.find({
        fullSlug: { $regex: `^${oldFull}/` },
      }).lean();

      const ops = [];
      for (const child of descendants) {
        // החלפת הפריפיקס ב-fullSlug
        const childNewFull = child.fullSlug.replace(oldFull + "/", newFull + "/");

        // pathSlugs: החלפת הראש
        const tail = child.pathSlugs.slice(oldPathSlugs.length);
        const childNewPathSlugs = [...newPathSlugs, ...tail];

        // ancestors: [...updated.ancestors, updated._id, ...rest]
        const rest = child.ancestors.slice(oldAncestorsLen);
        const childNewAncestors = [...updated.ancestors, updated._id, ...rest];

        const childNewDepth = childNewPathSlugs.length - 1;

        ops.push({
          updateOne: {
            filter: { _id: child._id },
            update: {
              $set: {
                fullSlug: childNewFull,
                pathSlugs: childNewPathSlugs,
                ancestors: childNewAncestors,
                depth: childNewDepth,
                updatedAt: new Date(),
              },
            },
          },
        });
      }

      if (ops.length) await Category.bulkWrite(ops, { ordered: false });

      return updated;
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError(err.message || "Failed to update category", 500);
    }
  }

  // -------- REMOVE --------
  async remove(id, { cascade = false } = {}) {
    try {
      if (!isValidObjectId(id)) throw new CustomError("Invalid id", 400);

      const current = await Category.findById(id);
      if (!current) throw new CustomError("Category not found", 404);

      // 1) מביאים את כל הקטגוריות בתת־העץ (הקטגוריה + כל תתי־הקטגוריות שלה)
      const subtreeCategories = await Category.find({
        fullSlug: { $regex: `^${current.fullSlug}(/|$)` },
      })
        .select("_id")
        .lean();

      const categoryIds = subtreeCategories.map((c) => c._id);

      // 2) בודקים האם יש מוצרים שמשויכים לאחת מהקטגוריות בתת־העץ
      //    לפי primaryCategoryId או categoryPathIds
      const linkedProductsCount = await Product.countDocuments({
        $or: [
          { primaryCategoryId: { $in: categoryIds } },
          { categoryPathIds: { $in: categoryIds } },
        ],
      });

      if (linkedProductsCount > 0) {
        throw new CustomError(
          "לא ניתן למחוק קטגוריה שיש אליה מוצרים משויכים (כולל תתי־קטגוריות)",
          400
        );
      }

      // 3) אם אין מוצרים, אפשר להמשיך לפי מצב cascade

      if (cascade) {
        // מוחק את כל תת־העץ (כולל השורש)
        await Category.deleteMany({
          _id: { $in: categoryIds },
        });
        return;
      }

      // בלי cascade: לא מאפשרים מחיקה אם יש ילדים ישירים
      const childrenCount = await Category.countDocuments({ parent: id });
      if (childrenCount > 0) {
        throw new CustomError(
          "Category has children. Use ?cascade=true to delete subtree or reassign children first.",
          400
        );
      }

      await Category.deleteOne({ _id: id });
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError("Failed to delete category", 500);
    }
  }

  // -------- UPLOAD ICON --------
  async uploadIcon(id, iconPath) {
    try {
      if (!isValidObjectId(id)) throw new CustomError("Invalid id", 400);
      const category = await Category.findByIdAndUpdate(
        id,
        { $set: { icon: iconPath } },
        { new: true, runValidators: true }
      );
      if (!category) throw new CustomError("Category not found", 404);
      return category;
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError("Failed to upload icon", 500);
    }
  }
    // -------- CHILDREN + hasChildren (למגה-פאנל) --------
// -------- CHILDREN + hasChildren (למגה-פאנל) --------
async getChildrenWithHasChildren(parentId) {
  try {
    if (!isValidObjectId(parentId)) {
      throw new CustomError("Invalid parent id", 400);
    }

    // ילדים ישירים של ה-root (L2)
    const children = await Category.find({
      parent: parentId,
      isActive: true,
    })
      .sort({ order: 1, name: 1 })
      .lean();

    if (!children.length) return [];

    const childIds = children.map((c) => c._id);

    // בודקים אם יש להם ילדים ישירים (L3) לפי parent
    const directChildrenCounts = await Category.aggregate([
      {
        $match: {
          parent: { $in: childIds },
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$parent",
          count: { $sum: 1 },
        },
      },
    ]);

    const countsMap = new Map(
      directChildrenCounts.map((d) => [String(d._id), d.count])
    );

    // מחזירים את הילדים עם hasChildren לפי אם יש להם ילד ישיר
    return children.map((cat) => ({
      ...cat,
      hasChildren: countsMap.has(String(cat._id)),
    }));
  } catch (err) {
    if (err instanceof CustomError) throw err;
    throw new CustomError(
      err.message || "Failed to fetch children with hasChildren",
      500
    );
  }
}

}

