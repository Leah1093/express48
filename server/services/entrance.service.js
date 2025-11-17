// services/entrance.service.js
import { User } from '../models/user.js';
import { Password } from '../models/password.js';
import { userQueries } from '../mongoQueries/user.queries.js';
import { Store } from '../models/store.js';
import bcrypt from 'bcrypt';

export class EntranceService {
  async getSellerAndStore(userId) {
    const store = await Store.findOne({ userId }).select("_id sellerId");
    if (!store) { return { sellerId: null, storeId: null }; }

    return { sellerId: store.sellerId, storeId: store._id, };
  }
//לוגין
  async verifyCredentials(email, password) {
    const user = await User.findOne(userQueries.findByEmail(email));
    if (!user) throw new Error("INVALID_CREDENTIALS");

    const passwordRecord = await Password.findOne({ userId: user._id });
    if (!passwordRecord) throw new Error("INVALID_CREDENTIALS");

    const isMatch = await bcrypt.compare(password, passwordRecord.password);
    if (!isMatch) throw new Error("INVALID_CREDENTIALS");

    const { sellerId, storeId } = await this.getSellerAndStore(user._id);

    return { user, sellerId, storeId };
  }


  async registerUser({ username, email, phone, password }) {
    const existingUser = await User.findOne(userQueries.findByEmail(email));
    if (existingUser) {
      const error = new Error('המייל כבר קיים במערכת');
      error.statusCode = 409; throw error;
    }

    const user = await User.create({ username, email, phone });
    const hashedPassword = await bcrypt.hash(password, 10);
    await Password.create({ userId: user._id, password: hashedPassword });

    return { user };
  }

  //כניסה /הרשמה דרך גוגל 
  async findOrCreateGoogleUser({ email, name }) {
    let user = await User.findOne({ email });
    if (!user) user = await User.create({ username: name, email });
    const { sellerId, storeId } = await this.getSellerAndStore(user._id);
    return { user, sellerId, storeId };
  }
  async getUserById(userId) {
    const user = await User.findById(userId).select('username email phone role roles');
    return user;
  }

}
