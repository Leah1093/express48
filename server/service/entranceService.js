import { User } from '../models/user.js';
import { userQueries } from '../mongoQueries/userQueries.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export class EntranceService {
    async login(email, password) {
console.log("EntranceService 😄");

        const user = await User.findOne(userQueries.findByEmail(email));
        if (!user) throw new Error('משתמש לא נמצא');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('סיסמה שגויה');

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        return { token, email: user.email };


    }


}
