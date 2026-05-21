import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { ErrorToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import {
  FaCalendarAlt,
  FaShoppingCart,
  FaBox,
  FaChartLine,
  FaMoneyBillWave,
  FaReceipt,
  FaChartPie,
  FaUsers,
  FaBell,
  FaWallet,
  FaTruck,
  FaCreditCard,
  FaChartBar,
} from "react-icons/fa";
import { BsGearWideConnected } from "react-icons/bs";
import { MdDashboard, MdOutlineDateRange, MdOutlineEditCalendar, MdOutlineElectricalServices, MdShowChart } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../Helper/axios_resonse_interceptor";
import { getDateRange } from "../../Helper/dateRangeHelper";
import useLanguageStore from "../../Zustand/languageStore";
import { dateRangeOptions } from "../../TranslationText/TranslateTextDateRange";
import { translateDatePickerText } from "../../TranslationText/TranslateTextDateRange";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { Link, useNavigate } from "react-router-dom";
import { getBusinessDetails } from "../../Helper/SessionHelper";
import SummaryDashboard from "./SummaryDashboard";
import { TranslateDashBoard } from "../../TranslationText/TranslateDashboard";
import Swal from "sweetalert2";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";

const Dashboard = () => {
  const { setGlobalLoader } = loadingStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [last30DaysData, setLast30DaysData] = useState([]);
  const { lang } = useLanguageStore();
  const t = useTextTranslate(GlobalTableTranslator);
  const navigate = useNavigate();

  // latest data state
  const [saleList, setSaleList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState("area"); // area, bar, line

  // date states
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState("Today");
  const [initialized, setInitialized] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // কার্ড অ্যানিমেশন ভেরিয়েন্টস
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  // dateRangeOptions চেক করে নেওয়া
  const dateRangeOptionsList = useMemo(() => {
    if (dateRangeOptions && typeof dateRangeOptions === 'object') {
      return Object.values(dateRangeOptions).map(opt => ({
        value: opt.value,
        label: opt.label?.[lang] || opt.label?.en || opt.value
      }));
    }
    if (Array.isArray(dateRangeOptions)) {
      return dateRangeOptions.map(opt => ({
        value: opt.value,
        label: opt.label?.[lang] || opt.label?.en || opt.value
      }));
    }
    return [
      { value: "Today", label: lang === "bn" ? "আজ" : "Today" },
      { value: "Yesterday", label: lang === "bn" ? "গতকাল" : "Yesterday" },
      { value: "ThisWeek", label: lang === "bn" ? "এই সপ্তাহ" : "This Week" },
      { value: "LastWeek", label: lang === "bn" ? "গত সপ্তাহ" : "Last Week" },
      { value: "ThisMonth", label: lang === "bn" ? "এই মাস" : "This Month" },
      { value: "LastMonth", label: lang === "bn" ? "গত মাস" : "Last Month" },
      { value: "Last30Days", label: lang === "bn" ? "গত ৩০ দিন" : "Last 30 Days" },
      { value: "Custom", label: lang === "bn" ? "কাস্টম" : "Custom" },
    ];
  }, [lang]);

  const toISO = useCallback((date, end = false) => {
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
  }, []);

  // latest data
  const fetchLatestInvoice = useCallback(async () => {
    try {
      const { data } = await api.get("/SalesList/1/10/0");
      if (data.status === "Success") {
        setSaleList(data.data || []);
      }
    } catch (error) {
      console.log(error);
      setSaleList([]);
    }
  }, []);

  // Fetch Last 30 Days Data
  const fetchLast30DaysData = useCallback(async () => {
    try {
      const { data } = await api.get("/GetLast30DaysData");
      if (data.status === "Success") {
        setLast30DaysData(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching last 30 days data:", error);
      setLast30DaysData([]);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!startDate || !endDate) return;

    const start = toISO(startDate);
    const end = toISO(endDate, true);
    setGlobalLoader(true);
    setIsLoading(true);

    try {
      const res = await api.get(`/GetDashboardData/${start}/${end}`);

      if (res.data.status === "Success") {
        setDashboardData(res.data);
      }
    } catch (error) {
      ErrorToast(error.message);
      console.error(error);
    } finally {
      setGlobalLoader(false);
      setIsLoading(false);
    }
  }, [startDate, endDate, setGlobalLoader, toISO]);

  useEffect(() => {
    const { start, end } = getDateRange("Today");
    setStartDate(new Date(start));
    setEndDate(new Date(end));
    setInitialized(true);
    fetchLatestInvoice();
    fetchLast30DaysData(); // Fetch last 30 days data
  }, [fetchLatestInvoice, fetchLast30DaysData]);

  useEffect(() => {
    if (initialized) {
      fetchDashboardData();
    }
  }, [startDate, endDate, initialized, fetchDashboardData]);

  // Format number with commas
  const formatNumber = useCallback((num) => {
    if (!num && num !== 0) return "0.00";
    return Number(num).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  // Prepare chart data - মেমোইজ করা
  const chartData = useMemo(() => {
    if (!dashboardData) return [];

    return [
      {
        name: lang === "bn" ? "বিক্রয়" : "Sales",
        value: dashboardData.sales?.totalSales || 0,
        color: "#10b981",
      },
      {
        name: lang === "bn" ? "ক্রয়" : "Purchases",
        value: dashboardData.purchases?.totalPurchases || 0,
        color: "#3b82f6",
      },
      {
        name: lang === "bn" ? "খরচ" : "Expenses",
        value: dashboardData.expenses?.totalExpenses || 0,
        color: "#ef4444",
      },
    ];
  }, [dashboardData, lang]);

  // Last 30 Days Chart Data - ফরম্যাট করা
  const last30DaysChartData = useMemo(() => {
    if (!last30DaysData.length) return [];

    return last30DaysData.map((item) => ({
      date: new Date(item.date).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
        day: "2-digit",
        month: "short",
      }),
      fullDate: item.date,
      sales: item.totalSales || 0,
      purchases: item.totalPurchases || 0,
      expenses: item.totalExpenses || 0,
    }));
  }, [last30DaysData, lang]);

  // Calculate totals for last 30 days
  const last30DaysTotals = useMemo(() => {
    const totals = {
      totalSales: 0,
      totalPurchases: 0,
      totalExpenses: 0,
      avgSales: 0,
      maxSales: 0,
      maxSalesDate: "",
    };

    if (last30DaysData.length) {
      last30DaysData.forEach(item => {
        totals.totalSales += item.totalSales || 0;
        totals.totalPurchases += item.totalPurchases || 0;
        totals.totalExpenses += item.totalExpenses || 0;

        if (item.totalSales > totals.maxSales) {
          totals.maxSales = item.totalSales;
          totals.maxSalesDate = item.date;
        }
      });

      totals.avgSales = totals.totalSales / last30DaysData.length;
    }

    return totals;
  }, [last30DaysData]);

  const smsAleart = dashboardData?.sms < 5;
  const alertShownRef = useRef(false);

  useEffect(() => {
    if (smsAleart && !alertShownRef.current) {
      alertShownRef.current = true;
      Swal.fire({
        icon: "warning",
        title: lang === "bn" ? "এসএমএস সতর্কতা" : "SMS Alert",
        html: `
          <p class="mb-2">${lang === "bn"
            ? "আপনার SMS ব্যালেন্স <b>৫টির কম</b> হয়ে গেছে"
            : "Your SMS balance is <b>less than 5</b>"
          }</p>
          <a 
            href="/BuySMS" 
            class="inline-block mt-2 text-green-600 hover:text-green-700 font-medium underline"
          >
            ${lang === "bn" ? "রিচার্জ করুন" : "Recharge Now"}
          </a>
        `,
        confirmButtonText: lang === "bn" ? "ঠিক আছে" : "Okay",
        confirmButtonColor: "#22c55e",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#f9fafb"
          : "#111827",
      });
    }
  }, [smsAleart, lang]);

  const getBusinessExpiryStatus = useCallback(() => {
    const endDateStr = getBusinessDetails()?.endDate;
    if (!endDateStr) {
      return {
        daysLeft: 0,
        progressPercent: 0,
        barColor: "bg-red-600",
        isExpired: true,
        isCritical: false,
        isWarning: false,
      };
    }

    const expiryDate = new Date(endDateStr);
    const today = new Date();

    const diffTime = expiryDate - today;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const MAX_DAYS = 30;
    let progressPercent = 100;

    if (daysLeft <= 0) {
      progressPercent = 0;
    } else if (daysLeft < MAX_DAYS) {
      progressPercent = (daysLeft / MAX_DAYS) * 100;
    }

    const barColor =
      daysLeft <= 0
        ? "bg-red-600"
        : daysLeft <= 7
          ? "bg-orange-500"
          : daysLeft <= 30
            ? "bg-yellow-500"
            : "bg-green-500";

    return {
      daysLeft,
      progressPercent,
      barColor,
      isExpired: daysLeft <= 0,
      isCritical: daysLeft > 0 && daysLeft <= 7,
      isWarning: daysLeft > 7 && daysLeft <= 30,
    };
  }, []);

  const { daysLeft, progressPercent, barColor } = getBusinessExpiryStatus();

  const handleNavigate = useCallback((value) => {
    value === "sale" ? navigate("/NewSale") : navigate("/CreatePurchase");
  }, [navigate]);

  // Chart type selector component
  const ChartTypeSelector = () => (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
      <button
        onClick={() => setChartType("area")}
        className={`p-2 rounded-md transition-all ${chartType === "area"
          ? "bg-white dark:bg-gray-800 shadow-md text-green-600"
          : "text-gray-500 hover:text-gray-700"
          }`}
        title={lang === "bn" ? "এরিয়া চার্ট" : "Area Chart"}
      >
        <MdShowChart className="text-lg" />
      </button>
      <button
        onClick={() => setChartType("bar")}
        className={`p-2 rounded-md transition-all ${chartType === "bar"
          ? "bg-white dark:bg-gray-800 shadow-md text-blue-600"
          : "text-gray-500 hover:text-gray-700"
          }`}
        title={lang === "bn" ? "বার চার্ট" : "Bar Chart"}
      >
        <FaChartBar className="text-lg" />
      </button>
      <button
        onClick={() => setChartType("line")}
        className={`p-2 rounded-md transition-all ${chartType === "line"
          ? "bg-white dark:bg-gray-800 shadow-md text-purple-600"
          : "text-gray-500 hover:text-gray-700"
          }`}
        title={lang === "bn" ? "লাইন চার্ট" : "Line Chart"}
      >
        <FaChartLine className="text-lg" />
      </button>
    </div>
  );

  // Render chart based on selected type
  const renderTrendChart = () => {
    const commonProps = {
      data: last30DaysChartData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    switch (chartType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#6b7280" angle={-45} textAnchor="end" height={60} />
            <YAxis stroke="#6b7280" />
            <Tooltip
              formatter={(value) => formatNumber(value)}
              labelFormatter={(label) => `${lang === "bn" ? "তারিখ" : "Date"}: ${label}`}
              contentStyle={{
                backgroundColor: document.documentElement.classList.contains("dark")
                  ? "#1f2937"
                  : "#ffffff",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            />
            <Legend />
            <Bar dataKey="sales" name={lang === "bn" ? "বিক্রয়" : "Sales"} fill="#10b981" />
            <Bar dataKey="purchases" name={lang === "bn" ? "ক্রয়" : "Purchases"} fill="#3b82f6" />
            <Bar dataKey="expenses" name={lang === "bn" ? "খরচ" : "Expenses"} fill="#ef4444" />
          </BarChart>
        );

      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#6b7280" angle={-45} textAnchor="end" height={60} />
            <YAxis stroke="#6b7280" />
            <Tooltip
              formatter={(value) => formatNumber(value)}
              labelFormatter={(label) => `${lang === "bn" ? "তারিখ" : "Date"}: ${label}`}
              contentStyle={{
                backgroundColor: document.documentElement.classList.contains("dark")
                  ? "#1f2937"
                  : "#ffffff",
                border: "none",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="sales" name={lang === "bn" ? "বিক্রয়" : "Sales"} stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="purchases" name={lang === "bn" ? "ক্রয়" : "Purchases"} stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="expenses" name={lang === "bn" ? "খরচ" : "Expenses"} stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        );

      case "area":
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#6b7280" angle={-45} textAnchor="end" height={60} />
            <YAxis stroke="#6b7280" />
            <Tooltip
              formatter={(value) => formatNumber(value)}
              labelFormatter={(label) => `${lang === "bn" ? "তারিখ" : "Date"}: ${label}`}
              contentStyle={{
                backgroundColor: document.documentElement.classList.contains("dark")
                  ? "#1f2937"
                  : "#ffffff",
                border: "none",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="sales"
              name={lang === "bn" ? "বিক্রয়" : "Sales"}
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorSales)"
            />
            <Area
              type="monotone"
              dataKey="purchases"
              name={lang === "bn" ? "ক্রয়" : "Purchases"}
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorPurchases)"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name={lang === "bn" ? "খরচ" : "Expenses"}
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorExpenses)"
            />
          </AreaChart>
        );
    }
  };

  // Quick Action Buttons
  const QuickActions = () => (
    <div className="flex flex-wrap gap-2 mb-2">
      {/* New Sale - Green */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/NewSale")}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <FaShoppingCart className="text-sm" />
        <span className="hidden sm:inline">{lang === "bn" ? "নতুন বিক্রয়" : "New Sale"}</span>
      </motion.button>

      {/* New Purchase - Blue */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/CreatePurchase")}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <FaBox className="text-sm" />
        <span className="hidden sm:inline">{lang === "bn" ? "নতুন ক্রয়" : "New Purchase"}</span>
      </motion.button>

      {/* Product List - Purple */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/ProductList")}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <FaBox className="text-sm" />
        <span className="hidden sm:inline">{lang === "bn" ? "পণ্য তালিকা" : "Product List"}</span>
      </motion.button>

      {/* Customer - Indigo */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/Customer")}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-600 transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <FaUsers className="text-sm" />
        <span className="hidden sm:inline">{lang === "bn" ? "কাস্টমার" : "Customer"}</span>
      </motion.button>

      {/* Supplier - Orange */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/Supplier")}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <FaTruck className="text-sm" />
        <span className="hidden sm:inline">{lang === "bn" ? "সাপ্লায়ার" : "Supplier"}</span>
      </motion.button>

      {/* Sale List - Pink */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/SaleList")}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-lg hover:from-pink-700 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <FaReceipt className="text-sm" />
        <span className="hidden sm:inline">{lang === "bn" ? "বিক্রয় তালিকা" : "Sales List"}</span>
      </motion.button>

      {/* Purchase List - Teal */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/PurchaseList")}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-lg hover:from-teal-700 hover:to-teal-600 transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <FaBox className="text-sm" />
        <span className="hidden sm:inline">{lang === "bn" ? "ক্রয় তালিকা" : "Purchase List"}</span>
      </motion.button>

      {/* Service - Green */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/CreateService")}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <MdOutlineElectricalServices className="text-sm" />

        <span className="hidden sm:inline">{lang === "bn" ? "সার্ভিস" : "Service"}</span>
      </motion.button>

      {/* Service List - Green */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/ServiceList")}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <MdOutlineEditCalendar className="text-sm" />

        <span className="hidden sm:inline">{lang === "bn" ? "সার্ভিস তালিকা" : "Service List"}</span>
      </motion.button>
    </div>
  );

  return (
    <div className="p-3 md:p-3 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
   

        <QuickActions />
      </div>

      {/* Date Range Selector */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md p-3"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Range Select */}
          <div className="flex items-center gap-3">
            <MdOutlineDateRange className="text-xl text-gray-500" />
            <select
              value={selectedRange}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedRange(value);
                if (value !== "Custom") {
                  const { start, end } = getDateRange(value);
                  setStartDate(new Date(start));
                  setEndDate(new Date(end));
                } else {
                  setShowDatePicker(true);
                }
              }}
              className="global_dropdown min-w-[150px]"
            >
              {dateRangeOptionsList.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Pickers */}
          <AnimatePresence>
            {(showDatePicker || selectedRange === "Custom") && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col sm:flex-row gap-4 overflow-hidden"
              >
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400" />
                  <DatePicker
                    selected={startDate}
                    onChange={(d) => setStartDate(d)}
                    dateFormat="dd-MM-yyyy"
                    className="global_input w-32"
                    placeholderText={translateDatePickerText?.start_date?.[lang] || "Start Date"}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400" />
                  <DatePicker
                    selected={endDate}
                    onChange={(d) => setEndDate(d)}
                    dateFormat="dd-MM-yyyy"
                    className="global_input w-32"
                    placeholderText={translateDatePickerText?.end_date?.[lang] || "End Date"}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Refresh Button */}
          <motion.button
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            onClick={fetchDashboardData}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <FaChartLine className="text-gray-500" />
          </motion.button>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Sales Card */}
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
              onClick={() => handleNavigate("sale")}
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl shadow-lg p-6 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <FaShoppingCart className="text-green-600 text-xl" />
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {dashboardData?.sales?.salesCount || 0}
                </span>
              </div>

              <h3 className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                {TranslateDashBoard?.sale?.[lang] || "Sales"}
              </h3>

              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                <CountUp
                  end={dashboardData?.sales?.totalSales || 0}
                  formattingFn={formatNumber}
                  duration={2}
                />
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">{TranslateDashBoard?.paid?.[lang] || "Paid"}</span>
                  <span className="font-semibold">
                    <CountUp
                      end={dashboardData?.sales?.totalPaidSales || 0}
                      formattingFn={formatNumber}
                      duration={2}
                    />
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">{TranslateDashBoard?.due?.[lang] || "Due"}</span>
                  <span className="font-semibold">
                    <CountUp
                      end={(dashboardData?.sales?.totalSales || 0) - (dashboardData?.sales?.totalPaidSales || 0)}
                      formattingFn={formatNumber}
                      duration={2}
                    />
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${dashboardData?.sales?.totalSales > 0
                        ? (dashboardData.sales.totalPaidSales / dashboardData.sales.totalSales) * 100
                        : 0
                        }%`,
                    }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-green-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {((dashboardData?.sales?.totalPaidSales / dashboardData?.sales?.totalSales) * 100 || 0).toFixed(1)}% {TranslateDashBoard?.collected?.[lang] || "Collected"}
                </p>
              </div>
            </motion.div>

            {/* Purchases Card */}
            <motion.div
              custom={1}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
              onClick={() => handleNavigate("purchase")}
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl shadow-lg p-6 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <FaBox className="text-blue-600 text-xl" />
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {dashboardData?.purchases?.purchasesCount || 0}
                </span>
              </div>

              <h3 className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                {TranslateDashBoard?.purchase?.[lang] || "Purchases"}
              </h3>

              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                <CountUp
                  end={dashboardData?.purchases?.totalPurchases || 0}
                  formattingFn={formatNumber}
                  duration={2}
                />
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">{TranslateDashBoard?.paid?.[lang] || "Paid"}</span>
                  <span className="font-semibold">
                    <CountUp
                      end={dashboardData?.purchases?.totalPaidPurchases || 0}
                      formattingFn={formatNumber}
                      duration={2}
                    />
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">{TranslateDashBoard?.due?.[lang] || "Due"}</span>
                  <span className="font-semibold">
                    <CountUp
                      end={dashboardData?.purchases?.totalDuePurchases || 0}
                      formattingFn={formatNumber}
                      duration={2}
                    />
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${dashboardData?.purchases?.totalPurchases > 0
                        ? (dashboardData.purchases.totalPaidPurchases / dashboardData.purchases.totalPurchases) * 100
                        : 0
                        }%`,
                    }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="h-full bg-green-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {((dashboardData?.purchases?.totalPaidPurchases / dashboardData?.purchases?.totalPurchases) * 100 || 0).toFixed(1)}% {TranslateDashBoard?.paid?.[lang] || "Paid"}
                </p>
              </div>
            </motion.div>

            {/* Cash Flow Card */}
            <motion.div
              custom={2}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
              className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800 rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <FaMoneyBillWave className="text-amber-600 text-xl" />
                </div>
                <FaWallet className="text-amber-600 text-2xl" />
              </div>

              <h3 className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                {TranslateDashBoard?.cash?.[lang] || "Cash Flow"}
              </h3>

              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                <CountUp
                  end={(dashboardData?.transactions?.totalCredit || 0) - (dashboardData?.transactions?.totalDebit || 0)}
                  formattingFn={formatNumber}
                  duration={2}
                />
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">{TranslateDashBoard?.received?.[lang] || "Received"}</span>
                  <span className="font-semibold">
                    <CountUp
                      end={dashboardData?.transactions?.totalCredit || 0}
                      formattingFn={formatNumber}
                      duration={2}
                    />
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">{TranslateDashBoard?.paidOut?.[lang] || "Paid Out"}</span>
                  <span className="font-semibold">
                    <CountUp
                      end={dashboardData?.transactions?.totalDebit || 0}
                      formattingFn={formatNumber}
                      duration={2}
                    />
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${dashboardData?.transactions?.totalCredit > 0
                        ? (dashboardData.transactions.totalDebit / dashboardData.transactions.totalCredit) * 100
                        : 0
                        }%`,
                    }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {((dashboardData?.transactions?.totalDebit / dashboardData?.transactions?.totalCredit) * 100 || 0).toFixed(1)}% {TranslateDashBoard?.paid?.[lang] || "Paid"}
                </p>
              </div>

            </motion.div>

            {/* Account Status Card */}
            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <FaCreditCard className="text-purple-600 text-xl" />
                </div>
                <Link
                  to="/BuySMS"
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${dashboardData?.sms < 10
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                    }`}
                >
                  <FaBell className={dashboardData?.sms < 10 ? "animate-pulse" : ""} />
                  {dashboardData?.sms || 0} {TranslateDashBoard?.sms?.[lang] || "SMS"}
                </Link>
              </div>

              <h3 className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                {TranslateDashBoard?.account?.[lang] || "Account"}
              </h3>

              <Link to="/Payment" className="block mb-3">
                <SubscriptionCountdownLarge lang={lang} />
              </Link>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{TranslateDashBoard?.balance?.[lang] || "Balance"}</span>
                  <span className={`font-semibold ${dashboardData?.accountBalance < 0 ? "text-red-600" : "text-green-600"
                    }`}>
                    <CountUp
                      end={dashboardData?.accountBalance || 0}
                      formattingFn={formatNumber}
                      duration={2}
                    />
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{TranslateDashBoard?.expense?.[lang] || "Expense"}</span>
                  <span className="font-semibold text-red-600">
                    <CountUp
                      end={dashboardData?.expenses?.totalExpenses || 0}
                      formattingFn={formatNumber}
                      duration={2}
                    />
                  </span>
                </div>
              </div>

              {/* Subscription Progress */}
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className={`h-full rounded-full ${barColor}`}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {daysLeft <= 0
                    ? lang === "bn" ? "মেয়াদ উত্তীর্ণ" : "Expired"
                    : daysLeft <= 7
                      ? lang === "bn" ? `${daysLeft} দিন বাকি (জরুরি)` : `${daysLeft} days left (Critical)`
                      : daysLeft <= 30
                        ? lang === "bn" ? `${daysLeft} দিন বাকি` : `${daysLeft} days left`
                        : lang === "bn" ? "সক্রিয়" : "Active"}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Summary Dashboard */}
          <SummaryDashboard data={dashboardData} translate={TranslateDashBoard} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-light dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FaChartPie className="text-blue-600" />
                  {TranslateDashBoard?.chart?.[lang] || "Distribution"}
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatNumber(value)}
                    contentStyle={{
                      backgroundColor: document.documentElement.classList.contains("dark")
                        ? "#1f2937"
                        : "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Last 30 Days Trend Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-light dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <MdShowChart className="text-2xl text-green-600" />
                  <h3 className="text-lg font-semibold">
                    {lang === "bn" ? "গত ৩০ দিনের প্রবণতা" : "Last 30 Days Trend"}
                  </h3>
                </div>
                <ChartTypeSelector />
              </div>

              {/* Summary Stats for Last 30 Days */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {lang === "bn" ? "মোট বিক্রয়" : "Total Sales"}
                  </p>
                  <p className="text-sm font-bold text-green-600">
                    {formatNumber(last30DaysTotals.totalSales)}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {lang === "bn" ? "মোট ক্রয়" : "Total Purchases"}
                  </p>
                  <p className="text-sm font-bold text-blue-600">
                    {formatNumber(last30DaysTotals.totalPurchases)}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {lang === "bn" ? "মোট খরচ" : "Total Expenses"}
                  </p>
                  <p className="text-sm font-bold text-red-600">
                    {formatNumber(last30DaysTotals.totalExpenses)}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {lang === "bn" ? "গড় বিক্রয়" : "Avg. Sales"}
                  </p>
                  <p className="text-sm font-bold text-purple-600">
                    {formatNumber(last30DaysTotals.avgSales)}
                  </p>
                </div>
              </div>

              {/* Chart */}
              <ResponsiveContainer width="100%" height={300}>
                {renderTrendChart()}
              </ResponsiveContainer>

              {/* Max Sales Info */}
              {last30DaysTotals.maxSales > 0 && (
                <div className="mt-3 text-xs text-gray-500 text-right">
                  {lang === "bn"
                    ? `সর্বোচ্চ বিক্রয়: ${formatNumber(last30DaysTotals.maxSales)} (${new Date(last30DaysTotals.maxSalesDate).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")})`
                    : `Max Sales: ${formatNumber(last30DaysTotals.maxSales)} (${new Date(last30DaysTotals.maxSalesDate).toLocaleDateString()})`
                  }
                </div>
              )}
            </motion.div>
          </div>

          {/* Recent Sales Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-light dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaReceipt className="text-purple-600" />
                {TranslateDashBoard?.lastTable?.[lang] || "Recent Sales"}
              </h3>
              <button
                onClick={() => navigate("/SaleList")}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {lang === "bn" ? "সব দেখুন" : "View All"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("customer")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("amount")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("paid")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("due")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("action")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {saleList.map((item, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/Invoice/1/${item?._id}`)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item?.Customer?.[0]?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {formatNumber(item?.grandTotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {formatNumber(item?.paid || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {formatNumber(item?.dueAmount || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <FaReceipt className="hover:text-blue-600 transition-colors" />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

// SubscriptionCountdownLarge কম্পোনেন্ট
const SubscriptionCountdownLarge = ({ lang }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const endDateStr = getBusinessDetails()?.endDate;
  const endDate = new Date(endDateStr);

  useEffect(() => {
    const now = new Date();
    if (!endDateStr || endDate < now) {
      navigate("/Payment");
    }
  }, [endDateStr, endDate, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = endDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="flex items-center justify-center gap-1 text-sm font-mono"
    >
      <span className="px-1.5 py-1 bg-green-100 dark:bg-green-900 rounded text-green-600 dark:text-green-400">
        {timeLeft.days}d
      </span>
      <span className="text-gray-400">:</span>
      <span className="px-1.5 py-1 bg-blue-100 dark:bg-blue-900 rounded text-blue-600 dark:text-blue-400">
        {String(timeLeft.hours).padStart(2, "0")}h
      </span>
      <span className="text-gray-400">:</span>
      <span className="px-1.5 py-1 bg-purple-100 dark:bg-purple-900 rounded text-purple-600 dark:text-purple-400">
        {String(timeLeft.minutes).padStart(2, "0")}m
      </span>
      <span className="text-gray-400">:</span>
      <span className="px-1.5 py-1 bg-red-100 dark:bg-red-900 rounded text-red-600 dark:text-red-400">
        {String(timeLeft.seconds).padStart(2, "0")}s
      </span>
    </motion.div>
  );
};