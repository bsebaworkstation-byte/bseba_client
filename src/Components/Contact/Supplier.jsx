import React, { useEffect, useRef, useState, useCallback } from "react";
import loadingStore from "../../Zustand/LoadingStore";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { timeAgo } from "../../Helper/TimeAgo";
import GlobalPhoneInput from "../../Helper/GlobalPhoneInput";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import api from "../../Helper/axios_resonse_interceptor";
import TransictionModal from "../Modals/TransictionModal";
import openCloseStore from "../../Zustand/OpenCloseStore";
import { can } from "../../Helper/permissionChecker";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";

const Supplier = () => {
  const navigate = useNavigate();
  const { setTransictionModal } = openCloseStore();
  const [transictionCustomer, setTransictionCustomer] = useState(null);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const formRef = useRef(null);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    supplier: "",
    mobile: "",
    email: "",
    contactPerson: "",
    address: "",
    contactType: "Supplier", // default Supplier
  });

  // language translator
  const formTrans = useTextTranslate(GlobalFormTranslator);
  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);

  // Previous transaction state, default "দিব"
  const [transactionType, setTransactionType] = useState("দিব");
  const [transactionAmount, setTransactionAmount] = useState("");

  const { setGlobalLoader } = loadingStore();

  // Fetch suppliers - Memoized with useCallback
  const fetchSuppliers = useCallback(async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/SuppliersList/${page}/${limit}/${search || 0}`,
      );
      if (res.data.status === "Success") {
        setSuppliers(res.data.data);
        setTotal(res.data.pagination.totalSuppliers);
        setTotalPages(res.data.pagination.totalPages || Math.ceil(res.data.pagination.totalSuppliers / limit));
      } else {
        ErrorToast("Failed to fetch suppliers");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  }, [page, limit, search, setGlobalLoader]);

  // Fetch suppliers when dependencies change
  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const transactionOptions = [
    { value: "দিব", label: "দিব" },
    { value: "পাবো", label: "পাবো" },
  ];

  const resetForm = () => {
    setForm({
      supplier: "",
      mobile: "",
      email: "",
      address: "",
      contactPerson: "",
      contactType: "Supplier",
    });
    setEditId(null);
    setTransactionType("দিব"); // reset default
    setTransactionAmount("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value));
    setPage(1); // Reset to first page when changing items per page
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.supplier?.trim()) {
      ErrorToast("Supplier name is required");
      return;
    }

    setGlobalLoader(true);
    try {
      const payload = {
        name: form.supplier,
        mobile: form.mobile,
        email: form.email,
        contactPerson: form.contactPerson,
        address: form.address,
        type: form.contactType,
        Credit: transactionType === "পাবো" ? Number(transactionAmount) : 0,
        Debit: transactionType === "দিব" ? Number(transactionAmount) : 0,
      };

      if (editId) {
        const res = await api.put(`/UpdateSupplierByID/${editId}`, payload);
        if (res.data.status === "Success") {
          SuccessToast("Supplier updated successfully");
          resetForm();
          fetchSuppliers();
        } else {
          ErrorToast(res.data.message || "Failed to update Supplier");
        }
      } else {
        const res = await api.post(`/CreateContact`, payload);
        if (res.data.status === "Success") {
          SuccessToast("Supplier created successfully");
          fetchSuppliers();
          resetForm();
        } else {
          ErrorToast(res.data.message || "Failed to create Supplier");
        }
      }
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      {/* Form */}
      {can("CreateContact") && (
        <div ref={formRef} className={`global_sub_container`}>
          <div className="mb-4">
            <h1 className="text-xl font-semibold mb-3">
              {heading("supplier")}
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {/* Supplier Name */}
            <div>
              <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {formTrans("supplierName")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="supplier"
                value={form.supplier}
                onChange={handleChange}
                className="global_input"
                placeholder={formTrans("supplierName")}
                required
              />
            </div>

            {/* Mobile */}
            <div>
              <GlobalPhoneInput
                label="Mobile"
                required
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {formTrans("email")}
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="global_input"
                placeholder={formTrans("email")}
              />
            </div>

            {/* Address */}
            <div>
              <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {formTrans("address")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="global_input"
                placeholder={formTrans("address")}
                required
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {formTrans("ContactPerson")}
              </label>
              <input
                type="text"
                name="contactPerson"
                value={form.contactPerson}
                onChange={handleChange}
                className="global_input"
                placeholder="Contact Person Name"
              />
            </div>

            {/* Contact Type */}
            <div>
              <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {formTrans("contactType")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                name="contactType"
                value={form.contactType}
                onChange={handleChange}
                required
                className="global_input appearance-none bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Supplier">Supplier</option>
                <option value="Both">Both (Customer and Supplier)</option>
              </select>
            </div>

            {/* Previous Transaction */}
            <div>
              <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {formTrans("prevAmount")}
              </label>
              <div className="flex gap-2">
                <Select
                  value={transactionOptions.find(
                    (opt) => opt.value === transactionType,
                  )}
                  onChange={(selectedOption) =>
                    setTransactionType(selectedOption.value)
                  }
                  options={transactionOptions}
                  classNamePrefix="react-select"
                  className="w-full"
                  menuPortalTarget={document.body}
                  styles={getReactSelectStyles()}
                />
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {formTrans("amount")}
              </label>
              <input
                type="text"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                placeholder={
                  transactionType === "দিব"
                    ? "আমার কাছে পাবে"
                    : transactionType === "পাবো"
                    ? "আমি পাবো"
                    : "Amount"
                }
                className="global_input"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-center lg:justify-start items-end gap-2">
              <button
                type="submit"
                className={
                  editId ? "global_edit" : "global_button w-full lg:w-fit"
                }
              >
                {editId ? btn("update") : btn("create")}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="global_button_red"
                >
                  {btn("cancel")}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Supplier list */}
      {can("SuppliersList") && (
        <div className="global_sub_container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {heading("supplierList")}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Showing {suppliers.length} of {total} Suppliers
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <input
                type="text"
                placeholder="Search Supplier..."
                value={search}
                onChange={handleSearchChange}
                className="global_input"
              />

              <select
                value={limit}
                onChange={handleLimitChange}
                className="global_dropdown"
              >
                {[20, 50, 100, 500].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt} per page
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="global_table">
              <thead className="global_thead">
                <tr>
                  <th className="global_th">#</th>
                  <th className="global_th">{table("name")}</th>
                  <th className="global_th">{table("address")}</th>
                  <th className="global_th">{table("mobile")}</th>
                  <th className="global_th">{table("balance")}</th>
                  {can("CreateTransaction") && (
                    <th className="global_th">{table("transaction")}</th>
                  )}
                  <th className="global_th">{table("date")}</th>
                  {can("UpdateContact") && (
                    <th className="global_th">{btn("edit")}</th>
                  )}
                  {can("ViewLedger") && (
                    <th className="global_th">{table("ledger")}</th>
                  )}
                </tr>
              </thead>
              <tbody className="global_tbody">
                {suppliers?.length > 0 ? (
                  suppliers.map((s, i) => (
                    <tr key={s._id} className="global_tr">
                      <td className="global_td">
                        {(page - 1) * limit + i + 1}
                      </td>
                      <td className="global_td">
                        <div className="flex flex-col leading-tight">
                          <span className="font-medium">{s.name}</span>
                          <span className="text-xs text-gray-500 mt-[2px]">
                            {s?.contactPerson}
                          </span>
                        </div>
                      </td>
                      <td className="global_td max-w-[150px] truncate">
                        {s.address}
                      </td>
                      <td className="global_td">{s.mobile}</td>
                      {/* Payable and Recevable set */}
                      <td
                        className={`global_td ${
                          s.balance < 0
                            ? "text-green-500"
                            : s.balance > 0
                            ? "text-red-500"
                            : ""
                        }`}
                      >
                        {s.balance
                          ? `${
                              s.balance < 0 ? "Receivable" : "Payable"
                            } : ${Math.abs(s.balance).toFixed(2)}`
                          : "0.00"}
                      </td>
                      {can("CreateTransaction") && (
                        <td className="global_td max-w-[150px] truncate">
                          <div className="w-full flex justify-center">
                            <button
                              onClick={() => {
                                const info = {
                                  value: s._id,
                                  label: `${s.name} (${s.mobile}) ${s.balance}`,
                                  ...s,
                                };
                                setTransictionCustomer(info);
                                setTransictionModal(true);
                              }}
                              className="global_edit"
                            >
                              {btn("add")}
                            </button>
                          </div>
                        </td>
                      )}
                      <td className="global_td">{timeAgo(s.updatedAt)}</td>
                      {can("UpdateContact") && (
                        <td className="global_td">
                          <Link
                            to={`/EditContact/${s._id}`}
                            className="global_edit"
                          >
                            {btn("edit")}
                          </Link>
                        </td>
                      )}
                      {can("ViewLedger") && (
                        <td className="global_td">
                          <Link
                            to={`/Transaction/${s._id}`}
                            className="global_button"
                          >
                            {btn("view")}
                          </Link>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr className="global_tr">
                    <td colSpan="8" className="global_td text-center">
                      No suppliers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className={`px-4 py-2 rounded-r-md rounded-l-full ${
                  page === 1
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "global_button"
                }`}
              >
                {table("previous")}
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {table("page")} {page} {table("of")} {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={page >= totalPages}
                className={`px-4 py-2 rounded-l-md rounded-r-full ${
                  page >= totalPages
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "global_button"
                }`}
              >
                {table("next")}
              </button>
            </div>
          )}
        </div>
      )}
      <TransictionModal contact={transictionCustomer} />
    </div>
  );
};

export default Supplier;