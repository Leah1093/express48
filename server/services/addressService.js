import { Address } from "../models/address.js";
import { CustomError } from "../utils/CustomError.js";

export class AddressService {
  async createAddress(data) {
    try {
      return await Address.create(data);
    } catch (err) {
      throw new CustomError("שגיאה ביצירת כתובת", 500, err);
    }
  }

  async getUserAddresses(userId) {
    try {
      return await Address.find({ userId }).sort({ createdAt: -1 }).lean();
    } catch (err) {
      throw new CustomError("שגיאה בשליפת כתובות", 500, err);
    }
  }

  async getAddressById(id) {
    try {
      const address = await Address.findById(id);
      if (!address) {
        throw new CustomError("כתובת לא נמצאה", 404);
      }
      return address;
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError("שגיאה בשליפת כתובת", 500, err);
    }
  }


  async updateAddress(id, userId, data) {
    try {
      const updated = await Address.findOneAndUpdate(
        { _id: id, userId },   // לוודא שהכתובת שייכת למשתמש
        data,
        { new: true, runValidators: true }
      );

      if (!updated) {
        throw new CustomError("כתובת לא נמצאה או אינה שייכת למשתמש", 404);
      }
      return updated;
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError("שגיאה בעדכון כתובת", 500, err);
    }
  }

  async deleteAddress(id) {
    try {
      const deleted = await Address.findByIdAndDelete(id);
      if (!deleted) {
        throw new CustomError("כתובת לא נמצאה", 404);
      }
      return deleted;
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError("שגיאה במחיקת כתובת", 500, err);
    }
  }

  async setDefaultAddress(userId, addressId) {
    try {
      // מסיר isDefault משאר הכתובות של המשתמש
      await Address.updateMany({ userId }, { $set: { isDefault: false } });

      // מוודא שהכתובת החדשה שייכת למשתמש
      const updated = await Address.findOneAndUpdate(
        { _id: addressId, userId },
        { isDefault: true },
        { new: true }
      );

      if (!updated) {
        throw new CustomError("כתובת לא נמצאה או אינה שייכת למשתמש", 404);
      }
      return updated;
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError("שגיאה בהגדרת כתובת כברירת מחדל", 500, err);
    }
  }
}
