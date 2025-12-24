# מדריך API ליצירת הזמנות - משתמש מחובר ואורח

## Endpoint
```
POST /orders
```

## Headers
- **משתמש מחובר**: `Authorization: Bearer <token>` (אופציונלי - אם יש טוקן, יזוהה כמשתמש מחובר)
- **אורח**: אין צורך ב-header (או בלי טוקן)

---

## 1. משתמש מחובר - עם addressId

### Request Body:
```json
{
  "addressId": "507f1f77bcf86cd799439011",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "quantity": 2,
      "price": 99.90,
      "priceAfterDiscount": 89.90,
      "variationId": "variation_123",
      "variationAttributes": {
        "צבע": "אדום",
        "גודל": "L"
      }
    }
  ],
  "notes": "אנא להתקשר לפני המשלוח",
  "couponCode": "SUMMER2024"
}
```

### דוגמה ב-JavaScript/Fetch:
```javascript
const createOrderAsUser = async (addressId, items, couponCode) => {
  const response = await fetch('https://your-api.com/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}` // טוקן של משתמש מחובר
    },
    body: JSON.stringify({
      addressId: addressId,
      items: items,
      notes: 'אנא להתקשר לפני המשלוח',
      couponCode: couponCode || undefined
    })
  });
  
  const order = await response.json();
  return order;
};
```

---

## 2. אורח - עם guestAddress

### Request Body:
```json
{
  "guestAddress": {
    "fullName": "יוסי כהן",
    "phone": "050-1234567",
    "email": "yossi@example.com",
    "country": "IL",
    "city": "תל אביב",
    "street": "רחוב דיזנגוף",
    "houseNumber": "100",
    "apartment": "5",
    "zip": "64332",
    "notes": "קומה 2"
  },
  "items": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "quantity": 1,
      "price": 149.90
    }
  ],
  "notes": "משלוח עד 14:00"
}
```

### דוגמה ב-JavaScript/Fetch:
```javascript
const createOrderAsGuest = async (guestAddress, items) => {
  const response = await fetch('https://your-api.com/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
      // אין Authorization header - אורח
    },
    body: JSON.stringify({
      guestAddress: {
        fullName: guestAddress.fullName,
        phone: guestAddress.phone,
        email: guestAddress.email, // אופציונלי אבל מומלץ למייל אישור
        country: guestAddress.country || 'IL',
        city: guestAddress.city,
        street: guestAddress.street,
        houseNumber: guestAddress.houseNumber,
        apartment: guestAddress.apartment,
        zip: guestAddress.zip,
        notes: guestAddress.notes
      },
      items: items,
      notes: 'משלוח עד 14:00'
    })
  });
  
  const order = await response.json();
  return order;
};
```

---

## 3. דוגמה מלאה - React Component

```javascript
import { useState } from 'react';

const CheckoutForm = ({ user, cartItems }) => {
  const [isGuest, setIsGuest] = useState(!user);
  const [addressId, setAddressId] = useState('');
  const [guestAddress, setGuestAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    street: '',
    houseNumber: '',
    apartment: '',
    zip: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // הכנת פריטים מהעגלה
    const items = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      priceAfterDiscount: item.priceAfterDiscount,
      variationId: item.variationId,
      variationAttributes: item.variationAttributes
    }));

    const orderData = {
      items: items,
      notes: ''
    };

    // אם משתמש מחובר - שולח addressId
    if (user && !isGuest) {
      orderData.addressId = addressId;
      orderData.couponCode = couponCode; // אם יש קופון
    } else {
      // אורח - שולח guestAddress
      orderData.guestAddress = guestAddress;
    }

    try {
      const response = await fetch('/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && !isGuest && { 'Authorization': `Bearer ${user.token}` })
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('שגיאה ביצירת ההזמנה');
      }

      const order = await response.json();
      console.log('הזמנה נוצרה:', order);
      
      // מעבר לדף תשלום
      // window.location.href = `/payment/${order.orderId}`;
    } catch (error) {
      console.error('שגיאה:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* כאן הטופס... */}
    </form>
  );
};
```

---

## 4. דוגמה ב-Axios

```javascript
import axios from 'axios';

// משתמש מחובר
const createOrderUser = async (addressId, items) => {
  try {
    const response = await axios.post('/orders', {
      addressId: addressId,
      items: items,
      couponCode: 'SUMMER2024'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('שגיאה:', error.response?.data);
    throw error;
  }
};

// אורח
const createOrderGuest = async (guestAddress, items) => {
  try {
    const response = await axios.post('/orders', {
      guestAddress: guestAddress,
      items: items
    });
    return response.data;
  } catch (error) {
    console.error('שגיאה:', error.response?.data);
    throw error;
  }
};
```

---

## Response Format

### Success (201 Created):
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "orderId": "ORD-1706781234567-532",
  "userId": "507f1f77bcf86cd799439014", // null לאורחים
  "addressId": "507f1f77bcf86cd799439015",
  "guestAddress": { // רק לאורחים
    "fullName": "יוסי כהן",
    "phone": "050-1234567",
    "email": "yossi@example.com",
    "city": "תל אביב",
    "street": "רחוב דיזנגוף",
    "houseNumber": "100"
  },
  "items": [...],
  "totalAmount": 199.80,
  "status": "pending",
  "payment": {
    "status": "pending",
    "gateway": "tranzila"
  },
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Error (400 Bad Request):
```json
{
  "error": "נדרש addressId או guestAddress"
}
```

---

## שדות חובה

### למשתמש מחובר:
- ✅ `addressId` (string)
- ✅ `items` (array עם לפחות פריט אחד)

### לאורח:
- ✅ `guestAddress.fullName` (string)
- ✅ `guestAddress.phone` (string)
- ✅ `guestAddress.city` (string)
- ✅ `guestAddress.street` (string)
- ✅ `items` (array עם לפחות פריט אחד)
- ⚠️ `guestAddress.email` (מומלץ מאוד - למייל אישור)

### שדות אופציונליים:
- `notes` (string)
- `couponCode` (string) - רק למשתמשים מחוברים
- `guestAddress.country` (default: "IL")
- `guestAddress.houseNumber` (string)
- `guestAddress.apartment` (string)
- `guestAddress.zip` (string)
- `guestAddress.notes` (string)
- `items[].priceAfterDiscount` (number)
- `items[].variationId` (string)
- `items[].variationAttributes` (object)

---

## הערות חשובות

1. **מייל לאורחים**: אם `guestAddress.email` לא מסופק, לא יישלח מייל אישור ללקוח (רק למנהל)

2. **קופונים**: קופונים עובדים רק למשתמשים מחוברים

3. **Validation**: המערכת בודקת שיש לפחות `addressId` או `guestAddress` - לא שניהם ולא אף אחד

4. **Items**: כל פריט חייב לכלול:
   - `productId` (string)
   - `quantity` (number, מינימום 1)
   - `price` (number, מינימום 0)


