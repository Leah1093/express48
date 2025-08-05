import { EntranceService } from '../service/entranceService.js';
import 'dotenv/config'

export default class EntranceController {

    async login(req, res, next) {
        console.log("EntranceController 💓");
        try {
            const entranceService = new EntranceService();
            const { email, password } = req.body;
            if (!email || !password) {
                const error = new Error('Email and password are required');
                error.statusCode = 400;
                throw error;
            }
            const result = await entranceService.login(email, password);

            res.cookie("token", result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // ב־https בלבד בפרודקשן
                sameSite: "Lax",
                maxAge: 1000 * 60 * 60, // שעה
            });

            // res.status(200).json({
            //     success: true,
            //     message: "התחברת בהצלחה",
            //     data: { email: result.email },
            // });
            res.status(200).json({
                success: true,
                message: "התחברת בהצלחה",
                data: result.user,
            });
        } catch (err) {
            next(err);
        }
    }

    async register(req, res, next) {
        console.log("EntranceController 📝 register");

        try {
            const entranceService = new EntranceService();
            const { username, email, phone, password } = req.body;
            if (!username || !email || !phone || !password) {
                const error = new Error("נא למלא את כל השדות");
                error.statusCode = 400;
                throw error;
            }
            const result = await entranceService.registerUser({ username, email, phone, password });
            res.cookie("token", result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
                maxAge: 1000 * 60 * 60 * 24,
            });
            res.status(201).json({
                success: true,
                message: "נרשמת בהצלחה",
                data: result.user,
            });
        } catch (err) {
            next(err);
        }
    }

    async getCurrentUser(req, res, next) {
        console.log("hi")
        try {
            const userId = req.user.userId;
            const entranceService = new EntranceService();
            const user = await entranceService.getUserById(userId);

            if (!user) {
                return res.status(404).json({ error: "משתמש לא נמצא" });
            }

            res.status(200).json({
                success: true,
                user,
            });
        } catch (err) {
            next(err);
        }
    }
}
