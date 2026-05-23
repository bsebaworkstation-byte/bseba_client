import {
  formatISO,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subWeeks,
  subMonths,
  subYears,
} from "date-fns";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import { IoMdCloseCircle } from "react-icons/io";
import TimeAgo from "../../Helper/UI/TimeAgo";
import { formatDate } from "../../Helper/utils";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import Select from "react-select";
import {
  ConfirmToast,
  ErrorToast,
  SuccessToast,
} from "../../Helper/FormHelper";
import { formatCurrency } from "../../Helper/formatCurrency";

const MemberReport = () => {
  const { id } = useParams();
  const filters = [
    { value: "custom", label: "Custom" },
    { value: "last30days", label: "Last 30 Days" },
    { value: "thisWeek", label: "This Week" },
    { value: "lastWeek", label: "Last Week" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "thisYear", label: "This Year" },
    { value: "lastYear", label: "Last Year" },
  ];
  const [stuff, setStuff] = useState(null);
  const [salaryPayments, setSalaryPayments] = useState([]);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [reportSummary, setReportSummary] = useState(null);
  const [Filter, setFilter] = useState("thisMonth");
  const [giveSalaryDate, setGiveSalaryDate] = useState(new Date());
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [accounts, setAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const { setGlobalLoader } = loadingStore();
  const [note, setNote] = useState("");
  const fetchSalaryReport = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/SalaryReport/${formatISO(startDate)}/${formatISO(endDate)}/${id}`,
      );
      if (res.data.status === "Success") {
        setStuff({
          name: res.data.staffName,
          mobile: res.data.staffMobile,
          balance: res.data.staffBalance,
          salary: res.data.staffSalary,
        });
        setReportSummary({
          totalPayments: res.data.totalPayments ?? 0,
          totalSalaryRecords: res.data.totalSalaryRecords ?? 0,
          totalPaid: res.data.totalPaid ?? 0,
          totalSalaryAssigned: res.data.totalSalaryAssigned ?? 0,
        });
        setSalaryPayments(res.data.data?.salaryPayments || []);
        setSalaryHistory(res.data.data?.salaryHistory || []);
      } else {
        ErrorToast("Failed to fetch Members");
      }
    } catch (err) {
      console.error(err);
      ErrorToast("Something went wrong while fetching Members");
    } finally {
      setGlobalLoader(false);
    }
  };

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

  const getDateRange = (selectedFilter) => {
    const today = new Date();
    switch (selectedFilter) {
      case "last30days":
        return { start: subDays(today, 30), end: today };
      case "thisWeek":
        return {
          start: startOfWeek(today, { weekStartsOn: 1 }),
          end: endOfWeek(today, { weekStartsOn: 1 }),
        };
      case "lastWeek": {
        const lastWeek = subWeeks(today, 1);
        return {
          start: startOfWeek(lastWeek, { weekStartsOn: 1 }),
          end: endOfWeek(lastWeek, { weekStartsOn: 1 }),
        };
      }
      case "thisMonth":
        return { start: startOfMonth(today), end: endOfMonth(today) };
      case "lastMonth": {
        const lastMonth = subMonths(today, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      }
      case "thisYear":
        return { start: startOfYear(today), end: endOfYear(today) };
      case "lastYear": {
        const lastYear = subYears(today, 1);
        return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
      }
      default:
        return { start: subDays(today, 30), end: today };
    }
  };

  useEffect(() => {
    fetchAllAccounts();
  }, []);

  useEffect(() => {
    if (Filter !== "custom") {
      const { start, end } = getDateRange(Filter);
      setStartDate(start);
      setEndDate(end);
    }
  }, [Filter]);

  useEffect(() => {
    fetchSalaryReport();
  }, [startDate, endDate]);

  const totalAmount = useMemo(
    () => selectedAccounts.reduce((acc, a) => acc + (a.amount || 0), 0),
    [selectedAccounts],
  );

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

  // Submit purchase
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      Salary: {
        salary: totalAmount,
        staffID: id,
        CreatedDate: giveSalaryDate,
        note: note,
      },
      payment: selectedAccounts.map((a) => ({
        accountID: a.value,
        accountName: a.name,
        amount: a.amount,
      })),
    };

    try {
      setGlobalLoader(true);
      const res = await api.post(`/AddSalary`, payload);

      if (res.data.status === "Success") {
        SuccessToast("Salary Has Given Successfully");
        setNote("");
        setSelectedAccounts([]);
        fetchAllAccounts();
        fetchSalaryReport();
      } else {
        ErrorToast(res.data.message || "Failed to create purchase");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const handleDeleteSalaryPayment = async (paymentId) => {
    const confirmed = await ConfirmToast(
      "Are you sure you want to delete this salary payment?",
      "Delete Salary Payment",
    );
    if (!confirmed) return;

    setGlobalLoader(true);
    try {
      const res = await api.get(`/DeleteSalary/${paymentId}`);
      if (res.data.status === "Success") {
        SuccessToast(res.data.message || "Salary payment deleted successfully");
        fetchSalaryReport();
      } else {
        ErrorToast(res.data.message || "Failed to delete salary payment");
      }
    } catch (error) {
      ErrorToast(
        error.response?.data?.message || "Failed to delete salary payment",
      );
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div>
      {/* Staff Information Card */}
      {stuff && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
            Staff Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Name */}
            {stuff.name && (
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Name
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {stuff.name}
                </span>
              </div>
            )}

            {/* Mobile */}
            {stuff.mobile && (
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Mobile
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {stuff.mobile}
                </span>
              </div>
            )}

            {/* Salary */}
            {stuff.salary != null && (
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Monthly Salary
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(Number(stuff.salary))}
                </span>
              </div>
            )}

            {/* Balance */}
            {stuff.balance != null && (
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Balance
                </span>
                <span
                  className={`font-medium ${
                    Number(stuff.balance) < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {formatCurrency(Math.abs(Number(stuff.balance)))}
                </span>
              </div>
            )}

            {reportSummary && (
              <>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Total Assigned
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(Number(reportSummary.totalSalaryAssigned))}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Total Paid
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {formatCurrency(Number(reportSummary.totalPaid))}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <div className="global_sub_container">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-5 gap-4"
        >
          {/* Date */}
          <div className="flex flex-col col-span-1">
            <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Date
            </label>
            <DatePicker
              selected={giveSalaryDate}
              onChange={(date) => setGiveSalaryDate(date)}
              dateFormat="dd-MM-yyyy"
              className="global_input w-full"
            />
          </div>
          {/* Note */}
          <div className="flex flex-col col-span-1">
            <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Note
            </label>
            <textarea
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="global_input"
              placeholder="Add note here"
              rows="2"
            />
          </div>
          {/* Paid Amount With Multiple Bank Account */}
          <div className="flex flex-col gap-1 lg:col-span-2">
            <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment Option
            </label>
            <div className="space-y-2">
              {selectedAccounts.map((account, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Payment By - {account.label}
                    </span>
                    {selectedAccounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => unselectAccount(account)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <IoMdCloseCircle size={20} />
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
                    className="global_input w-32 text-right"
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>

            {/* Add More Account */}
            {accounts?.length > 0 && (
              <div className="max-w-xs">
                <Select
                  options={accounts}
                  value={null}
                  onChange={(account) => selectAccounts(account)}
                  placeholder="Select More Account"
                  classNamePrefix="react-select"
                  styles={getReactSelectStyles()}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="col-span-1 flex items-center">
            <button type="submit" className="global_button w-full">
              Pay Salary
            </button>
          </div>
        </form>
      </div>
      <div className="global_sub_container">
        {/* Filter */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col w-full">
            <label className="font-medium mb-1">Select Period:</label>
            <select
              className="global_dropdown w-full"
              value={Filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {filters.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col w-full">
            <label className="font-medium mb-1">Start Date:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd-MM-yyyy"
              className="global_input w-full"
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="font-medium mb-1">End Date:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd-MM-yyyy"
              className="global_input w-full"
            />
          </div>
        </div>{" "}
        {/* Salary assignment history */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Salary Assignment ({reportSummary?.totalSalaryRecords ?? 0})
        </h3>
        {salaryHistory.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
            No salary assignment found
          </p>
        ) : (
          <div className="overflow-auto mb-8">
            <table className="global_table w-full">
              <thead className="global_thead">
                <tr>
                  <th className="global_th">#</th>
                  <th className="global_th">Date</th>
                  <th className="global_th">Assigned Salary</th>
                </tr>
              </thead>
              <tbody className="global_tbody">
                {salaryHistory.map((r, i) => (
                  <tr
                    key={r._id || i}
                    className="global_tr bg-gray-100 dark:bg-gray-800"
                  >
                    <td className="global_td">{i + 1}</td>
                    <td className="global_td">
                      {formatDate(r?.CreatedDate)}{" "}
                      <TimeAgo date={r?.CreatedDate} />
                    </td>
                    <td className="global_td font-medium">
                      {formatCurrency(Number(r?.salary || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="global_tr font-semibold bg-gray-50 dark:bg-gray-800/50">
                  <td colSpan={2} className="global_td text-right">
                    Total Assigned
                  </td>
                  <td className="global_td font-medium text-green-600">
                    {formatCurrency(
                      Number(reportSummary?.totalSalaryAssigned || 0),
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        {/* Salary payments */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Salary Payments ({reportSummary?.totalPayments ?? 0})
        </h3>
        {salaryPayments.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No salary payment found
          </p>
        ) : (
          <div className="overflow-auto">
            <table className="global_table w-full">
              <thead className="global_thead">
                <tr>
                  <th className="global_th">#</th>
                  <th className="global_th">Payment Date</th>
                  <th className="global_th">Paid Amount</th>
                  <th className="global_th">Note</th>
                  <th className="global_th">Action</th>
                </tr>
              </thead>
              <tbody className="global_tbody">
                {salaryPayments.map((r, i) => (
                  <tr
                    key={r._id || i}
                    className="global_tr bg-gray-100 dark:bg-gray-800"
                  >
                    <td className="global_td">{i + 1}</td>
                    <td className="global_td">
                      {formatDate(r?.CreatedDate)}{" "}
                      <TimeAgo date={r?.CreatedDate} />
                    </td>
                    <td className="global_td font-medium">
                      {formatCurrency(Number(r?.salary || 0))}
                    </td>
                    <td className="global_td">{r?.note || "-"}</td>
                    <td className="global_td">
                      <button
                        type="button"
                        onClick={() => handleDeleteSalaryPayment(r._id)}
                        className="global_button_red cursor-pointer text-xs px-2 py-1"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="global_tr font-semibold bg-gray-50 dark:bg-gray-800/50">
                  <td colSpan={2} className="global_td text-right">
                    Total Paid
                  </td>
                  <td className="global_td font-medium text-green-600">
                    {formatCurrency(Number(reportSummary?.totalPaid || 0))}
                  </td>
                  <td className="global_td" colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberReport;
