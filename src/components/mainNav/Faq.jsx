import { useState } from "react";

const faqData = [
    {
        category: "הזמנות ורכישות",
        items: [
            { question: "איך מבצעים הזמנה באתר?", answer: "נכנסים למוצר הרצוי, מוסיפים אותו לסל הקניות, ולוחצים על 'לתשלום'. שם תוכל לבחור שיטת תשלום ולהזין פרטים." },
            { question: "האם צריך להירשם כדי לבצע רכישה?", answer: "כן, לצורך ביצוע הזמנה יש להירשם תחילה לאתר, הרשמה תאפשר לעקוב אחרי הזמנות ולשמור פרטים לפעמים הבאות." },
        ],
    },
    {
        category: "משלוחים",
        items: [
            { question: "תוך כמה זמן מגיע המשלוח?", answer: "רוב המוצרים נשלחים תוך 48 שעות. זמן הגעת המשלוח משתנה לפי הכתובת וסוג השירות שבחרת." },
            { question: "איך אוכל לעקוב אחרי ההזמנה שלי?", answer: "מיד לאחר שליחת ההזמנה תקבל מייל עם קישור למעקב. ניתן גם לבדוק באזור האישי באתר." },
        ],
    },
    {
        category: "תשלומים",
        items: [
            { question: "אילו אמצעי תשלום זמינים באתר?", answer: "ניתן לשלם באמצעות כרטיסי אשראי, PayPal " },
            { question: "האם התשלום מאובטח?", answer: "כן. האתר מאובטח בפרוטוקול SSL, וכל פרטי התשלום מוצפנים ומוגנים." },
        ],
    },
    {
        category: "ביטולים והחזרות",
        items: [
            { question: "איך מבטלים הזמנה?", answer: "כן, ניתן לבטל הזמנה כל עוד היא לא נשלחה. לאחר מכן יש לבצע תהליך החזרה." },
            { question: "מהי מדיניות ההחזרות?", answer: "פונים לשירות הלקוחות בטופס יצירת קשר או בוואטסאפ, ואנו נספק הוראות החזרה." },
        ],
    },
    {
        category: "מסמכים",
        items: [
            { question: "מתי מקבלים קבלה או חשבונית?", answer: "מיד לאחר ביצוע ההזמנה תישלח קבלה למייל. לקוחות עסקיים יכולים לבקש חשבונית מס." },
        ],
    }, {
        category: "שירות לקוחות",
        items: [
            { question: "איך אפשר ליצור איתכם קשר?", answer: "ניתן לפנות אלינו בטופס יצירת קשר באתר, בצ'אט, או ישירות לוואטסאפ שלנו." },
        ],
    },
];

const Faq = () => {
    const [openItems, setOpenItems] = useState({});

    const toggleItem = (categoryIndex, itemIndex) => {
        const key = `${categoryIndex}-${itemIndex}`;
        setOpenItems((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <div  className="bg-gray-50 py-12 px-4 md:px-10 max-w-5xl mx-auto">
            {/* כותרת ממורכזת */}
            <h2 className="text-3xl font-bold text-center text-primary-900 mb-10">
                שאלות ותשובות
            </h2>
            {/* תוכן מיושר לימין */}
            <div className="text-right space-y-10">
                {faqData.map((section, catIdx) => (
                    <div key={catIdx}>
                        <h3 className="text-xl font-bold text-primary-900 mb-3">{section.category}</h3>
                        <div className="space-y-2">
                            {section.items.map((item, idx) => {
                                const key = `${catIdx}-${idx}`;
                                const isOpen = openItems[key];

                                return (
                                    <div key={key} className="border border-gray-200 rounded bg-white shadow-sm overflow-hidden">
                                        <button
                                            onClick={() => toggleItem(catIdx, idx)}
                                            className="w-full flex flex-row-reverse justify-between items-center px-4 py-3 font-medium text-gray-800 hover:bg-gray-100 text-right"
                                        >
                                            <span>{item.question}</span>
                                            <span className="text-xl">{isOpen ? "−" : "+"}</span>
                                        </button>
                                        {isOpen && (
                                            <div className="px-4 pb-4 text-sm text-gray-700 border-t border-gray-200">
                                                {item.answer}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Faq;
