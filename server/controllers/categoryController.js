import { CategoryService } from "../service/categoryService.js";

const service = new CategoryService();

export class CategoryController {
async create(req, res, next) {
  try {
    const { name, parentId } = req.body;

    const icon = req.file ? `/uploads/icons/${req.file.filename}` : null;
    console.log("req.file:", req.file);
    console.log("icon:", icon);

    const category = await service.create({
      name,
      parentId: parentId || null,
      icon,
    });

    res.status(201).json(category);
  } catch (e) {
    next(e);
  }
}


    async list(req, res, next) {
        try {
            const categories = await service.list();
            res.json(categories);
        } catch (e) {
            next(e);
        }
    }

    async get(req, res, next) {
        try {
            const category = await service.getById(req.params.id);
            res.json(category);
        } catch (e) {
            next(e);
        }
    }

    // async update(req, res, next) {
    //     try {
    //         const category = await service.update(req.params.id, req.body);
    //         res.json(category);
    //     } catch (e) {
    //         next(e);
    //     }
    // }

    async update(req, res, next) {
  try {
    const { name, parentId } = req.body;
    const updateData = { name, parentId: parentId || null };

    // אם הגיע קובץ חדש
    if (req.file) {
      updateData.icon = `/uploads/icons/${req.file.filename}`;
    }

    const category = await service.update(req.params.id, updateData);
    if (!category) return res.status(404).json({ error: "Category not found" });

    res.json(category);
  } catch (e) {
    next(e);
  }
}


    async remove(req, res, next) {
        try {
            await service.remove(req.params.id);
            res.json({ ok: true });
        } catch (e) {
            next(e);
        }
    }

    async uploadIcon(req, res, next) {
        try {
            if (!req.file) throw new Error("לא הועלתה תמונה");
            const category = await service.uploadIcon(req.params.id, req.file.path);
            res.json(category);
        } catch (e) {
            next(e);
        }
    }

}
