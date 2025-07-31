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
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async register(req, res, next) {
        console.log("EntranceController 📝 register");

        try {
            const entranceService = new EntranceService();
            const { name, email, phone, password } = req.body;
            if (!name || !email || !phone || !password) {
                const error = new Error("נא למלא את כל השדות");
                error.statusCode = 400;
                throw error;
            }
            const user = await entranceService.registerUser({ name, email, phone, password });
            res.status(201).json({
                message: "נרשמת בהצלחה",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                },
            });
        } catch (err) {
            next(err);
        }
    }
}
