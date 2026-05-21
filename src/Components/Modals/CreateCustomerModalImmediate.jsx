import React, { useEffect, useState } from "react";
import { ErrorToast, IsMobile, SuccessToast } from "../../Helper/FormHelper";
import api from "../../Helper/axios_resonse_interceptor";
import GlobalPhoneInput from "../../Helper/GlobalPhoneInput";

const CreateCustomerModal = ({ open, setOpen, setSelectedCustomer }) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
    email: "",
    mobile: "",
    contactPerson: "",
    type: "Customer",
  });

  // Disable background scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]);

  // Input change handler
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Reset form
  const resetForm = () => {
    setForm({
      name: "",
      address: "",
      email: "",
      mobile: "",
      contactPerson: "",
      type: "Customer",
    });
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      ErrorToast("Name is required");
      return false;
    }

    if (!form.address.trim()) {
      ErrorToast("Address is required");
      return false;
    }

    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      ErrorToast("Invalid email format");
      return false;
    }

    return true; // সব ঠিক থাকলে true রিটার্ন করবে
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      const res = await api.post(`/CreateContact`, form);

      if (res.data.status === "Success") {
        // SuccessToast("Customer created successfully");
        setSelectedCustomer({
          label: `${form.name} (${form.address}) ${form.mobile}`,
          value: res.data.data._id,
          ...res.data.data,
        });
        resetForm();
        setOpen(false);
      } else {
        ErrorToast(res.data.message);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        // The backend sent a JSON body, e.g. { status: "Fail", message: "Contact already exists By Mobile" }
        ErrorToast(error.response.data.message || "Something went wrong");
      } else {
        // Network or unexpected error
        ErrorToast(error.message || "Unexpected error occurred");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-50 bg-[#0000006c] flex items-center justify-center"
    >
      <div
        className="flex relative text-black dark:text-white flex-col bg-white dark:bg-[#1E2939] rounded-lg p-6 max-w-lg w-full mx-4 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <div className="flex justify-between">
          <h2 className="text-lg  font-bold mb-4">Create cutomer</h2>
          <button
            className="global_button_red"
            onClick={() => {
              setOpen(false);
            }}
          >
            close
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Name */}
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
              placeholder="Enter name"
              required
            />
          </div>

          {/* Mobile */}
          <div className="flex flex-col">
            <GlobalPhoneInput
              label="Mobile"
              required
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
            />
          </div>

          {/* Address */}
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
              required
            />
          </div>
          {/* Contact Person (Optional) */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">Contact Person </label>
            <input
              type="text"
              name="contactPerson"
              value={form?.contactPerson || ""}
              onChange={handleChange}
              className="global_input"
              placeholder="Enter contact person"
            />
          </div>
          {/* Email */}
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

          {/* Submit Button */}
          <div className="flex justify-end items-end md:col-span-1">
            <button type="submit" className="global_button" disabled={loading}>
              {loading ? "Creating..." : "Create Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomerModal;
