import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { SuccessToast, ErrorToast } from "../../Helper/FormHelper";
import toast from "react-hot-toast";
import api from "../../Helper/axios_resonse_interceptor";
import GlobalPhoneInput from "../../Helper/GlobalPhoneInput";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";

const CreateSupplierModal = ({ open, setOpen, setSelectedSupplier }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    supplier: "",
    company: "",
    email: "",
    mobile: "",
    address: "",
    contactPerson: "",
    type: "Supplier",
  });
  const [error, setError] = useState(false);

  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const formTrans = useTextTranslate(GlobalFormTranslator);

  // Prevent background scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.value.trim()) setError(false);
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      mobile: "",
      address: "",
      contactPerson: "",
      type: "",
    });
    setError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.supplier.trim() ||
      !form.mobile.trim() ||
      !form.address.trim() ||
      !form.type.trim()
    ) {
      setError("Please fill all required fields");
      return;
    }

    const payload = {
      name: form.supplier,
      mobile: form.mobile,
      address: form.address,
      email: form.email,
      type: form.type,
      contactPerson: form.contactPerson,
    };

    try {
      setLoading(true);
      const res = await api.post(`/CreateContact`, payload);

      if (res.data.status === "Success") {
        // SuccessToast("Customer created successfully");
        setSelectedSupplier({
          label: `${form.supplier} - ${form.mobile}`,
          value: res.data.data._id,
          ...res.data.data,
        });
        resetForm();

        resetForm();
        setOpen(false);
        // call parent callback
      } else {
        toast.error(res.data.message || "Failed to create Supplier");
      }
    } catch (err) {
      console.error(err);
      ErrorToast(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-50 text-black dark:text-white bg-black/60 flex items-center justify-center overflow-y-auto pt-10 px-3"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1E2939] p-6 rounded-lg w-full sm:w-[90%] max-w-lg max-h-[90vh] overflow-y-auto shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{heading("supplier")}</h2>
          <button className="global_button_red" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              {formTrans("supplierName")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="supplier"
              value={form.supplier}
              onChange={handleChange}
              className="global_input"
              placeholder="Enter supplier name"
            />
          </div>

          <div className="flex flex-col">
            <GlobalPhoneInput
              label="Mobile"
              required
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              {formTrans("email")}
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="global_input"
              placeholder="Enter email"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              {formTrans("ContactPerson")}
            </label>
            <input
              type="text"
              name="contactPerson"
              value={form?.contactPerson || ""}
              onChange={handleChange}
              className="global_input"
              placeholder="Enter contact person name"
            />
          </div>
          <div>
            <label
              htmlFor="contactType"
              className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {formTrans("contactType")} <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="global_input appearance-none bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
            >
              <option value="Supplier">Supplier</option>
              <option value="Both">Both (Customer & Supplier)</option>
            </select>
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 text-sm font-medium">
              {formTrans("address")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="global_input"
              placeholder="Enter address"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm md:col-span-2">{error}</div>
          )}

          <div className="flex justify-end md:col-span-2">
            <button
              type="submit"
              className="global_button w-full"
              disabled={loading}
            >
              {loading ? "Creating..." : `${btn("create")}`}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default CreateSupplierModal;
