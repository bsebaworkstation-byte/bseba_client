import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
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
import "react-datepicker/dist/react-datepicker.css";
import { createPortal } from "react-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import api from "../../Helper/axios_resonse_interceptor";

const DalyReport = () => {
  const [dalyReportData, setDalyReportData] = useState({});
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [showQuickSale, setShowQuickSale] = useState(true);
  const [showDiscountDebit, setShowDiscountDebit] = useState(true);
  const [showDiscountCredit, setShowDiscountCredit] = useState(true);
  const [showDamage, setShowDamage] = useState(true);
  const { setGlobalLoader } = loadingStore();
  const componentRef = useRef();

  const periodOptions = [
    { value: "", label: "Custom" },
    { value: "thisWeek", label: "This Week" },
    { value: "lastWeek", label: "Last Week" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "thisYear", label: "This Year" },
    { value: "lastYear", label: "Last Year" },
  ];

  const fetchReport = async (start, end) => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/GetReport/${format(start, "yyyy-MM-dd")}/${format(
          end,
          "yyyy-MM-dd"
        )}`
      );
      setDalyReportData(res.data || {});
    } catch (err) {
      console.error("Failed to fetch report:", err);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    switch (selectedPeriod) {
      case "thisWeek":
        fetchReport(
          startOfWeek(new Date(), { weekStartsOn: 1 }),
          endOfWeek(new Date(), { weekStartsOn: 1 })
        );
        break;
      case "lastWeek":
        fetchReport(
          startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
          endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 })
        );
        break;
      case "thisMonth":
        fetchReport(startOfMonth(new Date()), endOfMonth(new Date()));
        break;
      case "lastMonth":
        fetchReport(
          startOfMonth(subMonths(new Date(), 1)),
          endOfMonth(subMonths(new Date(), 1))
        );
        break;
      case "thisYear":
        fetchReport(startOfYear(new Date()), endOfYear(new Date()));
        break;
      case "lastYear":
        fetchReport(
          startOfYear(subYears(new Date(), 1)),
          endOfYear(subYears(new Date(), 1))
        );
        break;
      default:
        fetchReport(startDate, endDate);
        break;
    }
  }, [startDate, endDate, selectedPeriod]);

  // Totals helper function
  const getTotal = (field) => {
    if (!dalyReportData?.report?.length) return "0.00";
    return dalyReportData.report
      .reduce((sum, item) => sum + (item[field] || 0), 0)
      .toFixed(2);
  };

  const getNetProfitTotal = () => {
    if (!dalyReportData?.report?.length) return "0.00";
    return dalyReportData.report
      .reduce((sum, item) => {
        const net =
          (item.totalProfit || 0) -
          (item.totalExpenses || 0) +
          (showQuickSale ? item.totalQuickSale || 0 : 0) -
          (item.totalSaleReturnProfitLoss || 0) -
          (showDiscountDebit ? item.totalDiscountDebit || 0 : 0) +
          (showDiscountCredit ? item.totalDiscountCredit || 0 : 0) -
          (showDamage ? item.totalDamage || 0 : 0);
        return sum + net;
      }, 0)
      .toFixed(2);
  };

  return (
    <div className="global_container">
      <div className="global_sub_container">
        {/* Filters */}
        <div className="flex flex-wrap md:flex-nowrap gap-3 mb-4">
          <div className="w-full md:w-1/3">
            <label className="block text-sm mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              dateFormat="dd-MM-yyyy"
              className="global_input w-full "
              popperPlacement="bottom-start"
              popperClassName="z-[9999]"
              calendarClassName="react-datepicker-custom"
              popperContainer={(props) =>
                createPortal(<div {...props} />, document.body)
              }
            />
          </div>

          <div className="w-full md:w-1/3">
            <label className="block text-sm mb-1">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              dateFormat="dd-MM-yyyy"
              className="global_input w-full "
              popperPlacement="bottom-start"
              popperClassName="z-[9999]"
              calendarClassName="react-datepicker-custom"
              popperContainer={(props) =>
                createPortal(<div {...props} />, document.body)
              }
            />
          </div>

          <div className="w-full md:w-1/3">
            <label className="block text-sm mb-1">Period</label>

            <Select
              value={periodOptions.find((p) => p.value === selectedPeriod)}
              onChange={(opt) => {
                setSelectedPeriod(opt?.value || "");
                setStartDate(new Date());
                setEndDate(new Date());
              }}
              classNamePrefix="react-select"
              options={periodOptions}
              placeholder="Select Period"
              isClearable
              className="w-full"
              menuPortalTarget={document.body}
              styles={getReactSelectStyles()}
            />
          </div>
        </div>

        {/* Checkbox Filters */}
        <div className="flex flex-wrap gap-4 mt-3 justify-center">
          <label>
            <input
              type="checkbox"
              checked={showQuickSale}
              onChange={() => setShowQuickSale(!showQuickSale)}
              className="form-check-input accent-blue-600"
            />{" "}
            Service
          </label>
          <label>
            <input
              type="checkbox"
              checked={showDiscountDebit}
              onChange={() => setShowDiscountDebit(!showDiscountDebit)}
              className="form-check-input accent-blue-600"
            />{" "}
            Discount Paid
          </label>
          <label>
            <input
              type="checkbox"
              checked={showDiscountCredit}
              onChange={() => setShowDiscountCredit(!showDiscountCredit)}
              className="form-check-input accent-blue-600"
            />{" "}
            Discount Received
          </label>
          <label>
            <input
              type="checkbox"
              checked={showDamage}
              onChange={() => setShowDamage(!showDamage)}
              className="form-check-input accent-blue-600"
            />{" "}
            Damage
          </label>
        </div>
      </div>

      <div className="global_sub_container">
        <div ref={componentRef}>
          {dalyReportData?.report?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="global_table">
                <thead className="global_thead">
                  <tr>
                    <th className="global_th">#</th>
                    <th className="global_th">Date</th>
                    <th className="global_th">Sales</th>
                    <th className="global_th">Profit</th>
                    <th className="global_th">Expenses</th>
                    {showDiscountDebit && (
                      <th className="global_th">Discount Paid</th>
                    )}
                    {showDiscountCredit && (
                      <th className="global_th">Discount Received</th>
                    )}
                    {showQuickSale && <th className="global_th">Service</th>}
                    <th className="global_th">Sale Return Loss</th>
                    {showDamage && <th className="global_th">Damage</th>}
                    <th className="global_th">Net Profit</th>
                  </tr>
                </thead>

                <tbody className="global_tbody">
                  {dalyReportData.report.map((item, i) => {
                    const netProfit =
                      (item.totalProfit || 0) -
                      (item.totalExpenses || 0) +
                      (showQuickSale ? item.totalQuickSale || 0 : 0) -
                      (item.totalSaleReturnProfitLoss || 0) -
                      (showDiscountDebit ? item.totalDiscountDebit || 0 : 0) +
                      (showDiscountCredit ? item.totalDiscountCredit || 0 : 0) -
                      (showDamage ? item.totalDamage || 0 : 0);

                    return (
                      <tr className="global_tr" key={i}>
                        <td className="global_td text-center">{i + 1}</td>
                        <td className="global_td">
                          {format(new Date(item.date), "dd-MM-yyyy")}
                        </td>
                        <td className="global_td">
                          {(item.totalSales || 0).toFixed(2)}
                        </td>
                        <td className="global_td">
                          {(item.totalProfit || 0).toFixed(2)}
                        </td>
                        <td className="global_td">
                          {(item.totalExpenses || 0).toFixed(2)}
                        </td>
                        {showDiscountDebit && (
                          <td className="global_td">
                            {(item.totalDiscountDebit || 0).toFixed(2)}
                          </td>
                        )}
                        {showDiscountCredit && (
                          <td className="global_td">
                            {(item.totalDiscountCredit || 0).toFixed(2)}
                          </td>
                        )}
                        {showQuickSale && (
                          <td className="global_td">
                            {(item.totalQuickSale || 0).toFixed(2)}
                          </td>
                        )}
                        <td className="global_td">
                          {(item.totalSaleReturnProfitLoss || 0).toFixed(2)}
                        </td>
                        {showDamage && (
                          <td className="global_td">
                            {(item.totalDamage || 0).toFixed(2)}
                          </td>
                        )}
                        <td className="global_td">{netProfit.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot className="bg-gray-100 dark:bg-gray-700 font-semibold">
                  <tr>
                    <td className="global_td text-center" colSpan={2}>
                      Total
                    </td>
                    <td className="global_td">{getTotal("totalSales")}</td>
                    <td className="global_td">{getTotal("totalProfit")}</td>
                    <td className="global_td">{getTotal("totalExpenses")}</td>
                    {showDiscountDebit && (
                      <td className="global_td">
                        {getTotal("totalDiscountDebit")}
                      </td>
                    )}
                    {showDiscountCredit && (
                      <td className="global_td">
                        {getTotal("totalDiscountCredit")}
                      </td>
                    )}
                    {showQuickSale && (
                      <td className="global_td">
                        {getTotal("totalQuickSale")}
                      </td>
                    )}
                    <td className="global_td">
                      {getTotal("totalSaleReturnProfitLoss")}
                    </td>
                    {showDamage && (
                      <td className="global_td">{getTotal("totalDamage")}</td>
                    )}
                    <td className="global_td">{getNetProfitTotal()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-center dark:text-gray-100 text-gray-500">
              No report data found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DalyReport;
