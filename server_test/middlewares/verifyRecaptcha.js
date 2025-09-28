import axios from "axios";

export const verifyRecaptcha = async (req, res, next) => {
  const token = req.body.recaptchaToken;
  if (!token) {
    return res.status(400).json({ error: "Missing reCAPTCHA token" });
  }

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET,
          response: token,
        },
      }
    );

    const data = response.data;

    if (!data.success || data.score < 0.5) {
      return res.status(403).json({ error: "reCAPTCHA failed. Suspicious activity detected." });
    }

    next(); // עובר ל-controller
  } catch (error) {
    console.error("reCAPTCHA error:", error);
    return res.status(500).json({ error: "reCAPTCHA verification failed" });
  }
};
