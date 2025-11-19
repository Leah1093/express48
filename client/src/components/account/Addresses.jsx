import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetAddressesQuery,
  useDeleteAddressMutation,
  useUpdateAddressMutation,
} from "../../redux/services/addressApi";
import { useState } from "react";

// אייקון פח
function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M12.2833 7.49995L11.995 14.9999M8.005 14.9999L7.71667 7.49995M16.0233 4.82495C16.3083 4.86828 16.5917 4.91411 16.875 4.96328M16.0233 4.82495L15.1333 16.3941C15.097 16.8651 14.8842 17.3051 14.5375 17.626C14.1908 17.9469 13.7358 18.1251 13.2633 18.1249H6.73667C6.26425 18.1251 5.80919 17.9469 5.46248 17.626C5.11578 17.3051 4.90299 16.8651 4.86667 16.3941L3.97667 4.82495M16.0233 4.82495C15.0616 4.67954 14.0948 4.56919 13.125 4.49411M3.97667 4.82495C3.69167 4.86745 3.40833 4.91328 3.125 4.96245M3.97667 4.82495C4.93844 4.67955 5.9052 4.56919 6.875 4.49411M13.125 4.49411V3.73078C13.125 2.74745 12.3667 1.92745 11.3833 1.89661C10.4613 1.86714 9.53865 1.86714 8.61667 1.89661C7.63333 1.92745 6.875 2.74828 6.875 3.73078V4.49411M13.125 4.49411C11.0448 4.33334 8.95523 4.33334 6.875 4.49411"
        stroke="#141414"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.2833 7.49995L11.995 14.9999M8.005 14.9999L7.71667 7.49995M16.0233 4.82495C16.3083 4.86828 16.5917 4.91411 16.875 4.96328M16.0233 4.82495L15.1333 16.3941C15.097 16.8651 14.8842 17.3051 14.5375 17.626C14.1908 17.9469 13.7358 18.1251 13.2633 18.1249H6.73667C6.26425 18.1251 5.80919 17.9469 5.46248 17.626C5.11578 17.3051 4.90299 16.8651 4.86667 16.3941L3.97667 4.82495M16.0233 4.82495C15.0616 4.67954 14.0948 4.56919 13.125 4.49411M3.97667 4.82495C3.69167 4.86745 3.40833 4.91328 3.125 4.96245M3.97667 4.82495C4.93844 4.67955 5.9052 4.56919 6.875 4.49411M13.125 4.49411V3.73078C13.125 2.74745 12.3667 1.92745 11.3833 1.89661C10.4613 1.86714 9.53865 1.86714 8.61667 1.89661C7.63333 1.92745 6.875 2.74828 6.875 3.73078V4.49411M13.125 4.49411C11.0448 4.33334 8.95523 4.33334 6.875 4.49411"
        stroke="black"
        strokeOpacity="0.2"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// אייקון עריכה
function EditIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M14.0517 3.73937L15.4575 2.33271C15.7506 2.03964 16.148 1.875 16.5625 1.875C16.977 1.875 17.3744 2.03964 17.6675 2.33271C17.9606 2.62577 18.1252 3.02325 18.1252 3.43771C18.1252 3.85216 17.9606 4.24964 17.6675 4.54271L8.81833 13.3919C8.37777 13.8322 7.83447 14.1558 7.2375 14.3335L5 15.0002L5.66667 12.7627C5.8444 12.1657 6.16803 11.6224 6.60833 11.1819L14.0517 3.73937ZM14.0517 3.73937L16.25 5.93771M15 11.6669V15.6252C15 16.1225 14.8025 16.5994 14.4508 16.951C14.0992 17.3027 13.6223 17.5002 13.125 17.5002H4.375C3.87772 17.5002 3.40081 17.3027 3.04917 16.951C2.69754 16.5994 2.5 16.1225 2.5 15.6252V6.87521C2.5 6.37792 2.69754 5.90101 3.04917 5.54938C3.40081 5.19775 3.87772 5.00021 4.375 5.00021H8.33333"
        stroke="#141414"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.0517 3.73937L15.4575 2.33271C15.7506 2.03964 16.148 1.875 16.5625 1.875C16.977 1.875 17.3744 2.03964 17.6675 2.33271C17.9606 2.62577 18.1252 3.02325 18.1252 3.43771C18.1252 3.85216 17.9606 4.24964 17.6675 4.54271L8.81833 13.3919C8.37777 13.8322 7.83447 14.1558 7.2375 14.3335L5 15.0002L5.66667 12.7627C5.8444 12.1657 6.16803 11.6224 6.60833 11.1819L14.0517 3.73937ZM14.0517 3.73937L16.25 5.93771M15 11.6669V15.6252C15 16.1225 14.8025 16.5994 14.4508 16.951C14.0992 17.3027 13.6223 17.5002 13.125 17.5002H4.375C3.87772 17.5002 3.40081 17.3027 3.04917 16.951C2.69754 16.5994 2.5 16.1225 2.5 15.6252V6.87521C2.5 6.37792 2.69754 5.90101 3.04917 5.54938C3.40081 5.19775 3.87772 5.00021 4.375 5.00021H8.33333"
        stroke="black"
        strokeOpacity="0.2"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AddressBookPage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user?.user);

  const {
    data: addresses = [],
    isLoading,
    isError,
    refetch,
  } = useGetAddressesQuery();

  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();

  // מצב למודאלים
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    street: "",
    city: "",
    zip: "",
    notes: "",
  });

  const userName = user?.username || user?.name || user?.email || "משתמש";
  const userPhone = user?.phone;

  const handleAddNew = () => {
    navigate("/account/addresses/new");
  };

  // פתיחת מודאל עריכה
  const handleOpenEdit = (address) => {
    setAddressToEdit(address);
    setEditForm({
      street: address.street || "",
      city: address.city || "",
      zip: address.zip || "",
      notes: address.notes || "",
    });
  };

  const handleCloseEdit = () => {
    setAddressToEdit(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!addressToEdit) return;

    try {
      await updateAddress({
        id: addressToEdit._id,
        street: editForm.street,
        city: editForm.city,
        zip: editForm.zip,
        notes: editForm.notes,
      }).unwrap();
      setAddressToEdit(null);
    } catch (err) {
      console.error("שגיאה בעדכון כתובת", err);
      alert("אירעה שגיאה בעדכון הכתובת");
    }
  };

  // פתיחת מודאל מחיקה
  const handleOpenDelete = (address) => {
    setAddressToDelete(address);
  };

  const handleCloseDelete = () => {
    setAddressToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;
    try {
      await deleteAddress(addressToDelete._id).unwrap();
      setAddressToDelete(null);
    } catch (err) {
      console.error("שגיאה במחיקת כתובת", err);
      alert("אירעה שגיאה במחיקת הכתובת");
    }
  };

  return (
    
    <div dir="rtl" className="w-full px-4 py-8 md:px-8">
      {/* כותרת למעלה */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-right">הכתובות שלי </h1>

        <button
          type="button"
          className="text-xs text-[#FF6500] hover:underline"
        >
לכל הכתובות שלי        </button>
      </div>
      {/* מצבי טעינה / שגיאה / אין נתונים */}
      {isLoading && (
        <div className="rounded-2xl border border-[#F3EEEA] bg-white p-6 text-sm text-[#7A7474]">
          טוען את הכתובות שלך...
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          אירעה שגיאה בטעינת הכתובות. נסי שוב עוד רגע.
        </div>
      )}

      {!isLoading && !isError && addresses.length === 0 && (
        <div className="rounded-2xl border border-[#F3EEEA] bg-white p-8 text-center text-sm text-[#7A7474]">
          עדיין לא שמרת כתובות.
          <br />
          הוסיפי כתובת חדשה כדי לזרז את תהליך ההזמנה.
        </div>
      )}

      {/* כרטיסי כתובות */}
      {!isLoading && !isError && addresses.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {addresses.map((address) => {
            const { _id, city, street, zip, isDefault, notes } = address;

            return (
              <article
                key={_id}
                dir="rtl"
                className="
    flex flex-col items-end
    gap-2
    w-[367px]
    px-4 py-4
    rounded-[12px]
    border border-[#EDEDED]
    bg-[#FFF7F2]
    min-h-[190px]
  "
                style={{ boxSizing: "border-box" }}
              >
                {/* שורה 1: שם יוזר + טלפון */}
                <div className="w-full text-right text-[16px] leading-[150%] tracking-[-0.011em]">
                  <span className="font-normal text-[#141414]">{userName}</span>
                  {userPhone && (
                    <span className="font-normal text-[#7A7575]">
                      {" "}
                      {userPhone}
                    </span>
                  )}
                </div>

                {/* שורה 2: רחוב */}
                {street && (
                  <div className="w-full text-right text-sm text-[#141414]">
                    {street}
                  </div>
                )}

                {/* שורה 3: עיר, פסיק, מיקוד */}
                {(city || zip) && (
                  <div className="w-full text-right text-sm text-[#141414]">
                    {city}
                    {city && zip && ", "}
                    {zip}
                  </div>
                )}

                {/* הערות – אם יש */}
                {notes && notes.trim() !== "" && (
                  <div className="w-full text-right text-xs text-[#7A7475]">
                    {notes}
                  </div>
                )}

                {/* תיבת "כתובת ברירת מחדל" */}
                {isDefault && (
                  <div
                    className="
                      inline-flex items-center justify-center
                      rounded-[4px]
                      border border-[#48C711]
                      bg-[#EDFFEA]
                      px-3 py-1
                      ml-auto
                    "
                  >
                    <span className="text-xs font-medium text-[#2F8D11]">
                      כתובת ברירת מחדל
                    </span>
                  </div>
                )}

                {/* למטה בצד שמאל – שני האייקונים עם אפקט לחיצה */}
                <div className="w-full mt-auto flex justify-start" dir="ltr">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(address)}
                      className="
        w-8 h-8 flex items-center justify-center
        rounded-full
        transition
        hover:bg-[#F3EEEA]
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-[#FF6500]/40
      "
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDelete(address)}
                      disabled={isDeleting}
                      className="
        w-8 h-8 flex items-center justify-center
        rounded-full
        transition
        hover:bg-[#F3EEEA]
        active:scale-95
        disabled:opacity-50
        focus:outline-none focus:ring-2 focus:ring-red-300
      "
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* מודאל מחיקה */}
      {addressToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div
            dir="rtl"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="mb-2 text-base font-semibold text-[#141414]">
              למחוק את הכתובת?
            </h2>
            <p className="mb-4 text-sm text-[#7A7475]">
              פעולה זו תמחק את הכתובת מספר הכתובות השמורות שלך. ניתן תמיד להוסיף
              אותה מחדש.
            </p>
            <div className="mb-4 rounded-xl bg-[#FFF7F2] px-4 py-3 text-sm text-[#141414]">
              {addressToDelete.street && <div>{addressToDelete.street}</div>}
              {(addressToDelete.city || addressToDelete.zip) && (
                <div>
                  {addressToDelete.city}
                  {addressToDelete.city && addressToDelete.zip && ", "}
                  {addressToDelete.zip}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCloseDelete}
                className="
                  flex-1 rounded-full border border-[#E0E0E0]
                  px-4 py-2 text-sm
                  text-[#141414]
                  hover:bg-[#F7F7F7]
                  transition
                "
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="
                  flex-1 rounded-full
                  bg-red-500 px-4 py-2 text-sm font-medium text-white
                  hover:bg-red-600
                  disabled:opacity-60
                  transition
                "
              >
                מחיקה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* מודאל עריכה */}
      {addressToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div
            dir="rtl"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="mb-4 text-base font-semibold text-[#141414]">
              עריכת כתובת
            </h2>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-[#7A7475]">
                  רחוב
                </label>
                <input
                  type="text"
                  className="
                    w-full rounded-xl border border-[#E0E0E0] bg-white
                    px-3 py-2 text-sm text-[#141414]
                    focus:outline-none focus:ring-2 focus:ring-[#FF6500]/30
                  "
                  value={editForm.street}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, street: e.target.value }))
                  }
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-[#7A7475]">
                    עיר
                  </label>
                  <input
                    type="text"
                    className="
                      w-full rounded-xl border border-[#E0E0E0] bg-white
                      px-3 py-2 text-sm text-[#141414]
                      focus:outline-none focus:ring-2 focus:ring-[#FF6500]/30
                    "
                    value={editForm.city}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, city: e.target.value }))
                    }
                  />
                </div>
                <div className="w-32">
                  <label className="mb-1 block text-xs text-[#7A7475]">
                    מיקוד
                  </label>
                  <input
                    type="text"
                    className="
                      w-full rounded-xl border border-[#E0E0E0] bg-white
                      px-3 py-2 text-sm text-[#141414]
                      focus:outline-none focus:ring-2 focus:ring-[#FF6500]/30
                    "
                    value={editForm.zip}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, zip: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-[#7A7475]">
                  הערות (לא חובה)
                </label>
                <textarea
                  rows={3}
                  className="
                    w-full rounded-xl border border-[#E0E0E0] bg-white
                    px-3 py-2 text-sm text-[#141414]
                    focus:outline-none focus:ring-2 focus:ring-[#FF6500]/30
                    resize-none
                  "
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, notes: e.target.value }))
                  }
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="
                    flex-1 rounded-full border border-[#E0E0E0]
                    px-4 py-2 text-sm
                    text-[#141414]
                    hover:bg-[#F7F7F7]
                    transition
                  "
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="
                    flex-1 rounded-full
                    bg-[#FF6500] px-4 py-2 text-sm font-medium text-white
                    hover:bg-[#ff7f2a]
                    disabled:opacity-60
                    transition
                  "
                >
                  שמירת כתובת
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
