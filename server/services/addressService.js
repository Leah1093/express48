// server/service/addressService.js
import { Address } from "../models/address.js";
import { CustomError } from "../utils/CustomError.js";

export class AddressService {
 async createAddress(data) {
    try {
      console.log("📦 createAddress payload after validate:", data);

      const isDefault = !!data.isDefault;

      // ✅ אם זו כתובת ברירת מחדל חדשה – קודם מאפסים את הישנות
      if (isDefault) {
        await Address.updateMany(
          { userId: data.userId },
          { $set: { isDefault: false } }
        );
      }

      // עכשיו יוצרים את הכתובת החדשה בלי להתנגש עם האינדקס
      const created = await Address.create({
        userId: data.userId,
        fullName: data.fullName,
        phone: data.phone,
        country: data.country || "IL",
        city: data.city,
        street: data.street,
        houseNumber: data.houseNumber,
        apartment: data.apartment,
        zip: data.zipCode || data.zip,
        isDefault,
        notes: data.notes || "",
      });

      return created.toObject();
    } catch (err) {
      console.error("❌ Mongoose error in createAddress:", err);
      // אם זו שגיאת אינדקס, נחזיר הודעה ברורה
      if (err.code === 11000) {
        throw new CustomError(
          "לא ניתן להגדיר שתי כתובות כברירת מחדל לאותו משתמש",
          400
        );
      }
      throw new CustomError("שגיאה ביצירת כתובת", 500);
    }
  }

  // ...

  async setDefaultAddress(userId, addressId) {
    try {
      // מוודא שהכתובת קיימת ושייכת למשתמש
      const target = await Address.findOne({ _id: addressId, userId });
      if (!target) {
        throw new CustomError("כתובת לא נמצאה או אינה שייכת למשתמש", 404);
      }

      // כל הכתובות האחרות → isDefault=false
      await Address.updateMany(
        { userId, _id: { $ne: addressId } },
        { $set: { isDefault: false } }
      );

      // הכתובת שנבחרה → isDefault=true
      target.isDefault = true;
      await target.save();

      return target.toObject();
    } catch (err) {
      if (err instanceof CustomError) throw err;
      console.error("❌ error in setDefaultAddress:", err);
      throw new CustomError("שגיאה בהגדרת כתובת כברירת מחדל", 500);
    }
  }


  async getUserAddresses(userId) {
  try {
    const list = await Address.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    return list;
  } catch (err) {
    console.error("❌ error in getUserAddresses:", err);
    throw new CustomError("שגיאה בשליפת כתובות", 500);
  }
}

  async getAddressById(id, userId) {
  try {
    const address = await Address.findOne({ _id: id, userId }).lean();
    if (!address) {
      throw new CustomError("כתובת לא נמצאה", 404);
    }
    return address;
  } catch (err) {
    if (err instanceof CustomError) throw err;
    console.error("❌ error in getAddressById:", err);
    throw new CustomError("שגיאה בשליפת כתובת", 500);
  }
}

  async updateAddress(id, userId, data) {
  try {
    const update = {
      fullName: data.fullName,
      phone: data.phone,
      country: data.country,
      city: data.city,
      street: data.street,
      houseNumber: data.houseNumber,
      apartment: data.apartment,
      zip: data.zip,
      isDefault: data.isDefault,
      notes: data.notes,
    };

    const updated = await Address.findOneAndUpdate(
      { _id: id, userId },
      update,
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      throw new CustomError("כתובת לא נמצאה או אינה שייכת למשתמש", 404);
    }

    // אם עכשיו היא ברירת מחדל – לנקות שאר כתובות
    if (updated.isDefault) {
      await Address.updateMany(
        {
          userId,
          _id: { $ne: id },
        },
        { $set: { isDefault: false } }
      );
    }

    return updated;
  } catch (err) {
    if (err instanceof CustomError) throw err;
    console.error("❌ error in updateAddress:", err);
    throw new CustomError("שגיאה בעדכון כתובת", 500);
  }
}

  async deleteAddress(id, userId) {
  try {
    const deleted = await Address.findOneAndDelete({ _id: id, userId }).lean();
    if (!deleted) {
      throw new CustomError("כתובת לא נמצאה", 404);
    }
    return deleted;
  } catch (err) {
    if (err instanceof CustomError) throw err;
    console.error("❌ error in deleteAddress:", err);
    throw new CustomError("שגיאה במחיקת כתובת", 500);
  }
}

 
}
