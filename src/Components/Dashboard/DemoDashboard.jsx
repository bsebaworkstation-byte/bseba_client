// import React from "react";
// import {
//   LineChart,
//   Line,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   AreaChart,
//   Area,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   FaDollarSign,
//   FaShoppingCart,
//   FaChartLine,
//   FaUsers,
// } from "react-icons/fa"; // Example React Icons

// // Sample Data (Apnar dashboard er chart gulo bananor jonno)
// const salesData = [
//   { name: "Jan", Loyal: 400, New: 240, Unique: 240 },
//   { name: "Feb", Loyal: 300, New: 139, Unique: 200 },
//   { name: "Mar", Loyal: 200, New: 980, Unique: 400 },
//   { name: "Apr", Loyal: 278, New: 390, Unique: 278 },
//   { name: "May", Loyal: 189, New: 480, Unique: 189 },
//   { name: "Jun", Loyal: 239, New: 380, Unique: 239 },
//   { name: "Jul", Loyal: 349, New: 430, Unique: 349 },
//   { name: "Aug", Loyal: 450, New: 500, Unique: 300 },
//   { name: "Sep", Loyal: 500, New: 450, Unique: 350 }, // Apnar image-e Sep-e peak dekha geche
//   { name: "Oct", Loyal: 450, New: 400, Unique: 320 },
//   { name: "Nov", Loyal: 380, New: 350, Unique: 280 },
//   { name: "Dec", Loyal: 300, New: 300, Unique: 250 },
// ];

// const revenueData = [
//   { name: "Monday", Online: 12000, Offline: 8000 },
//   { name: "Tuesday", Online: 15000, Offline: 10000 },
//   { name: "Wednesday", Online: 18000, Offline: 6000 },
//   { name: "Thursday", Online: 13000, Offline: 9000 },
//   { name: "Friday", Online: 10000, Offline: 7500 },
//   { name: "Saturday", Online: 16000, Offline: 12000 },
//   { name: "Sunday", Online: 14000, Offline: 9000 },
// ];

// const productData = [
//   { name: "Home Decor Range", popularity: 45, sales: 450 },
//   { name: "Disney Princess Pink Bag", popularity: 29, sales: 290 },
//   { name: "Bathroom Essentials", popularity: 18, sales: 180 },
//   { name: "Apple Smartwatches", popularity: 28, sales: 280 },
// ];

// // Dark Mode-er jonyo color variables use kora hoyeche
// const CHART_COLORS = {
//   // Apnar CSS-e "dark" class thakle ei color gulo override hobe
//   primary: "var(--chart-primary, #8884d8)",
//   secondary: "var(--chart-secondary, #82ca9d)",
//   tertiary: "var(--chart-tertiary, #ffc658)",
//   text: "var(--text-color, #000)",
//   grid: "var(--grid-color, #f0f0f0)",
// };

// const CustomTooltip = ({ active, payload, label }) => {
//   if (active && payload && payload.length) {
//     // Dark mode-er jonyo style dynamically set kora jabe
//     return (
//       <div className="custom-tooltip bg-white dark:bg-gray-800 p-2 border border-gray-300 dark:border-gray-600 rounded shadow-md">
//         <p className="label">{`${label}`}</p>
//         {payload.map((p, index) => (
//           <p key={index} style={{ color: p.color }}>
//             {`${p.dataKey}: ${p.value}`}
//           </p>
//         ))}
//       </div>
//     );
//   }
//   return null;
// };

// const DemoDashboard = () => {
//   // Ekhane Apni Dark Mode State Niyontron korte paren, kintu apnar shudhu "dark" class add korar kotha.

//   return (
//     // Apni jodi body/root-e "dark" class add koren, tahole ei div-e shudhu styling dite hobe.
//     // Ekhane tailwind CSS class ba custom CSS use kora dorkar.
//     <div className="dashboard-container p-4 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-500">
//       <h1 className="text-3xl font-bold mb-6"> Dashboard</h1>

//       {/* --- Today's Sales & Visitor Insights --- */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         {/* Today's Sales Summary (4 Cards) */}
//         <DashboardCard
//           icon={<FaDollarSign />}
//           title="Total Sales"
//           value="$1K"
//           percent="+5% from yesterday"
//           color="bg-pink-100 dark:bg-pink-800"
//           text="text-pink-600 dark:text-pink-200"
//         />
//         <DashboardCard
//           icon={<FaShoppingCart />}
//           title="Total Order"
//           value="300"
//           percent="+5% from yesterday"
//           color="bg-yellow-100 dark:bg-yellow-800"
//           text="text-yellow-600 dark:text-yellow-200"
//         />
//         <DashboardCard
//           icon={<FaChartLine />}
//           title="Product Sold"
//           value="5"
//           percent="+12% from yesterday"
//           color="bg-green-100 dark:bg-green-800"
//           text="text-green-600 dark:text-green-200"
//         />
//         <DashboardCard
//           icon={<FaUsers />}
//           title="New Customers"
//           value="8"
//           percent="-0.5% from yesterday"
//           color="bg-purple-100 dark:bg-purple-800"
//           text="text-purple-600 dark:text-purple-200"
//         />
//       </div>

//       {/* --- Visitor Insights Chart --- */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//         <div className="chart-panel p-4 bg-white dark:bg-gray-800 rounded shadow-lg">
//           <h2 className="text-xl font-semibold mb-4">Total Revenue</h2>
//           <div className="w-full h-80">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={revenueData}
//                 margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//               >
//                 <CartesianGrid
//                   strokeDasharray="3 3"
//                   stroke={CHART_COLORS.grid}
//                 />
//                 <XAxis dataKey="name" stroke={CHART_COLORS.text} />
//                 <YAxis stroke={CHART_COLORS.text} />
//                 <Tooltip content={<CustomTooltip />} />
//                 <Legend />
//                 <Bar dataKey="Online" fill={CHART_COLORS.primary} />
//                 <Bar dataKey="Offline" fill={CHART_COLORS.secondary} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         <div className="chart-panel p-4 bg-white dark:bg-gray-800 rounded shadow-lg">
//           <h2 className="text-xl font-semibold mb-4">Visitor Insights</h2>
//           <div className="w-full h-80">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart
//                 data={salesData}
//                 margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//               >
//                 <CartesianGrid
//                   strokeDasharray="3 3"
//                   stroke={CHART_COLORS.grid}
//                 />
//                 <XAxis dataKey="name" stroke={CHART_COLORS.text} />
//                 <YAxis stroke={CHART_COLORS.text} />
//                 <Tooltip content={<CustomTooltip />} />
//                 <Legend />
//                 <Line
//                   type="monotone"
//                   dataKey="Loyal"
//                   stroke="#90EE90"
//                   strokeWidth={2}
//                 />{" "}
//                 {/* Light Green */}
//                 <Line
//                   type="monotone"
//                   dataKey="New"
//                   stroke="#FF6347"
//                   strokeWidth={2}
//                 />{" "}
//                 {/* Tomato Red */}
//                 <Line
//                   type="monotone"
//                   dataKey="Unique"
//                   stroke="#A020F0"
//                   strokeWidth={2}
//                 />{" "}
//                 {/* Purple */}
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>

//       {/* --- Customer Satisfaction and Target vs Reality --- */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//         <div className="chart-panel p-4 bg-white dark:bg-gray-800 rounded shadow-lg">
//           <h2 className="text-xl font-semibold mb-4">Customer Satisfaction</h2>
//           <div className="w-full h-80">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={revenueData}>
//                 <CartesianGrid
//                   strokeDasharray="3 3"
//                   stroke={CHART_COLORS.grid}
//                 />
//                 <XAxis dataKey="name" stroke={CHART_COLORS.text} />
//                 <YAxis stroke={CHART_COLORS.text} />
//                 <Tooltip content={<CustomTooltip />} />
//                 <Area
//                   type="monotone"
//                   dataKey="Online"
//                   stroke={CHART_COLORS.primary}
//                   fillOpacity={1}
//                   fill={`url(#colorUv)`}
//                 />
//                 <Area
//                   type="monotone"
//                   dataKey="Offline"
//                   stroke={CHART_COLORS.secondary}
//                   fillOpacity={1}
//                   fill={`url(#colorPv)`}
//                 />
//                 <defs>
//                   <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
//                     <stop
//                       offset="5%"
//                       stopColor={CHART_COLORS.primary}
//                       stopOpacity={0.8}
//                     />
//                     <stop
//                       offset="95%"
//                       stopColor={CHART_COLORS.primary}
//                       stopOpacity={0}
//                     />
//                   </linearGradient>
//                   <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
//                     <stop
//                       offset="5%"
//                       stopColor={CHART_COLORS.secondary}
//                       stopOpacity={0.8}
//                     />
//                     <stop
//                       offset="95%"
//                       stopColor={CHART_COLORS.secondary}
//                       stopOpacity={0}
//                     />
//                   </linearGradient>
//                 </defs>
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Target vs Reality is a Bar Chart in your image - Ekhane shudhu structure deya holo */}
//         <div className="chart-panel p-4 bg-white dark:bg-gray-800 rounded shadow-lg">
//           <h2 className="text-xl font-semibold mb-4">Target vs Reality </h2>
//           <p className="text-center text-gray-500 dark:text-gray-400 mt-20">
//             Recharts BarChart component-ti ekhane target vs reality data diye
//             use korte hobe.
//           </p>
//         </div>
//       </div>

//       {/* --- Top Products, Sales Mapping, Volume vs Service Level --- */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Top Products - A List/Table in your image */}
//         <div className="list-panel p-4 bg-white dark:bg-gray-800 rounded shadow-lg">
//           <h2 className="text-xl font-semibold mb-4">Top Products</h2>
//           <ul className="space-y-3">
//             {productData.map((item, index) => (
//               <li
//                 key={index}
//                 className="flex items-center justify-between text-sm"
//               >
//                 <span className="font-medium">{item.name}</span>
//                 <div className="flex items-center w-1/2">
//                   <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
//                     <div
//                       className="h-2.5 rounded-full"
//                       style={{
//                         width: `${item.popularity}%`,
//                         backgroundColor:
//                           index % 2 === 0
//                             ? CHART_COLORS.primary
//                             : CHART_COLORS.secondary,
//                       }}
//                     ></div>
//                   </div>
//                   <span className="ml-2 text-xs font-semibold">
//                     {item.popularity}%
//                   </span>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Sales Mapping by Country - Map component hobe. Recharts map support kore na. */}
//         <div className="chart-panel p-4 bg-white dark:bg-gray-800 rounded shadow-lg">
//           <h2 className="text-xl font-semibold mb-4">
//             Sales Mapping by Country{" "}
//           </h2>
//           <p className="text-center text-gray-500 dark:text-gray-400 mt-20">
//             E-proyojoner jonno react-simple-maps ba onno library use kora bhalo.
//           </p>
//         </div>

//         {/* Volume vs Service Level - A Bar Chart in your image */}
//         <div className="chart-panel p-4 bg-white dark:bg-gray-800 rounded shadow-lg">
//           <h2 className="text-xl font-semibold mb-4">
//             Volume vs Service Level
//           </h2>
//           <p className="text-center text-gray-500 dark:text-gray-400 mt-20">
//             Recharts BarChart use kore ekhane Volume vs Services chart banate
//             hobe.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Sales Summary Card component (Optional)
// const DashboardCard = ({ icon, title, value, percent, color, text }) => (
//   <div className={`p-4 rounded-lg shadow-md flex items-center ${color}`}>
//     <div
//       className={`text-3xl p-3 rounded-full mr-4 ${text} bg-white dark:bg-gray-900`}
//     >
//       {icon}
//     </div>
//     <div>
//       <p className="text-sm font-medium opacity-80">{title}</p>
//       <p className="text-2xl font-bold">{value}</p>
//       <p className={`text-xs ${text} font-semibold mt-1`}>{percent}</p>
//     </div>
//   </div>
// );

// export default DemoDashboard;

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import {
  FaDollarSign,
  FaShoppingCart,
  FaChartLine,
  FaUsers,
} from "react-icons/fa";
import { createPortal } from "react-dom";

// Sample chart data
const salesData = [
  { name: "Jan", Loyal: 400, New: 240, Unique: 240 },
  { name: "Feb", Loyal: 300, New: 139, Unique: 200 },
  { name: "Mar", Loyal: 200, New: 980, Unique: 400 },
  { name: "Apr", Loyal: 278, New: 390, Unique: 278 },
  { name: "May", Loyal: 189, New: 480, Unique: 189 },
  { name: "Jun", Loyal: 239, New: 380, Unique: 239 },
  { name: "Jul", Loyal: 349, New: 430, Unique: 349 },
  { name: "Aug", Loyal: 450, New: 500, Unique: 300 },
  { name: "Sep", Loyal: 500, New: 450, Unique: 350 },
  { name: "Oct", Loyal: 450, New: 400, Unique: 320 },
  { name: "Nov", Loyal: 380, New: 350, Unique: 280 },
  { name: "Dec", Loyal: 300, New: 300, Unique: 250 },
];

const revenueData = [
  { name: "Monday", Online: 12000, Offline: 8000 },
  { name: "Tuesday", Online: 15000, Offline: 10000 },
  { name: "Wednesday", Online: 18000, Offline: 6000 },
  { name: "Thursday", Online: 13000, Offline: 9000 },
  { name: "Friday", Online: 10000, Offline: 7500 },
  { name: "Saturday", Online: 16000, Offline: 12000 },
  { name: "Sunday", Online: 14000, Offline: 9000 },
];

const CHART_COLORS = {
  primary: "var(--chart-primary, #8884d8)",
  secondary: "var(--chart-secondary, #82ca9d)",
  tertiary: "var(--chart-tertiary, #ffc658)",
  text: "var(--text-color, #000)",
  grid: "var(--grid-color, #f0f0f0)",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white dark:bg-gray-800 p-2 border border-gray-300 dark:border-gray-600 rounded shadow-md">
        <p className="label">{`${label}`}</p>
        {payload.map((p, index) => (
          <p key={index} style={{ color: p.color }}>
            {`${p.dataKey}: ${p.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const DemoDashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [lastSaleData, setLastSaleData] = useState({});
  const [showModal, setShowModal] = useState(false);

  // Example: fetch API or JSON
  useEffect(() => {
    // Mock API fetch
    const mockDashboardData = {
      totalSales: 1000,
      totalOrder: 300,
      productSold: 5,
      newCustomers: 8,
      totalPurchases: 0,
      totalDamage: 0,
      totalPaidPurchases: 0,
      totalDuePurchases: 0,
      purchasesCount: 0,
      totalExpenses: 0,
      totalCredit: 0,
      totalDebit: 0,
      totalCustomers: 0,
      totalSuppliers: 0,
      totalSaleReturn: 0,
      totalSaleReturnProfitLoss: 0,
      totalQuickSaleAmount: 0,
      totalDiscountDebit: 0,
      totalDiscountCredit: 0,
    };

    const mockLastSaleData = {
      lastSale: {
        referenceNo: "SL001",
        total: 500,
        discount: 50,
        grandTotal: 450,
        dueAmount: 0,
        profit: 100,
        CreatedDate: new Date(),
      },
      lastPurchase: {
        referenceNo: "PR001",
        total: 700,
        grandTotal: 700,
        dueAmount: 0,
        note: "N/A",
        CreatedDate: new Date(),
      },
      lastTransaction: {
        Credit: 300,
        Debit: 200,
        Discount: 20,
        CreatedDate: new Date(),
      },
    };

    setDashboardData(mockDashboardData);
    setLastSaleData(mockLastSaleData);
  }, []);

  const summaryCards = [
    {
      title: "Total Sales",
      value: `$${dashboardData.totalSales || 0}`,
      icon: <FaDollarSign />,
      color: "bg-pink-100 dark:bg-pink-800",
      text: "text-pink-600 dark:text-pink-200",
    },
    {
      title: "Total Order",
      value: dashboardData.totalOrder || 0,
      icon: <FaShoppingCart />,
      color: "bg-yellow-100 dark:bg-yellow-800",
      text: "text-yellow-600 dark:text-yellow-200",
    },
    {
      title: "Product Sold",
      value: dashboardData.productSold || 0,
      icon: <FaChartLine />,
      color: "bg-green-100 dark:bg-green-800",
      text: "text-green-600 dark:text-green-200",
    },
    {
      title: "New Customers",
      value: dashboardData.newCustomers || 0,
      icon: <FaUsers />,
      color: "bg-purple-100 dark:bg-purple-800",
      text: "text-purple-600 dark:text-purple-200",
    },
  ];

  return (
    <div className="dashboard-container p-4 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-500">
      <h1 className="text-3xl font-bold mb-6"> Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((c, idx) => (
          <DashboardCard key={idx} {...c} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="chart-panel p-4 bg-white dark:bg-gray-800 rounded shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Total Revenue</h2>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_COLORS.grid}
                />
                <XAxis dataKey="name" stroke={CHART_COLORS.text} />
                <YAxis stroke={CHART_COLORS.text} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Online" fill={CHART_COLORS.primary} />
                <Bar dataKey="Offline" fill={CHART_COLORS.secondary} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-panel p-4 bg-white dark:bg-gray-800 rounded shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Visitor Insights</h2>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_COLORS.grid}
                />
                <XAxis dataKey="name" stroke={CHART_COLORS.text} />
                <YAxis stroke={CHART_COLORS.text} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Loyal"
                  stroke="#90EE90"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="New"
                  stroke="#FF6347"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="Unique"
                  stroke="#A020F0"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Last Sale / Purchase / Transaction */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-4 rounded-xl shadow text-sm bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-blue-600 mb-3">
            🧾 Last Sale
          </h2>
          {lastSaleData?.lastSale ? (
            <div className="space-y-1">
              <p>
                <span className="font-medium">Reference:</span>{" "}
                {lastSaleData.lastSale.referenceNo}
              </p>
              <p>
                <span className="font-medium">Total:</span>{" "}
                {lastSaleData.lastSale.total}
              </p>
              <p>
                <span className="font-medium">Discount:</span>{" "}
                {lastSaleData.lastSale.discount}
              </p>
              <p>
                <span className="font-medium">Grand Total:</span>{" "}
                {lastSaleData.lastSale.grandTotal}
              </p>
              <p>
                <span className="font-medium">Due Amount:</span>{" "}
                {lastSaleData.lastSale.dueAmount}
              </p>
              <p>
                <span className="font-medium">Profit:</span>{" "}
                {lastSaleData.lastSale.profit}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 italic">No Sale Data</p>
          )}
        </div>

        <div className="p-4 rounded-xl shadow text-sm bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-green-600 mb-3">
            🛒 Last Purchase
          </h2>
          {lastSaleData?.lastPurchase ? (
            <div className="space-y-1">
              <p>
                <span className="font-medium">Reference:</span>{" "}
                {lastSaleData.lastPurchase.referenceNo}
              </p>
              <p>
                <span className="font-medium">Total:</span>{" "}
                {lastSaleData.lastPurchase.total}
              </p>
              <p>
                <span className="font-medium">Grand Total:</span>{" "}
                {lastSaleData.lastPurchase.grandTotal}
              </p>
              <p>
                <span className="font-medium">Due Amount:</span>{" "}
                {lastSaleData.lastPurchase.dueAmount}
              </p>
              <p>
                <span className="font-medium">Note:</span>{" "}
                {lastSaleData.lastPurchase.note}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 italic">No Purchase Data</p>
          )}
        </div>

        <div className="p-4 rounded-xl shadow text-sm bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-purple-600 mb-3">
            💰 Last Transaction
          </h2>
          {lastSaleData?.lastTransaction ? (
            <div className="space-y-1">
              <p>
                <span className="font-medium">Credit:</span>{" "}
                {lastSaleData.lastTransaction.Credit}
              </p>
              <p>
                <span className="font-medium">Debit:</span>{" "}
                {lastSaleData.lastTransaction.Debit}
              </p>
              <p>
                <span className="font-medium">Discount:</span>{" "}
                {lastSaleData.lastTransaction.Discount}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 italic">No Transaction Data</p>
          )}
        </div>
      </div>

      {/* Optional All Details Modal */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full relative">
              <h2 className="text-xl font-semibold mb-4">
                All Dashboard Details
              </h2>
              <button
                className="absolute top-2 right-2 text-gray-500 dark:text-gray-200"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
              <ul className="space-y-1 text-sm">
                {Object.entries(dashboardData).map(([key, value], idx) => (
                  <li key={idx}>
                    <span className="font-medium">
                      {key.replace(/([A-Z])/g, " $1")}:{" "}
                    </span>
                    {value}
                  </li>
                ))}
              </ul>
            </div>
          </div>,
          document.body
        )}

      {/* Optional button to open modal */}
      <div className="mt-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          View All Details
        </button>
      </div>
    </div>
  );
};

// DashboardCard
const DashboardCard = ({ icon, title, value, color, text, percent }) => (
  <div className={`p-4 rounded-lg shadow-md flex items-center ${color}`}>
    <div
      className={`text-3xl p-3 rounded-full mr-4 ${text} bg-white dark:bg-gray-900`}
    >
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      {percent && (
        <p className={`text-xs ${text} font-semibold mt-1`}>{percent}</p>
      )}
    </div>
  </div>
);

export default DemoDashboard;
