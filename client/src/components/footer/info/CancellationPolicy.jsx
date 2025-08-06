import React from 'react';

const CancellationPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-right rtl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">ביטול עסקה</h1>

      <h2 className="text-xl font-semibold mb-2 text-gray-700">
        מדיניות ביטול עסקה – <span className="text-blue-600 font-bold">express48.co.il</span>
      </h2>
      <p className="mb-6 text-gray-500">עודכן לאחרונה: מאי 2025</p>

      <p className="mb-8 text-gray-600 leading-loose">
        אנחנו ב־<strong>אקספרס 48</strong> (express48.co.il) מתחייבים לשירות שקוף, אמין ונגיש.
        להלן מדיניות ביטול העסקה והחזרות בהתאם לחוק:
      </p>

      <Section title="1. ביטול עסקה על ידי הלקוח" items={[
        'ניתן לבטל עסקה תוך 14 ימים ממועד קבלת המוצר בפועל.',
        'בקשת ביטול תיעשה בכתב בלבד – באמצעות טופס באתר או בדוא"ל: support@express48.co.il',
        'החזר כספי יבוצע תוך 7 ימי עסקים ממועד אישור הביטול.'
      ]} />

      <Section title="2. מקרים בהם יינתן החזר כספי מלא" items={[
        'המוצר התקבל פגום או שאינו תקין.',
        'המוצר שסופק שונה מהמפרט באתר.',
        'ההזמנה לא סופקה תוך 5 ימי עסקים (לא כולל שבתות וחגים).'
      ]} />

      <Section title="3. דמי ביטול" items={[
        'במקרה של ביטול שלא עקב פגם במוצר, ייגבו דמי ביטול של עד 5% או 100 ₪ – הנמוך מביניהם.',
        'במידה והמוצר כבר נשלח – עלות המשלוח לא תוחזר.'
      ]} />

      <Section title="4. תנאי החזרת המוצר" items={[
        'המוצר חייב להיות חדש, באריזתו המקורית וללא שימוש.',
        'יש לצרף את חשבונית הרכישה.',
        'החזרת המוצר תבוצע למחסן הלוגיסטי של החברה (כתובת תימסר לאחר פנייה לשירות הלקוחות).'
      ]} />

      <Section title="5. החזרים כספיים" items={[
        'ההחזר יתבצע לאותו אמצעי תשלום שבו בוצעה ההזמנה.',
        'ייתכן שההחזר יופיע בחשבון תוך 2–5 ימי עסקים מרגע הזיכוי.'
      ]} />

      <Section title="6. ביטול עסקה על ידי החברה" items={[
        'החברה שומרת לעצמה את הזכות לבטל הזמנה במקרים כגון:',
        'טעות במחיר או במלאי.',
        'בעיה באספקה מצד הספק.',
        'חשש להונאה או שימוש לרעה באתר.'
      ]} />

      <h3 className="text-lg font-semibold mt-10 mb-2 text-gray-700">7. צרו קשר</h3>
      <p className="text-gray-600 mb-1">
        בכל שאלה או בקשה ניתן לפנות אלינו בכתובת:{" "}
        <a href="mailto:support@express48.co.il" className="text-blue-600 underline">
          support@express48.co.il
        </a>
      </p>
      <p className="text-gray-600">
        או בטלפון: <span className="text-gray-800 font-semibold">[השלם כאן את המספר]</span>
      </p>
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

export default CancellationPolicy;
