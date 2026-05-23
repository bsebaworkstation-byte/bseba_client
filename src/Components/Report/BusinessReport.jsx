import React, { useEffect, useMemo, useState } from "react";
import loadingStore from "../../Zustand/LoadingStore";
import Select from "react-select";

import {
  FaShoppingCart,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaWallet,
  FaCoins,
  FaUsers,
  FaTruck,
  FaUndo,
  FaChartLine,
  FaWrench,
  FaHandshake,
  FaPercent,
  FaCashRegister,
  FaBoxes,
} from "react-icons/fa";
import { GiProfit } from "react-icons/gi";

import { MdAttachMoney, MdPayments, MdInventory } from "react-icons/md";
import { RiRefund2Line } from "react-icons/ri";
import { HiOutlineSupport } from "react-icons/hi";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import api from "../../Helper/axios_resonse_interceptor";
import { ErrorToast } from "../../Helper/FormHelper";

const periodOptions = [
  { value: "today", label: "Today" },
  { value: "thisWeek", label: "This Week" },
  { value: "lastWeek", label: "Last Week" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "thisYear", label: "This Year" },
  { value: "lastYear", label: "Last Year" },
];

// Helper to format date as YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

const BusinessReport = () => {
  const { setGlobalLoader } = loadingStore();
  const [filter, setFilter] = useState("today");
  const [startDate, setStartDate] = useState(new Date());

  const [endDate, setEndDate] = useState(new Date());
  const [data, setData] = useState({});
  const [businessValueData, setBusinessValueData] = useState(null);
  const [allAccount, setAllAccount] = useState([]);
  const [investors, setInvestors] = useState([]);
  // Apply selected filter to set start/end dates
  const applyFilter = (selectedFilter) => {
    const now = new Date();
    let start, end;

    switch (selectedFilter) {
      case "today":
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      case "thisWeek":
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        end = new Date(now);
        break;
      case "lastWeek":
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay() - 7);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      case "thisMonth":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now);
        break;
      case "lastMonth":
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "thisYear":
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now);
        break;
      case "lastYear":
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
        break;
      default:
        start = startDate;
        end = endDate;
    }

    setStartDate(start);
    setEndDate(end);
  };
  // fetch allAccount
  const fetchAllAccounts = async () => {
    setGlobalLoader(true);
    try {
      const { data } = await api.get(`/AllAccount`);
      if (data.status === "Success") {
        setAllAccount(data.data);
      } else {
        setAllAccount([]);
      }
    } catch (error) {
      ErrorToast(error.message);
      setAllAccount([]);
    } finally {
      setGlobalLoader(false);
    }
  };

  // Fetch data from API
  const fetchBusinessReportData = async (start, end) => {
    try {
      setGlobalLoader(true);
      const res = await api.get(
        `/BusinessReport/${formatDate(start)}/${formatDate(end)}`,
      );

      if (res.data.status === "Success") {
        setData(res.data);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const fetchInvestorList = async () => {
    try {
      const res = await api.get("/InvestorList");
      if (res.data.status === "success") {
        setInvestors(res.data.data || []);
      } else {
        setInvestors([]);
      }
    } catch (error) {
      console.error("Error fetching investor list", error);
      setInvestors([]);
    }
  };

  // Fetch data from API
  const fetchBusinessValue = async (start, end) => {
    try {
      setGlobalLoader(true);
      const res = await api.get(`/Value`);

      if (res.data.status === "Success") {
        setBusinessValueData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setGlobalLoader(false);
    }
  };

  // Re-fetch when filter changes
  useEffect(() => {
    applyFilter(filter);
  }, [filter]);

  // Re-fetch when dates change
  useEffect(() => {
    fetchBusinessReportData(startDate, endDate);
  }, [startDate, endDate]);
  useEffect(() => {
    fetchBusinessValue();
    fetchAllAccounts();
    fetchInvestorList();
  }, []);

  const cards = [
    {
      title: "Total Sales",
      value: data?.sales?.totalSales,
      icon: <FaCashRegister />,
    },
    {
      title: "Total Paid Sales",
      value: data?.sales?.totalPaidSales,
      icon: <MdPayments />,
    },
    {
      title: "Total Due Sales",
      value: data?.sales?.totalDueSales,
      icon: <FaMoneyBillWave />,
    },
    {
      title: "Sales Profit",
      value: data?.sales?.totalProfit,
      icon: <GiProfit />,
    },
    {
      title: "Others Sales Earned",
      value: data?.sales?.totalOutherAmount,
      icon: <FaPercent />,
    },
    {
      title: "Total Vat",
      value: data?.sales?.totalVat,
      icon: <FaCashRegister />,
    },
    {
      title: "Total Purchases",
      value: data?.purchases?.totalPurchases,
      icon: <FaShoppingCart />,
    },
    {
      title: "Total Paid Purchases",
      value: data?.purchases?.totalPaidPurchases,
      icon: <FaCoins />,
    },
    {
      title: "Total Due Purchases",
      value: data?.purchases?.totalDuePurchases,
      icon: <FaWallet />,
    },
    {
      title: "Purchase Others Cost",
      value: data?.purchases?.totalPurchasesCost,
      icon: <FaBoxes />,
      type: "Cost",
    },

    {
      title: "Expense",
      value: data?.expenses?.totalExpenses,
      icon: <FaMoneyBillWave />,
      type: "Cost",
    },
    {
      title: "Salary",
      value: data?.salary?.totalSalary,
      icon: <FaHandshake />,
      type: "Cost",
    },
    {
      title: "Warranty Cost",
      value: data?.warrantyCost?.totalWarrantyDebit,
      icon: <FaWrench />,
      type: "Cost",
    },

    {
      title: "Total Sale Return",
      value: data?.saleReturns?.totalSaleReturn,
      icon: <RiRefund2Line />,
      type: "Cost",
    },
    {
      title: "Sale Return Loss",
      value: data?.saleReturns?.totalSaleReturnProfitLoss,
      icon: <FaUndo />,
      type: "Cost",
    },
    {
      title: "Service Refunded",
      value: data?.servicePayment?.ServiceRefund,
      icon: <FaUndo />,
      type: "Cost",
    },
    {
      title: "Discount Payment",
      value: data?.discounts?.totalDiscountDebit,
      icon: <FaUndo />,
      type: "Cost",
    },
    {
      title: "Warranty Earned",
      value: data?.warrantyCost?.totalWarrantyCredit,
      icon: <HiOutlineSupport />,
    },
    {
      title: "Discount Received",
      value: data?.discounts?.totalDiscountCredit,
      icon: <MdAttachMoney />,
    },
    {
      title: "Total Received",
      value: data?.transactions?.totalCredit,
      icon: <MdAttachMoney />,
    },
    {
      title: "Total Paid",
      value: data?.transactions?.totalDebit,
      icon: <FaCoins />,
    },

    {
      title: "Service",
      value: data?.service?.totalService,
      icon: <FaFileInvoiceDollar />,
    },
    {
      title: "Service Paid",
      value: data?.servicePayment?.ServicePaid,
      icon: <GiProfit />,
    },
    {
      title: "Total Customers",
      value: data?.customers?.totalCustomers,
      icon: <FaUsers />,
    },
    {
      title: "Total Suppliers",
      value: data?.suppliers?.totalSuppliers,
      icon: <FaTruck />,
    },

    {
      title: "Net Profit",
      value:
        (data?.sales?.totalProfit || 0) +
        (data?.servicePayment?.ServicePaid || 0) +
        (data?.sales?.totalOutherAmount || 0) +
        (data?.discounts?.totalDiscountCredit || 0) +
        (data?.warrantyCost?.totalWarrantyCredit || 0) -
        ((data?.expenses?.totalExpenses || 0) +
          (data?.purchases?.totalPurchasesCost || 0) +
          (data?.salary?.totalSalary || 0) +
          (data?.servicePayment?.ServiceRefund || 0) +
          (data?.saleReturns?.totalSaleReturnProfitLoss || 0) +
          (data?.warrantyCost?.totalWarrantyDebit || 0) +
          (data?.discounts?.totalDiscountDebit || 0)),
      icon: <FaChartLine />,
      type: "Dynamic",
    },
  ];

  const totalBalance = useMemo(
    () => allAccount.reduce((acc, a) => acc + (a?.balance || 0), 0),
    [allAccount],
  );

  const investorStats = useMemo(() => {
    const totalInvestmentBalance = investors.reduce(
      (sum, investor) => sum + Number(investor.balance || 0),
      0,
    );
    return {
      count: investors.length,
      totalInvestmentBalance,
    };
  }, [investors]);
  // const businessAsset = useMemo(
  //   () =>
  //     -(
  //       businessValueData?.stock?.totalStockValue -
  //       businessValueData?.debit?.totalDebitAmount +
  //       businessValueData?.credit?.totalCreditAmount -
  //       totalBalance
  //     ),
  //   [businessValueData, totalBalance]
  // );
  const businessAsset = useMemo(
    () =>
      (businessValueData?.stock?.totalStockValue || 0) -
      (businessValueData?.debit?.totalDebitAmount || 0) +
      (-businessValueData?.credit?.totalCreditAmount || 0) +
      (totalBalance || 0),
    [businessValueData, totalBalance],
  );

  const StatCard = ({ title, value, color = "text-green-700" }) => (
    <div
      className="p-4 rounded-xl shadow-sm border border-gray-100 
                dark:border-gray-700 bg-white dark:bg-gray-800 
                hover:shadow-md transition-all duration-200 
                flex flex-col items-center justify-center
                min-h-[110px] w-full"
    >
      <p
        className={`text-sm text-gray-600 dark:text-gray-300 font-medium mb-2 text-nowrap`}
      >
        {title}
      </p>
      <h3 className={`text-2xl md:text-2xl font-bold ${color} tracking-tight`}>
        {value ?? "0"}
      </h3>
    </div>
  );

  return (
    <div className="global_container">
      <div className="global_sub_container grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Stock Section */}
        <section className="border border-gray-300 dark:border-gray-500 rounded-lg p-2">
          <h2 className="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-200 text-center">
            Stock
          </h2>
          <div className="flex lg:flex-row flex-col lg:justify-center gap-5">
            <StatCard
              title="Total Products"
              value={businessValueData?.products?.totalProducts?.toFixed(2)}
            />
            <StatCard
              title="Stock Value"
              value={businessValueData?.stock?.totalStockValue?.toFixed(2)}
            />
          </div>
        </section>

        {/* Credit Section */}
        <section className="border border-gray-300 dark:border-gray-500 rounded-lg p-2">
          <h2 className="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-200 text-center">
            Recievable
          </h2>
          <div className="flex lg:flex-row flex-col lg:justify-center gap-5">
            <StatCard
              title="Recievable Contact"
              value={businessValueData?.credit?.totalCreditCustomers?.toFixed(
                2,
              )}
              color="text-blue-700"
            />
            <StatCard
              title="Recievable Amount"
              value={-businessValueData?.credit?.totalCreditAmount?.toFixed(2)}
              color="text-blue-700"
            />
          </div>
        </section>

        {/* Debit Section */}
        <section className="border border-gray-300 dark:border-gray-500 rounded-lg p-2">
          <h2 className="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-200 text-center">
            Payable
          </h2>
          <div className="flex lg:flex-row flex-col lg:justify-center gap-5">
            <StatCard
              title="Payable Contact"
              value={businessValueData?.debit?.totalDebitCustomers?.toFixed(2)}
              color="text-red-700"
            />
            <StatCard
              title="Payable Amount"
              value={businessValueData?.debit?.totalDebitAmount?.toFixed(2)}
              color="text-red-700"
            />
          </div>
        </section>
        {/* Business */}
        <section className="border border-gray-300 dark:border-gray-500 rounded-lg p-2">
          <h2 className="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-200 text-center">
            Business Asset
          </h2>
          <div className="flex justify-center gap-5">
            <StatCard
              title="Account Balance"
              value={totalBalance?.toFixed(2)}
              color={totalBalance > 0 ? "text-green-500" : "text-red-700"}
            />
            <StatCard
              title="Business Asset"
              value={businessAsset.toFixed(2)}
              color={businessAsset > 0 ? "text-green-500" : "text-red-700"}
            />
          </div>
        </section>

        {/* Investment */}
        <section className="border border-gray-300 dark:border-gray-500 rounded-lg p-2 sm:col-span-2">
          <h2 className="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-200 text-center">
            Investment
          </h2>
          <div className="flex lg:flex-row flex-col lg:justify-center gap-5">
            <StatCard
              title="Total Investors"
              value={investorStats.count}
              color="text-blue-700"
            />
            <StatCard
              title="Investment Balance"
              value={Math.abs(investorStats.totalInvestmentBalance).toFixed(2)}
              color={
                investorStats.totalInvestmentBalance > 0
                  ? "text-red-700"
                  : investorStats.totalInvestmentBalance < 0
                    ? "text-green-500"
                    : "text-gray-700"
              }
            />
          </div>
        </section>
      </div>
      {/* Filter Section */}
      <div className="p-5 rounded-2xl border-2 border-blue-500 mb-6">
        <h1 className="text-xl font-semibold mb-4">Business Report Filter</h1>
        <div className="flex flex-wrap items-center gap-4">
          <div className="md:flex-1 w-full">
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd-MM-yyyy"
              className="global_input"
            />
          </div>
          <div className="md:flex-1 w-full">
            <label className="block text-sm font-medium mb-1">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd-MM-yyyy"
              className="global_input"
            />
          </div>
          <div className="md:flex-1 w-full">
            <label className="block text-sm font-medium mb-1">
              Select Period
            </label>

            <Select
              options={periodOptions}
              value={periodOptions.find((opt) => opt.value === filter) || null}
              onChange={(selectedOption) =>
                setFilter(selectedOption?.value || "")
              }
              placeholder="Select Period"
              classNamePrefix="react-select"
              isClearable
              menuPlacement="auto"
              menuPortalTarget={document.body}
              styles={getReactSelectStyles()}
            />
            {/* <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              // className="global_input w-full "
              classNamePrefix="react-select"
            >
              <option value="thisWeek">This Week</option>
              <option value="lastWeek">Last Week</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">This Year</option>
              <option value="lastYear">Last Year</option>
            </Select> */}
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="global_sub_container">
        <h1 className="text-xl font-semibold mb-4">Business Summary</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {cards.map((item, index) => (
            <div
              key={index}
              className="p-3 rounded-2xl  shadow-md border dark:bg-gray-800 border-gray-200 dark:border-gray-500 text-center bg-white hover:shadow-lg transition-shadow duration-200"
            >
              <div
                className={`text-3xl text-${
                  item.type === "Cost" ? "yellow" : "green"
                }-600 mb-2 flex justify-center`}
              >
                {item.icon}
              </div>
              <h6 className={`text-gray-600 dark:text-white font-medium`}>
                {item.title}
              </h6>
              <h3
                className={`text-2xl  font-bold text-${
                  item.type === "Cost"
                    ? "yellow"
                    : item.type === "Dynamic" && item.value < 0
                      ? "red"
                      : "green"
                }-500 mt-1`}
              >
                {item.value?.toFixed(2) ?? 0}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessReport;
