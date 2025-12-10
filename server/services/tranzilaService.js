// server/services/tranzilaService.js
import axios from 'axios';
import { CustomError } from '../utils/CustomError.js';

const TIMEOUT_MS = 8000;
const toILS = (n) => Math.round(Number(n) * 100) / 100;

export class TranzilaService {
  // חישוב סכום לתשלום לפי המוצרים
  static calcTotal(itemsRaw) {
    const items = Array.isArray(itemsRaw) ? itemsRaw : [];
    if (!items.length) throw new CustomError('No items to pay', 400);

    return toILS(
      items.reduce((s, it) => {
        const qty = Number(it?.qty ?? it?.quantity ?? it?.quentity ?? 1);
        const price = Number(it?.priceAfterDiscount ?? it?.price ?? 0);
        return s + (isFinite(price) ? price : 0) * (isFinite(qty) ? qty : 1);
      }, 0)
    );
  }

  /**
   * בניית URL ל-iframenew.php של טרנזילה
   * משתמשים ב-supplier + myid כמו בדוגמה שקיבלת מהם
   */
  static buildIframeUrl({ orderId, items, terminal, customerInfo }) {
    if (!orderId) {
      throw new CustomError('Missing orderId', 400);
    }

    if (!terminal || /@/.test(terminal)) {
      throw new CustomError(
        'Invalid TRANZILA_TERMINAL (must be terminal name, not email)',
        500
      );
    }

    const total = this.calcTotal(items);
    if (total <= 0) {
      throw new CustomError('Total must be greater than zero', 400);
    }

    const safeOrderId = String(orderId)
      .replace(/[^A-Za-z0-9_-]/g, '')
      .slice(0, 64);

    const url = new URL(`https://direct.tranzila.com/${terminal}/iframenew.php`);

    url.searchParams.set('supplier', terminal);
    url.searchParams.set('sum', String(total));
    url.searchParams.set('currency', '1');
    url.searchParams.set('myid', safeOrderId);

    if (customerInfo?.name) {
      url.searchParams.set('contact', customerInfo.name);
    }
    if (customerInfo?.email) {
      url.searchParams.set('email', customerInfo.email);
    }
    if (customerInfo?.phone) {
      url.searchParams.set('phone', customerInfo.phone);
    }

    console.log('[TRZ] iframe url:', url.toString());

    return { iframeUrl: url.toString(), amount: total };
  }

  // אימות עסקה ל-webhook
  static async verifyTransaction({ transaction_index }) {
    const env = (process.env.TRZ_ENV || 'live').toLowerCase();

    if (env === 'mock') {
      console.log('[TRZ][VERIFY] mock mode → approve always');
      return { approved: true, source: 'mock' };
    }

    const terminal = process.env.TRANZILA_TERMINAL;
    const token =
      process.env.TRANZILA_PRIVATE_API || process.env.TRANZILA_ACCESS_TOKEN;

    if (!terminal || !token) {
      console.warn('[TRZ][VERIFY] missing credentials', {
        hasTerminal: !!terminal,
        hasToken: !!token,
      });
      return { approved: false, reason: 'missing_credentials' };
    }

    const client = axios.create({
      baseURL: 'https://api.tranzila.co.il/v1',
      timeout: TIMEOUT_MS,
      headers: {
        'access-token': token,
        'content-type': 'application/json',
      },
      validateStatus: () => true,
    });

    try {
      const resp = await client.post('/transaction', {
        terminal_name: terminal,
        transaction_index: Number(transaction_index),
      });

      const data = resp.data || {};
      const approved =
        data.approved === true ||
        data.status === 'approved' ||
        data.response === '000';

      return {
        approved,
        httpStatus: resp.status,
        status: data.status,
        response: data.response,
        raw: data,
      };
    } catch (e) {
      console.error('[TRZ][VERIFY][ERR]', e?.response?.data || e.message);
      return { approved: false, error: e.message };
    }
  }
}
