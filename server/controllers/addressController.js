// server/controllers/addressController.js
import { AddressService } from "../service/addressService.js";

export const service = new AddressService();

export class AddressController {
  async create(req, res, next) {
    try {
      const {
        fullName,
        phone,
        country,
        city,
        street,
        houseNumber,
        apartment,
        zip,
        zipCode,
        isDefault,
        notes,
      } = req.body || {};

      const address = await service.createAddress({
        userId: req.user.userId, // מגיע מה-middleware של auth
        fullName,
        phone,
        country,
        city,
        street,
        houseNumber,
        apartment,
        zip: zipCode ?? zip, // תמיכה בשני שמות
        isDefault,
        notes,
      });

      res.status(201).json(address);
    } catch (e) {
      next(e);
    }
  }

  async list(req, res, next) {
    try {
      const addresses = await service.getUserAddresses(req.user.userId);
      res.json(addresses);
    } catch (e) {
      next(e);
    }
  }

  async get(req, res, next) {
    try {
      const address = await service.getAddressById(
        req.params.id,
        req.user.userId
      );
      res.json(address);
    } catch (e) {
      next(e);
    }
  }

  async update(req, res, next) {
    try {
      const {
        fullName,
        phone,
        country,
        city,
        street,
        houseNumber,
        apartment,
        zip,
        zipCode,
        isDefault,
        notes,
      } = req.body || {};

      const updated = await service.updateAddress(
        req.params.id,
        req.user.userId,
        {
          fullName,
          phone,
          country,
          city,
          street,
          houseNumber,
          apartment,
          zip: zipCode ?? zip,
          isDefault,
          notes,
        }
      );

      res.json(updated);
    } catch (e) {
      next(e);
    }
  }

  async remove(req, res, next) {
    try {
      await service.deleteAddress(req.params.id, req.user.userId);
      res.json({ message: "Deleted successfully" });
    } catch (e) {
      next(e);
    }
  }

  async setDefault(req, res, next) {
    try {
      const updated = await service.setDefaultAddress(
        req.user.userId,
        req.params.id
      );
      res.json(updated);
    } catch (e) {
      next(e);
    }
  }
}