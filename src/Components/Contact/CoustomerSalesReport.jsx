import React, { useEffect, useState } from "react";
import {
  formatISO,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subWeeks,
  subMonths,
  startOfYear,
  endOfYear,
  subYears,
} from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../Helper/axios_resonse_interceptor";
import loadingStore from "../../Zustand/LoadingStore";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUser,
  FaMobile,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaShoppingCart,
  FaCheckCircle,
  FaExclamationCircle,
  FaChartLine,
  FaFileInvoice,
  FaCalendarAlt,
  FaFilter,
  FaArrowDown,
  FaArrowUp,
} from "react-icons/fa";

const CoustomerSalesReport = () => {
  const { id } = useParams();
  const { setGlobalLoader } = loadingStore();

  const [contact, setContact] = useState(null);
  const [summary, setSummary] = useState(null);
  const [filterType, setFilterType] = useState("thisMonth");

  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));

  // ফিল্টার অপশন
  const filters = [
    { value: "custom", label: "Custom" },
    { value: "last30days", label: "Last 30 Days" },
    { value: "thisWeek", label: "This Week" },
    { value: "lastWeek", label: "Last Week" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "thisYear", label: "This Year" },
    { value: "lastYear", label: "Last Year" },
  ];

  // ডেট রেঞ্জ জেনারেট করার ফাংশন
  const getDateRange = (selectedFilter) => {
    const today = new Date();
    switch (selectedFilter) {
      case "last30days":
        return { start: subDays(today, 30), end: today };
      case "thisWeek":
        return {
          start: startOfWeek(today, { weekStartsOn: 1 }),
          end: endOfWeek(today, { weekStartsOn: 1 }),
        };
      case "lastWeek": {
        const lastWeek = subWeeks(today, 1);
        return {
          start: startOfWeek(lastWeek, { weekStartsOn: 1 }),
          end: endOfWeek(lastWeek, { weekStartsOn: 1 }),
        };
      }
      case "thisMonth":
        return { start: startOfMonth(today), end: endOfMonth(today) };
      case "lastMonth": {
        const lastMonth = subMonths(today, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      }
      case "thisYear":
        return { start: startOfYear(today), end: endOfYear(today) };
      case "lastYear": {
        const lastYear = subYears(today, 1);
        return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
      }
      default:
        return { start: subDays(today, 30), end: today };
    }
  };

  // ফিল্টার চেঞ্জ হলে ডেট আপডেট
  useEffect(() => {
    if (filterType !== "custom") {
      const { start, end } = getDateRange(filterType);
      setStartDate(start);
      setEndDate(end);
    }
  }, [filterType]);

  const fetchReport = async () => {
    setGlobalLoader(true);

    try {
      const res = await api.get(
        `/CoustomerSalesReport/${id}/${formatISO(startDate)}/${formatISO(
          endDate
        )}`
      );

      if (res.data.status === "Success") {
        setContact(res.data.contact);
        setSummary(res.data.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  // Balance status check function
  const getBalanceStatus = (balance) => {
    const numBalance = parseFloat(balance);
    if (numBalance < 0) {
      return {
        text: "Receivable",
        color: "text-green-600",
        bg: "bg-green-100 dark:bg-green-900/30",
        border: "border-green-500",
        icon: <FaArrowDown className="text-green-600" />,
        amount: Math.abs(numBalance),
      };
    } else if (numBalance > 0) {
      return {
        text: "Payable",
        color: "text-red-600",
        bg: "bg-red-100 dark:bg-red-900/30",
        border: "border-red-500",
        icon: <FaArrowUp className="text-red-600" />,
        amount: numBalance,
      };
    } else {
      return {
        text: "Settled",
        color: "text-gray-600",
        bg: "bg-gray-100 dark:bg-gray-700",
        border: "border-gray-500",
        icon: null,
        amount: 0,
      };
    }
  };

  // অ্যানিমেশন ভেরিয়েন্ট
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Customer Sales Report
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            View customer's sales history and summary
          </p>
        </motion.div>

        {/* Contact Info Cards */}
        {contact && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-blue-500"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FaUser className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Customer
                  </p>
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                    {contact.name}
                  </h3>
                  {contact?.contactPerson && (
                    <span className="text-sm text-gray-500">
                      {contact.contactPerson}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-green-500"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <FaMobile className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Mobile
                  </p>
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                    {contact.mobile}
                  </h3>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 border-purple-500"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <FaMapMarkerAlt className="text-purple-600 dark:text-purple-400 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Address
                  </p>
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg truncate">
                    {contact.address || "N/A"}
                  </h3>
                </div>
              </div>
            </motion.div>

            {/* Balance Card with Dynamic Status */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className={`bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border-l-4 ${
                getBalanceStatus(contact.balance).border
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-lg ${
                    getBalanceStatus(contact.balance).bg
                  }`}
                >
                  <FaMoneyBillWave
                    className={`text-xl ${
                      getBalanceStatus(contact.balance).color
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Balance
                  </p>
                  <div className="flex items-center gap-2">
                    {getBalanceStatus(contact.balance).icon}
                    <h3
                      className={`font-bold text-lg ${
                        getBalanceStatus(contact.balance).color
                      }`}
                    >
                      ৳ {Math.abs(contact.balance)}
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      getBalanceStatus(contact.balance).color
                    }`}
                  >
                    {getBalanceStatus(contact.balance).text}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Filter Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Filter Report
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filter Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Period
              </label>
              <select
                className="global_dropdown w-full"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                {filters.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                <DatePicker
                  selected={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                    setFilterType("custom");
                  }}
                  className="global_input pl-10 w-full"
                  dateFormat="dd-MM-yyyy"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => {
                    setEndDate(date);
                    setFilterType("custom");
                  }}
                  className="global_input pl-10 w-full"
                  dateFormat="dd-MM-yyyy"
                />
              </div>
            </div>

            {/* Load Button */}
            <div className="flex items-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchReport}
                className="global_button w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5"
              >
                Load Report
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        {summary && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {/* Total Sale */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-xl shadow-lg text-white"
            >
              <div className="flex items-center justify-between mb-2">
                <FaShoppingCart className="text-2xl opacity-80" />
                <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
                  Sale
                </span>
              </div>
              <p className="text-sm opacity-90">Total Sale</p>
              <p className="text-2xl font-bold">৳ {summary.totalSale}</p>
            </motion.div>

            {/* Paid */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 p-5 rounded-xl shadow-lg text-white"
            >
              <div className="flex items-center justify-between mb-2">
                <FaCheckCircle className="text-2xl opacity-80" />
                <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
                  Paid
                </span>
              </div>
              <p className="text-sm opacity-90">Total Paid</p>
              <p className="text-2xl font-bold">৳ {summary.totalPaid}</p>
            </motion.div>

            {/* Due */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-red-500 to-pink-500 p-5 rounded-xl shadow-lg text-white"
            >
              <div className="flex items-center justify-between mb-2">
                <FaExclamationCircle className="text-2xl opacity-80" />
                <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
                  Due
                </span>
              </div>
              <p className="text-sm opacity-90">Total Due</p>
              <p className="text-2xl font-bold">৳ {summary.totalDue}</p>
            </motion.div>

            {/* Profit */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-xl shadow-lg text-white"
            >
              <div className="flex items-center justify-between mb-2">
                <FaChartLine className="text-2xl opacity-80" />
                <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
                  Profit
                </span>
              </div>
              <p className="text-sm opacity-90">Total Profit</p>
              <p className="text-2xl font-bold">৳ {summary.totalProfit}</p>
            </motion.div>

            {/* Invoices */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-amber-500 to-orange-500 p-5 rounded-xl shadow-lg text-white"
            >
              <div className="flex items-center justify-between mb-2">
                <FaFileInvoice className="text-2xl opacity-80" />
                <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
                  Invoices
                </span>
              </div>
              <p className="text-sm opacity-90">Total Invoices</p>
              <p className="text-2xl font-bold">{summary.totalInvoice}</p>
            </motion.div>
          </motion.div>
        )}

        {/* No Data Message */}
        {!summary && !contact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-500 dark:text-gray-400">
              No data available for this customer
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default CoustomerSalesReport;