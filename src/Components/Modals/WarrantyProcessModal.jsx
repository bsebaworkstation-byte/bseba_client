import { useEffect, useMemo, useState } from "react";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import Select from "react-select";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import { IoMdCloseCircle } from "react-icons/io";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";

const WarrantyProcessModal = ({ open, setOpen, id, reload }) => {
  const { setGlobalLoader } = loadingStore();
  const [accounts, setAccounts] = useState([]);
  const [note, setNote] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [createdDate, setCreatedDate] = useState(new Date());

  // language translator
  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);
  const formTrans = useTextTranslate(GlobalFormTranslator);


  useEffect(() => {
    (async () => {
      if (open) {
        document.body.classList.add("overflow-hidden");
        await fetchAllAccounts();
      } else {
        document.body.classList.remove("overflow-hidden");
      }
    })();
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]);

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

  const totalPaid = useMemo(
    () => selectedAccounts.reduce((total, a) => total + (a.amount || 0), 0),
    [selectedAccounts],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedAccount = selectedAccounts.map((a) => ({
      accountID: a.value,
      accountName: a.name,
      amount: a.amount,
    }));
    const payload = {
      Note: note,
      SendDate: createdDate,
      payment: formattedAccount,
      ID: id,
    };

    try {
      setGlobalLoader(true);
      const res = await api.post(`/SendWarranty`, payload);

      if (res.data.status === "Success") {
        toast.success(res.data.message);
        reload();
        setOpen(false);
      } else {
        ErrorToast(res.data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");

      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  if (!open) return null;

  return (
    <div
      onClick={() => {
        setOpen(false);
      }}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center overflow-y-auto pt-10 px-3"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-black dark:text-white dark:bg-[#1E2939] p-6 rounded-lg w-full sm:w-[90%] max-w-2xl max-h-[90vh] min-h-[70vh] overflow-y-auto shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <button className="global_button_red" onClick={() => setOpen(false)}>
            {btn("close")}
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-3"
        >
          <div className="col-span-1 flex items-center">
            {/* Date */}
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
          </div>
          {/* Paid Amount With Multiple Bank Account*/}
          <div className="flex justify-end items-end mt-5">
            <h1>{formTrans("cost")}</h1>
          </div>
          <div className="flex flex-col gap-2 col-span-2">
            {selectedAccounts.map((account, index) => {
              return (
                <div className="flex justify-between" key={index}>
                  <div className="flex items-center w-full justify-between">
                    <h1 className="text-nowrap">{formTrans("cost")} From - {account.label}</h1>
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
                      handleAccountAmountChange(account.value, e.target.value)
                    }
                    className="global_input w-100 rounded-sm text-right"
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

          <div className="flex-1 col-span-2">
            <label className="block mb-2 font-medium">{formTrans("note")}</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="global_input min-h-[150px] w-full"
            />
          </div>

          <button type="submit" className="global_button col-span-2 w-full">
            {btn("sendWarranty")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WarrantyProcessModal;
