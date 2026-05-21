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
import { formatDate } from "../../Helper/utils";

const DeliveryWarrantyModal = ({ open, setOpen, data, reload }) => {
  const { setGlobalLoader } = loadingStore();
  const [accounts, setAccounts] = useState([]);
  const [note, setNote] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [createdDate, setCreatedDate] = useState(new Date());

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

  const getRemainingWarranty = (purchaseDate, warrantyDays) => {
    if (!purchaseDate || !warrantyDays) return 0;

    const start = new Date(purchaseDate);
    const today = new Date();

    const diffTime = today - start; // milliseconds
    const passedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const remaining = warrantyDays - passedDays;

    return remaining > 0 ? remaining : 0;
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
      ReceiDeliveryDate: createdDate,
      payment: formattedAccount,
      ID: data._id,
      ...(data?.NewserialNo
        ? {
            NewProductID: data?.NewProductID,
            NewProduct: data?.NewProduct,
            NewserialNo: data?.NewserialNo,
          }
        : {}),
    };

    try {
      setGlobalLoader(true);
      const res = await api.post(`/DeliveryWarranty`, payload);

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
            Close
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Purchase */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700 max-w-xl">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Purchase From
            </h1>

            <p className="text-base font-medium text-indigo-600 dark:text-indigo-400">
              {data?.PurchaseContactName}
            </p>

            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Purchase Date:
                <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                  {formatDate(data?.PurchaseDate)}
                </span>
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                Warranty:
                <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                  {data?.PurchaseWarranty || 0} Days
                </span>
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                Remaining:
                <span
                  className={`ml-2 font-semibold ${
                    getRemainingWarranty(
                      data?.PurchaseDate,
                      data?.PurchaseWarranty,
                    ) > 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {getRemainingWarranty(
                    data?.PurchaseDate,
                    data?.PurchaseWarranty,
                  ) || 0}{" "}
                  Days
                </span>
              </p>
            </div>
          </div>
          {/* Sale */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700 max-w-xl">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Sale On
            </h1>

            <p className="text-base font-medium text-indigo-600 dark:text-indigo-400">
              {data?.SalesContactName}
            </p>

            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Sale Date:
                <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                  {formatDate(data?.SalesDate)}
                </span>
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                Warranty:
                <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                  {data?.SaleWarranty || 0} Days
                </span>
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                Remaining:
                <span
                  className={`ml-2 font-semibold ${
                    getRemainingWarranty(data?.SalesDate, data?.SaleWarranty) >
                    0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {getRemainingWarranty(data?.SalesDate, data?.SaleWarranty) ||
                    0}{" "}
                  Days
                </span>
              </p>
            </div>
          </div>
          {/* Charge */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700 max-w-xl">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Charges
            </h1>
            <p className="text-base font-medium text-indigo-600 dark:text-indigo-400">
              Charge {data?.Charge}
            </p>{" "}
            <div className="mt-4 space-y-2">
              {data?.Cost >= data?.Charge && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Cost :
                  <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                    {data?.Cost || 0}
                  </span>
                </p>
              )}

              <p className="text-sm text-gray-600 dark:text-gray-300">
                Paid :
                <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                  {data?.Paid || 0}
                </span>
              </p>
              <p className="text-sm text-red-600">
                Due :
                <span className="ml-2 font-medium ">
                  {data?.Charge - data?.Paid || 0}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="py-5 space-y-3">
          {!!data?.NewProduct && (
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
              <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                New Product Name :
                <span className="ml-2 text-blue-600 dark:text-blue-400 font-bold">
                  {data?.NewProduct}
                </span>
              </h1>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-gray-400"></span>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Old Serial No :
              <span className="ml-2 text-gray-700 dark:text-gray-300 font-medium">
                {data?.serialNo}
              </span>
            </h1>
          </div>

          {!!data?.NewserialNo && (
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
              <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                New Serial No :
                <span className="ml-2 text-green-600 dark:text-green-400 font-bold">
                  {data?.NewserialNo}
                </span>
              </h1>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-3"
        >
          <div className="col-span-full flex items-center gap-5">
            {/* Date */}
            <div className="">
              <label className="block text-sm font-medium mt-1 mb-1">
                Select Date
              </label>
              <div className="relative w-full">
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
          <div className="flex justify-end items-end mt-5 col-span-full">
            <h1>Charge Received</h1>
          </div>
          <div className="flex flex-col gap-2 col-span-2">
            {selectedAccounts.map((account, index) => {
              return (
                <div className="flex justify-between" key={index}>
                  <div className="flex items-center w-full justify-between">
                    <h1 className="text-nowrap">{account.label}</h1>
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
            <label className="block mb-2 font-medium">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="global_input min-h-[50px] w-full"
            />
          </div>
          {data?.Charge - data?.Paid <= totalPaid && (
            <button type="submit" className="global_button col-span-2 w-full">
              Delivery
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default DeliveryWarrantyModal;
