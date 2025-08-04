// מדיניות פרטיותר
import React from 'react'

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-right rtl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">מדיניות פרטיות</h1>

      <h2 className="text-xl font-semibold mb-2 text-gray-700">
        מדיניות פרטיות – <span className="text-blue-600 font-bold">express48.co.il</span>
      </h2>
      <p className="mb-6 text-gray-500">עודכן לאחרונה: מאי 2025</p>

      <p className="mb-8 text-gray-600 leading-loose">
        הפרטיות שלך חשובה לנו. מסמך זה מסביר כיצד אנו ב־<strong>אקספרס 48</strong> (להלן: "החברה", "האתר", "express48.co.il")
        אוספים, שומרים, משתמשים ומשתפים מידע שמתקבל מהמשתמשים באתר.
      </p>

      <Section title="1. סוגי המידע שנאספים" items={[
        <><strong>מידע אישי:</strong> שם מלא, כתובת דוא"ל, כתובת מגורים למשלוח, מספר טלפון, פרטי תשלום (מעובדים דרך מערכת סליקה מאובטחת – לא נשמרים אצלנו)</>,
        <><strong>מידע טכני:</strong> כתובת IP, סוג הדפדפן והמכשיר, זמן ביקור ודפים שנצפו באתר</>
      ]} />

      <Section title="2. מטרות השימוש במידע" items={[
        'לצורך עיבוד והשלמת הזמנות',
        'מתן שירות לקוחות ותמיכה',
        'שליחת עדכונים והודעות בנוגע להזמנה',
        'ניתוח נתוני גלישה לצורך שיפור חוויית המשתמש',
        'שמירה על אבטחת האתר ומניעת הונאות'
      ]} />

      <Section title="3. אבטחת מידע" items={[
        'האתר פועל תחת פרוטוקול אבטחה SSL מוצפן.',
        'המידע שלך מוגן באמצעים פיזיים, אלקטרוניים וניהוליים ברמה גבוהה.'
      ]} />

      <Section title="4. שיתוף מידע עם צדדים שלישיים" items={[
        'המידע שלך לא יימסר לצדדים שלישיים, למעט במקרים הבאים:',
        'ספקי שירות חיוניים (כגון חברת משלוחים, שירותי סליקה)',
        'דרישת חוק מגורמי אכיפה',
        'מניעת הונאות ונזק לחברה'
      ]} />

      <Section title="5. שימוש בעוגיות (Cookies)" items={[
        'האתר עושה שימוש בעוגיות לצורך:',
        'שמירת העדפות משתמש',
        'ניתוח התנהגות גלישה (למשל Google Analytics)',
        'שיפור חוויית השימוש והתאמת תוכן אישי',
        'ניתן לשנות או לחסום עוגיות דרך הגדרות הדפדפן.'
      ]} />

      <Section title="6. קישורים לאתרים חיצוניים" items={[
        'האתר עשוי להכיל קישורים לאתרים חיצוניים.',
        'החברה לא אחראית לתוכן או למדיניות הפרטיות של אתרים אלו.'
      ]} />

      <Section title="7. זכות לעיין, לתקן ולבקש מחיקה" items={[
        'בהתאם לחוק הגנת הפרטיות, כל משתמש רשאי:',
        'לקבל מידע על הנתונים שנשמרים עליו',
        'לבקש לתקן, לעדכן או למחוק את המידע האישי',
        'פניות בנושא יש לשלוח לכתובת: support@express48.co.il'
      ]} />

      <Section title="8. שינויים במדיניות הפרטיות" items={[
        'החברה רשאית לעדכן את מדיניות הפרטיות מעת לעת.',
        'תאריך העדכון האחרון יוצג בראש עמוד זה.'
      ]} />

      <h3 className="text-lg font-semibold mt-10 mb-2 text-gray-700">9. יצירת קשר</h3>
      <p className="text-gray-600 mb-1">
        בכל שאלה ניתן לפנות אלינו בכתובת:{" "}
        <a href="mailto:support@express48.co.il" className="text-blue-600 underline">
          support@express48.co.il
        </a>
      </p>
      <p className="text-gray-600">
        טלפון: <span className="text-gray-800 font-semibold">[השלם כאן את המספר]</span>
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

export default PrivacyPolicy;
