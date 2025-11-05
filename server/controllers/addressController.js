import { AddressService } from "../service/addressService.js";

export const service = new AddressService();

export class AddressController {
  async create(req, res, next) {
    try {
      const address = await service.createAddress({
        ...req.body,
        userId: req.user.userId,
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
      const address = await service.getAddressById(req.params.id);
      res.json(address);
    } catch (e) {
      next(e);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await service.updateAddress(
        req.params.id,
        req.user.userId,
        req.body
      );
      res.json(updated);
    } catch (e) {
      next(e);
    }
  }

  async remove(req, res, next) {
    try {
      await service.deleteAddress(req.params.id);
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
