import { Order } from "../models/order.js";

export class OrderService {
    async createOrder(userId, data) {
        const { addressId, notes, items } = data;

        const totalAmount = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

        const order = new Order({
            userId: userId,
            addressId,
            items,
            notes: notes || "",
            totalAmount,
        });

        return await order.save();
    }

    async getUserOrders(userId) {
        return await Order.find({ user: userId })
            .populate("items.productId", "title price")
            .populate("addressId");
    }

    async getOrderById(orderId, userId) {
        return await Order.findOne({ _id: orderId, userId: userId })
            .populate("items.productId", "title price")
            .populate("addressId")
            .populate("userId", "username email"); // ← יביא שם ואימייל

    }

    async updateOrderStatus(orderId, status) {
        return await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );
    }

    async deleteOrder(orderId, userId) {
        return await Order.findOneAndDelete({ _id: orderId, user: userId });
    }
}
