import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import {
  formatISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createPortal } from "react-dom";
import { AiOutlineEye } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import api from "../../Helper/axios_resonse_interceptor";

const periodOptions = [
  { value: "", label: "Select Period" },
  { value: "last30days", label: "Last 30 Days" },
  { value: "thisWeek", label: "This Week" },
  { value: "lastWeek", label: "Last Week" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "thisYear", label: "This Year" },
  { value: "lastYear", label: "Last Year" },
];

const TopCustomer = () => {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [period, setPeriod] = useState("thisMonth");
  const [dataList, setDataList] = useState([]);
  const navigate = useNavigate();
  const { setGlobalLoader } = loadingStore();

  // Fetch Data from API
  const fetchData = async (start, end) => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/TopListByDate/${formatISO(start)}/${formatISO(end)}`
      );
      setDataList(res.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch Top Customer list!");
    } finally {
      setGlobalLoader(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData(startDate, endDate);
  }, [startDate, endDate]);

  // Handle Period Change
  const handlePeriodChange = (selectedValue) => {
    setPeriod(selectedValue);
    let newStartDate;
    let newEndDate = new Date();

    switch (selectedValue) {
      case "last30days":
        newStartDate = subDays(new Date(), 30);
        break;
      case "thisWeek":
        newStartDate = startOfWeek(new Date(), { weekStartsOn: 1 });
        newEndDate = endOfWeek(new Date(), { weekStartsOn: 1 });
        break;
      case "lastWeek":
        newStartDate = startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 });
        newEndDate = endOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 });
        break;
      case "thisMonth":
        newStartDate = startOfMonth(new Date());
        newEndDate = endOfMonth(new Date());
        break;
      case "lastMonth":
        newStartDate = startOfMonth(subMonths(new Date(), 1));
        newEndDate = endOfMonth(subMonths(new Date(), 1));
        break;
      case "thisYear":
        newStartDate = startOfYear(new Date());
        newEndDate = endOfYear(new Date());
        break;
      case "lastYear":
        newStartDate = startOfYear(subYears(new Date(), 1));
        newEndDate = endOfYear(subYears(new Date(), 1));
        break;
      default:
        newStartDate = startOfMonth(new Date());
        newEndDate = endOfMonth(new Date());
        break;
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
    fetchData(newStartDate, newEndDate);
  };

  return (
    <div className="global_container">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ---------------- Filter Section ---------------- */}
      <div className="global_sub_container">
        <div className="grid md:grid-cols-3 grid-cols-1 justify-between items-center gap-5">
          {/* Period Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Period</label>
            <Select
              classNamePrefix="react-select"
              options={periodOptions}
              value={periodOptions.find((opt) => opt.value === period) || null}
              onChange={(opt) => handlePeriodChange(opt?.value || "")}
              placeholder="Select Period"
              isClearable
              menuPortalTarget={document.body}
              styles={getReactSelectStyles()}
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd-MM-yyyy"
              className="global_input w-full"
              popperPlacement="bottom-start"
              popperClassName="z-[9999]"
              calendarClassName="react-datepicker-custom"
              popperContainer={(props) =>
                createPortal(<div {...props} />, document.body)
              }
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd-MM-yyyy"
              className="global_input w-full"
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

      {/* ---------------- Table Section ---------------- */}
      <div className="global_sub_container mt-5">
        <h1 className="text-lg font-semibold mb-3">Top Customer List</h1>

        <div className="overflow-x-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr>
                <th className="global_th">#</th>
                <th className="global_th">Customer Name</th>
                <th className="global_th">Address</th>
                <th className="global_th">Mobile</th>
                <th className="global_th">Total Sales</th>
                <th className="global_th">Total Profit</th>
                <th className="global_th">Action</th>
              </tr>
            </thead>

            <tbody className="global_tbody">
              {dataList.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-10 text-gray-500 text-lg italic"
                  >
                    No Customer Record Found
                  </td>
                </tr>
              ) : (
                dataList.map((customer, index) => (
                  <tr className="global_tr" key={customer.contactID || index}>
                    <td className="global_td">{index + 1}</td>
                    <td className="global_td">
                      {customer.contactDetails?.name || "N/A"}
                    </td>
                    <td className="global_td">
                      {customer.contactDetails?.address || "N/A"}
                    </td>
                    <td className="global_td">
                      {customer.contactDetails?.mobile || "N/A"}
                    </td>
                    <td className="global_td">
                      {Intl.NumberFormat("en-IN").format(customer.totalSales)}
                    </td>
                    <td className="global_td">
                      {Intl.NumberFormat("en-IN").format(customer.totalProfit)}
                    </td>
                    <td className="global_td text-center">
                      <button
                        onClick={() =>
                          navigate(`/Transaction/${customer.contactID}`)
                        }
                        className="text-green-600 hover:underline text-center"
                      >
                        <AiOutlineEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {dataList.length > 0 && (
              <tfoot className="font-semibold bg-gray-100 dark:bg-gray-700">
                <tr>
                  <td colSpan="4" className="text-right">
                    Total:
                  </td>
                  <td>
                    {Intl.NumberFormat("en-IN").format(
                      dataList.reduce((a, b) => a + b.totalSales, 0)
                    )}
                  </td>
                  <td>
                    {Intl.NumberFormat("en-IN").format(
                      dataList.reduce((a, b) => a + b.totalProfit, 0)
                    )}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default TopCustomer;
