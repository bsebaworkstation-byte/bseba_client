// import React, { useEffect } from "react";
// import { createPortal } from "react-dom";
// import openCloseStore from "../../Zustand/OpenCloseStore";

// const EditTransactionModal = () => {
//   const { editTransactionModal, setEditTransactionModal } = openCloseStore();

//   // ✅ Prevent background scroll when modal is open
//   useEffect(() => {
//     if (editTransactionModal) {
//       document.body.style.overflow = "hidden"; // Disable scrolling
//     } else {
//       document.body.style.overflow = "auto"; // Enable scrolling
//     }

//     // Cleanup when component unmounts or modal closes
//     return () => {
//       document.body.style.overflow = "auto";
//     };
//   }, [editTransactionModal]);

//   if (!editTransactionModal) return null;

//   // ✅ Use createPortal for rendering above all other UI layers
//   return createPortal(
//     <div
//       onClick={() => setEditTransactionModal(false)}
//       className="fixed inset-0 z-50 bg-[#0000006c] flex items-center justify-center"
//     >
//       <div
//         onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
//         className="relative text-black dark:text-white bg-white dark:bg-[#1E2939] rounded-lg p-6 max-w-lg w-full mx-4 shadow-lg"
//       >
//         {/* Header */}
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-bold">Edit Transaction</h2>
//           <button
//             onClick={() => setEditTransactionModal(false)}
//             className="global_button_red"
//           >
//             Close
//           </button>
//         </div>

//         {/* Form placeholder (functionality will be added later) */}
//         <div className="space-y-4">
//           <input
//             type="text"
//             placeholder="Amount"
//             className="global_input w-full"
//           />
//           <textarea
//             placeholder="Note"
//             className="global_input w-full h-24"
//           ></textarea>

//           <button className="global_button w-full">Update Transaction</button>
//         </div>
//       </div>
//     </div>,
//     document.body
//   );
// };

// export default EditTransactionModal;

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import openCloseStore from "../../Zustand/OpenCloseStore";
import { SuccessToast, ErrorToast } from "../../Helper/FormHelper";
import api from "../../Helper/axios_resonse_interceptor";

const EditTransactionModal = ({ transactionData, refreshParent }) => {
  const { editTransactionModal, setEditTransactionModal } = openCloseStore();
  const [form, setForm] = useState({
    contactsID: "",
    Credit: "",
    Debit: "",
    note: "",
    CreatedDate: "",
  });
  const [loading, setLoading] = useState(false);

  // Pre-fill form when modal opens
  useEffect(() => {
    if (transactionData) {
      setForm({
        contactsID: transactionData.contactsID || "",
        Credit: transactionData.Credit || "",
        Debit: transactionData.Debit || "",
        note: transactionData.note || "",
        CreatedDate: transactionData.CreatedDate || "",
      });
    }
  }, [transactionData]);

  // Prevent background scroll
  useEffect(() => {
    if (editTransactionModal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => (document.body.style.overflow = "auto");
  }, [editTransactionModal]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transactionData) return;

    try {
      setLoading(true);

      // Send full payload including contactsID & CreatedDate
      const payload = { ...form };

      const res = await api.post(
        `/EditTransactionById/${transactionData._id}`,
        payload,
      );

      if (res.data.status === "Success") {
        SuccessToast("Transaction updated successfully");
        setEditTransactionModal(false);
        if (refreshParent) refreshParent();
      } else {
        ErrorToast(res.data.message || "Update failed");
      }
    } catch (error) {
      console.error(error);
      ErrorToast(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!editTransactionModal) return null;

  return createPortal(
    <div
      onClick={() => setEditTransactionModal(false)}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-[#1E2939] text-black dark:text-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Edit Transaction</h2>
          <button
            className="global_button_red"
            onClick={() => setEditTransactionModal(false)}
          >
            Close
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Payment (Credit) */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">Payment</label>
            <input
              type="number"
              name="Credit"
              value={form.Credit}
              onChange={handleChange}
              placeholder="Enter Payment"
              className="global_input w-full"
            />
          </div>

          {/* Received (Debit) */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">Received</label>
            <input
              type="number"
              name="Debit"
              value={form.Debit}
              onChange={handleChange}
              placeholder="Enter Received"
              className="global_input w-full"
            />
          </div>

          {/* Note */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">Note</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Enter Note"
              className="global_input w-full h-24"
            ></textarea>
          </div>

          <button
            type="submit"
            className="global_button w-full"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Transaction"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditTransactionModal;
