import axios from 'axios';
import { env } from '../config/env.js';
import { toTwoDecimals } from '../utils/amount.js';

export async function createPaymentRequest({ amount, orderId, customer }) {
  const payload = {
    amount: toTwoDecimals(amount),
    currency: 'ILS',
    description: `Order #${orderId}`,
    success_url: `${env.PUBLIC_APP_URL}/pay/success?orderId=${encodeURIComponent(orderId)}`,
    failure_url: `${env.PUBLIC_APP_URL}/pay/fail?orderId=${encodeURIComponent(orderId)}`,
    notify_url:  `${env.API_BASE_URL}/payments/tranzila/notify`,
    metadata: { orderId, email: customer?.email ?? '' },
  };

  const url = `${env.TRANZILA_API_BASE}/v1/pr/create`;

  const r = await axios.post(url, payload, {
    headers: {
      'X-tranzila-api-app-key': env.TRANZILA_APP_KEY,
      'X-tranzila-api-request-key': env.TRANZILA_REQUEST_KEY,
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });

  return r.data; // מצופה לכלול url/payment_url, transaction_id וכו'
}
