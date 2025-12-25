// import axios from 'axios';
// import { CustomError } from '../utils/CustomError.js';

// const TIMEOUT_MS = 8000;
// const toILS = (n) => Math.round(Number(n) * 100) / 100;

// export class TranzilaService {
//   // חישוב סכום לתשלום לפי המוצרים
//   static calcTotal(itemsRaw) {
//     const items = Array.isArray(itemsRaw) ? itemsRaw : [];
//     if (!items.length) throw new CustomError('No items to pay', 400);

//     return toILS(
//       items.reduce((s, it) => {
//         const qty = Number(it?.qty ?? it?.quantity ?? it?.quentity ?? 1);
//         const price = Number(it?.priceAfterDiscount ?? it?.price ?? 0);
//         return s + (isFinite(price) ? price : 0) * (isFinite(qty) ? qty : 1);
//       }, 0)
//     );
//   }

//   /**
//    * בניית URL ל-iframenew.php של טרנזילה
//    * משתמשים ב-supplier + myid כמו בדוגמה שקיבלת מהם
//    */
//   static buildIframeUrl({ orderId, items, terminal, customerInfo, baseUrl }) {
//     if (!orderId) {
//       throw new CustomError('Missing orderId', 400);
//     }

//     if (!terminal || /@/.test(terminal)) {
//       throw new CustomError(
//         'Invalid TRANZILA_TERMINAL (must be terminal name, not email)',
//         500
//       );
//     }
//     if (!baseUrl || !/^https?:\/\//i.test(baseUrl)) {
//       throw new CustomError('BASE_URL must be HTTP/HTTPS', 500);
//     }

//     const total = this.calcTotal(items);
//     if (total <= 0) {
//       throw new CustomError('Total must be greater than zero', 400);
//     }

//     // סניטיזציה של מזהה ההזמנה (WAF/URL-safe)
//     const safeOrderId = String(orderId)
//       .replace(/[^A-Za-z0-9_-]/g, '')
//       .slice(0, 64);

//     // נורמליזציה של baseUrl ובניית כתובת webhook
//     const safeBaseUrl = baseUrl.replace(/\/+$/, ''); // להוריד / בסוף אם יש
//     const postUrl = `${safeBaseUrl}/payments/tranzila/webhook`;

//     const url = new URL(`https://direct.tranzila.com/${terminal}/iframe.php`);

//     // סכום וחיוב
//     url.searchParams.set('sum', String(total));
//     url.searchParams.set('currency', '1');
//     url.searchParams.set('cred_type', '1');
//     url.searchParams.set('lang', 'il');

//     // ✅ להזדהות ההזמנה – כדי שה-webhook ידע למי לשייך את התשלום
//     url.searchParams.set('orderid', safeOrderId);

//     // ✅ כתובת webhook לשרת שלך בענן
//     url.searchParams.set('posturl', postUrl);

//     // מידע ללקוח (לא חובה אבל מומלץ)
//     if (customerInfo?.email) {
//       url.searchParams.set('email', customerInfo.email);
//     }
//     if (customerInfo?.phone) {
//       url.searchParams.set('phone', customerInfo.phone);
//     }
//     if (customerInfo?.name) {
//       url.searchParams.set('contact', customerInfo.name);
//     }

//     console.log('[TRZ] terminal=', terminal, 'sum=', total, 'url=', url.toString(), 'posturl=', postUrl);
//     return { iframeUrl: url.toString(), amount: total };
//   }

//   // אימות עסקה ל-webhook
//   static async verifyTransaction({ transaction_index }) {
//     const env = (process.env.TRZ_ENV || 'live').toLowerCase();

//     // מצב בדיקות (development) – מאשר תמיד
//     if (env === 'mock') {
//       console.log('[TRZ][VERIFY] mock mode → approve always');
//       return { approved: true, source: 'mock' };
//     }

//     const terminal = process.env.TRANZILA_TERMINAL;
//     const token =
//       process.env.TRANZILA_PRIVATE_API || process.env.TRANZILA_ACCESS_TOKEN;

//     if (!terminal || !token) {
//       console.warn('[TRZ][VERIFY] missing credentials', {
//         hasTerminal: !!terminal,
//         hasToken: !!token,
//       });
//       return { approved: false, reason: 'missing_credentials' };
//     }

//     const client = axios.create({
//       baseURL: 'https://api.tranzila.co.il/v1',
//       timeout: TIMEOUT_MS,
//       headers: {
//         'access-token': token,
//         'content-type': 'application/json',
//       },
//       validateStatus: () => true,
//     });

//     try {
//       const resp = await client.post('/transaction', {
//         terminal_name: terminal,
//         transaction_index: Number(transaction_index),
//       });

//       const data = resp.data || {};
//       const approved =
//         data.approved === true ||
//         data.status === 'approved' ||
//         data.response === '000';

//       return {
//         approved,
//         httpStatus: resp.status,
//         status: data.status,
//         response: data.response,
//         raw: data,
//       };
//     } catch (e) {
//       console.error('[TRZ][VERIFY][ERR]', e?.response?.data || e.message);
//       return { approved: false, error: e.message };
//     }
//   }
// }

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
        return s + (Number.isFinite(price) ? price : 0) * (Number.isFinite(qty) ? qty : 1);
      }, 0)
    );
  }

  /**
   * בניית URL ל-iframe.php של טרנזילה (הקיים אצלך)
   */
  static buildIframeUrl({ orderId, items, terminal, customerInfo, baseUrl }) {
    if (!orderId) {
      throw new CustomError('Missing orderId', 400);
    }

    if (!terminal || /@/.test(terminal)) {
      throw new CustomError(
        'Invalid TRANZILA_TERMINAL (must be terminal name, not email)',
        500
      );
    }
    if (!baseUrl || !/^https?:\/\//i.test(baseUrl)) {
      throw new CustomError('BASE_URL must be HTTP/HTTPS', 500);
    }

    const total = this.calcTotal(items);
    if (total <= 0) {
      throw new CustomError('Total must be greater than zero', 400);
    }

    const safeOrderId = String(orderId)
      .replace(/[^A-Za-z0-9_-]/g, '')
      .slice(0, 64);

    const safeBaseUrl = baseUrl.replace(/\/+$/, '');
    const postUrl = `${safeBaseUrl}/payments/tranzila/webhook`;

    const url = new URL(`https://direct.tranzila.com/${terminal}/iframe.php`);

    url.searchParams.set('sum', String(total));
    url.searchParams.set('currency', '1');
    url.searchParams.set('cred_type', '1');
    url.searchParams.set('lang', 'il');

    url.searchParams.set('orderid', safeOrderId);
    url.searchParams.set('posturl', postUrl);

    if (customerInfo?.email) url.searchParams.set('email', customerInfo.email);
    if (customerInfo?.phone) url.searchParams.set('phone', customerInfo.phone);
    if (customerInfo?.name) url.searchParams.set('contact', customerInfo.name);

    console.log('[TRZ] terminal=', terminal, 'sum=', total, 'url=', url.toString(), 'posturl=', postUrl);
    return { iframeUrl: url.toString(), amount: total };
  }

  /**
   * Hosted Fields - Handshake (מחזיר thtk)
   * לפי הדוק: https://api.tranzila.com/v1/handshake/create?supplier=...&sum=...&TranzilaPW=...
   */
  static async createHostedFieldsHandshake({ amount }) {
    const terminal = process.env.TRANZILA_TERMINAL;
    const terminalPassword = process.env.TRANZILA_TERMINAL_PASSWORD;

    if (!terminal || !terminalPassword) {
      throw new CustomError('Payment configuration missing', 500);
    }

    const sum = toILS(amount);
    if (!sum || sum <= 0) {
      throw new CustomError('Invalid amount', 400);
    }

    const resp = await axios.get('https://api.tranzila.com/v1/handshake/create', {
      timeout: TIMEOUT_MS,
      params: {
        supplier: terminal,
        sum: String(sum),
        TranzilaPW: terminalPassword,
      },
      validateStatus: () => true,
    });

    const data = resp.data;

    let thtk = '';
    if (data && typeof data === 'object') {
      thtk = String(data?.thtk ?? data?.THTK ?? data?.token ?? '');
    } else if (typeof data === 'string') {
      const m = data.match(/thtk\s*[:=]\s*"?([A-Za-z0-9._-]+)"?/i);
      if (m?.[1]) thtk = m[1];
      if (!thtk) {
        try {
          const parsed = JSON.parse(data);
          thtk = String(parsed?.thtk ?? parsed?.THTK ?? parsed?.token ?? '');
        } catch {}
      }
    }

    if (!thtk) {
      console.error('[TRZ][HF][HANDSHAKE] failed:', { status: resp.status, data });
      throw new CustomError('Handshake failed (no thtk)', 502);
    }

    return { thtk, terminalName: terminal, amount: sum };
  }

  // אימות עסקה ל-webhook (קיים אצלך)
  static async verifyTransaction({ transaction_index }) {
    const env = (process.env.TRZ_ENV || 'live').toLowerCase();

    if (env === 'mock') {
      console.log('[TRZ][VERIFY] mock mode -> approve always');
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
