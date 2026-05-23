import React, { useEffect, useMemo, useRef, useState } from "react";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaPrint } from "react-icons/fa6";
import { printElement } from "../../Helper/Printer";
import { getDateRange } from "../../Helper/dateRangeHelper";
import { FaCalendarAlt } from "react-icons/fa";
import formatDateToLocal from "../../Helper/formatDate";
import TimeAgo from "../../Helper/UI/TimeAgo";
import { Link } from "react-router-dom";
import {
  dateRangeOptions,
  translateDatePickerText,
} from "../../TranslationText/TranslateTextDateRange";
import useLanguageStore from "../../Zustand/languageStore";

const Transactions = () => {
  const [reportData, setReportData] = useState([]);
  const { setGlobalLoader } = loadingStore();
  const { lang } = useLanguageStore();
  const printRef = useRef(null);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState("Today");
  const [initialized, setInitialized] = useState(false);
  const [filterType, setFilterType] = useState("All");
  const [filterByCreate, setFilterByCreate] = useState("");

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

  const fetchData = async () => {
    if (!startDate || !endDate) return;

    const start = toISO(startDate);
    const end = toISO(endDate, true);

    setGlobalLoader(true);

    try {
      const res = await api.get(`/AccountPaymentReport/${start}/${end}`);

      if (res.data.status === "Success") {
        setReportData(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load account report", err);
      setReportData([]);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    const { start, end } = getDateRange("Today");

    setStartDate(new Date(start));
    setEndDate(new Date(end));
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      fetchData();
    }
  }, [startDate, endDate]);

  // Filter by Type

  const filterByType = reportData.filter((item) => {
    if (filterType === "All") return true;

    if (filterType === "Sale") return !!item.saleID;
    if (filterType === "Return") return !!item.salereturnID;
    if (filterType === "Purchase") return !!item.purchaseID;
    if (filterType === "Expense") return !!item.expensesID;
    if (filterType === "Warranty") return !!item.WarrantyID;
    if (filterType === "Staff") return !!item.staffID;

    return true;
  });

  const filteredData = useMemo(() => {
    if (!filterByCreate) return filterByType;

    return filterByType.filter((item) => item.CreatedBy === filterByCreate);
  }, [filterByType, filterByCreate]);

  const totalDebit = filteredData.reduce(
    (acc, item) => acc + (item.Debit || 0),
    0,
  );

  const totalCredit = filteredData.reduce(
    (acc, item) => acc + (item.Credit || 0),
    0,
  );

  const handlePrint = () => {
    printElement(printRef, "Account Payment Report");
  };

  const uniqueData = useMemo(() => {
    return Array.from(
      new Map(
        filterByType
          .filter((item) => item.CreatedBy)
          .map((item) => [item.CreatedBy, item]),
      ).values(),
    );
  }, [filterByType]);

  // Report Link
  const getReportLink = (item) => {
    if (item.saleID) return `/Invoice/1/${item.saleID}`;

    if (item.purchaseID) return `/PurchaseDetails/${item.purchaseID}`;

    if (item.expensesID) return `/ExpenseDetails/${item.expensesID}`;

    if (item.transactionID) return `/TransactionDetails/${item.transactionID}`;
    //  investorID add
    if (item.investorID) return `/InvestmentReport/${item.investorID}`;

    return "#";
  };

  const getReportLabel = (item) => {
    if (item.saleID) return "View Sale";

    if (item.purchaseID) return "View Purchase";

    if (item.expensesID) return "Expense Details";

    if (item.transactionID) return "View Details";

    if (item.investorID) return "View Investment";

    return "View";
  };

  return (
    <section className="container global_container mx-auto">
      <div className="global_sub_container">
        {/* Date Filter */}

        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
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

          <div className="flex gap-4 pb-4">
            <div>
              <label className="block text-sm">
                {translateDatePickerText.start_date[lang]}
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
                {translateDatePickerText.end_date[lang]}
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

        {/* Filters */}

        <div className="flex mt-3 flex-wrap justify-end items-end gap-3">
          <button
            onClick={handlePrint}
            className="global_button_red flex items-center gap-2"
          >
            <FaPrint /> Print Report
          </button>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="max-w-40 border p-1.5 rounded-md"
          >
            <option value="All">All</option>
            <option value="Sale">Sale</option>
            <option value="Return">Return</option>
            <option value="Purchase">Purchase</option>
            <option value="Expense">Expense</option>
            <option value="Warranty">Warranty</option>
            <option value="Staff">Staff salary</option>
          </select>

          <select
            value={filterByCreate}
            onChange={(e) => setFilterByCreate(e.target.value)}
            className="max-w-40 border p-1.5 rounded-md"
          >
            <option value="">All</option>

            {uniqueData.map((item) => (
              <option value={item.CreatedBy} key={item.CreatedBy}>
                {item.CreatedBy}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}

      <div className="global_sub_container">
        <div ref={printRef} className="overflow-x-auto">
          <style>{`
            @media print {
              .no-print {
                display: none !important;
              }
              .print-only {
                display: table-cell !important;
              }
              table {
                border-collapse: collapse;
                width: 100%;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              tfoot tr:first-child td {
                border-top: 2px solid #000;
              }
              tfoot tr:last-child td {
                border-top: 2px solid #000;
                font-weight: bold;
              }
            }
          `}</style>

          <table className="global_table">
            <thead className="global_thead">
              <tr>
                <th className="global_th">#</th>
                <th className="global_th">Date</th>
                <th className="global_th">Account Title</th>
                <th className="global_th">Reference</th>
                <th className="global_th">Contact</th>
                <th className="global_th">Created By</th>
                <th className="global_th text-right">Payment</th>
                <th className="global_th text-right">Received</th>
                <th className="global_th no-print">Action</th>
              </tr>
            </thead>

            <tbody className="global_tbody">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-6">
                    No records found
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item._id} className="global_tr">
                    <td className="global_td">{index + 1}</td>

                    <td className="global_td">
                      {formatDateToLocal(item.CreatedDate)}
                      <br />
                      <small>
                        <TimeAgo date={item.CreatedDate} />
                      </small>
                    </td>

                    <td className="global_td text-left">
                      <div className="flex flex-col">
                        <span>{item.AccountTitle}</span>

                        {item.chequeNo && (
                          <span className="text-xs text-gray-400">
                            Cheque No: {item.chequeNo}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="global_td">
                      {item.saleID
                        ? "Sale"
                        : item.purchaseID
                          ? "Purchase"
                          : item.expensesID
                            ? "Expense"
                            : item.staffID
                              ? "Staff"
                              : item.Credit > 0
                                ? "Received"
                                : "Payment"}
                    </td>

                    <td className="global_td">
                      <div className="flex flex-col">
                        <span>
                          {item.ContactName ||
                            item.ContactMobile ||
                            item.UserMobile}
                        </span>

                        {item.ContactMobile && (
                          <span className="text-xs text-gray-500">
                            {item.ContactMobile}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="global_td">{item.CreatedBy}</td>

                    <td className="global_td text-right text-red-600">
                      {item.Debit ? item.Debit.toLocaleString() : "-"}
                    </td>

                    <td className="global_td text-right text-green-600">
                      {item.Credit ? item.Credit.toLocaleString() : "-"}
                    </td>

                    <td className="global_td no-print">
                      <Link to={getReportLink(item)} className="global_button">
                        {getReportLabel(item)}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Updated Footer with better styling */}
            {filteredData.length > 0 && (
              <tfoot className="font-bold">
                {/* Subtotal row */}
                <tr className="border-t-2 border-gray-400 bg-gray-50">
                  <td
                    colSpan="6"
                    className="global_td text-right font-bold text-gray-700 uppercase tracking-wider"
                  >
                    Subtotal
                  </td>
                  <td className="global_td text-right text-red-700 font-bold">
                    ৳
                    {totalDebit.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="global_td text-right text-green-700 font-bold">
                    ৳
                    {totalCredit.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="global_td no-print"></td>
                </tr>

                {/* Net Balance row */}
                <tr className="border-t-2 border-gray-400 bg-gray-100">
                  <td
                    colSpan="6"
                    className="global_td text-right font-bold text-gray-800 uppercase tracking-wider"
                  >
                    Net Balance
                  </td>
                  <td
                    colSpan="2"
                    className={`global_td text-center font-bold text-lg ${
                      totalCredit - totalDebit >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ৳
                    {(totalCredit - totalDebit).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    <span className="text-sm ml-2 font-normal">
                      ({totalCredit - totalDebit >= 0 ? "Received" : "Payment"})
                    </span>
                  </td>
                  <td className="global_td no-print"></td>
                </tr>

                {/* Summary row with counts */}
                <tr className="bg-gray-50 text-xs">
                  <td colSpan="9" className="global_td text-gray-600">
                    <div className="flex justify-between items-center">
                      <span>Total Transactions: {filteredData.length}</span>
                      <span>|</span>
                      <span>Total Debit: ৳{totalDebit.toLocaleString()}</span>
                      <span>|</span>
                      <span>Total Credit: ৳{totalCredit.toLocaleString()}</span>
                      <span>|</span>
                      <span>
                        Period: {formatDateToLocal(startDate)} -{" "}
                        {formatDateToLocal(endDate)}
                      </span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </section>
  );
};

export default Transactions;
