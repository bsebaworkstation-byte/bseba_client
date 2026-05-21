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
import {
  dateRangeOptions,
  translateDatePickerText,
} from "../../TranslationText/TranslateTextDateRange";
import useLanguageStore from "../../Zustand/languageStore";

const AccountPaymentReport = () => {
  const [reportData, setReportData] = useState([]);
  const { setGlobalLoader } = loadingStore();
  const { lang } = useLanguageStore();
  const printRef = useRef(null);
  // date states
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
      setGlobalLoader(true);

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
    0
  );
  const totalCredit = filteredData.reduce(
    (acc, item) => acc + (item.Credit || 0),
    0
  );

  const handlePrint = () => {
    printElement(printRef, "Account Payment Report");
  };

  const uniqueData = useMemo(() => {
    return Array.from(
      new Map(
        filterByType
          .filter((item) => item.CreatedBy)
          .map((item) => [item.CreatedBy, item])
      ).values()
    );
  }, [filterByType]);

  return (
    <section className="container global_container mx-auto">
      <div className="global_sub_container">
        {/* date */}
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
                {
                  <label className="block text-sm">
                    {translateDatePickerText.start_date[lang]}
                  </label>
                }
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
            className="max-w-40 w-full border p-1.5 rounded-md dark:bg-gray-700 border-gray-400 outline-0"
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
            className="max-w-40 w-full border p-1.5 rounded-md dark:bg-gray-700 border-gray-400 outline-0"
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

      <div className="global_sub_container">
        {/* Report Table */}
        <div ref={printRef} className="overflow-x-auto">
          <table className="global_table w-full text-sm">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">#</th>
                <th className="global_th">Date</th>
                <th className="global_th">Account Title</th>
                <th className="global_th">Reference (ID)</th>
                <th className="global_th">Contact Info</th>
                <th className="global_th">Created By</th>
                <th className="global_th text-right">Payment/Cost</th>
                <th className="global_th text-right">Received</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500">
                    No records found for this date range.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item._id} className="global_tr hover:bg-gray-700">
                    <td className="global_td">{index + 1}</td>
                    <td className="global_td whitespace-nowrap">
                      {formatDateToLocal(item?.CreatedDate)}{" "}
                      <TimeAgo date={item?.CreatedDate} />
                    </td>
                    <td className="global_td font-medium">
                      {item.AccountTitle}
                    </td>
                    <td className="global_td">
                      {item.saleID ? (
                        <span>Sale</span>
                      ) : item?.expensesID ? (
                        <span>Expense</span>
                      ) : item?.salereturnID ? (
                        <span>Return</span>
                      ) : item.WarrantyID ? (
                        <span>Warranty</span>
                      ) : item?.purchaseID ? (
                        <span>Purchase</span>
                      ) : item?.staffID ? (
                        <span>Staff Salary</span>
                      ) : item?.Credit > 0 ? (
                        <span>Received</span>
                      ) : item?.Debit > 0 ? (
                        <span>Payment/cost</span>
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="global_td">
                      <div className="flex flex-col">
                        <span>
                          {item.ContactName ||
                            item.ContactMobile ||
                            item.UserMobile}
                        </span>
                        {item.ContactName && item.ContactMobile && (
                          <span className="text-xs text-gray-500">
                            {item.ContactMobile}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="global_td">{item.CreatedBy}</td>
                    <td className="global_td text-right font-medium text-red-600">
                      {item.Debit ? item.Debit.toLocaleString() : "-"}
                    </td>
                    <td className="global_td text-right font-medium text-green-600">
                      {item.Credit ? item.Credit.toLocaleString() : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Table Footer with Totals */}
            {filteredData.length > 0 && (
              <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-300">
                <tr className="global_tr">
                  <td
                    colSpan="6"
                    className="global_td text-right text-gray-400 uppercase"
                  >
                    Total
                  </td>
                  <td className="global_td text-right text-red-700">
                    {totalDebit.toLocaleString()}
                  </td>
                  <td className="global_td text-right text-green-700">
                    {totalCredit.toLocaleString()}
                  </td>
                </tr>
                <tr className="global_tr">
                  <td
                    colSpan="6"
                    className="global_td text-right text-gray-400 uppercase"
                  >
                    Net Balance (Credit - Debit)
                  </td>
                  <td
                    colSpan="2"
                    className={`global_td text-center text-lg ${
                      totalCredit - totalDebit >= 0
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    {(totalCredit - totalDebit).toLocaleString()}
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

export default AccountPaymentReport;
