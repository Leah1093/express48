// services/entrance.service.js
import { User } from '../models/user.js';
import { Password } from '../models/password.js';
import { userQueries } from '../mongoQueries/user.queries.js';
import { Seller } from '../models/seller.js';              // ← חדש
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export class EntranceService {
  // עזר קטן להשגת sellerId לפי userId
  async _getSellerId(userId) {
    const s = await Seller.findOne({ userId }).select('_id');
    return s ? s._id : null;
  }

  _signToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  }

  async login(email, password) {
    const user = await User.findOne(userQueries.findByEmail(email));
    if (!user) throw new Error('משתמש לא נמצא');

    const passwordRecord = await Password.findOne({ userId: user._id });
    if (!passwordRecord) throw new Error('סיסמה לא קיימת');

    const isMatch = await bcrypt.compare(password, passwordRecord.password);
    if (!isMatch) throw new Error('סיסמה שגויה');

    const sellerId = await this._getSellerId(user._id);    // ← חדש
    const token = this._signToken({
      userId: user._id,
      role: user.role,
      roles: user.roles || [],
      sellerId,                                            // ← חדש
    });

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        roles: user.roles || [],
        sellerId,                                          // ← חדש
      },
    };
  }

  async registerUser({ username, email, phone, password }) {
    const existingUser = await User.findOne(userQueries.findByEmail(email));
    if (existingUser) {
      const error = new Error('המייל כבר קיים במערכת');
      error.statusCode = 409;
      throw error;
    }

    const user = await User.create({ username, email, phone });
    const hashedPassword = await bcrypt.hash(password, 10);
    await Password.create({ userId: user._id, password: hashedPassword });

    const sellerId = await this._getSellerId(user._id);    // לרוב null בשלב זה
    const token = this._signToken({
      userId: user._id,
      role: user.role,
      roles: user.roles || [],
      sellerId,                                            // ← חדש
    });

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        roles: user.roles || [],
        sellerId,                                          // ← חדש
      },
    };
  }

  async findOrCreateGoogleUser({ email, name, role = 'user', roles = [] }) {
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ username: name, email, role, roles });
    }

    const sellerId = await this._getSellerId(user._id);    // ← חדש
    const token = this._signToken({
      userId: user._id,
      role: user.role,
      roles: user.roles || [],
      sellerId,                                            // ← חדש
    });

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        roles: user.roles || [],
        sellerId,                                          // ← חדש
      },
    };
  }

  async getUserById(userId) {
    const user = await User.findById(userId).select('username email phone role roles');
    return user;
  }

  generateToken(userId) {
    return this._signToken({ userId });
  }
}
