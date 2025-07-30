import { FaTelegramPlane, FaWhatsapp, FaEnvelope, FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { HiOutlineMail } from "react-icons/hi";

import { useNavigate } from "react-router-dom";


const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-100 text-gray-800 py-12 px-6 mt-20 border-t">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 text-sm rtl">

        {/* עלינו */}
        <div className="md:col-span-1">
          <h4 className="font-bold mb-4 text-right">עלינו</h4>
          <p className="text-sm text-right">
            אנחנו פועלים כדי להביא לכם את חוויית הקנייה הטובה ביותר אונליין, עם שירות אישי ואחריות מלאה לכל מוצר.
          </p>
        </div>

        {/* עקבו אחרינו */}
        <div className="md:col-span-1">
          <h4 className="font-bold mb-4 text-right">עקבו אחרינו</h4>
          <div className="flex gap-3 justify-end">
            <a href="#" className="text-white bg-[#29A9EA] p-2 rounded-full"><FaTelegramPlane /></a>
            <a href="#" className="text-white bg-[#25D366] p-2 rounded-full"><FaWhatsapp /></a>
            <a href="#" className="text-white bg-[#F4B400] p-2 rounded-full"><FaEnvelope /></a>
            <a href="#" className="text-white bg-black p-2 rounded-full"><FaXTwitter /></a>
            <a href="#" className="text-white bg-[#3b5998] p-2 rounded-full"><FaFacebookF /></a>
          </div>
        </div>

        {/* מידע */}
        <div className="md:col-span-1">
          <h4 className="font-bold mb-4 text-right">מידע</h4>
          <ul className="space-y-2 text-right">
            <li><button onClick={() => navigate('/terms')} className="hover:underline">תקנון האתר</button></li>
            <li><button onClick={() => navigate('/cancel')} className="hover:underline">ביטול עסקה</button></li>
            <li><button onClick={() => navigate('/privacy')} className="hover:underline">מדיניות פרטיות</button></li>
            <li><button onClick={() => navigate('/warranty')} className="hover:underline">מדיניות אחריות</button></li>
            <li><button onClick={() => navigate('/shipping')} className="hover:underline">מדיניות הובלה</button></li>
            <li><button onClick={() => navigate('/returns')} className="hover:underline">מדיניות החלפות וחזרות</button></li>
          </ul>
        </div>

        {/* שירות ותמיכה */}
        <div className="md:col-span-1">
          <h4 className="font-bold mb-4 text-right">שירות ותמיכה</h4>
          <ul className="space-y-2 text-right">
            <li><button onClick={() => navigate('/support')} className="hover:underline">שירות לקוחות</button></li>
            <li><button onClick={() => navigate('/marketplace')} className="hover:underline">מרקטפלייס</button></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

