import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import openCloseStore from "../../Zustand/OpenCloseStore";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";

const apiMap = {
  category: {
    url: "CreateCategory",
    title: "Create Category",
    fieldName: "name",
  },
  brand: { url: "CreateBrand", title: "Create Brand", fieldName: "name" },
  unit: { url: "CreateUnit", title: "Create Unit", fieldName: "name" },
};

const ProductModal = () => {
  const { modalOpen, modalType, modalCallback, closeModal, setData } =
    openCloseStore();
  const { setGlobalLoader } = loadingStore();
  const config = apiMap[modalType];
  const [form, setForm] = useState({});

  const btn = useTextTranslate(GlobalBtnTranslator);

  useEffect(() => {
    if (config) {
      setForm({ [config.fieldName]: "" });
    }
  }, [config]);

  useEffect(() => {
    if (modalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => (document.body.style.overflow = "auto");
  }, [modalOpen]);

  if (!modalOpen || !config) return null;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setGlobalLoader(true);
      const res = await api.post(`/${config.url}`, form);
      if (res.data.status === "Success") {
        SuccessToast(`${config.title} created successfully`);
        if (modalCallback) {
          modalCallback(res.data.data);
        }
        closeModal();
      } else {
        ErrorToast(res.data.message || `Failed to create ${config.title}`);
      }
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Something went wrong");
    } finally {
      setGlobalLoader(false);
    }
  };

  return createPortal(
    <div
      onClick={closeModal}
      className="fixed inset-0 z-50 bg-black/60 flex  pt-30 items-start justify-center overflow-y-auto pt-10 px-3"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1E2939] p-6 rounded-lg w-full sm:w-[90%] max-w-md max-h-[90vh] overflow-y-auto shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold dark:text-white text-lg">{config.title}</h2>
          <button className="global_button_red" onClick={closeModal}>
            {btn("close")}
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            name={config.fieldName}
            value={form[config.fieldName] || ""}
            onChange={handleChange}
            placeholder={config.title}
            className="global_input flex-1 dark:text-gray-300"
          />
          <button className="global_button w-full sm:w-auto" type="submit">
            {btn("create")}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default ProductModal;
