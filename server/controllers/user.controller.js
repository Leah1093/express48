import { UserService } from '../services/user.service.js';

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
   async listCustomers(req, res, next) {
        try {
                const service = new UserService();
            // אם תרצי, אפשר לבדוק כאן שהמשתמש הוא admin / seller
            const users = await service.listCustomers();
            res.json({ items: users });
        } catch (err) {
            next(err);
        }
    }

  
}
