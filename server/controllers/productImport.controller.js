import { ProductImportService } from "../services/productImport.service.js";
import { CustomError } from "../utils/CustomError.js";

export class ProductImportController {
  static async importCsv(req, res, next) {
    try {
      if (!req.file || !req.file.buffer) {
        throw new CustomError("לא הועלה קובץ CSV", 400);
      }

      const sellerId = req.user?.sellerId;
      const storeId = req.user?.storeId;

      if (!sellerId || !storeId) {
        throw new CustomError("לא נמצא sellerId / storeId למשתמש", 400);
      }

      const result = await ProductImportService.importFromCsv({
        csvBuffer: req.file.buffer,
        sellerId,
        storeId,
      });

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

