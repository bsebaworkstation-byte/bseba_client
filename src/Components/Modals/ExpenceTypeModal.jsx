import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import openCloseStore from "../../Zustand/OpenCloseStore";
import { SuccessToast, ErrorToast } from "../../Helper/FormHelper";
import api from "../../Helper/axios_resonse_interceptor";

const ExpenceTypeModal = ({ onSuccess }) => {
  const { expenseTypeModal, setExpenseTypeModal } = openCloseStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState(false);

  // prevent background scroll when modal open
  useEffect(() => {
    document.body.style.overflow = expenseTypeModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [expenseTypeModal]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.value.trim()) setError(false);
  };

  const resetForm = () => {
    setForm({ name: "", description: "" });
    setError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Expense type name is required");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/CreateExpenseTypes`, form);

      if (res.data.status === "Success") {
        SuccessToast("Expense type created successfully");
        const createdType = res.data.data; // backend থেকে নতুন type object
        resetForm();
        if (onSuccess) onSuccess(createdType); // parent-এ পাঠানো callback
      } else {
        ErrorToast(res.data.message || "Failed to create expense type");
      }
    } catch (err) {
      console.error(err);
      ErrorToast(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!expenseTypeModal) return null;

  return createPortal(
    <div
      onClick={() => setExpenseTypeModal(false)}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center overflow-y-auto pt-10 px-3"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1E2939] p-6 rounded-lg w-full sm:w-[90%] max-w-lg max-h-[90vh] overflow-y-auto shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold mb-3">Add Expense Type</h2>
          <button
            className="global_button_red"
            onClick={() => setExpenseTypeModal(false)}
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="global_input"
              placeholder="Enter expense type name"
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="flex justify-end">
            <button
              type="submit"
              className="global_button 
              "
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Expense Type"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ExpenceTypeModal;
