import React, { useEffect, useRef, useState } from "react";
import loadingStore from "../../Zustand/LoadingStore";
import { getDateRange } from "../../Helper/dateRangeHelper";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import expenseStore from "../../Zustand/expenseStore";
import TimeAgo from "../../Helper/UI/TimeAgo";
import api from "../../Helper/axios_resonse_interceptor";
import { printExpense } from "../../Helper/PrintExpense";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import useLanguageStore from "../../Zustand/languageStore.js";
import { Link } from "react-router-dom";
import { dateRangeOptions } from "../../TranslationText/TranslateTextDateRange";
import { translateDatePickerText } from "../../TranslationText/TranslateTextDateRange";
import { SuccessToast, ErrorToast } from "../../Helper/FormHelper";
export default function ExpenseList() {
  const { setGlobalLoader } = loadingStore();
  const { refresh } = expenseStore();
  const { lang } = useLanguageStore();
  // date states
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState("Today");
  const [initialized, setInitialized] = useState(false);
  // data
  const [expenseData, setExpenseData] = useState([]);
  const printRef = useRef();
  // language translator
  const formTrans = useTextTranslate(GlobalFormTranslator);
  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);

  const toISO = (date, end = false) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = end ? "23" : "00";
    const minutes = end ? "59" : "00";
    const seconds = end ? "59" : "00";

    return `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}T${hours}:${minutes}:${seconds}.000Z`;
  };

  const fetchExpenseByDate = async () => {
    if (!startDate || !endDate) return;

    const start = toISO(startDate);
    const end = toISO(endDate, true);

    setGlobalLoader(true);

    try {
      const { data } = await api.get(`/GetExpenseByDate/${start}/${end}`);

      setExpenseData(data.status === "Success" ? data.data : []);
    } catch (err) {
      setExpenseData([]);
      console.log(err);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    const { start, end } = getDateRange("This Month");

    setStartDate(new Date(start));
    setEndDate(new Date(end));

    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      setExpenseData([]);
      fetchExpenseByDate();
    }
  }, [startDate, endDate, refresh]);

  const categoryTotals = expenseData.reduce((acc, item) => {
    const key = item.typeName || "Unknown";
    acc[key] = (acc[key] || 0) + Number(item.amount);
    return acc;
  }, {});

  const handlePrint = () => {
    printExpense(printRef, "Expense list");
  };
  const deleteExpense = async (id) => {
    try {
      setGlobalLoader(true);
      const res = await api.get(`/DeleteExpense/${id}`);

      if (res.data.status === "Success") {
        SuccessToast("Expense deleted successfully");
        await fetchExpenseByDate();
      } else {
        ErrorToast(res.data.message || "Failed to delete expense");
      }
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Failed to delete expense");
    } finally {
      setGlobalLoader(false);
    }
  };
  return (
    <div ref={printRef}>
      <h4 className="global_heading">{heading("expenseList")}</h4>

      <div className="flex flex-col md:justify-between md:flex-row md:items-center">
        {/* RANGE SELECT */}
        <div>
          <select
            value={selectedRange}
            onChange={(e) => {
              const value = e.target.value;

              setSelectedRange(value);

              if (value !== "Custom") {
                const { start, end } = getDateRange(value);

                setStartDate(new Date(start));

                setEndDate(new Date(end));
              }
            }}
            className="global_dropdown max-w-40"
          >
            {Object.values(dateRangeOptions).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label[lang]}
              </option>
            ))}
          </select>
        </div>

        {/* date picker */}

        <div className="flex gap-4 pb-4">
          <div>
            <label className="block text-sm">
              <label className="block text-sm">
                {translateDatePickerText.start_date[lang]}
              </label>
            </label>

            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-3" />

              <DatePicker
                selected={startDate}
                onChange={(d) => setStartDate(d)}
                dateFormat="dd-MM-yyyy"
                className="global_input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm">
              <label className="block text-sm">
                {translateDatePickerText.end_date[lang]}
              </label>
            </label>

            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-3" />

              <DatePicker
                selected={endDate}
                onChange={(d) => setEndDate(d)}
                dateFormat="dd-MM-yyyy"
                className="global_input pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="w-full overflow-auto my-5">
        <table className="global_table">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th">#</th>
              <th className="global_th">{formTrans("expenseType")}</th>
              <th className="global_th">{formTrans("amount")}</th>
              <th className="global_th">{formTrans("note")}</th>
              <th className="global_th">{table("history")}</th>
              <th className="global_th">{table("date")}</th>
              <th className="global_th">{table("Action")}</th>
            </tr>
          </thead>

          <tbody className="global_tbody">
            {expenseData.map((d, i) => (
              <tr className="global_tr" key={d._id || i}>
                <td className="global_td">{i + 1}</td>
                <td className="global_td">{d.typeName || "N/A"}</td>
                <td className="global_td">{d.amount || 0}</td>
                <td className="global_td">{d.note || "N/A"}</td>
                <td className="global_td">
                  {d.AccountPayments.map((a, i) => (
                    <span key={i}>
                      {a.accountName ? `(${a.accountName} ${a.amount}) ` : ""}
                    </span>
                  ))}
                </td>
                <td className="global_td " style={{ whiteSpace: "nowrap" }}>
                  {new Date(d.CreatedDate)
                    .toLocaleDateString("en-GB")
                    .replace(/\//g, "-")}{" "}
                  <TimeAgo date={d.CreatedDate} />
                </td>
                <td className="global_td">
                  <button>
                    <Link
                      to={`/ExpenseDetails/${d._id}`}
                      className="global_button"
                    >
                      View
                    </Link>
                  </button>
                  {/* delete button */}
                  <button
                    onClick={() => deleteExpense(d._id)}
                    className="global_button_red ml-4"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {/* expense */}
            {expenseData.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-3 text-gray-500">
                  You have no data
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="global_tr">
              <td colSpan={2} className="global_td">
                {table("total")}
              </td>
              <td className="global_td">
                {expenseData.reduce(
                  (sum, item) => sum + Number(item.amount),
                  0,
                )}
              </td>
              <td colSpan={4} className="global_td"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* CATEGORY WISE TOTAL TABLE */}
      <div className="w-full overflow-auto my-5">
        <h4 className="global_heading">{heading("categoryWiseTotal")}</h4>

        <table className="global_table mt-3">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th">#</th>
              <th className="global_th">{formTrans("category")}</th>
              <th className="global_th">
                {table("total")} {table("amount")}
              </th>
            </tr>
          </thead>

          <tbody className="global_tbody">
            {Object.entries(categoryTotals).map(([cat, total], i) => (
              <tr key={i} className="global_tr">
                <td className="global_td">{i + 1}</td>
                <td className="global_td">{cat}</td>
                <td className="global_td">{total}</td>
              </tr>
            ))}

            {Object.keys(categoryTotals).length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-3 text-gray-500">
                  No category data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button
        id="no-print"
        onClick={handlePrint}
        className="global_button mt-5"
      >
        Print
      </button>
    </div>
  );
}
