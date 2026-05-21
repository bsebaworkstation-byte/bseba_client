import { useEffect, useMemo, useState } from "react";

import openCloseStore from "../../Zustand/OpenCloseStore";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import Select from "react-select";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import { IoMdCloseCircle } from "react-icons/io";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { can } from "../../Helper/permissionChecker";
import { formatCurrency } from "../../Helper/formatCurrency";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";

const TransictionModal = ({ contact }) => {
  const navigate = useNavigate();

  const { transictionModal, setTransictionModal } = openCloseStore();
  const { setGlobalLoader } = loadingStore();
  const [accounts, setAccounts] = useState([]);
  const [note, setNote] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);

  const [selectedTransactionType, setSelectedTransactionType] = useState(null);
  const [searchCustomerKeyword, setSearchCustomerKeyword] = useState("");
  const [createdDate, setCreatedDate] = useState(new Date());
  const [sendSMS, setSendSMS] = useState(true);
  const [createDiscount, setCreateDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState("");
  const transactionOptions = [
    { value: "Credit", label: createDiscount ? "Discount Payment" : "Recieve" },
    { value: "Debit", label: createDiscount ? "Discount Recieve" : "Payment" },
  ];
  // language translator
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);
  const formTrans = useTextTranslate(GlobalFormTranslator);

  // const discountAmount = Number(discountNumber);

  useEffect(() => {
    (async () => {
      if (transictionModal) {
        document.body.classList.add("overflow-hidden");
        setCreateDiscount(false);
        setSelectedTransactionType(null);
        await fetchAllAccounts();
        setSelectedCustomer(contact);
      } else {
        document.body.classList.remove("overflow-hidden");
      }
    })();
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [transictionModal]);

  // Fetch Accounts
  const fetchAllAccounts = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/AllAccount`);
      if (res.data.status === "Success") {
        const formatted = res.data.data.map((b) => ({
          value: b._id,
          label: b.name,
          amount: 0,
          ...b,
        }));
        const defaultAccount = formatted.find((a) => a.default === 1);
        if (defaultAccount) {
          // selectedAccounts এ সেট করা
          setSelectedAccounts([defaultAccount]);

          // accounts থেকে default বাদ দেওয়া
          const filtered = formatted.filter(
            (a) => a.value !== defaultAccount.value,
          );
          setAccounts(filtered);
        } else {
          // যদি default না থাকে, সব accounts সেট করো
          setAccounts(formatted);
          setSelectedAccounts([]);
        }
      }
    } catch (error) {
      ErrorToast("Failed to load accounts");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  // Fetch c
  const fetchCustomers = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/CustomersList/1/20/${searchCustomerKeyword || 0}`,
      );
      if (res.data.status === "Success") {
        setCustomers(
          res.data.data.map((s) => ({
            value: s._id,
            label: `${s.name} (${s.address}) (${
              s.mobile
            }) (${s?.balance?.toFixed(2)}) `,
            ...s,
          })),
        );
      } else {
        ErrorToast("Failed to fetch customers");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const selectAccounts = (account) => {
    setSelectedAccounts((prev) => [...prev, account]);
    const updated = [...accounts];
    const filteredAccounts = updated.filter((a) => a.value !== account.value);
    setAccounts(filteredAccounts);
  };

  const unselectAccount = (account) => {
    const updated = [...selectedAccounts];
    const filtered = updated.filter((a) => a.value !== account.value);
    setSelectedAccounts(filtered);
    setAccounts((prev) => [...prev, account]);
  };

  const handleAccountAmountChange = (accountId, value) => {
    let newVal = value === "" ? 0 : Number(value);

    // if (newVal > grandTotal) newVal = grandTotal; // grandTotal limit ধরে রাখো

    setSelectedAccounts((prev) =>
      prev.map((acc) =>
        acc.value === accountId ? { ...acc, amount: newVal } : acc,
      ),
    );
  };

  useEffect(() => {
    Promise.all([fetchAllAccounts()]);
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [searchCustomerKeyword]);

  const totalPaid = useMemo(
    () =>
      selectedAccounts.reduce((total, a) => total + (a.amount || 0), 0) ||
      Number(discountAmount) ||
      0,
    [selectedAccounts, Number(discountAmount)],
  );

  const currentBalance = useMemo(() => {
    if (!selectedCustomer) return 0;

    if (selectedTransactionType?.value === "Credit") {
      return totalPaid + (selectedCustomer?.balance || 0);
    } else {
      return totalPaid - (selectedCustomer?.balance || 0);
    }
  }, [totalPaid, selectedCustomer?.balance]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedAccount = selectedAccounts.map((a) => ({
      accountID: a.value,
      accountName: a.name,
      ...(selectedTransactionType.value === "Debit"
        ? { Credit: a.amount }
        : { Debit: a.amount }),
    }));
    const payload = {
      contactsID: selectedCustomer.value,
      Credit: selectedTransactionType.value === "Debit" ? totalPaid : 0,
      sms: sendSMS ? 1 : 0,
      Debit: selectedTransactionType.value === "Credit" ? totalPaid : 0,
      note: note,
      CreatedDate: createdDate,
      ...(createDiscount ? {} : { payment: formattedAccount }),
    };

    try {
      setGlobalLoader(true);
      const res = await api.post(
        `/${createDiscount ? "CreateDiscount" : "CreateTransaction"}`,
        payload,
      );

      if (res.data.status === "Success") {
        toast.success(res.data.message);
        if (createDiscount) {
          navigate(`/Transaction/${res.data.data.contactsID}`);
          setTransictionModal(false);
          return;
        }
        navigate(`/TransactionDetails/${res.data.data.transactionId}`);
        setTransictionModal(false);
      } else {
        ErrorToast(res.data.message || "Failed to create Transaction");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  if (!transictionModal) return null;

  return (
    <div
      onClick={() => {
        setTransictionModal(false);
      }}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center overflow-y-auto pt-10 px-3"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-black dark:text-white dark:bg-[#1E2939] p-6 rounded-lg w-full sm:w-[90%] max-w-2xl max-h-[90vh] min-h-[70vh] overflow-y-auto shadow-lg"
      >
        <button
          className="global_button_red mb-2"
          onClick={() => setTransictionModal(false)}
        >
          {btn("close")}
        </button>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-3"
        >
          {/* Contact*/}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">
              {table("customer")}
            </label>
            <Select
              options={customers}
              value={selectedCustomer}
              onChange={setSelectedCustomer}
              placeholder="Select Customer"
              classNamePrefix="react-select"
              onInputChange={(val) => setSearchCustomerKeyword(val)}
              styles={getReactSelectStyles()}
              isClearable
            />
          </div>

          {/* type and date */}
          <div className="flex items-center justify-between gap-2 col-span-2">
            <div className="w-full">
              <label className="block text-sm font-medium mb-1">
                {formTrans("transactionType")}
              </label>
              <Select
                value={selectedTransactionType}
                onChange={(selectedOption) => {
                  setSelectedTransactionType(selectedOption);
                }}
                options={transactionOptions}
                classNamePrefix="react-select"
                className="w-full"
                menuPortalTarget={document.body}
                styles={getReactSelectStyles()}
              />
            </div>

            <div className="flex items-center">
              {/* Date */}
              {can("isAdmin") && (
                <div className="">
                  <label className="block text-sm font-medium mt-1 mb-1">
                    {formTrans("selectDate")}
                  </label>
                  <div className="relative w-full">
                    {/* <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarAlt />
                      </div> */}
                    <DatePicker
                      selected={createdDate}
                      onChange={(date) => setCreatedDate(date)}
                      dateFormat="dd-MM-yyyy"
                      className="global_input w-full"
                      popperPlacement="bottom-start"
                      popperClassName="z-[9999]"
                      calendarClassName="react-datepicker-custom"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* sms and discount */}
          <div className="flex justify-between items-center gap-2">
            <div className="w-1/2 flex flex-col text-center">
              <label className="text-sm font-medium">{btn("sendSms")}</label>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setSendSMS(!sendSMS)}
                  className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-300 ${
                    sendSMS ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform duration-300 ${
                      sendSMS ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="w-1/2 flex flex-col text-center">
              <label className="text-sm font-medium">
                {btn("createDiscount")}
              </label>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setCreateDiscount(!createDiscount)}
                  className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-300 ${
                    createDiscount ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform duration-300 ${
                      createDiscount ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Paid Amount With Multiple Bank Account*/}
          {!createDiscount ? (
            <>
              {" "}
              <div className="flex flex-col gap-2 col-span-2">
                {selectedAccounts.map((account, index) => {
                  return (
                    <div className="flex justify-between" key={index}>
                      <div className="flex items-center w-full justify-between">
                        <h1 className="text-nowrap text-xs">
                          {selectedTransactionType?.value === "Credit"
                            ? `${formTrans("received")}`
                            : `${formTrans("payment")}`}
                          {account.label}
                        </h1>
                        {selectedAccounts?.length === 1 ? null : (
                          <button
                            className="pr-10"
                            onClick={() => unselectAccount(account)}
                          >
                            {" "}
                            <IoMdCloseCircle size={20} color="red" />
                          </button>
                        )}
                      </div>
                      <input
                        type="number"
                        name="amount"
                        value={account.amount === 0 ? "" : account.amount}
                        onChange={(e) =>
                          handleAccountAmountChange(
                            account.value,
                            e.target.value,
                          )
                        }
                        className={` w-40 rounded-sm outline-0 p-1.5 text-right ${
                          account.amount > 0
                            ? "border-2 border-green-500"
                            : " border-red-500 border"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
              {accounts?.length > 0 && (
                <div className="col-span-2">
                  {/* <h1> Paid Amount: </h1> */}
                  <Select
                    options={accounts}
                    value={null}
                    onChange={(account) => {
                      selectAccounts(account);
                    }}
                    placeholder="Select More Account"
                    classNamePrefix="react-select"
                    // onInputChange={(val) => setSearchSupplierKeyword(val)}
                    styles={getReactSelectStyles()}
                    // isClearable
                  />
                </div>
              )}
            </>
          ) : (
            selectedTransactionType && (
              <div className="flex items-center col-span-2 w-full justify-between">
                <h1 className="text-nowrap">{formTrans("discountHit")}</h1>
                <input
                  type="text"
                  inputMode="numeric"
                  // value={discountAmount === 0 ? "" : discountAmount}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d*\.?\d*$/.test(v)) {
                      setDiscountAmount(v);
                    }
                  }}
                  placeholder="Amount"
                  className={` w-40 rounded-sm outline-0 p-1.5 text-right ${
                    discountAmount > 0
                      ? "border-2 border-green-500"
                      : " border-red-500 border"
                  }`}
                />
              </div>
            )
          )}

          {/* Prev Balance */}
          {selectedCustomer?.balance < 0 ? (
            <h1 className="col-span-2 flex justify-between">
              <span>
                {" "}
                {formTrans("previous")} {formTrans("receivable")}{" "}
                {formTrans("amount")} :
              </span>{" "}
              <span>{Math.abs(selectedCustomer?.balance)?.toFixed(2)}</span>
            </h1>
          ) : (
            <h1 className="col-span-2 flex justify-between">
              <span>
                {" "}
                {formTrans("previous")} {formTrans("payable")}{" "}
                {formTrans("amount")} :
              </span>{" "}
              <span>{selectedCustomer?.balance?.toFixed(2)}</span>
            </h1>
          )}
          <h1 className="col-span-2 flex justify-between">
            <span>{formTrans("totalPaid")} :</span>{" "}
            <span>{formatCurrency(totalPaid)}</span>
          </h1>

          {selectedTransactionType?.value === "Credit" &&
            currentBalance !== false && (
              <h1 className="col-span-2 flex justify-between">
                <span>
                  {" "}
                  {selectedCustomer?.balance + totalPaid < 0
                    ? `${formTrans("receivable")}`
                    : `${formTrans("payable")}`}
                  :
                </span>{" "}
                <span>
                  {Math.abs(selectedCustomer?.balance + totalPaid).toFixed(2)}
                </span>
              </h1>
            )}
          {selectedTransactionType?.value === "Debit" &&
            currentBalance !== false && (
              <h1 className={`col-span-2 flex justify-between`}>
                <span>
                  {" "}
                  {Number(selectedCustomer?.balance || 0) -
                    Number(totalPaid || 0) <
                  0
                    ? `${formTrans("receivable")}`
                    : `${formTrans("payable")}`}{" "}
                  :
                </span>{" "}
                <span>
                  {Math.abs(
                    Number(selectedCustomer?.balance || 0) -
                      Number(totalPaid || 0),
                  ).toFixed(2)}
                </span>
              </h1>
            )}

          <div className="flex-1 col-span-2">
            <label className="block mb-2 font-medium">
              {formTrans("note")}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="global_input min-h-[150px] w-full"
            />
          </div>

          <button
            type="submit"
            disabled={createDiscount && !discountAmount}
            className={` col-span-2 w-full ${
              createDiscount && !discountAmount
                ? "border rounded-full bg-gray-400"
                : "global_button"
            }`}
          >
            {btn("create")}{" "}
            {createDiscount ? `${btn("discount")}` : `${btn("transaction")}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransictionModal;
