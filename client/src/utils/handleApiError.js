import toast from "react-hot-toast";

/**
 * טיפול אחיד בשגיאות API
 * @param {object} error - אובייקט השגיאה מ־axios
 * @param {string} [defaultMessage] - הודעה ברירת מחדל אם אין תגובה מהשרת
 */
export function handleApiError(error, defaultMessage = "אירעה שגיאה. נסה שוב מאוחר יותר.") {
  if (error?.response) {
    const status = error.response.status;
    const message = error.response.data?.message;

    switch (status) {
      case 400:
        toast.error(message || "בקשה לא תקינה");
        break;
      case 401:
        toast.error(message || "אין הרשאה לביצוע הפעולה");
        break;
      case 403:
        toast.error(message || "הגישה נדחתה");
        break;
      case 404:
        toast.error(message || "לא נמצא");
        break;
      case 409:
        toast.error(message || "התנגשות בנתונים");
        break;
      case 429:
        toast.error(message || "בוצעו יותר מדי ניסיונות. נסה שוב מאוחר יותר.");
        break;
      case 500:
        toast.error("שגיאה בשרת. נסה שוב מאוחר יותר.");
        break;
      default:
        toast.error(message || defaultMessage);
        break;
    }
  } else {
    toast.error("שגיאת רשת – ודא חיבור לאינטרנט");
  }
}
