import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export class EntranceService {
    async login(email, password) {
        const user = await User.findOne({ email });
        if (!user) throw new Error('משתמש לא נמצא');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('סיסמה שגויה');

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        return { token, email: user.email };
    }


}