import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../Helper/axios_resonse_interceptor";
import loadingStore from "../../Zustand/LoadingStore";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import Select from "react-select";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import { IoMdCloseCircle } from "react-icons/io";

export default function RecievedWarranty() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { setGlobalLoader } = loadingStore();
  const [serialDetails, setSerialDetails] = useState({});
  const [accounts, setAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [charge, setCharge] = useState(0);
  const [note, setNote] = useState("");

  const fetchSerialDetails = async () => {
    setGlobalLoader(true);
    try {
      const { data } = await api.get(`/SerialDetailsById/${id}`);
      if (data.status === "Success") {
        setSerialDetails(data.data || {});
      }
    } catch (error) {
      console.log(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const fetchAllAccounts = async () => {
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
          setSelectedAccounts([defaultAccount]);
          setAccounts(
            formatted.filter((a) => a.value !== defaultAccount.value)
          );
        } else {
          setAccounts(formatted);
        }
      }
    } catch (error) {
      ErrorToast("Failed to load accounts");
    }
  };

  useEffect(() => {
    fetchSerialDetails();
    fetchAllAccounts();
  }, [id]);

  const selectAccounts = (account) => {
    setSelectedAccounts((prev) => [...prev, { ...account, amount: 0 }]);
    setAccounts((prev) => prev.filter((a) => a.value !== account.value));
  };

  const unselectAccount = (account) => {
    setSelectedAccounts((prev) =>
      prev.filter((a) => a.value !== account.value)
    );
    setAccounts((prev) => [...prev, account]);
  };

  const handleAccountAmountChange = (accountId, value) => {
    const newVal = value === "" ? 0 : Number(value);
    setSelectedAccounts((prev) =>
      prev.map((acc) =>
        acc.value === accountId ? { ...acc, amount: newVal } : acc
      )
    );
  };

  const totalAmount = selectedAccounts.reduce(
    (sum, acc) => sum + acc.amount,
    0
  );

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (val === "" || Number(val) > 0) {
      setAmount(val);
    }
  };

  const handleSubmit = async () => {
    const payload = {
      ProductID: serialDetails.ProductID,
      Product: serialDetails.ProductName,
      PurchaseID: serialDetails.PurchaseID,
      SalesID: serialDetails.SalesID,
      serialID: serialDetails._id,
      SalesContactName: serialDetails.SalesContactName || "",
      SaleMobile: serialDetails.SaleMobile || "",
      PurchaseContactName: serialDetails.PurchaseContactName || "",
      PurchaseAddress: serialDetails.PurchaseAddress || "",
      PurchaseMobile: serialDetails.PurchaseMobile || "",
      PurchaseDate: serialDetails.PurchaseCreatedDate || "",
      SalesDate: serialDetails.SalesCreatedDate,
      PurchaseWarranty: serialDetails.PurchaseWarranty || "",
      SaleWarranty: serialDetails.SaleWarranty || "",
      Charge: Number(charge),
      Paid: totalAmount,
      serialNo: serialDetails.serialNo,
      Note: note,
      payment: selectedAccounts.map((a) => ({
        accountID: a.value,
        accountName: a.label,
        amount: a.amount,
      })),
    };

    try {
      setGlobalLoader(true);
      const res = await api.post("/ReceivedWarranty", payload);
      if (res.data.status === "Success") {
        SuccessToast("Warranty Received Successfully");
        navigate("/RMA");
      }
    } catch (error) {
      ErrorToast(error.message || "Failed received warranty");
    } finally {
      setGlobalLoader(false);
    }
  };

  const getRemainingDays = (startDate, totalWarrantyDays) => {
    if (!startDate || !totalWarrantyDays) return 0;

    const start = new Date(startDate);
    const today = new Date();

    // কতদিন অতিবাহিত হয়েছে তা বের করা
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // অবশিষ্ট দিন = মোট ওয়ারেন্টি - অতিবাহিত দিন
    const remaining = totalWarrantyDays - diffDays;

    return remaining > 0 ? remaining : 0; // ওয়ারেন্টি শেষ হয়ে গেলে ০ দেখাবে
  };

  return (
    <div className="global_container">
      <h4 className="font-semibold mb-2">Create Received Warranty</h4>

      {/* Serial Details Section */}
      <div className="global_sub_container mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {/* Product Summary Card - No Change Needed */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-lg">Product Summary</h4>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wider">
                  Name
                </span>
                <p className="font-medium">{serialDetails.ProductName}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex flex-col">
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Sales Price
                  </span>
                  <span className="text-green-600 font-bold text-lg">
                    {serialDetails.SalesPrice}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Serial No
                  </span>
                  <span className="text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded text-sm">
                    {serialDetails.serialNo}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-lg">Supplier Details</h4>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider">
                  Supplier
                </span>
                <p className="font-medium mt-1">
                  {serialDetails.PurchaseContactName}
                </p>
                <span className="text-green-700 font-medium">
                  Warranty: {serialDetails?.PurchaseWarranty}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Purchase Date
                  </span>
                  <p className="font-medium mt-1">
                    {serialDetails.PurchaseCreatedDate?.split("T")[0]}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Remaining Days
                  </span>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 mt-1">
                    <span className="text-blue-700 font-medium">
                      {getRemainingDays(
                        serialDetails.PurchaseCreatedDate,
                        serialDetails.PurchaseWarranty
                      )}{" "}
                      Days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-lg">Customer Details</h4>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider">
                  Customer Name
                </span>
                <p className="font-medium mt-1">
                  {serialDetails.SalesContactName}
                </p>
                <span className="text-green-700 font-medium">
                  Warranty: {serialDetails?.PurchaseWarranty}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Sales Date
                  </span>
                  <p className="font-medium mt-1">
                    {serialDetails.SalesCreatedDate?.split("T")[0]}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Remaining Days
                  </span>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 mt-1">
                    <span className="text-green-700 font-medium">
                      {getRemainingDays(
                        serialDetails.SalesCreatedDate,
                        serialDetails.SaleWarranty
                      )}{" "}
                      Days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="global_sub_container">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          {/* Note Section */}
          <div className="flex-1">
            <label className="font-semibold text-sm pb-0.5 block">Note</label>
            <textarea
              rows={5}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write warranty details or notes..."
              className="global_input"
            ></textarea>
          </div>

          {/* Payment Section */}
          <div className="flex-1 border border-gray-300 p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
            <div className="flex justify-between items-center gap-2 mb-4">
              <label className="font-bold text-sm">Charge:</label>
              <input
                value={charge === 0 ? "" : charge} // 0 thakle blank dekhabe
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || Number(val) >= 0) {
                    setCharge(val === "" ? 0 : Number(val));
                  }
                }}
                onKeyDown={(e) =>
                  ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                }
                className="global_input w-32 text-right text-red-600"
                type="number"
                placeholder="charge"
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm border-b pb-1">
                Payment Method
              </h4>
              {selectedAccounts.map((account, index) => (
                <div className="flex items-center gap-2" key={index}>
                  <div className="flex-1 flex justify-between items-center ">
                    <span className="text-sm font-medium">{account.label}</span>
                    {selectedAccounts.length > 1 && (
                      <button onClick={() => unselectAccount(account)}>
                        <IoMdCloseCircle
                          size={18}
                          className="text-red-500 hover:text-red-700"
                        />
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    value={account.amount || ""}
                    onChange={(e) =>
                      handleAccountAmountChange(account.value, e.target.value)
                    }
                    // onChange={(e) => {
                    //   const val = e.target.value;
                    //   if (val === "" || Number(val) >= 0) {
                    //     handleAccountAmountChange(val === "" ? 0 : Number(val));
                    //   }
                    // }}
                    // onKeyDown={(e) =>
                    //   ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                    // }
                     className={`  rounded-4xl outline-0 w-32 p-1 text-right ${account.amount > 0 ? "border-2 border-green-500" : " border-red-500 border"}`}
                    placeholder="Amount"
                  />
                </div>
              ))}

              {accounts.length > 0 && (
                <div className="mt-3">
                  <Select
                    options={accounts}
                    value={null}
                    onChange={selectAccounts}
                    placeholder="Add Payment Account..."
                    classNamePrefix="react-select"
                    styles={getReactSelectStyles()}
                  />
                </div>
              )}

              <div className="pt-3 border-t flex justify-between font-bold text-sm">
                <span>Total Paid:</span>
                <span className="text-green-600">{totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="global_button w-full md:w-40"
          >
            Confirm Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
