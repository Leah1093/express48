import { verifyRecaptchaV2 } from '../utils/verifyRecaptchaV2.js';
export const recaptchaV2Middleware = async (req, res, next) => {
  try {
    const token = req.body.recaptchaToken;

    if (!token) {
      return res.status(400).json({ message: 'חסר טוקן אימות reCAPTCHA' });
    }

    const isHuman = await verifyRecaptchaV2(token);

    if (!isHuman) {
      return res.status(400).json({ message: 'אימות reCAPTCHA נכשל – נא לנסות שוב' });
    }

    next(); // הכל תקין – ממשיכים לקונטרולר

  } catch (err) {
    console.error("שגיאה באימות reCAPTCHA:", err.message);
    return res.status(500).json({ message: 'שגיאה באימות reCAPTCHA' });
  }
};
