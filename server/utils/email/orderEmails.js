import { Order } from '../../models/order.js';
import { sendEmail } from './sendEmail.js';

export async function sendOrderCreatedEmails(orderId) {
  const order = await Order.findById(orderId).populate('userId').populate('addressId');
  if (!order) return;
  let toEmail = '';
  if (order.userId && order.userId.email) {
    toEmail = order.userId.email;
  } else if (order.guestAddress && order.guestAddress.email) {
    toEmail = order.guestAddress.email;
  }
  // שלח ללקוח
  if (toEmail) {
    await sendEmail({
      to: toEmail,
      subject: 'הזמנתך התקבלה',
      html: `<h2>הזמנה #${order._id}</h2><p>תודה על ההזמנה!</p>`
    });
  }
  // שלח לאדמין
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: 'התקבלה הזמנה חדשה',
    html: `<h2>הזמנה חדשה #${order._id}</h2><p>סכום: ${order.totalAmount}</p>`
  });
}
