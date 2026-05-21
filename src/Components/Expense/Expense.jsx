import React, { useEffect, useState } from "react";
import { FaTag, FaCalendarAlt, FaStickyNote } from "react-icons/fa";
import { MdOutlineAccountBalance } from "react-icons/md";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { createPortal } from "react-dom";

import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import openCloseStore from "../../Zustand/OpenCloseStore";
import ExpenceTypeModal from "../Modals/ExpenceTypeModal";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import ExpenseList from "./ExpenseList";
import expenseStore from "../../Zustand/expenseStore";
import api from "../../Helper/axios_resonse_interceptor";
import { can } from "../../Helper/permissionChecker";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";

const Expense = () => {
  const { setExpenseTypeModal } = openCloseStore();
  const { setGlobalLoader } = loadingStore();
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null); // { value, label }
  const [note, setNote] = useState("");
  const [createDate, setCreateDate] = useState(new Date());
  const [allAccount, setAllAccount] = useState([]);
  const [paymentList, setPaymentList] = useState([]);
  const { toggleRefresh } = expenseStore();

  // language translator
  const formTrans = useTextTranslate(GlobalFormTranslator);
  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);

  // Expense options
  const expenseOptions = expenseTypes.map((exp) => ({
    value: exp._id,
    label: exp.name,
  }));

  // fetch expense types
  const fetchExpenseTypes = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/GetExpenseTypes`);
      if (res.data && res.data.data) setExpenseTypes(res.data.data.reverse());
    } catch (err) {
      console.log(err);
    } finally {
      setGlobalLoader(false);
    }
  };

  // fetch accounts
  const fetchAllAccounts = async () => {
    try {
      const res = await api.get(`/AllAccount`);
      if (res.data?.status === "Success") {
        setAllAccount(
          res.data.data.map((item) => ({ value: item._id, label: item.name })),
        );
      } else {
        setAllAccount([]);
      }
    } catch (err) {
      setAllAccount([]);
      ErrorToast(err.message || "Failed to load accounts");
    }
  };

  useEffect(() => {
    fetchExpenseTypes();
    fetchAllAccounts();
  }, []);

  // add account to payment list
  const handleAddAccount = (accObj) => {
    if (!accObj) return;
    const exists = paymentList.find((p) => p.accountID === accObj.value);
    if (exists) {
      return ErrorToast("This account already added");
    }
    setPaymentList((prev) => [
      ...prev,
      { accountID: accObj.value, accountName: accObj.label, amount: 0 },
    ]);
  };

  // remove account row
  const handleRemoveAccount = (id) => {
    setPaymentList((prev) => prev.filter((p) => p.accountID !== id));
  };

  // update amount
  const updateAmount = (id, val) => {
    setPaymentList((prev) =>
      prev.map((p) => (p.accountID === id ? { ...p, amount: Number(val) } : p)),
    );
  };

  // handle expense type created from modal
  const handleExpenseTypeCreated = (newType) => {
    setExpenseTypes((prev) => [...prev, newType]);
    setSelectedExpense({ value: newType._id, label: newType.name });
    setExpenseTypeModal(false);
  };

  // === IMPORTANT: compute totalAmount here so it's defined for JSX ===
  const totalAmount = paymentList.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0,
  );

  // submit handler
  const handleSubmit = async () => {
    if (!selectedExpense) return ErrorToast("Select expense type");
    if (paymentList.length === 0) return ErrorToast("Add at least one account");

    const noAmount = paymentList.some(
      (l) => !l.amount || Number(l.amount) <= 0,
    );

    if (noAmount) {
      return ErrorToast("Please enter a valid amount.");
    }

    const payload = {
      typeID: selectedExpense.value,
      amount: totalAmount,
      note,
      payment: paymentList,
      date: createDate, // if backend expects ISO, consider createDate.toISOString()
    };

    try {
      setGlobalLoader(true);
      const res = await api.post(`/CreateExpense`, payload);
      if (res.data.status === "Success") {
        SuccessToast("Expense created Succesfully");
        toggleRefresh();
        setSelectedExpense(null);
        setPaymentList([]);
        setNote("");
        setCreateDate(new Date());
      } else {
        ErrorToast(res.data.message || "Failed to create expense");
      }
    } catch (err) {
      ErrorToast(err.message || "Request failed");
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      <div className="global_sub_container relative">
        <h1 className="text-xl font-semibold mb-4">{heading("addExpense")}</h1>
        {/* form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* EXPENSE TYPE */}
          <div className="flex gap-2">
            <div className="w-full">
              <label className="text-sm font-medium flex mb-1">
                <FaTag className="mr-2 text-green-500" />{" "}
                {formTrans("expenseType")}
              </label>

              <Select
                value={selectedExpense}
                onChange={(e) => setSelectedExpense(e)}
                options={expenseOptions}
                isClearable
                placeholder="Select Expense Type"
                classNamePrefix="react-select"
                className="w-full"
                isDisabled={paymentList.length > 0}
                styles={getReactSelectStyles()}
                menuPortalTarget={document.body}
              />
            </div>
            {/* ADD EXPENSE TYPE BUTTON */}
            {can("CreateExpenseTypes") && (
              <div className="flex items-end">
                {" "}
                <button
                  onClick={() => setExpenseTypeModal(true)}
                  className=" global_button"
                >
                  + {btn("expenseType")}
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            {/* ACCOUNT SELECT */}
            <div className="w-1/2">
              <label className="text-sm font-medium flex mb-1">
                <MdOutlineAccountBalance className="mr-2 text-green-500" /> {formTrans("addPaymentAccount")}
              </label>

              <Select
                options={allAccount}
                isClearable
                onChange={handleAddAccount}
                isDisabled={!selectedExpense}
                placeholder="Select Account"
                classNamePrefix="react-select"
                className="w-full"
                styles={getReactSelectStyles()}
                menuPortalTarget={document.body}
              />
            </div>

            {/* DATE */}
            {can("isAdmin") && (
              <div className="w-1/2">
                <label className="text-sm font-medium flex mb-1">
                  <FaCalendarAlt className="mr-2 text-green-500" /> {formTrans("selectDate")}
                </label>

                <DatePicker
                  selected={createDate}
                  onChange={(date) => setCreateDate(date)}
                  dateFormat="dd-MM-yyyy"
                  className="global_input w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* CREATE BUTTON */}
      </div>

      {/* TABLE SECTION */}
      <div className="global_sub_container">
        <div className="w-full overflow-auto text-nowrap">
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">{btn("expenseType")}</th>
                <th className="global_th">{table("accountName")}</th>
                <th className="global_th">{table("amount")}</th>
                <th className="global_th">{table("action")}</th>
              </tr>
            </thead>

            <tbody className="global_tbody">
              {paymentList.map((p) => (
                <tr key={p.accountID} className="global_tr">
                  <td className="global_td">{selectedExpense?.label || "—"}</td>
                  <td className="global_td">{p.accountName}</td>

                  <td className="global_td">
                    <input
                      type="number"
                      className="outline-none border border-gray-300 rounded-sm p-1 focus:border-green-500"
                      onChange={(e) =>
                        updateAmount(p.accountID, e.target.value)
                      }
                    />
                  </td>

                  <td className="global_td">
                    <button
                      onClick={() => handleRemoveAccount(p.accountID)}
                      className="text-red-600 font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}

              {paymentList.length === 0 && (
                <tr className="global_tr">
                  <td colSpan="4" className="global_td text-center">
                    No accounts added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="global_sub_container mt-6">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          {/* NOTE AREA */}
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 flex items-center">
              <FaStickyNote className="mr-2 text-green-500" /> {formTrans("note")}
            </label>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="global_input w-full"
              placeholder="Write note..."
            />
          </div>

          {/* TOTAL + BUTTON AREA */}
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            {/* Total Amount */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">{table("total")} {table("amount")}</label>
              <input
                className="global_input w-full text-right font-semibold rounded-sm cursor-not-allowed"
                value={totalAmount}
                type="number"
                readOnly
                disabled
              />
            </div>

            {/* Button */}
            <button onClick={handleSubmit} className="global_button w-full">
              {btn("create")}
            </button>
          </div>
        </div>
      </div>

      <ExpenceTypeModal onSuccess={handleExpenseTypeCreated} />

      <ExpenseList />
    </div>
  );
};

export default Expense;
