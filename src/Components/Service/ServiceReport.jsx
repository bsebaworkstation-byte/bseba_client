import { useEffect, useRef, useState } from "react";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaPrint } from "react-icons/fa";
import { getDateRange } from "../../Helper/dateRangeHelper";
import { printElement } from "../../Helper/Printer";
import { ErrorToast } from "../../Helper/FormHelper";
import { Link } from "react-router-dom";

const emptySummary = () => ({
  totalService: 0,
  totalCost: 0,
  totalPaid: 0,
  totalRefund: 0,
  totalDue: 0,
});

const formatMoney = (n) =>
  `৳${Number(n ?? 0).toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const ServiceReport = () => {
  const [summary, setSummary] = useState(emptySummary());
  const [statusWise, setStatusWise] = useState([]);
  const [filterType, setFilterType] = useState("Today");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { setGlobalLoader } = loadingStore();
  const printRef = useRef(null);

  useEffect(() => {
    handleDateFilter("Today");
  }, []);

  const fetchReport = async () => {
    if (!fromDate || !toDate) return;

    try {
      setGlobalLoader(true);
      const startISO = new Date(fromDate).toISOString();
      const endISO = new Date(toDate).toISOString();
      const path = `/ServiceReport/${encodeURIComponent(startISO)}/${encodeURIComponent(endISO)}`;
      const res = await api.get(path);

      if (res.data.status === "Success") {
        const s = res.data.summary;
        setSummary({
          totalService: s?.totalService ?? 0,
          totalCost: s?.totalCost ?? 0,
          totalPaid: s?.totalPaid ?? 0,
          totalRefund: s?.totalRefund ?? 0,
          totalDue: s?.totalDue ?? 0,
        });
        setStatusWise(Array.isArray(res.data.statusWise) ? res.data.statusWise : []);
      } else {
        setSummary(emptySummary());
        setStatusWise([]);
        ErrorToast(res.data.message || "Failed to load service report");
      }
    } catch (err) {
      console.error(err);
      setSummary(emptySummary());
      setStatusWise([]);
      ErrorToast(err.response?.data?.message || "Failed to load service report");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    if (fromDate && toDate) {
      fetchReport();
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

  const formatRangeLabel = () => {
    if (!fromDate || !toDate) return "";
    const a = new Date(fromDate).toLocaleDateString("en-GB");
    const b = new Date(toDate).toLocaleDateString("en-GB");
    return `${a} → ${b}`;
  };

  const handlePrint = () => {
    printElement(printRef, "Service Report");
  };

  const totalEarned = (summary?.totalPaid || 0) - (summary?.totalRefund || 0);

  const summaryCards = [
    { label: "Total services", value: summary.totalService },
    { label: "Total cost", value: formatMoney(summary.totalCost) },
    { label: "Total paid", value: formatMoney(summary.totalPaid) },
    { label: "Total refund", value: formatMoney(summary.totalRefund) },
    { label: "Total due", value: formatMoney(summary.totalDue) },
    { label: "Total earned", value: formatMoney(totalEarned) },
  ];

  return (
    <section className="container global_container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Service report
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatRangeLabel()}
          </p>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="global_button_red flex items-center gap-2 shrink-0"
        >
          <FaPrint /> Print
        </button>
      </div>

      <div className="global_sub_container">
        <div className="grid grid-cols-1 md:grid-cols-12 mt-4 mb-6 gap-4 items-end">
          <div className="md:col-span-3">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
              Quick filter
            </label>
            <select
              value={filterType}
              onChange={(e) => handleDateFilter(e.target.value)}
              className="global_dropdown w-full md:min-w-[200px]"
            >
              {[
                "Today",
                "This Week",
                "Last Week",
                "This Month",
                "Last Month",
                "Last 30 Days",
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
          <div className="md:col-span-6 md:col-start-7 flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
            <div className="w-full relative">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                From
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4 pointer-events-none z-[1]" />
                <DatePicker
                  selected={fromDate}
                  onChange={(date) => handleManualDateChange(date, true)}
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
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4 pointer-events-none z-[1]" />
                <DatePicker
                  selected={toDate}
                  onChange={(date) => handleManualDateChange(date, false)}
                  dateFormat="dd-MM-yyyy"
                  className="global_input pl-10 py-1.5 w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div ref={printRef} className="space-y-8">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Summary
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 p-4 shadow-sm"
                >
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {card.label}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 tabular-nums">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              By status
            </h2>
            <table className="global_table w-full text-sm min-w-[640px]">
              <thead className="global_thead">
                <tr>
                  <th className="global_th">#</th>
                  <th className="global_th">Status</th>
                  <th className="global_th text-right">Count</th>
                  <th className="global_th text-right">Cost</th>
                  <th className="global_th text-right">Paid</th>
                  <th className="global_th text-right">Refund</th>
                  <th className="global_th text-right">Due</th>
                  <th className="global_th text-center w-[1%]">Services</th>
                </tr>
              </thead>
              <tbody className="global_tbody">
                {statusWise.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="global_td text-center py-8 text-gray-500"
                    >
                      No data for this date range.
                    </td>
                  </tr>
                ) : (
                  statusWise.map((row, index) => (
                    <tr key={row._id ?? index} className="global_tr">
                      <td className="global_td">{index + 1}</td>
                      <td className="global_td font-medium">{row._id ?? "—"}</td>
                      <td className="global_td text-right tabular-nums">
                        {row.count ?? 0}
                      </td>
                      <td className="global_td text-right tabular-nums">
                        {formatMoney(row.totalCost)}
                      </td>
                      <td className="global_td text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                        {formatMoney(row.totalPaid)}
                      </td>
                      <td className="global_td text-right tabular-nums text-amber-600 dark:text-amber-400">
                        {formatMoney(row.totalRefund)}
                      </td>
                      <td className="global_td text-right tabular-nums text-rose-600 dark:text-rose-400">
                        {formatMoney(row.totalDue)}
                      </td>
                      <td className="global_td text-center">
                        {row._id != null && String(row._id).trim() !== "" ? (
                          <Link
                            to={`/ServiceListByStatus/${encodeURIComponent(row._id)}`}
                            className="inline-flex items-center justify-center text-xs font-medium px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600 whitespace-nowrap"
                          >
                            View all
                          </Link>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceReport;
