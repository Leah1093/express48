// מדיניות אחריות
import React from 'react'

const WarrantyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-right rtl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">מדיניות אחריות</h1>

      <h2 className="text-xl font-semibold mb-2 text-gray-700">
        מדיניות אחריות – <span className="text-blue-600 font-bold">express48.co.il</span>
      </h2>
      <p className="mb-6 text-gray-500">עודכן לאחרונה: מאי 2025</p>

      <p className="mb-8 text-gray-600 leading-loose">
        ב־<strong>אקספרס 48</strong> (express48.co.il) אנו מחויבים למכירה של מוצרים מקוריים בלבד, באיכות גבוהה ובשירות אחריות הוגן ושקוף ללקוח.
      </p>

      <Section title="1. סוגי מוצרים והאחריות עליהם" items={[
        '1.1 כל המוצרים הנמכרים באתר הינם חדשים, באריזה מקורית, ומגיעים עם אחריות בהתאם ליצרן או ליבואן הרשמי.',
        '1.2 תקופת האחריות משתנה בהתאם למוצר, לקטגוריה ולתנאי הספק. מידע זה יוצג בדף המוצר.',
        '1.3 האחריות ניתנת ע"י היבואן או היצרן, ובמקרים מסוימים – ע"י מעבדות שירות חיצוניות מוסמכות.'
      ]} />

      <Section title="2. מה כוללת האחריות" items={[
        'תיקון תקלות הנובעות מבעיה טכנית או ייצור',
        'החלפת חלקים פגומים (בהתאם לתנאי הספק)',
        'במקרה הצורך – החלפה מלאה של המוצר או החזר כספי'
      ]} />

      <Section title="3. מה לא כלול באחריות" items={[
        'נזקים פיזיים שנגרמו משימוש לא סביר או חבלה חיצונית',
        'נזקי מים, חשמל או נפילות',
        'שימוש לא תקני בניגוד להוראות היצרן',
        'מוצרים שתוקנו או נפתחו במעבדה לא מורשית'
      ]} />

      <Section title="4. הפעלת האחריות" items={[
        'לפנות לשירות הלקוחות שלנו בדוא"ל: support@express48.co.il',
        'לצרף מספר הזמנה, תיאור התקלה ופרטי התקשרות',
        'להחזיר את המוצר לפי הנחיות השירות (במקרים מסוימים – ישירות למעבדת הספק)'
      ]} />

      <Section title="5. שירות לקוחות" items={[
        'שירות הלקוחות שלנו זמין לטיפול בכל מקרה של תקלה או שאלה הקשורה לאחריות.',
        'אנחנו מתחייבים ל:',
        'מענה ראשוני תוך 24 שעות (בימי עסקים)',
        'תיאום טיפול מהיר מול הספק או המעבדה'
      ]} />

      <Section title="6. אחריות משלימה מטעם express48" items={[
        'בנוסף לאחריות הספק, express48 מתחייבת לאפשר החזר כספי מלא או החלפה במקרה של תקלה מהותית במוצר שלא ניתן לתקן',
        'או אם השירות לא סופק לשביעות רצון הלקוח – וזאת עד 14 יום מרגע קבלת המוצר.'
      ]} />

      <h3 className="text-lg font-semibold mt-10 mb-2 text-gray-700">7. צור קשר</h3>
      <p className="text-gray-600 mb-1">
        <a href="mailto:support@express48.co.il" className="text-blue-600 underline">
          support@express48.co.il
        </a>
      </p>
      <p className="text-gray-600">
        טלפון: <span className="text-gray-800 font-semibold">03-XXXXXXX</span><br />
        שירות הלקוחות שלנו ישמח לעזור בכל בעיה, תקלה או שאלה.
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

export default WarrantyPolicy;
