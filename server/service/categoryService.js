import { Category } from "../models/category.js";

export class CategoryService {
    async create(data) {
        const category = await Category.create(data);
        return category;
    }

    async list() {
        return Category.find().lean();
    }

    async getById(id) {
        const category = await Category.findById(id).lean();
        if (!category) throw new Error("Category not found");
        return category;
    }

    async update(id, data) {
        const category = await Category.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        if (!category) throw new Error("Category not found");
        return category;
    }

    async remove(id) {
        const category = await Category.findByIdAndDelete(id);
        if (!category) throw new Error("Category not found");
        // מחיקת כל תתי־הקטגוריות שמשויכות אליה
        await Category.deleteMany({ parentId: id });
        return category;
    }

    async uploadIcon(id, filePath) {
        const category = await Category.findByIdAndUpdate(
            id,
            { icon: `/uploads/icons/${path.basename(filePath)}` },
            { new: true }
        );
        if (!category) throw new Error("Category not found");
        return category;
    }

}


