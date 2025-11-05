import { Category } from "../models/category.js";
import path from "path";
import { CustomError } from "../utils/CustomError.js";

export class CategoryService {
  async create(data) {
    try {
      return await Category.create(data);
    } catch (err) {
      throw new CustomError(err.message || "Failed to create category", 500);
    }
  }

  async list() {
    try {
      return await Category.find().lean();
    } catch (err) {
      throw new CustomError("Failed to fetch categories", 500);
    }
  }

  async getById(id) {
    try {
      const category = await Category.findById(id).lean();
      if (!category) throw new CustomError("Category not found", 404);
      return category;
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError("Failed to fetch category", 500);
    }
  }

  async update(id, data) {
    try {
      const category = await Category.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
      if (!category) throw new CustomError("Category not found", 404);
      return category;
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError("Failed to update category", 500);
    }
  }

  async remove(id) {
    try {
      const category = await Category.findByIdAndDelete(id);
      if (!category) throw new CustomError("Category not found", 404);
      await Category.deleteMany({ parentId: id });
      return category;
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError("Failed to delete category", 500);
    }
  }

  async uploadIcon(id, filePath) {
    try {
      const category = await Category.findByIdAndUpdate(
        id,
        { icon: `/uploads/icons/${path.basename(filePath)}` },
        { new: true }
      );
      if (!category) throw new CustomError("Category not found", 404);
      return category;
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError("Failed to upload icon", 500);
    }
  }
}
