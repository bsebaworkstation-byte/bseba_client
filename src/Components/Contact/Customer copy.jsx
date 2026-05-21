import React, { useEffect, useRef, useState } from "react";
import loadingStore from "../../Zustand/LoadingStore";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { timeAgo } from "../../Helper/TimeAgo";
import GlobalPhoneInput from "../../Helper/GlobalPhoneInput";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import api from "../../Helper/axios_resonse_interceptor";
import openCloseStore from "../../Zustand/OpenCloseStore";
import TransictionModal from "../Modals/TransictionModal";
import { can } from "../../Helper/permissionChecker";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";

const Customer = () => {
  const { setTransictionModal } = openCloseStore();
  const navigate = useNavigate();
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [transictionCustomer, setTransictionCustomer] = useState(null);
  const formRef = useRef(null);
  const [customers, setCustomers] = useState([]);

  const [form, setForm] = useState({
    email: "",
    mobile: "",
    contactPerson: "",
    address: "",
    customer: "",
    contactType: "Customer",
  });

  const [transactionType, setTransactionType] = useState("পাবো");
  const [transactionAmount, setTransactionAmount] = useState("");

  const formTrans = useTextTranslate(GlobalFormTranslator);
  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);

  const { setGlobalLoader } = loadingStore();

  // Fetch Customers
  const fetchCustomers = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/CustomersList/${page}/${limit}/${search || 0}`,
      );
      if (res.data.status === "Success") {
        setCustomers(res.data.data);
        setTotal(res.data.pagination.totalCustomers);
      } else {
        ErrorToast("Failed to fetch customers");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchCustomers();
  }, [search, page, limit]);

  const transactionOptions = [
    { value: "পাবো", label: "পাবো" },
    { value: "দিব", label: "দিব" },
  ];

  const resetForm = () => {
    setForm({
      email: "",
      mobile: "",
      contactPerson: "",
      address: "",
      customer: "",
      contactType: "Customer",
    });
    setEditId(null);
    setTransactionType("পাবো");
    setTransactionAmount("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.customer?.trim()) {
      ErrorToast("Customer name is required");
      return;
    }

    if (!form.contactType) {
      ErrorToast("Please select contact type");
      return;
    }

    setGlobalLoader(true);
    try {
      const payload = {
        name: form.customer,
        contactPerson: form.contactPerson,
        mobile: form.mobile,
        email: form.email,
        address: form.address,
        type: form.contactType,
        Credit: transactionType === "পাবো" ? Number(transactionAmount) : 0,
        Debit: transactionType === "দিব" ? Number(transactionAmount) : 0,
      };

      if (editId) {
        const res = await api.put(`/UpdateContactById/${editId}`, payload);
        if (res.data.status === "Success") {
          SuccessToast("Customer updated successfully");
          resetForm();
          setPage(1);
          fetchCustomers();
        } else {
          ErrorToast(res.data.message || "Failed to update Customer");
        }
      } else {
        const res = await api.post(`/CreateContact`, payload);
        if (res.data.status === "Success") {
          SuccessToast("Customer created successfully");
          resetForm();
          setPage(1);
          fetchCustomers();
        } else {
          ErrorToast(res.data.message || "Failed to create Customer");
        }
      }
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Something went wrong");
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      {can("CreateContact") && (
        <div ref={formRef} className="global_sub_container">
          <div className="mb-4">
            <h1 className="text-xl font-semibold mb-3">
              {heading("addCustomer")}
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {/* Customer Name */}
            <div>
              <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {formTrans("customerName")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customer"
                value={form.customer}
                onChange={handleChange}
                className="global_input"
                placeholder="Customer Name"
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
                placeholder="Email"
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
                placeholder="Address"
                required
              />
            </div>

            {/* Contact Person (FIXED) */}
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
                placeholder="Contact Person"
              />
            </div>

            {/* Contact Type */}
            <div>
              <label
                htmlFor="contactType"
                className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {formTrans("contactType")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                name="contactType"
                value={form.contactType}
                onChange={handleChange}
                required
                className="global_input"
              >
                <option value="Customer">Customer</option>
                <option value="Supplier">Supplier</option>
                <option value="Both">Both</option>
              </select>
            </div>

            {/* Previous Transaction */}
            <div>
              <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {formTrans("prevAmount")}
              </label>
              <Select
                value={transactionOptions.find(
                  (opt) => opt.value === transactionType,
                )}
                onChange={(selectedOption) => {
                  setTransactionType(selectedOption.value);
                  setTransactionAmount("");
                }}
                options={transactionOptions}
                classNamePrefix="react-select"
                className="w-full"
                menuPortalTarget={document.body}
                styles={getReactSelectStyles()}
              />
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
                  transactionType === "দিব" ? "আমার কাছে পাবে" : "আমি পাবো"
                }
                className="global_input"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-center lg:justify-start items-end">
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

      {/* Customer List */}
      {can("CustomersList") && (
        <div className="global_sub_container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {heading("customerList")}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Showing {customers.length} of {total} Customers
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <input
                type="text"
                placeholder="Search Customer..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="global_input"
              />

              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
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
                   {can("isAdmin") && (
                    <th className="global_th">{btn("Report")}</th>
                  )}
                  {can("ViewLedger") && (
                    <th className="global_th">{table("ledger")}</th>
                  )}
                </tr>
              </thead>

              <tbody className="global_tbody">
                {customers?.length > 0 ? (
                  customers.map((c, i) => (
                    <tr key={c._id} className="global_tr">
                      <td className="global_td">{i + 1}</td>
                      <td className="global_td">
                        <div className="flex flex-col leading-tight">
                          <span className="font-medium">{c.name}</span>
                          <span className="text-xs text-gray-500 mt-[2px]">
                            {c?.contactPerson}
                          </span>
                        </div>
                      </td>
                      <td className="global_td max-w-[150px] truncate">
                        {c.address}
                      </td>
                      <td className="global_td">{c.mobile}</td>

                      <td
                        className={`global_td ${
                          c.balance < 0
                            ? "text-green-500"
                            : c.balance > 0
                            ? "text-red-500"
                            : ""
                        }`}
                      >
                        {c.balance
                          ? `${
                              c.balance < 0 ? "Receivable" : "Payable"
                            } ${Math.abs(c.balance).toFixed(2)}`
                          : "0.00"}
                      </td>

                      {can("CreateTransaction") && (
                        <td className="global_td">
                          <div className="flex justify-center">
                            <button
                              onClick={() => {
                                const info = {
                                  value: c._id,
                                  label: `${c.name} (${c.mobile}) ${c.balance}`,
                                  ...c,
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

                      <td className="global_td">{timeAgo(c.updatedAt)}</td>

                      {can("UpdateContact") && (
                        <td className="global_td">
                          <Link
                            to={`/EditContact/${c._id}`}
                            className="global_edit"
                          >
                            {btn("edit")}
                          </Link>
                        </td>
                      )}
                        {can("isAdmin") && (
                        <td className="global_td">
                          <Link
                            to={`/CoustomerSalesReport/${c._id}`}
                            className="global_button"
                          >
                            {btn("Report")}
                          </Link>
                        </td>
                      )}
                      {can("ViewLedger") && (
                        <td className="global_td">
                          <Link
                            to={`/Transaction/${c._id}`}
                            className="global_button"
                          >
                            {btn("Ledger")}
                          </Link>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="global_td text-center">
                      No customers found
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
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-r-md rounded-l-full ${
                  page === 1
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "global_button"
                }`}
              >
                {table("previous")}
              </button>

              <span className="text-sm text-gray-700 dark:text-gray-300">
                {table("page")} {page} {table("of")} {Math.ceil(total / limit)}
              </span>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / limit)}
                className={`px-4 py-2 rounded-l-md rounded-r-full ${
                  page >= Math.ceil(total / limit)
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
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

export default Customer;
