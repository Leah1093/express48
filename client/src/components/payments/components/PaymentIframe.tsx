type Props = { src: string };                         // טיפוס לפרופס: כתובת הטעינה

export default function PaymentIframe({ src }: Props) { // קומפוננטה שמציגה IFRAME
  return (                                             // JSX
    <iframe
      title="Payment"                                  // טייטל לגישה
      src={src}                                        // הכתובת של עמוד התשלום
      style={{ width: "100%", height: 600, border: 0, display: "block" }} // סגנון בסיסי
      allow="payment"                                  // רמז לדפדפן שזה לתשלום
    />
  );
}
