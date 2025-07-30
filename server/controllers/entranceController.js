import { EntranceService } from '../service/entranceService.js';
import 'dotenv/config'




export default class EntranceController {

    async login(req, res, next) {
        try {
            const entranceService= new EntranceService();
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
}
