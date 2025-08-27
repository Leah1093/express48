import SellerStatusBadge from "./SellerStatusBadge.jsx";
import SellerStatusForm from "./SellerStatusForm.jsx";

export default function AdminApplicationDetails({ open, onClose, seller, onUpdateStatus, updating }) {
  if (!open || !seller) return null;

  const Row = ({ label, children }) => (
    <div className="grid grid-cols-3 gap-2 py-1">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="col-span-2 text-sm">{children || "-"}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-start justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">פרטי בקשה</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">✕</button>
        </div>

        <div className="p-4 grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Row label="סטטוס"><SellerStatusBadge status={seller.status} /></Row>
            <Row label="חברה/חנות">{seller.companyName}</Row>
            <Row label="שם מלא">{seller.fullName}</Row>
            <Row label="אימייל">{seller.email}</Row>
            <Row label="טלפון">{seller.phone}</Row>
            <Row label="תפקיד">{seller.roleTitle}</Row>
            <Row label="קטגוריות">{(seller.categories || []).join(", ")}</Row>
            <Row label="פרטים נוספים">{seller.notes}</Row>
            <Row label="נוצר">{new Date(seller.createdAt).toLocaleString("he-IL")}</Row>
            <Row label="עודכן">{new Date(seller.updatedAt).toLocaleString("he-IL")}</Row>
          </div>

          <div className="border-t md:border-t-0 md:border-s p-0 md:ps-6">
            <SellerStatusForm
              initialStatus={seller.status}
              onSubmit={onUpdateStatus}
              submitting={updating}
            />
            {seller?.lastAction?.note && (
              <div className="mt-4 text-xs text-slate-500">
                <div className="font-medium">פעולה אחרונה:</div>
                <div>סטטוס: {seller.lastAction.status}</div>
                <div>תאריך: {new Date(seller.lastAction.at).toLocaleString("he-IL")}</div>
                <div>הערה: {seller.lastAction.note}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
