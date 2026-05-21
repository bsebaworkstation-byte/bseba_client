import React, { useEffect, useState, useRef } from "react";
import { FaCalendarAlt, FaTag } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ErrorToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { printElement } from "../../Helper/Printer";
import { Link } from "react-router-dom";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  subWeeks,
  subYears,
} from "date-fns";
import { createPortal } from "react-dom";
import api from "../../Helper/axios_resonse_interceptor";

const ExpenseByID = () => {
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [period, setPeriod] = useState("thisMonth");
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(new Date());
  const [expenseData, setExpenseData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const componentRef = useRef();
  const { setGlobalLoader } = loadingStore();

  // Format date with +06:00 offset
  const formatDateWithOffset = (date) => {
    const offset = "+06:00";
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    const ms = String(d.getMilliseconds()).padStart(3, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}.${ms}${offset}`;
  };

  // Fetch Expense Types
  const fetchExpenseTypes = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/GetExpenseTypes`);
      if (res.data.status === "Success") setExpenseTypes(res.data.data || []);
    } catch {
    } finally {
      setGlobalLoader(false);
    }
  };

  // Fetch Expenses by type + date
  const fetchExpenses = async () => {
    if (!selectedType) return;
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/GetExpenseByDateID/${formatDateWithOffset(
          startDate
        )}/${formatDateWithOffset(endDate)}/${selectedType}`
      );
      if (res.data.status === "Success") {
        setExpenseData(res.data.data || []);
        const total = (res.data.data || []).reduce(
          (sum, item) => sum + parseFloat(item.amount || 0),
          0
        );
        setTotalAmount(total);
      } else {
        setExpenseData([]);
        setTotalAmount(0);
      }
    } catch {
      ErrorToast("Failed to fetch expenses");
      setExpenseData([]);
      setTotalAmount(0);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchExpenseTypes();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [selectedType, startDate, endDate, period]);

  // Handle period change
  const handlePeriodChange = (value) => {
    const now = new Date();
    setPeriod(value);
    switch (value) {
      case "thisWeek":
        setStartDate(startOfWeek(now, { weekStartsOn: 1 }));
        setEndDate(endOfWeek(now, { weekStartsOn: 1 }));
        break;
      case "lastWeek":
        setStartDate(startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }));
        setEndDate(endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }));
        break;
      case "thisMonth":
        setStartDate(startOfMonth(now));
        setEndDate(new Date());
        break;
      case "lastMonth":
        setStartDate(startOfMonth(subMonths(now, 1)));
        setEndDate(endOfMonth(subMonths(now, 1)));
        break;
      case "thisYear":
        setStartDate(startOfYear(now));
        setEndDate(new Date());
        break;
      case "lastYear":
        setStartDate(startOfYear(subYears(now, 1)));
        setEndDate(endOfYear(subYears(now, 1)));
        break;
      case "custom":
        setStartDate(now);
        setEndDate(now);
        break;
      default:
        setStartDate(now);
        setEndDate(now);
        break;
    }
  };

  const formatDisplayDate = (date) => {
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return date;
    }
  };

  return (
    <div className="global_container">
      <div className="global_sub_container">
        <h2 className="text-xl font-semibold mb-3">Expense By Type</h2>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Expense Type */}
          <div className="flex flex-col w-full md:w-1/4">
            <label className="font-medium mb-1 flex items-center">
              <FaTag className="mr-2 text-green-600" /> Expense Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="global_dropdown w-full"
            >
              <option value="">Select Expense Type</option>
              {expenseTypes.map((exp) => (
                <option key={exp._id} value={exp._id}>
                  {exp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Period */}
          <div className="flex flex-col w-full md:w-1/4">
            <label className="font-medium mb-1">Period</label>
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="global_dropdown w-full"
            >
              <option value="thisWeek">This Week</option>
              <option value="lastWeek">Last Week</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">This Year</option>
              <option value="lastYear">Last Year</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="flex flex-col w-full md:w-1/4">
            <label className="font-medium mb-1 flex items-center">
              <FaCalendarAlt className="mr-2 text-green-600" /> Start Date
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd-MM-yyyy"
              className="global_input w-full pl-10"
              popperPlacement="bottom-start"
              popperClassName="z-[9999]"
              calendarClassName="react-datepicker-custom"
              popperContainer={(props) =>
                createPortal(<div {...props} />, document.body)
              }
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col w-full md:w-1/4">
            <label className="font-medium mb-1 flex items-center">
              <FaCalendarAlt className="mr-2 text-green-600" /> End Date
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd-MM-yyyy"
              className="global_input w-full pl-10"
              popperPlacement="bottom-start"
              popperClassName="z-[9999]"
              calendarClassName="react-datepicker-custom"
              popperContainer={(props) =>
                createPortal(<div {...props} />, document.body)
              }
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="global_sub_container mt-5">
        <table ref={componentRef} className="global_table">
          <thead className="global_thead">
            <tr>
              <th className="global_th">Expense Type</th>
              <th className="global_th">Amount</th>
              <th className="global_th">Note</th>
              <th className="global_th">Date</th>
                <th className="global_th">Action</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {expenseData.length > 0 ? (
              expenseData.map((item) => (
                <tr key={item._id} className="global_tr">
                  <td className="global_td">{item.typeName || "-"}</td>
                  <td className="global_td">
                    {parseFloat(item.amount).toFixed(2)}
                  </td>
                  <td className="global_td">{item.note || "-"}</td>

                  <td className="global_td">
                    {new Date(item.CreatedDate)
                      .toLocaleDateString("en-GB")
                      .replace(/\//g, "-")}
                  </td>
                  <td className="global_td" >
                    <button>
                      <Link
                        to={`/ExpenseDetails/${item._id}`}
                        className="global_button"
                      >
                        View
                      </Link>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-center" colSpan={4}>
                  No expenses available
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-green-100 dark:bg-gray-800 font-semibold">
            <tr>
              <td className="p-2 dark:text-white ">Total</td>
              <td className="p-2 text-red-600">{totalAmount.toFixed(2)}</td>
              <td></td>
              <td></td>
               <td></td>
            </tr>
          </tfoot>
        </table>

        <div className="text-center mt-5">
          <button
            onClick={() => printElement(componentRef, "Expense Report")}
            className="global_button w-60"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseByID;
