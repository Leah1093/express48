import React from 'react';

const About = () => {
  return (
    <div dir="rtl" className="bg-gray-50 py-12 px-6 md:px-10 text-right">
      <div className="max-w-4xl mx-auto text-gray-700 pe-6 md:pe-20">
        <h1 className="text-3xl font-bold text-black mb-6">אודות</h1>

        <p className="text-lg mb-4">
          <strong className="font-semibold">ברוכים הבאים לאקספרס 48</strong> – המרקט פלייס המוביל בישראל.
        </p>

        <p className="mb-6">
          אנחנו מאמינים ב<span className="text-black font-semibold"> מהירות, שירות ומקצועיות</span>.<br />
          המטרה שלנו היא לחבר בין לקוחות לספקים הטובים ביותר בארץ – עם מחירים משתלמים במיוחד
          ומשלוח מהיר עד הבית תוך <span className="text-black font-semibold">48 שעות בלבד</span>.
        </p>

        <h2 className="text-xl font-bold text-black mb-4">למה לבחור בנו?</h2>
        <ul className="list-disc pl-6 mb-8 space-y-2">
          <li><span className="text-black font-semibold">מבחר ענק:</span> אלקטרוניקה, לבית, למשרד ועוד – הכול במקום אחד.</li>
          <li><span className="text-black font-semibold">ספקים נבחרים:</span> כל הספקים בפלטפורמה מאושרים ונבדקים בקפידה.</li>
          <li><span className="text-black font-semibold">משלוחים מהירים:</span> שליח עד הבית תוך 48 שעות – בפריסה ארצית.</li>
          <li><span className="text-black font-semibold">שירות לקוחות אישי:</span> אנחנו כאן בשבילך – בכל שאלה ובכל זמן.</li>
        </ul>

        <h2 className="text-xl font-bold text-black mb-4">החזון שלנו</h2>
        <p>
          לשנות את חוויית הקנייה אונליין בישראל – להפוך אותה
          <span className="text-black font-semibold"> מהירה</span>,
          <span className="text-black font-semibold"> פשוטה</span>,
          <span className="text-black font-semibold"> משתלמת</span> ו
          <span className="text-black font-semibold">אמינה</span>,
          תוך תמיכה בעסקים מקומיים ושירות לקוחות ברמה הגבוהה ביותר.
        </p>
      </div>
    </div>
  );
};

export default About;
