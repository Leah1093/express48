// עיגול סכומים לשתי ספרות אחרי הנקודה — להתאמה לפורמט הספק
export function toTwoDecimals(n) {
  return Number.parseFloat(Number(n).toFixed(2));
}
