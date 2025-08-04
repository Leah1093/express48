// מדיניות החלפות וחזרות
import React from 'react';

const ReturnsPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-right rtl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">החלפות והחזרות</h1>

      <h2 className="text-xl font-semibold mb-2 text-gray-700">
        מדיניות החלפות והחזרות – <span className="text-blue-600 font-bold">express48.co.il</span>
      </h2>
      <p className="mb-6 text-gray-500">עודכן לאחרונה: מאי 2025</p>

      <p className="mb-8 text-gray-600 leading-loose">
        ב־<strong>אקספרס 48</strong> אנחנו עושים כל מאמץ כדי שתהיו מרוצים מהרכישה.
        עם זאת, אם ברצונכם להחזיר או להחליף מוצר – נשמח לטפל בכך בצורה פשוטה, ברורה והוגנת.
      </p>

      <Section title="1. תקופת החזרה" items={[
        'ניתן להחזיר או להחליף מוצר תוך 14 ימים מיום קבלתו.',
        'ההחזרה תתבצע בצירוף חשבונית או אישור הזמנה.'
      ]} />

      <Section title="2. תנאים להחזרה" items={[
        'המוצר יוחזר במצב חדש, ללא שימוש, ללא נזק, באריזתו המקורית.',
        'במוצרי אלקטרוניקה – אין להסיר מדבקות אחריות, הגנות מסך או איטומים.'
      ]} />

      <Section title="3. מקרים בהם ניתן החזר כספי מלא" items={[
        'המוצר שהתקבל שונה מהמוזמן בפועל.',
        'המוצר הגיע פגום או לא תקין.',
        'הלקוח לא קיבל את ההזמנה תוך 5 ימי עסקים (לא כולל שבתות וחגים).'
      ]} />

      <Section title="4. מקרים בהם תיתכן גביית דמי ביטול" items={[
        'אם הלקוח מבקש להחזיר מוצר שאינו פגום, עקב שינוי דעתו – ייגבו דמי ביטול בשיעור של עד 5% או 100 ₪, הנמוך מביניהם.',
        'עלות המשלוח לא תוחזר אם בוצעה בפועל.'
      ]} />

      <Section title="5. החלפת מוצרים" items={[
        'ניתן להחליף מוצר למוצר אחר בעל ערך זהה או שונה (בתוספת תשלום, אם נדרש).',
        'ההחלפה תתבצע רק לאחר קבלת המוצר המקורי במחסן הלוגיסטי ובדיקתו.'
      ]} />

      <Section title="6. דרך ביצוע ההחזרה" items={[
        'יש לפנות לשירות הלקוחות דרך האתר או בדוא"ל: support@express48.co.il',
        'לאחר קבלת הבקשה, נשלח הוראות להחזרת המוצר וכתובת יעד.',
        'לאחר קליטת המוצר והשלמת הבדיקה – יתבצע החזר כספי או שליחה חוזרת של מוצר חלופי.'
      ]} />

      <Section title="7. החזרים כספיים" items={[
        'יתבצעו לאותו אמצעי תשלום שבו בוצעה הרכישה.',
        'זמן טיפול: עד 7 ימי עסקים ממועד אישור הבקשה.',
        'ההחזר עשוי להופיע בכרטיס האשראי תוך 2–5 ימי עסקים נוספים, בהתאם לבנק.'
      ]} />

      <Section title="8. שאלות ותמיכה" items={[
        'שירות הלקוחות שלנו זמין לכל בקשה:',
        <a href="mailto:support@express48.co.il" className="text-blue-600 underline">support@express48.co.il</a>
      ]} />
    </div>
  );
};

const Section = ({ title, items }) => (
  <div className="mb-10">
    <h3 className="text-lg font-semibold mb-3 text-gray-700">{title}</h3>
    <ul className="space-y-2 text-gray-600 leading-loose list-none">
      {items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  </div>
);

export default ReturnsPolicy;
