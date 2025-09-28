import axios from 'axios';

export async function verifyRecaptchaV2(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
 console.log("👍",secret)
  const response = await axios.post(
    'https://www.google.com/recaptcha/api/siteverify',
    new URLSearchParams({
      secret,
      response: token,
    })
  );

  return response.data.success;
}
