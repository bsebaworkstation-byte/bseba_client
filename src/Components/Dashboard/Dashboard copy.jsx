import React, { useEffect, useRef, useState } from "react";
import { ErrorToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import {
  FaCalendarAlt,
  FaDollarSign,
  FaShoppingCart,
  FaUsers,
  FaBox,
  FaChartLine,
  FaMoneyBillWave,
  FaReceipt,
  FaPercentage,
  FaChartPie,
  FaBalanceScale,
  FaPlus,
} from "react-icons/fa";
import { BsGearWideConnected } from "react-icons/bs";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../Helper/axios_resonse_interceptor";
import { getDateRange } from "../../Helper/dateRangeHelper";
import useLanguageStore from "../../Zustand/languageStore";
import { dateRangeOptions } from "../../TranslationText/TranslateTextDateRange";
import { translateDatePickerText } from "../../TranslationText/TranslateTextDateRange";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Link, useNavigate } from "react-router-dom";
import SubscriptionCountdown from "../../Helper/UI/SubscriptionCountdown";
import { getBusinessDetails } from "../../Helper/SessionHelper";
import SummaryDashboard from "./SummaryDashboard";
import { TranslateDashBoard } from "../../TranslationText/TranslateDashboard";
import Swal from "sweetalert2";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";

const Dashboard = () => {
  const { setGlobalLoader } = loadingStore();
  const [dashboardData, setDashboardData] = useState(null);
  const { lang } = useLanguageStore();
  const t = useTextTranslate(GlobalTableTranslator);

  // latest data state
  const [saleList, setSaleList] = useState([]);

  // date states
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState("Today");
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

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

  // latest data
  const fetchLatestInvoice = async () => {
    try {
      const { data } = await api.get("/SalesList/1/10/0");
      if (data.status === "Success") {
        setSaleList(data.data || []);
      }
    } catch (error) {
      console.log(error);
      setSaleList([]);
    }
  };

  const fetchDashboardData = async () => {
    if (!startDate || !endDate) return;

    const start = toISO(startDate);
    const end = toISO(endDate, true);
    setGlobalLoader(true);

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
    }
  };
  // console.log(saleList.slice(2,5))
  useEffect(() => {
    const { start, end } = getDateRange("Today");
    setStartDate(new Date(start));
    setEndDate(new Date(end));
    setInitialized(true);
    fetchLatestInvoice();
  }, []);

  useEffect(() => {
    if (initialized) {
      fetchDashboardData();
    }
  }, [startDate, endDate]);

  // Format number with commas
  const formatNumber = (num) => {
    if (!num && num !== 0) return "0.00";

    return Number(num).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  // Prepare chart data
  const prepareChartData = () => {
    if (!dashboardData) return [];

    return [
      {
        name: "Sales",
        value: dashboardData.sales?.totalSales || 0,
        color: "#10b981",
      },
      {
        name: "Purchases",
        value: dashboardData.purchases?.totalPurchases || 0,
        color: "#3b82f6",
      },
      {
        name: "Expenses",
        value: dashboardData.expenses?.totalExpenses || 0,
        color: "#ef4444",
      },
      // {
      //   name: "Salary",
      //   value: dashboardData.salary?.totalSalary || 0,
      //   color: "#f59e0b",
      // },
    ];
  };


  // const calculateNetProfit = () => {
  //   if (!dashboardData) return 0;

  //   const salesProfit = dashboardData.sales?.totalProfit || 0;
  //   const expenses = dashboardData.expenses?.totalExpenses || 0;
  //   const salary = dashboardData.salary?.totalSalary || 0;
  //   const purchaseCost = dashboardData.purchases?.totalPurchasesCost || 0;
  //   const saleReturnLoss =
  //     dashboardData.saleReturns?.totalSaleReturnProfitLoss || 0;

  //   return (
  //     salesProfit - expenses - salary - purchaseCost - Math.abs(saleReturnLoss)
  //   );
  // };

  const smsAleart = dashboardData?.sms < 5;

  const alertShownRef = useRef(false);

  useEffect(() => {
    if (smsAleart && !alertShownRef.current) {
      alertShownRef.current = true;

      Swal.fire({
        icon: "warning",
        title: "SMS Alert",
        html: `
    <p>আপনার SMS ব্যালেন্স <b>৫টির কম</b> হয়ে গেছে</p>
    <a 
      href="/BuySMS" 
      class="swal-link"
      style="
        display:inline-block;
        margin-top:8px;
        color:#22c55e;
        text-decoration:underline;
        font-weight:500;
      "
    >
      রিচার্জ করুন
    </a>
  `,
        confirmButtonText: "Okay",
        confirmButtonColor: "#dc2626",
        background: document.documentElement.classList.contains("dark")
          ? "#020617"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#f9fafb"
          : "#111827",
      });
    }
  }, [smsAleart]);

  
  // navigate
  const handleNavigate = (value) => {
    value === "sale" ? navigate("/NewSale") : navigate("/CreatePurchase");
  };

  const getBusinessExpiryStatus = () => {
    const endDateStr = getBusinessDetails().endDate; // "2025-10-27T02:33:27.746Z"
    const expiryDate = new Date(endDateStr);
    const today = new Date();

    const diffTime = expiryDate - today;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const MAX_DAYS = 30;
    let progressPercent = 100;

    if (daysLeft <= 0) {
      progressPercent = 0; // expired
    } else if (daysLeft < MAX_DAYS) {
      progressPercent = (daysLeft / MAX_DAYS) * 100;
    } else {
      progressPercent = 100;
    }

    const barColor =
      daysLeft <= 0
        ? "bg-red-700"
        : daysLeft <= 30
        ? "bg-red-500"
        : "bg-green-500";

    return {
      daysLeft,
      progressPercent,
      barColor,
      isExpired: daysLeft <= 0,
      isWarning: daysLeft > 0 && daysLeft <= 30,
    };
  };
  const { daysLeft, progressPercent, barColor } = getBusinessExpiryStatus();

  return (
    <div className="p-2">
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

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4  gap-2 sm:gap-4 mb-8">
        {/* Sales Card */}
        <div
          onClick={() => handleNavigate("sale")}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 sm:p-6 border-l-4 border-green-500"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaShoppingCart className="text-green-600 text-xl" />
            </div>

            {dashboardData?.sales?.salesCount || 0}
            <span className="font-medium text-lg text-green-600">
              {" "}
              {TranslateDashBoard.sale[lang]}
            </span>
          </div>

          <h3 className="text-2xl font-bold mb-1 text-center">
            {formatNumber(dashboardData?.sales?.totalSales || 0)}
          </h3>

          <div className="mt-3 text-sm font-semibold">
            <h1 className="text-green-600 flex justify-between">
              <span> {TranslateDashBoard.paid[lang]}:</span>{" "}
              <span>
                {" "}
                {formatNumber(dashboardData?.sales?.totalPaidSales || 0)}
              </span>
            </h1>
            <h1 className="text-red-600 flex justify-between">
              <span> {TranslateDashBoard.due[lang]}: </span>
              <span>
                {formatNumber(
                  (dashboardData?.sales?.totalSales || 0) -
                    (dashboardData?.sales?.totalPaidSales || 0)
                )}
              </span>
            </h1>
          </div>

          {/* Progress Bar: Paid Percentage dekhabe */}
          <div className="h-2 bg-red-600 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{
                width: `${
                  dashboardData?.sales?.totalSales > 0
                    ? Math.min(
                        (dashboardData.sales.totalPaidSales /
                          dashboardData.sales.totalSales) *
                          100,
                        100
                      )
                    : 0
                }%`,
              }}
            ></div>
          </div>

          {/* Optional: Percentage Text */}
          <p className="text-[10px] text-gray-400 mt-1 text-right italic">
            {dashboardData?.sales?.totalSales > 0
              ? (
                  (dashboardData.sales.totalPaidSales /
                    dashboardData.sales.totalSales) *
                  100
                ).toFixed(1)
              : 0}
            % {TranslateDashBoard.collected[lang]}
          </p>
        </div>

        {/* Purchases Card */}
        <div
          onClick={() => handleNavigate("purchase")}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 sm:p-6 border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaBox className="text-blue-600 text-xl" />
            </div>
            <span className="text-center">
              {dashboardData?.purchases?.purchasesCount || 0}
            </span>
            <span className="font-medium dark:text-white text-blue-600 text-lg">
              {TranslateDashBoard.purchase[lang]}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1"></h3>
          <p className="text-2xl font-bold text-center">
            {formatNumber(dashboardData?.purchases?.totalPurchases || 0)}
          </p>
          <div className="mt-3 text-sm font-semibold">
            <h1 className="text-green-600 flex justify-between ">
              <span> {TranslateDashBoard.paid[lang]}: </span>
              {formatNumber(dashboardData?.purchases?.totalPaidPurchases || 0)}
            </h1>
            <h1 className="text-red-600 flex justify-between ">
              <span> {TranslateDashBoard.due[lang]}: </span>
              {formatNumber(dashboardData?.purchases?.totalDuePurchases || 0)}
            </h1>
          </div>
          <div>
            <div className="h-2 bg-red-600 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{
                  width: `${
                    dashboardData?.purchases?.totalPurchases > 0
                      ? Math.min(
                          (dashboardData.purchases.totalPaidPurchases /
                            dashboardData.purchases.totalDuePurchases) *
                            100,
                          100
                        )
                      : 0
                  }%`,
                }}
              ></div>
            </div>

            {/* Optional: Percentage Text */}
            <p className="text-[10px] text-gray-400 mt-1 text-right italic">
              {dashboardData?.purchases?.totalPurchases > 0
                ? (
                    (dashboardData.purchases.totalPaidPurchases /
                      dashboardData.purchases.totalPurchases) *
                    100
                  ).toFixed(1)
                : 0}
              % {TranslateDashBoard.paid[lang]}
            </p>
          </div>
        </div>

        {/* Cash Flow Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 sm:p-6 border-l-4 border-amber-400">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FaMoneyBillWave className="text-orange-600 text-xl" />
            </div>

            <span className="font-medium dark:text-white text-orange-600 text-lg">
              {TranslateDashBoard.cash[lang]}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1"></h3>
          <h3 className="text-2xl font-bold mb-1 text-center">
            <span
              className={`${
                (dashboardData?.transactions?.totalCredit || 0) >
                (dashboardData?.transactions?.totalDebit || 0)
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatNumber(
                (dashboardData?.transactions?.totalCredit || 0) -
                  (dashboardData?.transactions?.totalDebit || 0)
              )}
            </span>
          </h3>

          <div className="mt-3 text-sm font-semibold">
            <div className="flex justify-between items-center text-green-600">
              <span className=""> {TranslateDashBoard.received[lang]}:</span>
              <span className="text-green-600 font-semibold">
                {formatNumber(dashboardData?.transactions?.totalCredit || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center text-red-600">
              <span className=""> {TranslateDashBoard.paidOut[lang]}:</span>
              <span className="text-red-600 font-semibold">
                {formatNumber(dashboardData?.transactions?.totalDebit || 0)}
              </span>
            </div>
          </div>
          <div>
            <div className="h-2 bg-red-600 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{
                  width: `${
                    dashboardData?.transactions?.totalCredit > 0
                      ? Math.min(
                          (dashboardData.transactions.totalCredit /
                            dashboardData?.transactions?.totalDebit) *
                            100,
                          100
                        )
                      : 0
                  }%`,
                }}
              ></div>
            </div>

            {/* Optional: Percentage Text */}
            <p className="text-[10px] text-gray-400 mt-1 text-right italic">
              {dashboardData?.transactions?.totalCredit > 0
                ? (
                    (dashboardData.transactions.totalDebit /
                      dashboardData?.transactions?.totalCredit) *
                    100
                  ).toFixed(1)
                : 0}
              % {TranslateDashBoard.paid[lang]}
            </p>
          </div>
        </div>

        {/* SMS + Account */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 sm:p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <BsGearWideConnected className="text-red-600 text-xl" />
            </div>
            <Link
              to={"/BuySMS"}
              className={`flex items-center gap-2 text-${
                dashboardData?.sms < 10 ? "red" : "green"
              }-500 font-bold`}
            >
              {" "}
              {dashboardData?.sms} {TranslateDashBoard.sms[lang]}{" "}
              {dashboardData?.sms < 10 ? <FaPlus /> : null}
            </Link>
            <span className="font-medium text-lg text-green-600">Info</span>
          </div>

          <Link to={"/Payment"} className="text-2xl font-bold mb-1 text-center">
            <SubscriptionCountdownLarge />
          </Link>

          <div className="mt-3 text-sm font-semibold">
            <h1
              className={`text-${
                dashboardData?.accountBalance < 0 ? "red" : "green"
              }-600 flex justify-between`}
            >
              <span> {TranslateDashBoard.balance[lang]}:</span>{" "}
              <span> {formatNumber(dashboardData?.accountBalance || 0)}</span>
            </h1>
            <h1
              className={`text-${
                dashboardData?.expenses?.totalExpenses > 0 ? "red" : ""
              }-600 flex justify-between`}
            >
              <span> {TranslateDashBoard.expense[lang]}: </span>
              <span>
                {formatNumber(dashboardData?.expenses?.totalExpenses || 0)}
              </span>
            </h1>
          </div>

          {/* Progress Bar: Paid Percentage dekhabe */}
          <div className="h-2 bg-gray-300 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full transition-all duration-500 ${barColor}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-[10px] text-gray-400 mt-1 text-right italic">
            {daysLeft <= 0
              ? "Expired"
              : daysLeft <= 30
              ? `${daysLeft} days left`
              : "Active (More than 30 days)"}
          </p>
        </div>
      </div>

      <SummaryDashboard data={dashboardData} translate={TranslateDashBoard} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart - Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">
              {TranslateDashBoard?.chart?.[lang]}
            </h3>
            <FaChartPie className="text-gray-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={prepareChartData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {prepareChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatNumber(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Additional Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg  p-6">
          <h3 className="text-lg font-semibold">
            {TranslateDashBoard?.lastTable?.[lang]}
          </h3>
          <div className="w-full overflow-auto">
            <table className="global_table">
              <thead className="global_thead">
                <tr className="global_tr">
                  <th className="global_th">{t("customer")}</th>
                  <th className="global_th">{t("amount")}</th>
                  <th className="global_th">{t("paid")}</th>
                  <th className="global_th">{t("due")}</th>
                </tr>
              </thead>
              <tbody className="global_tbody">
                {saleList.map((item, index) => (
                  <tr
                    onClick={() => {
                      navigate(`/Invoice/1/${item?._id}`);
                    }}
                    className="global_tr"
                    key={index}
                  >
                    <td className="global_td">
                      {item?.Customer[0]?.name || "N/A"}
                    </td>
                    <td className="global_td">
                      {formatNumber(item?.grandTotal)}
                    </td>
                    <td className="global_td">
                      {formatNumber(item?.paid || 0)}
                    </td>
                    <td className="global_td">
                      {formatNumber(item?.dueAmount || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

const SubscriptionCountdownLarge = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({});
  // Example: getBusinessDetails().endDate
  const endDateStr = getBusinessDetails().endDate; // "2025-10-27T02:33:27.746Z"
  //   const endDateStr = "2025-11-27T02:33:27.746Z";
  const endDate = new Date(endDateStr);

  useEffect(() => {
    const now = new Date();
    const endDateStr = getBusinessDetails().endDate;

    if (!endDateStr) {
      // setBusinessDetails("");
      navigate("/Payment");
    }
    const endDate = new Date(endDateStr);
    // console.log(now);
    // console.log(endDate);

    if (endDate < now) {
      // setBusinessDetails("");
      navigate("/Payment");
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      const difference = endDate - now; // milliseconds

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        // Countdown finished
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <h6 className="text-lg px-2 font-blod">
      <span className="text-green-400">{timeLeft.days}d</span>-
      <span className="text-blue-400"> {timeLeft.hours}h</span>-
      <span className="text-fuchsia-500 pl-1">{timeLeft.minutes}m</span>-
      <span className="text-red-500">{timeLeft.seconds}s</span>
    </h6>
  );
};
