import { User } from '../models/user.js';

export class UserService {
    async updateProfile(userId, { username, phone }) {
        const user = await User.findById(userId);
        console.log("הקידב",userId);
        if (!user) throw new Error("User not found");
        user.username = username;
        user.phone = phone;
        await user.save();
        return user;
    }

     // 🔹 לקוחות רגילים (role: "user")
    async listCustomers() {
        const users = await User.find({ role: 'user' })
            .select('_id email username phone role'); // רק השדות שצריך לפרונט
        return users;
    }

   
}
