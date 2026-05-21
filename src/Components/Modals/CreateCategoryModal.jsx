import React, { useEffect, useState } from "react";
import openCloseStore from "../../Zustand/OpenCloseStore";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { FaWallet } from "react-icons/fa"; // since you used <FaWallet />
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";

const CreateCategoryModal = () => {
  const { categoryModal, setCategoryModal } = openCloseStore();

  const { setGlobalLoader } = loadingStore();

  const [form, setForm] = useState({
    name: "",
  });

  // Disable background scroll when modal is open
  useEffect(() => {
    if (categoryModal) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [categoryModal]);

  // Input change handler
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Reset form
  const resetForm = () => {
    setForm({
      name: "",
    });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setGlobalLoader(true);

      const payload = {
        name: form.name,
      };

      const res = await api.post(`/CreateCategory`, payload);

      if (res.data.status === "Success") {
        SuccessToast("Category created successfully");
        resetForm();

        setCategoryModal(false); // close modal after success
      } else {
        ErrorToast(res.data.message || "Failed to create Category");
      }
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  if (!categoryModal) return null;

  return (
    <div
      onClick={() => setCategoryModal(false)}
      className="fixed inset-0 z-50 bg-[#0000006c] flex items-center justify-center"
    >
      <div
        className="flex relative text-black dark:text-white flex-col bg-white dark:bg-[#1E2939] rounded-lg p-6 max-w-lg w-full mx-4 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <div className="flex justify-between">
          <h2 className="text-lg  font-bold mb-4">Create Category</h2>
          <button
            className="global_button_red"
            onClick={() => {
              setCategoryModal(false);
            }}
          >
            close
          </button>
        </div>
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 mb-6 flex justify-between  gap-5"
        >
          <div className="flex gap-5 w-full">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Category Name"
              className="global_input
            "
              required
            />
            <button type="submit" className="global_button">
              Create Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategoryModal;
