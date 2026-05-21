import React, { useEffect, useState } from "react";
import api from "../../Helper/axios_resonse_interceptor";
import Select from "react-select";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";


export default function BalanceTransfer() {
  const [allAccount, setAllAccount] = useState([]);
  const [selectedTo, setSelectedTo] = useState(null);
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const fetchAllAccount = async () => {
    try {
      const { data } = await api.get("/AllAccount");
      if (data.status === "Success") {
        setAllAccount(data.data || []);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load accounts!");
    }
  };

  useEffect(() => {
    fetchAllAccount();
  }, []);
  const accountOptions = allAccount.map((acc) => ({
    value: acc._id,
    label: `${acc.name} (Balance: ${acc.balance || 0})`,
    balance: acc.balance || 0,
  }));

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (val === "" || Number(val) > 0) {
      setAmount(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFrom || !selectedTo || !amount) {
      return toast.warn("Please fill all fields!");
    }
    if (selectedFrom.balance <= 0) {
      return toast.error("Insufficient balance in source account!");
    }
    if (Number(amount) > selectedFrom.balance) {
      return toast.error("Transfer amount exceeds available balance!");
    }
    if (selectedFrom.value === selectedTo.value) {
      return toast.error("Cannot transfer to the same account!");
    }

    const payload = {
      To: selectedTo.value,
      From: selectedFrom.value,
      Amount: Number(amount),
      note: note,
    };

    try {
      setLoading(true);
      const { data } = await api.post("/AccountBalanceTransfer", payload);

      if (data.status === "Success") {
        toast.success("Balance Transferred Successfully!");
        // State Reset
        setSelectedTo(null);
        setSelectedFrom(null);
        setAmount("");
        setNote("");
        fetchAllAccount();
      } else {
        toast.error(data.message || "Transaction failed!");
      }
    } catch (error) {
      toast.error(error.message || "Server error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="global_container">
      <h4 className="font-semibold text-lg pb-4">Balance transfer</h4>

      <form onSubmit={handleSubmit} className="global_sub_container">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* From Account (Source) */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              From Account (Source)
            </label>
            <Select
              options={accountOptions}
              value={selectedFrom}
              onChange={(option) => setSelectedFrom(option)}
              placeholder="Select source account"
              classNamePrefix="react-select"
              styles={getReactSelectStyles()}
              // Logic: 0 balance hole ba "To"-te select thakle disable hobe
              isOptionDisabled={(option) =>
                option.balance <= 0 || option.value === selectedTo?.value
              }
            />
            {selectedFrom && (
              <span className="text-xs text-green-600">
                Available: {selectedFrom.balance}
              </span>
            )}
          </div>

          {/* To Account (Destination) */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              To Account (Destination)
            </label>
            <Select
              options={accountOptions}
              value={selectedTo}
              onChange={(option) => setSelectedTo(option)}
              placeholder="Select destination account"
              classNamePrefix="react-select"
              styles={getReactSelectStyles()}
              // Logic: "From"-e jeta select kora seta ekhane disable thakbe
              isOptionDisabled={(option) =>
                option.value === selectedFrom?.value
              }
            />
          </div>

          {/* Amount Field */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              onKeyDown={(e) =>
                ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
              }
              placeholder="Enter amount"
              className={`  rounded-4xl outline-0 p-1 text-right ${amount > 0 ? "border-2 border-green-500" : " border-red-500 border"}`}
              min="1"
              required
            />
          </div>

          {/* Note Field */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="notes..."
              className="global_input"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`global_button transition-all ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Processing..." : "Transfer Now"}
          </button>
        </div>
      </form>

      <div className="global_sub_container">
        <h4 className="font-semibold pb-4">All Accounts</h4>
        <div className="w-full overflow-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">#</th>
                <th className="global_th">Name</th>
                <th className="global_th">Balance</th>
                <th className="global_th">Action</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {allAccount.map((item, index) => (
                <tr className="global_tr" key={index}>
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">{item?.name || "N/A"}</td>
                  <td className="global_td">{formatNumber(item?.balance)}</td>
                  <td className="global_td">
                    <Link
                      to={`/BalanceTransferReport/${item._id}`}
                      className="global_button"
                    >
                      Balance Transfer Report
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="global_tr">
                <td colSpan={2} className="text-green-600 global_td">
                  Total
                </td>
                <td className="global_td text-green-600 font-bold">
                  {allAccount
                    .reduce((acc, item) => acc + Number(item.balance || 0), 0)
                    .toLocaleString("en-in", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </td>
                <td className="global_td"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
