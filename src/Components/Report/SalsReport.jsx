import React, { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../../Helper/SessionHelper";
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
import { BaseURL } from "../../Helper/Config";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createPortal } from "react-dom";
import { AiOutlineEye } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
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

const SalesReport = () => {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [period, setPeriod] = useState("");
  const [dataList, setDataList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { setGlobalLoader } = loadingStore();
  const navigate = useNavigate();

  // Fetch data from API
  const fetchData = async (start, end) => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/SalesListByDate/${formatISO(start)}/${formatISO(end)}`
      );
      setDataList(res.data.data || []);
      // toast.success("Sales data fetched successfully!");
    } catch (error) {
      console.error("API Error:", error);
      // toast.error("Failed to fetch sales report data!");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchData(startDate, endDate);
  }, [startDate, endDate]);

  // Handle period change
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
        newStartDate = new Date();
        newEndDate = new Date();
        break;
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
    fetchData(newStartDate, newEndDate);
  };

  // Filter by search
  const filteredData = dataList.filter(
    (sale) =>
      sale.referenceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.Customer[0]?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="global_container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="global_sub_container">
        
        {/* Filters */}
        <div className="grid md:grid-cols-4 grid-cols-2 gap-5">
          {/* Period Select */}
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
              popperContainer={(props) =>
                createPortal(<div {...props} />, document.body)
              }
            />
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by Customer or Reference No"
              className="global_input w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Data Section */}
      <div className="global_sub_container mt-5">
        <h1 className="global_heading">Sales Report Data</h1>

        <div className="overflow-x-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr>
                <th className="global_th">#</th>
                <th className="global_th">Reference</th>

                <th className="global_th">Customer Name</th>
                <th className="global_th">Sales Person</th>
                <th className="global_th">Grand Total</th>
                <th className="global_th">Paid</th>
                <th className="global_th">Due Amount</th>
                <th className="global_th">Profit</th>
                <th className="global_th">Created Date</th>
                <th className="global_th">Action</th>
              </tr>
            </thead>

            <tbody className="global_tbody">
              {filteredData.length === 0 ? (
                <tr className="global_tr">
                  <td
                    colSpan="10"
                    className="text-center py-10 text-gray-500 text-lg italic"
                  >
                    No Sales Record Found
                  </td>
                </tr>
              ) : (
                filteredData.map((sale, index) => (
                  <tr className="global_tr" key={sale._id}>
                    <td className="global_td">{index + 1}</td>
                    <td className="global_td">
                      <Link to={`/Invoice/1/${sale._id}`}>
                        {sale.referenceNo}
                      </Link>
                    </td>
                    <td className="global_td">
                      {sale.Customer[0]?.name || "N/A"}
                    </td>
                    <td className="global_td">
                      {sale.Users[0]?.fullName || "N/A"}
                    </td>
                    <td className="global_td">
                      {Intl.NumberFormat("en-IN").format(sale.grandTotal || 0)}
                    </td>
                    <td className="global_td">
                      {Intl.NumberFormat("en-IN").format(sale.paid || 0)}
                    </td>
                    <td className="global_td">
                      {Intl.NumberFormat("en-IN").format(sale.dueAmount || 0)}
                    </td>
                    <td className="global_td">
                      {Intl.NumberFormat("en-IN").format(sale.profit || 0)}
                    </td>
                    <td className="global_td">
                      {(() => {
                        const d = new Date(sale.CreatedDate);

                        // Date in DD-MM-YYYY format
                        const day = String(d.getDate()).padStart(2, "0");
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const year = d.getFullYear();
                        const formattedDate = `${day}-${month}-${year}`;

                        // Time in HH:MM AM/PM format
                        const formattedTime = d.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        });

                        return `${formattedDate} ${formattedTime}`;
                      })()}
                    </td>
                    <td className="global_td text-center">
                      <button
                        onClick={() => navigate(`/Invoice/1/${sale._id}`)}
                        className="text-green-600 hover:underline text-center"
                      >
                        <AiOutlineEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
