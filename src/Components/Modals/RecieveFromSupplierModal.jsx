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

const RecieveFromSupplierModal = ({ open, setOpen, data, reload }) => {
  const { setGlobalLoader } = loadingStore();
  const [accounts, setAccounts] = useState([]);
  const [note, setNote] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [createdDate, setCreatedDate] = useState(new Date());
  const [warranty, setWarranty] = useState("");
  const [serialNo, setSerialNo] = useState();
  const [products, setProducts] = useState([]);
  const [searchProductKeyword, setSearchProductKeyword] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  // Fetch products
  const fetchProducts = async (keyword = 0) => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/ProductList/1/20/${keyword}`);
      if (res.data.status === "Success") {
        const formatted = res.data.data.map((p) => ({
          value: p._id,
          label: `${p.name} (${p.Brands.name}) (${p.Categories.name}) (${p.qty})`,
          ...p,
        }));

        const filtered = formatted.filter((p) => p.manageStock !== 0);
        setProducts(filtered);
      }
    } catch (error) {
      ErrorToast("Failed to load products");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    const keyword =
      searchProductKeyword.trim() === "" ? 0 : searchProductKeyword;
    fetchProducts(keyword);
  }, [searchProductKeyword]);
  // Fetch products
  const fetchSerial = async (keyword) => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/Serial/${keyword}`);
      if (res.data.status === "Success") {
        toast.error(`Serial - ${keyword} Already exist, try another`);
        return true;
      } else {
        return false;
      }
    } catch (error) {
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
    if (!serialNo) return;

    const timer = setTimeout(async () => {
      const isExist = await fetchSerial(serialNo);

      if (isExist) {
        toast.error(`Serial ${serialNo} already exists`);
      }
    }, 1000); // ⏱ 1 second delay

    return () => clearTimeout(timer); // 🧹 user আবার টাইপ করলে আগের timer cancel
  }, [serialNo]);

  const totalPaid = useMemo(
    () => selectedAccounts.reduce((total, a) => total + (a.amount || 0), 0),
    [selectedAccounts],
  );

  const getRemainingWarranty = (purchaseDate, warrantyDays) => {
    if (!purchaseDate || !warrantyDays) return 0;

    const start = new Date(purchaseDate);
    const today = new Date();

    const diffTime = today - start; // milliseconds
    const passedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const remaining = warrantyDays - passedDays;

    return remaining > 0 ? remaining : 0;
  };
  const handleValidateSerial = async (serial) => {
    if (!serial) return;

    const isExist = await fetchSerial(serial); // API call

    if (isExist === true) {
      toast.error(`Serial ${serial} already exists`);
      setSerialNo(""); // ❌ invalid হলে input clear
      return false;
    }

    return true; // ✅ valid
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedProduct && !serialNo) {
      return toast.error("Serial Number Must give");
    }
    if (serialNo) {
      const isSerialValid = await handleValidateSerial(serialNo);
      if (!isSerialValid) {
        return;
      }
    }

    const formattedAccount = selectedAccounts.map((a) => ({
      accountID: a.value,
      accountName: a.name,
      amount: a.amount,
    }));
    const payload = {
      Note: note,
      serialNo: data?.serialNo,
      ...(serialNo ? { NewserialNo: serialNo } : {}),
      ...(warranty ? { warranty: warranty } : {}),
      ...(selectedProduct
        ? {
            NewProductID: selectedProduct.value,
            NewProduct: selectedProduct.name,
          }
        : {}),
      ReceivedInDate: createdDate,
      payment: formattedAccount,
      ID: data._id,
    };

    try {
      setGlobalLoader(true);
      const res = await api.post(`/ReceivedinWarranty`, payload);

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
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Cost :
                <span className="ml-2 font-medium text-gray-800 dark:text-gray-100">
                  {data?.Cost || 0}
                </span>
              </p>

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
            {/* Warranty */}
            {/* <div className="">
              <label className="block text-sm font-medium mt-1 mb-1">
                Warranty
              </label>

              <input
                type="number"
                value={warranty}
                className="global_input"
                onChange={(e) => {
                  setWarranty(e.target.value);
                }}
              />
            </div> */}
            {/* OLD Serial */}
            <div className="">
              <label className="block text-sm font-medium mt-1 mb-1">
                Old Serial No
              </label>

              <input
                type="text"
                className="global_input"
                value={data?.serialNo}
                disabled
              />
            </div>
            {/* Serial No */}
            <div className="">
              <label className="block text-sm font-medium mt-1 mb-1">
                New Serial No
              </label>

              <input
                type="text"
                className="global_input"
                value={serialNo}
                onChange={(e) => {
                  setSerialNo(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleValidateSerial(e.target.value);
                  }
                }}
              />
            </div>
          </div>
          {/* Product*/}
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">
              New Product
            </label>

            <Select
              options={products}
              onChange={(p) => {
                setSelectedProduct(p);
              }}
              placeholder="Select Product"
              classNamePrefix="react-select"
              onInputChange={(val) => setSearchProductKeyword(val)}
              menuPortalTarget={document.body}
              styles={getReactSelectStyles()}
              isClearable
            />
          </div>
          {/* Paid Amount With Multiple Bank Account*/}
          <div className="flex justify-end items-end mt-5 col-span-full">
            <h1>Cost</h1>
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

          <button type="submit" className="global_button col-span-2 w-full">
            Recieve In
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecieveFromSupplierModal;
