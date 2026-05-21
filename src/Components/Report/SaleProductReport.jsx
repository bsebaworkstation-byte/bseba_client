import React, { useEffect, useRef, useState } from "react";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { FaPrint } from "react-icons/fa";
import { getDateRange } from "../../Helper/dateRangeHelper";

const SaleProductReport = () => {
  const [reportData, setReportData] = useState([]);
  const [filterType, setFilterType] = useState("Today");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { setGlobalLoader } = loadingStore();
  const printRef = useRef(null);

  useEffect(() => {
    handleDateFilter("Today");
  }, []);

  const fetchData = async () => {
    if (!fromDate || !toDate) return;

    try {
      setGlobalLoader(true);
      const startISO = new Date(fromDate).toISOString();
      const endISO = new Date(toDate).toISOString();

      const res = await api.get(`/SaleProductReport/${startISO}/${endISO}`);

      if (res.data.status === "Success") {
        setReportData(res.data.data || []);
      } else {
        setReportData([]);
      }
    } catch (err) {
      console.error("Failed to load account report", err);
      setReportData([]);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    if (fromDate && toDate) {
      fetchData();
    }
  }, [fromDate, toDate]);

  const handleDateFilter = (type) => {
    setFilterType(type);

    if (type === "Custom Range") return;

    const { start, end } = getDateRange(type);
    setFromDate(start);
    setToDate(end);
  };

  const handleManualDateChange = (date, isFrom) => {
    if (isFrom) setFromDate(date);
    else setToDate(date);
    setFilterType("Custom Range");
  };

  const totalQty = reportData.reduce(
    (acc, item) => acc + (item.qtySold || 0),
    0
  );
  const totalSales = reportData.reduce(
    (acc, item) => acc + (item.total || 0),
    0
  );
  const totalProfit = reportData.reduce(
    (acc, item) => acc + (item.profit || 0),
    0
  );

  const totalCost = reportData.reduce((acc, item) => {
    return acc + (item.qtySold || 0) * (item.unitCost || 0);
  }, 0);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    printElement(printRef, "Sale Product Report");
  };

  return (
    <section className="container global_container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h5 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            Sale Product Report
          </h5>
        </div>
        <div>
          <button
            onClick={handlePrint}
            className="global_button_red flex items-center gap-2"
          >
            <FaPrint /> Print Report
          </button>
        </div>
      </div>

      <div className="global_sub_container">
        <div className="grid grid-cols-1 md:grid-cols-12 mt-4 mb-6 gap-4 items-end">
          <div className="md:col-span-3">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
              Quick Filter
            </label>
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => handleDateFilter(e.target.value)}
                className="global_dropdown w-full md:min-w-[200px]"
              >
                {[
                  "Today",
                  "Last 30 Days",
                  "This Week",
                  "Last Week",
                  "This Month",
                  "Last Month",
                  "This Year",
                  "Last Year",
                  "Custom Range",
                ].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="md:col-span-6 md:col-start-7 flex items-center gap-2">
            <div className="w-full relative">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                From
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4 pointer-events-none" />
                <DatePicker
                  selected={fromDate}
                  onChange={(date) => handleManualDateChange(date, true)}
                  //   onChange={(e) => setFromDate(e.target.value)}
                  dateFormat="dd-MM-yyyy"
                  className="global_input pl-10 py-1.5 w-full"
                />
              </div>
            </div>

            <div className="w-full relative">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                To
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4 pointer-events-none" />
                <DatePicker
                  selected={toDate}
                  onChange={(date) => handleManualDateChange(date, false)}
                  //   onChange={(e) => setToDate(e.target.value)}
                  dateFormat="dd-MM-yyyy"
                  className="global_input pl-10 py-1.5 w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Report Table */}
        <div ref={printRef} className="overflow-x-auto">
          <table className="global_table w-full text-sm">
            <thead className="global_thead">
              <tr>
                <th className="global_th">#</th>
                <th className="global_th">Date</th>
                <th className="global_th">Product Name</th>
                <th className="global_th text-center">Qty</th>
                <th className="global_th text-right">Unit Cost</th>
                <th className="global_th text-right">Unit Price</th>
                <th className="global_th text-right">Total Sales</th>
                <th className="global_th text-right">Profit</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500">
                    No records found for this date range.
                  </td>
                </tr>
              ) : (
                reportData.map((item, index) => (
                  <tr key={item._id} className="global_tr hover:bg-gray-50">
                    <td className="global_td">{index + 1}</td>
                    <td className="global_td whitespace-nowrap">
                      {formatDate(item.CreatedDate)}
                    </td>
                    <td className="global_td font-medium">
                      {item.productName}
                      <div className="text-xs text-gray-500 block md:hidden">
                        Sold by: {item.CreatedBy}
                      </div>
                    </td>
                    <td className="global_td text-center">{item.qtySold}</td>
                    <td className="global_td text-right">
                      {Number(item.unitCost).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="global_td text-right">
                      {Number(item.price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="global_td text-right font-medium text-blue-700">
                      {Number(item.total).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td
                      className={`global_td text-right font-bold ${
                        item.profit >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {Number(item.profit).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Table Footer with Totals */}
            {reportData.length > 0 && (
              <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-300">
                <tr className="global_tr">
                  <td
                    colSpan="3"
                    className="global_td text-right text-gray-700 dark:text-gray-400 uppercase"
                  >
                    Total
                  </td>
                  <td className="global_td text-center">{totalQty}</td>
                  <td className="global_td text-right text-gray-500 dark:text-gray-400">
                    {totalCost.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="global_td text-right text-gray-500">-</td>
                  <td className="global_td text-right text-blue-800">
                    {totalSales.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="global_td text-right text-green-800">
                    {totalProfit.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
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

export default SaleProductReport;
