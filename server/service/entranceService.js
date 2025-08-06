import { User } from '../models/user.js';
// import { UserPassword } from '../models/userPassword.js';
import { Password } from '../models/password.js';
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

        const passwordRecord = await Password.findOne({ userId: user._id });
        if (!passwordRecord) throw new Error('סיסמה לא קיימת');

        const isMatch = await bcrypt.compare(password, passwordRecord.password);
        if (!isMatch) throw new Error('סיסמה שגויה');

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        return {
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
            }
        };
    }

    async registerUser({ username, email, phone, password }) {
        console.log("EntranceService 📝 register");
        const existingUser = await User.findOne(userQueries.findByEmail(email));
        if (existingUser) {
            const error = new Error("המייל כבר קיים במערכת");
            error.statusCode = 409;
            throw error;
        }

        const user = await User.create({ username, email, phone });
        const hashedPassword = await bcrypt.hash(password, 10);

        await Password.create({ userId: user._id, password: hashedPassword });
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        return {
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
            }
        };
    }
    async getUserById(userId) {
        const user = await User.findById(userId).select("username email phone");
        return user;
    }
    async findOrCreateGoogleUser({ email, name }) {
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                username: name,
                email,
                // אפשר לשמור picture אם אתה רוצה
            });
        }

        return user;
    }

    generateToken(userId) {
        return jwt.sign({ userId }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
    }

}
