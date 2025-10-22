import { CustomError } from '../../utils/CustomError.js';

const toILS = (n) => Math.round(Number(n) * 100) / 100;

export class TranzilaService {
  static calcTotal(itemsRaw) {
    const items = Array.isArray(itemsRaw) ? itemsRaw : [];
    console.log("✅✅✅✅✅✅✅✅✅✅✅", items);

    if (items.length === 0) throw new CustomError('No items to pay', 400);

    return toILS(items.reduce((s, it) => {
      const qty = Number(it?.qty ?? 1);
      const price = Number(it?.priceAfterDiscount ?? it?.price ?? 0);
      return s + (isFinite(price) ? price : 0) * (isFinite(qty) ? qty : 1);
    }, 0));
  }

  static buildIframeUrl({ orderId, items, baseUrl, terminal }) {
    if (!orderId) throw new CustomError('Missing orderId', 400);

    const total = this.calcTotal(items);
    if (!total || total <= 0) throw new CustomError('Total must be greater than zero', 400);

    const url = new URL(`https://direct.tranzila.com/${terminal}/iframe.php`);
    url.searchParams.set('lang', 'heb');
    url.searchParams.set('currency', '1');
    url.searchParams.set('sum', String(total));
    url.searchParams.set('orderid', String(orderId));
    url.searchParams.set('success_url', `${baseUrl}/checkout/success`);
    url.searchParams.set('error_url', `${baseUrl}/checkout/failed`);
    url.searchParams.set('notify_url', `${baseUrl}/api/payments/tranzila/webhook`);
    return { iframeUrl: url.toString(), amount: total };
  }

  // אופציונלי - אימות עסקה מול API של טרנזילה לפי transaction_index
  static async verifyTransaction({ transaction_index }) {
    // דוגמה בלבד - ממליץ לממש לפי המסמך שלך
    // const { data } = await axios.post('https://api.tranzila.com/v1/transaction',
    //   { terminal_name: process.env.TRANZILA_TERMINAL, transaction_index },
    //   { headers: { 'access-token': process.env.TRANZILA_ACCESS_TOKEN } }
    // );
    // return data;
    return { approved: true }; // placeholder
  }
}
