import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  externalId: Number, // id מה-API
  title: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  rating: {
    rate: Number,
    count: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Product = mongoose.model('Product', productSchema);
