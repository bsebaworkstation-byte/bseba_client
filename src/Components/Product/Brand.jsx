import React, { useEffect, useRef, useState } from "react";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import api from "../../Helper/axios_resonse_interceptor";
import { can } from "../../Helper/permissionChecker";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";

const Brand = () => {
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState({ name: "", logo: "" });
  const [editId, setEditId] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const formRef = useRef(null);

  // Pagination + Search
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [brandPage, setBrandPage] = useState(1);
  const [brandPerPage, setBrandPerPage] = useState(20);
  const [brandKeyWord, setBrandKeyWord] = useState("");

  const [imageLoading, setImageLoading] = useState(false);

  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);
  const formTrans = useTextTranslate(GlobalFormTranslator);

  //  Fetch Brands
  const fetchBrands = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/GetBrands`);

      // Basic fallback
      setBrands(res.data.data || []);

      //  Handle pagination safely (prevent undefined errors)
      if (res.data.pagination) {
        // setHasNextPage(res.data.pagination.hasNextPage || false);
        // setHasPrevPage(res.data.pagination.hasPrevPage || false);
        // setTotal(res.data.pagination.total || 0);
        // setTotalPages(res.data.pagination.totalPages || 1);
      } else {
        setHasNextPage(false);
        setHasPrevPage(false);
        setTotal(res.data.data?.length || 0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [brandKeyWord, brandPage, brandPerPage]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalLoader(true);
    try {
      if (editId) {
        const res = await api.post(`/UpdateBrand/${editId}`, form);
        if (res.data.status === "Success") {
          SuccessToast("Brand updated successfully!");
          clearForm();
          fetchBrands();
        } else {
          ErrorToast(res.data.message || "Failed to update Brand");
        }
      } else {
        const res = await api.post(`/CreateBrand`, form);
        if (res.data.status === "Success") {
          SuccessToast("Brand created successfully!");
          clearForm();
          fetchBrands();
        } else {
          ErrorToast(res.data.message || "Failed to create Brand");
        }
      }
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const clearForm = () => {
    setForm({ name: "", logo: "" });
    setEditId(null);
  };

  const handleEdit = (Brand) => {
    setEditId(Brand._id);
    setForm({ name: Brand.name, logo: Brand.logo || "" });
    const fileInput = document.getElementById("image");
    if (fileInput) fileInput.value = "";
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: '<span class="text-gray-900 dark:text-white">Are you sure?</span>',
      html: '<p class="text-gray-600 dark:text-gray-300">This action cannot be undone!</p>',
      icon: "warning",
      showCancelButton: true,
      background: "rgba(255, 255, 255, 0.2)",
      backdrop: `
        rgba(0,0,0,0.4)
        url("/images/nyan-cat.gif")
        left top
        no-repeat
      `,
      customClass: {
        popup:
          "rounded-lg border border-white/20 dark:border-gray-700/50 shadow-xl backdrop-blur-lg bg-white/80 dark:bg-gray-800/80",
        confirmButton:
          "px-4 py-2 bg-red-600/90 hover:bg-red-700/90 text-white rounded-md font-medium transition-colors backdrop-blur-sm ml-3",
        cancelButton:
          "px-4 py-2 bg-white/90 dark:bg-gray-700/90 hover:bg-gray-100/90 dark:hover:bg-gray-600/90 text-gray-800 dark:text-gray-200 border border-white/20 dark:border-gray-600/50 rounded-md font-medium transition-colors ml-2 backdrop-blur-sm",
      },
      buttonsStyling: false,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setGlobalLoader(true);
          const response = await api.get(`/DeleteBrand/${id}`);
          if (response.data.status === "Success") {
            SuccessToast(response.data.message);
            fetchBrands();
          } else {
            ErrorToast(response.data.message);
          }
        } catch (error) {
          ErrorToast(error.response?.data?.message || "Failed to delete Brand");
        } finally {
          setGlobalLoader(false);
        }
      }
    });
  };

  //  Filter by search keyword
  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(brandKeyWord.toLowerCase()),
  );

  return (
    <div ref={formRef} className="global_container">
      <div className="global_sub_container">
        <h1 className="text-xl font-semibold mb-3">
          {heading("brandManagement")}
        </h1>

        {/*  Form + Search Row */}
        <form
          onSubmit={handleSubmit}
          className=" md:space-y-4 space-y-0 flex flex-col lg:flex-row justify-between gap-5"
        >
          <div className="flex flex-col lg:flex-row gap-5 w-full">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Brand Name"
              className="global_input"
              required
            />
            <div className="flex lg:justify-start gap-2">
              {/* Create Button */}
              {!editId && can("CreateBrand") && (
                <button type="submit" className="global_button w-full lg:w-fit">
                  {btn("create")}
                </button>
              )}

              {/* Update Button */}
              {editId && can("UpdateBrand") && (
                <button type="submit" className="global_edit w-full lg:w-fit">
                  {btn("update")}
                </button>
              )}
              {editId && (
                <button
                  type="button"
                  className="global_button_red"
                  onClick={clearForm}
                >
                  {btn("cancel")}
                </button>
              )}
            </div>
          </div>

          {/*  Search Input beside form */}
          <input
            type="text"
            placeholder="Search Brand"
            value={brandKeyWord}
            onChange={(e) => setBrandKeyWord(e.target.value)}
            className="global_input h-fit w-full lg:w-lg"
          />
        </form>
      </div>

      {/*  Brand List */}
      <div className="global_sub_container space-y-3">
        {filteredBrands.reverse().map((Brand) => (
          <div
            key={Brand._id}
            className="global_list_item flex items-center justify-between"
          >
            <h2>{Brand.name}</h2>
            <div className="flex gap-2">
              {can("UpdateBrand") && (
                <button
                  onClick={() => handleEdit(Brand)}
                  className="global_edit"
                >
                  {btn("edit")}
                </button>
              )}
              {can("isAdmint") && (
                <button
                  onClick={() => handleDelete(Brand._id)}
                  className="global_button_red"
                >
                  {btn("delete")}
                </button>
              )}
            </div>
          </div>
        ))}

        {/*  No results message */}
        {filteredBrands.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No Brand found.
          </p>
        )}
      </div>
    </div>
  );
};

export default Brand;
