import React, { useEffect, useState } from "react";
import { ErrorToast } from "../../Helper/FormHelper";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import api from "../../Helper/axios_resonse_interceptor";

const ExpenseReport = () => {
  const { setGlobalLoader } = loadingStore();
  const [expenses, setExpenses] = useState([]);
  const [expenseTypeData, setExpenseTypeData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // Fetch Expense Types
  const fetchExpenseTypes = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/GetExpenseTypes`);
      if (res.data?.data) setExpenseTypeData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch expense types:", err);
      ErrorToast("Failed to fetch expense types");
    } finally {
      setGlobalLoader(false);
    }
  };

  // Fetch Expenses by Date Range
  const fetchExpenses = async (start, end) => {
    setGlobalLoader(true);
    if (!start || !end) return;
    try {
      // Format as YYYY-MM-DD
      const startStr = format(start, "yyyy-MM-dd");
      const endStr = format(end, "yyyy-MM-dd");

      const res = await api.get(
        `/GetExpenseByDate/${startStr}/${endStr}`
      );

      if (res.data?.data) setExpenses(res.data.data);
      else setExpenses([]);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
      ErrorToast("Failed to fetch expenses");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    let start, end;

    switch (selectedPeriod) {
      case "thisWeek":
        start = startOfWeek(new Date(), { weekStartsOn: 1 });
        end = endOfWeek(new Date(), { weekStartsOn: 1 });
        break;
      case "thisMonth":
        start = startOfMonth(new Date());
        end = endOfMonth(new Date());
        break;
      case "thisYear":
        start = startOfYear(new Date());
        end = endOfYear(new Date());
        break;
      case "lastMonth":
        start = startOfMonth(subMonths(new Date(), 1));
        end = endOfMonth(subMonths(new Date(), 1));
        break;
      case "lastWeek":
        start = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
        end = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
        break;
      case "lastYear":
        start = startOfYear(subYears(new Date(), 1));
        end = endOfYear(subYears(new Date(), 1));
        break;
      default:
        start = startDate;
        end = endDate;
    }

    fetchExpenses(start, end);
    fetchExpenseTypes();
  }, [startDate, endDate, selectedPeriod]);

  // Totals
  const totalAmount = expenses.reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0
  );
  const totalAmountByType = expenses.reduce((acc, item) => {
    if (!acc[item.typeName]) acc[item.typeName] = 0;
    acc[item.typeName] += parseFloat(item.amount);
    return acc;
  }, {});

  return (
    <div className="global_container">
      <div className="global_sub_container flex flex-col gap-3 justify-between md:flex-row-reverse">
        {/* Start Date */}


        {/* End Date */}
        <div className="flex-1">
          <label className="form-label form-custom-label">End Date</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="dd-MM-yyyy"
            // className="global_input"
            className="global_input pl-10 w-full"
            popperPlacement="bottom-start"
            popperClassName="z-[9999]"
            calendarClassName="react-datepicker-custom"
            popperContainer={(props) =>
              createPortal(<div {...props} />, document.body)
            }
          />
        </div>
        <div className="flex-1">
          <label className="form-label form-custom-label">Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="dd-MM-yyyy"
            className="global_input pl-10 w-full"
            popperPlacement="bottom-start"
            popperClassName="z-[9999]"
            calendarClassName="react-datepicker-custom"
            popperContainer={(props) =>
              createPortal(<div {...props} />, document.body)
            }
          />
        </div>

        {/* Period Select */}
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Period</label>

          <Select
            classNamePrefix="react-select"
            options={[
              { value: "", label: "Custom" },
              { value: "thisWeek", label: "This Week" },
              { value: "thisMonth", label: "This Month" },
              { value: "thisYear", label: "This Year" },
              { value: "lastMonth", label: "Last Month" },
              { value: "lastYear", label: "Last Year" },
            ]}
            onChange={(opt) => setSelectedPeriod(opt?.value || "")}
            isClearable
            placeholder="Select Period"
            menuPortalTarget={document.body}
            styles={getReactSelectStyles()}
          />
        </div>
      </div>
      <div className="global_sub_container">
        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="global_table">
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
              {expenses.length ? (
                expenses.map((item, i) => (
                  <tr className="global_tr" key={i}>
                    {console.log(item)}
                    <td className="global_td">{item.typeName || "N/A"}</td>
                    <td className="global_td">
                      {new Intl.NumberFormat("en-IN").format(item.amount)}
                    </td>
                    <td className="global_td">{item.note}</td>
                    <td className="global_td">
                      {format(new Date(item.CreatedDate), "dd-MM-yyyy")}
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
                  <td
                    colSpan={10}
                    className="text-center py-4 text-gray-500 italic"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td className="global_td">Total Amount:</td>
                <td className="global_td">
                  {new Intl.NumberFormat("en-IN").format(
                    totalAmount.toFixed(2)
                  )}
                </td>
                <td className="global_td"></td>
                <td className="global_td"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Total by Type */}
        {/* Total by Type */}
        <div className="mt-4 overflow-x-auto">
          <h1 className="global_heading">Total Amount by Expense Type</h1>
          <table className="global_table">
            <thead className="global_thead">
              <tr>
                <th className="global_th">Expense Type</th>
                <th className="global_th">Total Amount</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {Object.entries(totalAmountByType).map(([type, amount]) => (
                <tr className="global_tr" key={type}>
                  <td className="global_td">{type || "N/A"}</td>
                  <td className="global_td">
                    {new Intl.NumberFormat("en-IN").format(amount.toFixed(2))}
                  </td>
                </tr>
              ))}

              {/* Grand Total Row */}
              <tr className="font-semibold dark:bg-gray-900 bg-gray-100">
                <td className="global_td ">Grand Total:</td>
                <td className="global_td">
                  {new Intl.NumberFormat("en-IN").format(
                    Object.values(totalAmountByType)
                      .reduce((a, b) => a + b, 0)
                      .toFixed(2)
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* <div className="mt-4 overflow-x-auto">
          <h1 className="global_heading">Total Amount by Expense Type</h1>
          <table className="global_table">
            <thead className="global_thead">
              <tr>
                <th className="global_th">Expense Type</th>
                <th className="global_th">Total Amount</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {Object.entries(totalAmountByType).map(([type, amount]) => (
                <tr key={type}>
                  {console.log("exp type", totalAmountByType)}
                  <td className="global_td">{type}</td>
                  <td className="global_td">
                    {new Intl.NumberFormat("en-IN").format(amount.toFixed(2))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> */}
      </div>
    </div>
  );
};

export default ExpenseReport;
