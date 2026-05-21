import React, { useEffect, useRef, useState } from "react";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import Swal from "sweetalert2";
import api from "../../Helper/axios_resonse_interceptor";
import { can } from "../../Helper/permissionChecker";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";

const Unit = () => {
  const [units, setUnits] = useState([]);
  const [form, setForm] = useState({ name: "" });
  const [editId, setEditId] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const [searchKeyWord, setSearchKeyword] = useState("");
  const formRef = useRef(null);

  // translate bangla
  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);
  const formTrans = useTextTranslate(GlobalFormTranslator);

  // Fetch Brands
  const fetchUnits = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/GetUnit`);
      setUnits(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalLoader(true);

    try {
      if (editId) {
        const res = await api.post(`/UpdateUnit/${editId}`, form);
        if (res.data.status === "Success") {
          SuccessToast("Unit updated successfully!");
          setForm({ name: "" });
          setEditId(null);
          fetchUnits();
        } else {
          ErrorToast(res.data.message || "Failed to update unit");
        }
      } else {
        const res = await api.post(`/CreateUnit`, form);
        if (res.data.status === "Success") {
          SuccessToast("Unit created successfully!");
          setForm({ name: "" });
          fetchUnits();
        } else {
          ErrorToast(res.data.message || "Failed to create unit");
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
    setForm({ name: "" });
    setEditId(null);
  };

  const handleEdit = (unit) => {
    setEditId(unit._id);
    setForm({ name: unit.name });
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
        title: "text-lg font-semibold",
        htmlContainer: "mt-2",
      },
      buttonsStyling: false,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setGlobalLoader(true);
          const response = await api.get(`/DeleteUnit/${id}`);
          if (response.data.status === "Success") {
            SuccessToast(response.data.message);
            fetchUnits();
          } else {
            ErrorToast(response.data.message);
          }
        } catch (error) {
          ErrorToast(error.response?.data?.message || "Failed to delete unit");
        } finally {
          setGlobalLoader(false);
        }
      }
    });
  };

  //  Filter brands by search keyword
  const filteredUnits = units.filter((unit) =>
    unit.name.toLowerCase().includes(searchKeyWord.toLowerCase()),
  );

  return (
    <div ref={formRef} className="global_container">
      <div className="global_sub_container pb-10">
        <h1 className="text-xl font-semibold mb-3">
          {heading("unitManagement")}
        </h1>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 mb-6 flex flex-col lg:flex-row justify-between relative  gap-5"
        >
          <div className="flex flex-col lg:flex-row gap-5 w-full">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Unit Name"
              className="global_input
            "
              required
            />

            <div className="-bottom-10 right-0 absolute">
              {/* Create Button */}
              {!editId && can("CreateUnit") && (
                <button type="submit" className="global_button w-full lg:w-fit">
                  {btn("create")}
                </button>
              )}

              {/* Update Button */}
              {editId && can("UpdateUnit") && (
                <button type="submit" className="global_edit w-full lg:w-fit">
                  {btn("update")}
                </button>
              )}
              {editId ? (
                <button onClick={clearForm} className="global_button_red ml-3">
                  {btn("cancel")}
                </button>
              ) : (
                ""
              )}
            </div>
          </div>
          <input
            type="text"
            placeholder="Search Unit"
            value={searchKeyWord}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="global_input h-fit w-full lg:w-lg
          "
          />
        </form>
      </div>

      {/* Unit List */}
      <div className="global_sub_container space-y-3">
        {filteredUnits.map((unit) => (
          <div
            key={unit._id}
            className="global_list_item
            "
          >
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-200">
                {unit.name}
              </h2>
            </div>
            <div className="flex gap-2">
              {can("UpdateUnit") && (
                <button
                  onClick={() => handleEdit(unit)}
                  className="global_edit
                "
                >
                  {btn("edit")}
                </button>
              )}
              {can("isAdmin") && (
                <button
                  onClick={() => handleDelete(unit._id)}
                  className="global_button_red
                "
                >
                  {btn("delete")}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Show message if no results */}
        {filteredUnits.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No unit found.
          </p>
        )}
      </div>
    </div>
  );
};

export default Unit;
