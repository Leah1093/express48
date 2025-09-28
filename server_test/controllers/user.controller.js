import { UserService } from '../service/user.service.js';

export class UserController {
  async updateProfile(req, res, next) {
    console.log("UserController 📝 updateProfile");
    try {
      const userId = req.user.userId;
      const service = new UserService();
      const updatedUser = await service.updateProfile(userId, req.body);
      res.status(200).json({ success: true, updatedUser });
    } catch (err) {
      next(err);
    }
  }

  
}
