import {
  formatISO,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subWeeks,
  subMonths,
  subYears,
} from "date-fns";
import { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../Helper/axios_resonse_interceptor";
import {
  Package,
  Tag,
  Layers,
  Building,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import loadingStore from "../../Zustand/LoadingStore";
import toast from "react-hot-toast";
import { formatDate } from "../../Helper/utils";
import TimeAgo from "../../Helper/UI/TimeAgo";
import { getBusinessDetails } from "../../Helper/SessionHelper";
import DynamicReportDetailsModal from "../Modals/DynamicReportDetailsModal";

const Analyze = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [purchaseReturnHistory, setPurchaseReturnHistory] = useState([]);
  const [saleHistory, setSaleHistory] = useState([]);
  const [saleReturnHistory, setSaleReturnHistory] = useState([]);

  const [purchaseFilter, setPurchaseFilter] = useState("thisMonth");
  const [purchaseReturnFilter, setPurchaseReturnFilter] = useState("thisMonth");
  const [saleFilter, setSaleFilter] = useState("thisMonth");
  const [saleReturnFilter, setSaleReturnFilter] = useState("thisMonth");

  const { setGlobalLoader } = loadingStore();
  const [startPurchaseDate, setStartPurchaseDate] = useState(
    subDays(new Date(), 30)
  );
  const [endPurchaseDate, setEndPurchaseDate] = useState(new Date());
  const [startPurchaseReturnDate, setStartPurchaseReturnDate] = useState(
    subDays(new Date(), 30)
  );
  const [startSaleDate, setStartSaleDate] = useState(subDays(new Date(), 30));
  const [endPurchaseReturnDate, setEndPurchaseReturnDate] = useState(
    new Date()
  );

  const [endSaleDate, setEndSaleDate] = useState(new Date());

  const [startSaleReturnDate, setStartSaleReturnDate] = useState(
    subDays(new Date(), 30)
  );
  const [endSaleReturnDate, setEndSaleReturnDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [detailsID, setDetailsID] = useState(null);
  const [openReportDetailsModal, setOpenReportDetailsModal] = useState(false);
  const tabs = [
    { id: 1, name: "Purchase Report" },
    { id: 2, name: "Purchase Return Report" },
    { id: 3, name: "Sale Report" },
    { id: 4, name: "Sale Return Report" },
  ];

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

  useEffect(() => {
    if (activeTab !== 1) return;
    if (purchaseFilter !== "custom") {
      const { start, end } = getDateRange(purchaseFilter);
      setStartPurchaseDate(start);
      setEndPurchaseDate(end);
    }
  }, [purchaseFilter, activeTab]);

  useEffect(() => {
    if (activeTab !== 2) return;
    if (purchaseReturnFilter !== "custom") {
      const { start, end } = getDateRange(purchaseReturnFilter);
      setStartPurchaseReturnDate(start);
      setEndPurchaseReturnDate(end);
    }
  }, [purchaseReturnFilter, activeTab]);

  useEffect(() => {
    if (activeTab !== 3) return;
    if (saleFilter !== "custom") {
      const { start, end } = getDateRange(saleFilter);
      setStartSaleDate(start);
      setEndSaleDate(end);
    }
  }, [saleFilter, activeTab]);
  useEffect(() => {
    if (activeTab !== 4) return;
    if (saleReturnFilter !== "custom") {
      const { start, end } = getDateRange(saleReturnFilter);
      setStartSaleReturnDate(start);
      setEndSaleReturnDate(end);
    }
  }, [saleReturnFilter, activeTab]);

  const fetchProduct = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/ProductInfo/${id}`);
      if (res.data.status === "Success") {
        setProduct(res.data.data);
      } else {
      }
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setGlobalLoader(false);
    }
  };
  const fetchPurchaseHistory = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/ProductPurchasReport/${formatISO(startPurchaseDate)}/${formatISO(
          endPurchaseDate
        )}/${id}`
      );
      setPurchaseHistory(res.data.data);
    } catch (error) {
      console.error("Failed to fetch purchase report", error);
      toast.error("Failed to fetch purchase report");
    } finally {
      setGlobalLoader(false);
    }
  };
  const fetchPurchaseReturnHistory = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/ProductPurchaseReturnReport/${formatISO(
          startPurchaseReturnDate
        )}/${formatISO(endPurchaseReturnDate)}/${id}`
      );
      setPurchaseReturnHistory(res.data.data);
    } catch (error) {
      console.error("Failed to fetch purchase Return report", error);
      toast.error("Failed to fetch purchase Return report");
    } finally {
      setGlobalLoader(false);
    }
  };
  const fetchSaleHistory = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/ProductSalesReport/${formatISO(startSaleDate)}/${formatISO(
          endSaleDate
        )}/${id}`
      );
      setSaleHistory(res.data.data);
    } catch (error) {
      console.error("Failed to fetch Sale report", error);
      toast.error("Failed to fetch Sale report");
    } finally {
      setGlobalLoader(false);
    }
  };
  const fetchSaleReturnHistory = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/ProductSaleReturnReport/${formatISO(startSaleReturnDate)}/${formatISO(
          endSaleReturnDate
        )}/${id}`
      );
      setSaleReturnHistory(res.data.data);
    } catch (error) {
      console.error("Failed to fetch Sale Return report", error);
      toast.error("Failed to fetch Sale Return report");
    } finally {
      setGlobalLoader(false);
    }
  };
  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (activeTab !== 1) return;
    fetchPurchaseHistory();
  }, [startPurchaseDate, endPurchaseDate, activeTab]);

  useEffect(() => {
    if (activeTab !== 2) return;
    fetchPurchaseReturnHistory();
  }, [startPurchaseReturnDate, endPurchaseReturnDate, activeTab]);

  useEffect(() => {
    if (activeTab !== 3) return;
    fetchSaleHistory();
  }, [startSaleDate, endSaleDate, activeTab]);

  useEffect(() => {
    if (activeTab !== 4) return;
    fetchSaleReturnHistory();
  }, [startSaleReturnDate, endSaleReturnDate, activeTab]);

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

  const stats = [
    {
      icon: ShoppingCart,
      label: "Total Purchase",
      value: product?.totalPurchaseQty,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      icon: TrendingUp,
      label: "Total Sale",
      value: product?.totalSaleQty,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      icon: Layers,
      label: "Current Stock",
      value: product?.qty,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
  ];

  const details = [
    { icon: Tag, label: "Sale Price", value: `৳${product?.mrp}` },
    { icon: Package, label: "Category", value: product?.categoryName },
    { icon: Building, label: "Brand", value: product?.brandName },
  ];

  const openReportModal = (id, type) => {
    setDetailsID(id);
    setModalType(type);

    setTimeout(() => {
      setOpenReportDetailsModal(true);
    }, 50);
  };

  return (
    <Fragment>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-2">
        {/* Product */}
        <div className="global_sub_container">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Product Image */}
            <img
              src={product?.image}
              alt={product?.name}
              className="w-[250px] object-contain rounded-xl border-2 border-gray-100 dark:border-gray-700"
            />

            {/* Product Details */}
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-3">
                {product?.name}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {details?.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <item.icon
                        className={`w-5 h-5 ${
                          item.icon === Tag ? "text-green-500" : "text-blue-400"
                        }`}
                      />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {item.label}
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white truncate">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Performance Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className={`${stat.bg} p-4 rounded-xl border border-gray-100 dark:border-gray-600 flex flex-col justify-between`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {stat.value} {product?.unitName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* tabs  */}
        <div className="flex gap-3 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-md font-semibold 
        ${
          activeTab === t.id
            ? "bg-blue-600 text-white"
            : "bg-gray-300 dark:bg-gray-600"
        }
      `}
            >
              {t.name}
            </button>
          ))}
        </div>
        {/* Purchase Report */}
        {activeTab === 1 && (
          <div className="global_sub_container">
            <h1>Purchase Report</h1>
            {/* Filter */}
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col w-full">
                <label className="font-medium mb-1">Select Period:</label>
                <select
                  className="global_dropdown w-full"
                  value={purchaseFilter}
                  onChange={(e) => setPurchaseFilter(e.target.value)}
                >
                  {filters.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col w-full">
                <label className="font-medium mb-1">Start Date:</label>
                <DatePicker
                  selected={startPurchaseDate}
                  onChange={(date) => setStartPurchaseDate(date)}
                  dateFormat="dd-MM-yyyy"
                  className="global_input w-full"
                />
              </div>
              <div className="flex flex-col w-full">
                <label className="font-medium mb-1">End Date:</label>
                <DatePicker
                  selected={endPurchaseDate}
                  onChange={(date) => setEndPurchaseDate(date)}
                  dateFormat="dd-MM-yyyy"
                  className="global_input w-full"
                />
              </div>
            </div>

            <div className="overflow-auto">
              <table className="global_table">
                <thead className="global_thead">
                  <tr>
                    <th className="global_th">#</th>
                    <th className="global_th">Purchase Date</th>
                    <th className="global_th">QTY</th>
                    <th className="global_th">Purchase Price</th>
                    <th className="global_th">Total</th>
                    {getBusinessDetails().warranty === "1" && (
                      <th className="global_th">Warranty</th>
                    )}

                    {getBusinessDetails().warranty === "1" && (
                      <th className="global_th">Serial Nos</th>
                    )}
                    <th className="global_th">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {purchaseHistory.map((r, i) => (
                    <tr className="font-bold bg-gray-100 dark:bg-gray-800">
                      <td className="global_td">{i + 1}</td>
                      <td className="global_td">
                        {formatDate(r?.CreatedDate)}{" "}
                        <TimeAgo date={r?.CreatedDate} />
                      </td>{" "}
                      <td className="global_td">{r?.qty}</td>
                      <td className="global_td">{r?.unitCost?.toFixed(2)}</td>
                      <td className="global_td">{r?.total.toFixed(2)}</td>
                      {getBusinessDetails().warranty === "1" && (
                        <td className="global_td">{r?.warranty} Days</td>
                      )}
                      {getBusinessDetails().warranty === "1" && (
                        <td className="global_td">
                          <h2 className="grid grid-cols-2 gap-1">
                            {" "}
                            {r?.serialNumbers?.map((s, idx) => (
                              <span key={idx}>{s}</span>
                            ))}
                          </h2>
                        </td>
                      )}
                      <td className="global_td">
                        <button
                          className="global_button"
                          onClick={() =>
                            openReportModal(r?.purchaseID, "purchase")
                          }
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                </tbody>
                <tfoot className="global_tbody">
                  <tr className="global_tr">
                    <td className="global_td">Total</td>
                    <td className="global_td"></td>
                    <td className="global_td">
                      {purchaseHistory?.reduce(
                        (acc, r) => acc + (r?.qty || 0),
                        0
                      )}
                    </td>
                    <td className="global_td"></td>
                    <td className="global_td">
                      {" "}
                      {purchaseHistory
                        ?.reduce((acc, r) => acc + (r?.total || 0), 0)
                        .toFixed(2)}
                    </td>
                    {getBusinessDetails().warranty === "1" && (
                      <>
                        <td className="global_td"></td>
                        <td className="global_td"></td>
                      </>
                    )}{" "}
                    <td className="global_td"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Purchase Return Report */}
        {activeTab === 2 && (
          <div className="global_sub_container">
            <h1>Purchase Return Report</h1>
            {/* Filter */}
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col w-full">
                <label className="font-medium mb-1">Select Period:</label>
                <select
                  className="global_dropdown w-full"
                  value={purchaseReturnFilter}
                  onChange={(e) => setPurchaseReturnFilter(e.target.value)}
                >
                  {filters.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col w-full">
                <label className="font-medium mb-1">Start Date:</label>
                <DatePicker
                  selected={startPurchaseReturnDate}
                  onChange={(date) => setStartPurchaseReturnDate(date)}
                  dateFormat="dd-MM-yyyy"
                  className="global_input w-full"
                />
              </div>
              <div className="flex flex-col w-full">
                <label className="font-medium mb-1">End Date:</label>
                <DatePicker
                  selected={endPurchaseReturnDate}
                  onChange={(date) => setEndPurchaseReturnDate(date)}
                  dateFormat="dd-MM-yyyy"
                  className="global_input w-full"
                />
              </div>
            </div>

            <div className="overflow-auto">
              <table className="global_table">
                <thead className="global_thead">
                  <tr>
                    <th className="global_th">#</th>
                    <th className="global_th">Return Date</th>
                    <th className="global_th">QTY</th>
                    <th className="global_th">Amount</th>

                    <th className="global_th">Total</th>
                    {getBusinessDetails().warranty === "1" && (
                      <th className="global_th">Serial Nos</th>
                    )}
                    <th className="global_th">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {purchaseReturnHistory.map((r, i) => (
                    <tr className="font-bold bg-gray-100 dark:bg-gray-800">
                      <td className="global_td">{i + 1}</td>
                      <td className="global_td">
                        {formatDate(r?.CreatedDate)}{" "}
                        <TimeAgo date={r?.CreatedDate} />
                      </td>
                      <td className="global_td">{r?.qty}</td>
                      <td className="global_td">{r?.amount?.toFixed(2)}</td>

                      <td className="global_td">{r?.total?.toFixed(2)}</td>
                      {getBusinessDetails().warranty === "1" && (
                        <td className="global_td">
                          <h2 className="grid grid-cols-2 gap-1">
                            {" "}
                            {r?.serialNumbers?.map((s, idx) => (
                              <span key={idx}>{s}</span>
                            ))}
                          </h2>
                        </td>
                      )}
                      <td className="global_td">
                        <button
                          className="global_button"
                          onClick={() =>
                            openReportModal(
                              r?.purchaseReturnID,
                              "purchaseReturn"
                            )
                          }
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="global_tbody">
                  <tr className="global_tr">
                    <td className="global_td">Total</td>
                    <td className="global_td"></td>
                    <td className="global_td">
                      {purchaseReturnHistory?.reduce(
                        (acc, r) => acc + (r?.qty || 0),
                        0
                      )}
                    </td>
                    <td className="global_td"></td>
                    <td className="global_td">
                      {" "}
                      {purchaseReturnHistory
                        ?.reduce((acc, r) => acc + (r?.total || 0), 0)
                        .toFixed(2)}
                    </td>
                    {getBusinessDetails().warranty === "1" && (
                      <>
                        <td className="global_td"></td>
                        <td className="global_td"></td>
                      </>
                    )}{" "}
                    <td className="global_td"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
        {/* Sale Report */}
        {activeTab === 3 && (
          <div className="global_sub_container">
            <h1>Sale Report</h1>
            {/* Filter */}
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col w-full">
                <label className="font-medium mb-1">Select Period:</label>
                <select
                  className="global_dropdown w-full"
                  value={saleFilter}
                  onChange={(e) => setSaleFilter(e.target.value)}
                >
                  {filters.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col w-full">
                <label className="font-medium mb-1">Start Date:</label>
                <DatePicker
                  selected={startSaleDate}
                  onChange={(date) => setStartSaleDate(date)}
                  dateFormat="dd-MM-yyyy"
                  className="global_input w-full"
                />
              </div>
              <div className="flex flex-col w-full">
                <label className="font-medium mb-1">End Date:</label>
                <DatePicker
                  selected={endSaleDate}
                  onChange={(date) => setEndSaleDate(date)}
                  dateFormat="dd-MM-yyyy"
                  className="global_input w-full"
                />
              </div>
            </div>

            <div className="overflow-auto">
              <table className="global_table">
                <thead className="global_thead">
                  <tr>
                    <th className="global_th">#</th>
                    <th className="global_th">Sale Date</th>
                    <th className="global_th">QTY</th>
                    <th className="global_th">Price</th>
                    <th className="global_th">Total</th>
                    {getBusinessDetails()?.warranty === "1" && (
                      <th className="global_th">Warranty</th>
                    )}
                    {getBusinessDetails()?.warranty === "1" && (
                      <th className="global_th">Serial Nos</th>
                    )}
                    <th className="global_th">Profit</th>
                    <th className="global_th">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {saleHistory.map((r, i) => (
                    <tr className="font-bold bg-gray-100 dark:bg-gray-800">
                      <td className="global_td">{i + 1}</td>
                      <td className="global_td">
                        {formatDate(r?.CreatedDate)}{" "}
                        <TimeAgo date={r?.CreatedDate} />
                      </td>
                      <td className="global_td">{r?.qtySold || 0}</td>
                      <td className="global_td">{r?.price?.toFixed(2)}</td>
                      <td className="global_td">{r?.total?.toFixed(2)}</td>
                      {getBusinessDetails()?.warranty === "1" && (
                        <td className="global_td">{r?.warranty || 0} Days</td>
                      )}
                      {getBusinessDetails().warranty === "1" && (
                        <td className="global_td">
                          <h2 className="grid grid-cols-2 gap-1">
                            {" "}
                            {r?.serialNumbers?.map((s, idx) => (
                              <span key={idx}>{s}</span>
                            ))}
                          </h2>
                        </td>
                      )}
                      <td className="global_td">
                        {(r?.profit || 0).toFixed(2)}
                      </td>
                      <td className="global_td">
                        <button
                          className="global_button"
                          onClick={() => openReportModal(r.saleID, "sale")}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="global_tbody">
                  <tr className="global_tr">
                    <td className="global_td">Total</td>
                    <td className="global_td"></td>
                    <td className="global_td">
                      {saleHistory?.reduce(
                        (acc, r) => acc + (r?.qtySold || 0),
                        0
                      )}
                    </td>
                    <td className="global_td"></td>
                    <td className="global_td">
                      {" "}
                      {saleHistory
                        ?.reduce((acc, r) => acc + (r?.total || 0), 0)
                        .toFixed(2)}
                    </td>
                    {getBusinessDetails().warranty === "1" && (
                      <>
                        <td className="global_td"></td>
                        <td className="global_td"></td>
                      </>
                    )}{" "}
                    <td className="global_td">
                      {" "}
                      {saleHistory
                        ?.reduce((acc, r) => acc + (r?.profit || 0), 0)
                        .toFixed(2)}
                    </td>
                    <td className="global_td"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
        {/* Sale Return Report */}
        {activeTab === 4 && (
          <div className="global_sub_container">
            <h1>Sale Return Report</h1>
            {/* Filter */}
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col w-full">
                <label className="font-medium mb-1">Select Period:</label>
                <select
                  className="global_dropdown w-full"
                  value={saleReturnFilter}
                  onChange={(e) => setSaleReturnFilter(e.target.value)}
                >
                  {filters.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col w-full">
                <label className="font-medium mb-1">Start Date:</label>
                <DatePicker
                  selected={startSaleReturnDate}
                  onChange={(date) => setStartSaleReturnDate(date)}
                  dateFormat="dd-MM-yyyy"
                  className="global_input w-full"
                />
              </div>
              <div className="flex flex-col w-full">
                <label className="font-medium mb-1">End Date:</label>
                <DatePicker
                  selected={endSaleReturnDate}
                  onChange={(date) => setEndSaleReturnDate(date)}
                  dateFormat="dd-MM-yyyy"
                  className="global_input w-full"
                />
              </div>
            </div>

            <div className="overflow-auto">
              <table className="global_table">
                <thead className="global_thead">
                  <tr>
                    <th className="global_th">#</th>
                    <th className="global_th">Sale Date</th>
                    <th className="global_th">QTY</th>
                    <th className="global_th">Price</th>
                    <th className="global_th">Total</th>
                    {getBusinessDetails()?.warranty === "1" && (
                      <>
                        {" "}
                        <th className="global_th">Warranty</th>
                        <th className="global_th">Serial Nos</th>
                      </>
                    )}

                    <th className="global_th">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {saleReturnHistory.map((r, i) => (
                    <tr className="font-bold bg-gray-100 dark:bg-gray-800">
                      <td className="global_td">{i + 1}</td>
                      <td className="global_td">
                        {formatDate(r?.CreatedDate)}{" "}
                        <TimeAgo date={r?.CreatedDate} />
                      </td>
                      <td className="global_td">{r?.qty || 0}</td>
                      <td className="global_td">{r?.amount?.toFixed(2)}</td>
                      <td className="global_td">{r?.total?.toFixed(2)}</td>
                      {getBusinessDetails().warranty === "1" && (
                        <td className="global_td">{r?.warranty || 0} Days</td>
                      )}
                      {getBusinessDetails().warranty === "1" && (
                        <td className="global_td">
                          <h2 className="grid grid-cols-2 gap-1">
                            {" "}
                            {r?.serialNumbers?.map((s, idx) => (
                              <span key={idx}>{s}</span>
                            ))}
                          </h2>
                        </td>
                      )}

                      <td className="global_td">
                        <button
                          className="global_button"
                          onClick={() =>
                            openReportModal(r?.salereturnID, "saleReturn")
                          }
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="global_tbody">
                  <tr className="global_tr">
                    <td className="global_td">Total</td>
                    <td className="global_td"></td>
                    <td className="global_td">
                      {saleReturnHistory?.reduce(
                        (acc, r) => acc + (r?.qty || 0),
                        0
                      )}
                    </td>
                    <td className="global_td"></td>
                    <td className="global_td">
                      {" "}
                      {saleReturnHistory
                        ?.reduce((acc, r) => acc + (r?.total || 0), 0)
                        .toFixed(2)}
                    </td>
                    {getBusinessDetails().warranty === "1" && (
                      <>
                        <td className="global_td"></td>
                        <td className="global_td"></td>
                      </>
                    )}{" "}
                    <td className="global_td"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
      <DynamicReportDetailsModal
        isOpen={openReportDetailsModal}
        onClose={() => setOpenReportDetailsModal(false)}
        type={modalType}
        id={detailsID}
      />
    </Fragment>
  );
};

export default Analyze;
