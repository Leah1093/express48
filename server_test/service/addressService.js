// services/addressService.js
import { Address } from "../models/address.js";

export class AddressService {
  async createAddress(data) {
    return Address.create(data);
  }

  async getUserAddresses(userId) {
    return Address.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async getAddressById(id) {
    return Address.findById(id);
  }

//   async updateAddress(id, data) {
//     return Address.findByIdAndUpdate(id, data, { new: true,runValidators: true,});}
async updateAddress(id, userId, data) {
  return Address.findOneAndUpdate(
    { _id: id, userId },   // לוודא שהכתובת שייכת למשתמש
    data,
    { new: true, runValidators: true }
  );
}


  async deleteAddress(id) {
    return Address.findByIdAndDelete(id);
  }

  async setDefaultAddress(userId, addressId) {
    // מסיר isDefault משאר הכתובות של המשתמש
    await Address.updateMany({ userId }, { $set: { isDefault: false } });
    return Address.findByIdAndUpdate(addressId, { isDefault: true }, { new: true });
  }
}
