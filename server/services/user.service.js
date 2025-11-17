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

   
}
