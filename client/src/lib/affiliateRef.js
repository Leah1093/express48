// מפתח אחיד ב-localStorage
const AFFILIATE_KEY = "affiliate_ref";

// פונקציה שרצה בתחילת הטעינה של האתר
// ומחפשת ?ref= ב-URL ושומרת אותו
export function saveReferralFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref) {
    localStorage.setItem(AFFILIATE_KEY, ref);
  }
}

// פונקציה שנשתמש בה כשמוסיפים לסל
export function getSavedReferral() {
  return localStorage.getItem(AFFILIATE_KEY);
}
