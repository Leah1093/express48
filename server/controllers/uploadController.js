import cloudinary from "../config/cloudinary.js";
import { CustomError } from "../utils/CustomError.js";

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "express48/products/overview", // אפשר לשנות לתיקייה אחרת
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

export const uploadImageController = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new CustomError("לא הועלה קובץ", 400);
    }

    const result = await uploadToCloudinary(req.file.buffer);

    return res.status(201).json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    next(
      new CustomError(
        err.message || "שגיאה בהעלאת תמונה לקלאודינרי",
        err.status || 500
      )
    );
  }
};
