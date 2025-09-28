import Seller from '../models/seller.js';

export const isSellerMiddleware = async (req, res, next) => {
  try {
    const seller = await Seller.findOne({ userId: req.user.userId });

    if (!seller || seller.status !== 'approved' || !seller.panelAccess) {
      return res.status(403).json({ success: false, message: 'גישה למוכרים בלבד' });
    }

    req.seller = seller; // לשימוש בפונקציות
    next();
  } catch (err) {
    next(err);
  }
};
