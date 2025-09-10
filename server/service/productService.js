import { Product } from "../models/Product.js";

export class ProductService {
    getAllProductsService = async () => {
        try {
            const products = await Product.find({}).populate('storeId');
            return products;
        } catch (err) {
            throw new Error('Error fetching products');
        }
    }

    getProductBySlugService = async (slug) => {
        try {
            const product = await Product.findOne({ slug }).populate('storeId');
            return product;
        } catch (err) {
            throw new Error('Error fetching product by slug');
        }       
    }

};
