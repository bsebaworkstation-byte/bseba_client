import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import openCloseStore from "../../Zustand/OpenCloseStore";
import { SuccessToast, ErrorToast } from "../../Helper/FormHelper";
import api from "../../Helper/axios_resonse_interceptor";

const CreateSupplierModal = ({ onSuccess }) => {
  const { supplierModal, setSupplierModal } = openCloseStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    supplier: "",
    company: "",
    email: "",
    mobile: "",
    address: "",
  });
  const [error, setError] = useState(false);

  // Prevent background scroll
  useEffect(() => {
    if (supplierModal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [supplierModal]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.value.trim()) setError(false);
  };

  const resetForm = () => {
    setForm({
      supplier: "",
      company: "",
      email: "",
      mobile: "",
      address: "",
    });
    setError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.supplier.trim() ||
      !form.company.trim() ||
      !form.mobile.trim() ||
      !form.address.trim()
    ) {
      setError("Please fill all required fields");
      return;
    }

    const payload = {
      name: form.supplier,
      mobile: form.mobile,
      type: "Supplier", // default type
      businessName: form.company,
      address: form.address,
      email: form.email,
    };

    try {
      setLoading(true);
      const res = await api.post(`/CreateContact`, payload);

      if (res.data.status === "Success") {
        SuccessToast("Supplier created successfully");
        resetForm();
        setSupplierModal(false);
        if (onSuccess) onSuccess(); // call parent callback
      } else {
        ErrorToast(res.data.message || "Failed to create Supplier");
      }
    } catch (err) {
      console.error(err);
      ErrorToast(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!supplierModal) return null;

  return createPortal(
    <div
      onClick={() => setSupplierModal(false)}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center overflow-y-auto pt-10 px-3"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1E2939] p-6 rounded-lg w-full sm:w-[90%] max-w-lg max-h-[90vh] overflow-y-auto shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold dark:text-white">Create Supplier</h2>
          <button
            className="global_button_red"
            onClick={() => setSupplierModal(false)}
          >
            Close
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              Supplier Name <span className="text-red-500">*</span>
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
            <label className="mb-1 text-sm font-medium">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              className="global_input"
              placeholder="Enter business name"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              Mobile <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="global_input"
              placeholder="Enter mobile"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="global_input"
              placeholder="Enter email"
            />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 text-sm font-medium">
              Address <span className="text-red-500">*</span>
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
              {loading ? "Creating..." : "Create Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default CreateSupplierModal;
