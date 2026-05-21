import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { AiOutlineEye } from "react-icons/ai";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import { getDateRange } from "../../Helper/dateRangeHelper";
import DatePicker from "react-datepicker";
import { FaCalendarAlt } from "react-icons/fa";

const TransactionReport = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { setGlobalLoader } = loadingStore();
  // date states
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState("This Month");
  const [initialized, setInitialized] = useState(false);

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

  // Fetch API
  const fetchTransactions = async () => {
    setGlobalLoader(true);
    if (!startDate || !endDate) return;

    const start = toISO(startDate);
    const end = toISO(endDate, true);
    try {
      const res = await api.get(`/AllTransactions/${start}/${end}`);
      setTransactions(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch transactions");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    const { start, end } = getDateRange("This Month");
    setStartDate(new Date(start));
    setEndDate(new Date(end));
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      setTransactions([]);
      fetchTransactions();
    }
  }, [startDate, endDate]);

  // Navigate handlers
  const handleSaleReturnPopUp = (t) =>
    navigate(`/SaleReturnDetails/${t.salereturnID}`);
  const handleInvoicePopUp = (t) => navigate(`/SaleDetails/${t.saleID}`);
  const handlePurchasePopUp = (t) =>
    navigate(`/PurchaseDetails/${t.purchaseID}`);
  const handleTransactionDetails = (t) =>
    navigate(`/TransactionDetails/${t._id}`);

  // Filter transactions by search
  const filteredTransactions = transactions.filter((t) => {
    const c = t.contactDetails || {};
    const name = c.name?.toLowerCase() || "";
    const mobile = c.mobile || "";
    const address = c.address?.toLowerCase() || "";
    return (
      name.includes(searchTerm.toLowerCase()) ||
      address.includes(searchTerm.toLowerCase()) ||
      mobile.includes(searchTerm)
    );
  });

  // Totals
  const totalFilteredCredit = useMemo(
    () => filteredTransactions.reduce((acc, t) => acc + (t.Credit || 0), 0),
    [filteredTransactions],
  );
  const totalFilteredDebit = useMemo(
    () => filteredTransactions.reduce((acc, t) => acc + (t.Debit || 0), 0),
    [filteredTransactions],
  );

  return (
    <div className="global_container">
      {/* Filters */}
      <div className="global_sub_container">
        <h1 className="global_heading">Transactions Report</h1>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 items-end md:grid-cols-3">
          <div>
            <select
              value={selectedRange}
              onChange={(e) => {
                const opt = e.target.value;
                setSelectedRange(opt);

                if (opt !== "Custom") {
                  const { start, end } = getDateRange(opt);
                  setStartDate(new Date(start));
                  setEndDate(new Date(end));
                }
              }}
              className="global_dropdown"
            >
              {[
                "Custom",
                "Today",
                "Last 30 Days",
                "This Week",
                "Last Week",
                "This Month",
                "Last Month",
                "This Year",
                "Last Year",
              ].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          {/* date picker */}
          <div>
            <label className="block text-sm">Start Date</label>
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
            <label className="block text-sm">End Date</label>
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
          {/* Search */}
          <div className="w-full sm:flex-1">
            <label className="block text-sm mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by Name, Address or Mobile"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="global_input w-full"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="global_sub_container overflow-x-auto">
        <table className="global_table">
          <thead className="global_thead">
            <tr>
              <th className="global_th">#</th>
              <th className="global_th">Date</th>
              <th className="global_th">Contact</th>
              <th className="global_th">Type</th>
              <th className="global_th">Received/Purchase</th>
              <th className="global_th">Payment/Sale</th>
              <th className="global_th">Note</th>
              <th className="global_th">Actions</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {filteredTransactions.length ? (
              filteredTransactions.map((t, i) => (
                <tr key={i} className="text-center global_tr">
                  <td className="global_td">{i + 1}</td>
                  {/* <td className="global_td">
                    {new Date(t.CreatedDate).toLocaleDateString("en-GB")}{" "}
                    {new Date(t.CreatedDate).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td> */}
                  <td className="global_td">
                    {(() => {
                      const d = new Date(t.CreatedDate);

                      // Date in DD-MM-YYYY format
                      const day = String(d.getDate()).padStart(2, "0");
                      const month = String(d.getMonth() + 1).padStart(2, "0");
                      const year = d.getFullYear();
                      const formattedDate = `${day}-${month}-${year}`;

                      // Time in HH:MM AM/PM
                      const formattedTime = d.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      });

                      return `${formattedDate} ${formattedTime}`;
                    })()}
                  </td>
                  <td className="global_td">
                    {t.contactDetails
                      ? `${t.contactDetails.name || "N/A"}, ${
                          t.contactDetails.mobile || "N/A"
                        }`
                      : "No Contact"}
                    <br />
                    {t.contactDetails?.address || "N/A"}
                  </td>
                  <td className="global_td">
                    {t.salereturnID
                      ? "Sale Return"
                      : t.saleID
                      ? "Sale"
                      : t.purchaseID
                      ? "Purchase"
                      : "Direct Txn"}
                  </td>
                  <td className="global_td">{t.Debit?.toFixed(2) || "0.00"}</td>
                  <td className="global_td">
                    {t.Credit?.toFixed(2) || "0.00"}
                  </td>
                  <td className="global_td">{t.note || "No Notes"}</td>
                  {/* <td className="global_td flex justify-center gap-1">
                    {t.saleID && (
                      <button
                        onClick={() => handleInvoicePopUp(t)}
                        className="text-blue-600"
                      >
                        <AiOutlineEye /> Sale
                      </button>
                    )}
                    {t.purchaseID && (
                      <button
                        onClick={() => handlePurchasePopUp(t)}
                        className="text-green-600"
                      >
                        <AiOutlineEye /> Purchase
                      </button>
                    )}
                    {t.salereturnID && (
                      <button
                        onClick={() => handleSaleReturnPopUp(t)}
                        className="text-orange-600"
                      >
                        <AiOutlineEye /> Return
                      </button>
                    )}
                    {!t.saleID && !t.purchaseID && !t.salereturnID && (
                      <button
                        onClick={() => handleTransactionDetails(t)}
                        className="text-gray-600"
                      >
                        <AiOutlineEye /> View
                      </button>
                    )}
                  </td> */}
                  <td className="global_td border px-2 py-1">
                    <div className="flex flex-wrap justify-center gap-1">
                      {t.saleID && (
                        <button
                          onClick={() => handleInvoicePopUp(t)}
                          className="flex items-center gap-1 text-blue-600 px-2 py-1 rounded hover:bg-blue-50 text-sm"
                        >
                          <AiOutlineEye /> <span>Sale</span>
                        </button>
                      )}
                      {t.purchaseID && (
                        <button
                          onClick={() => handlePurchasePopUp(t)}
                          className="flex items-center gap-1 text-green-600 px-2 py-1 rounded hover:bg-green-50 text-sm"
                        >
                          <AiOutlineEye /> <span>Purchase</span>
                        </button>
                      )}
                      {t.salereturnID && (
                        <button
                          onClick={() => handleSaleReturnPopUp(t)}
                          className="flex items-center gap-1 text-orange-600 px-2 py-1 rounded hover:bg-orange-50 text-sm"
                        >
                          <AiOutlineEye /> <span>Return</span>
                        </button>
                      )}
                      {!t.saleID && !t.purchaseID && !t.salereturnID && (
                        <button
                          onClick={() => handleTransactionDetails(t)}
                          className="flex items-center gap-1 text-gray-600 px-2 py-1 rounded hover:bg-gray-100 text-sm"
                        >
                          <AiOutlineEye /> <span>View</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="global_td text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-gray-50 dark:bg-gray-700 font-semibold">
            <tr>
              <td colSpan="3" className="global_td text-center font-semibold">
                Total
              </td>
              <td className="global_td text-center font-semibold">
                {totalFilteredDebit.toFixed(2)}
              </td>
              <td></td>
              <td className="global_td text-center font-semibold">
                {totalFilteredCredit.toFixed(2)}
              </td>
              <td colSpan="3" className="global_td"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default TransactionReport;
