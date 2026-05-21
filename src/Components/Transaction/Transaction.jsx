import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link, useParams } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../Helper/axios_resonse_interceptor";
import TimeAgo from "../../Helper/UI/TimeAgo";
import { printElement } from "../../Helper/Printer";
import { printExpense } from "../../Helper/PrintExpense";
import { getBusinessDetails } from "../../Helper/SessionHelper";
import { formatDate } from "../../Helper/utils";

function Transaction() {
  const { id } = useParams();
  const { setGlobalLoader } = loadingStore();
  const printRef = useRef();
  const [transactions, setTransactions] = useState([]);
  const [contactDetails, setContactDetails] = useState({});

  // Filter state
  const [filter, setFilter] = useState("last30days");
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  // POST Discount Form State
  const [discountCredit, setDiscountCredit] = useState("");
  const [discountDebit, setDiscountDebit] = useState("");
  const [discountNote, setDiscountNote] = useState("");
  const [discountDate, setDiscountDate] = useState(new Date());
  const businessDetails = getBusinessDetails();
  const contactID = id;

  const filters = [
    { value: "last30days", label: "Last 30 Days" },
    { value: "thisWeek", label: "This Week" },
    { value: "lastWeek", label: "Last Week" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "thisYear", label: "This Year" },
    { value: "lastYear", label: "Last Year" },
  ];

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

  const fetchTransactions = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/GetTransactions/${contactID}/${formatISO(startDate)}/${formatISO(
          endDate,
        )}`,
      );
      setContactDetails((prev) => ({
        ...prev,
        ...(res.data.contactDetails || {}),
      }));

      setTransactions(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const fetchContactPerson = async () => {
    try {
      const res = await api.get(`/GetContactDetailsById/${id}`);
      if (res.data.status === "Success") {
        setContactDetails((prev) => ({ ...prev, ...res.data.data }));
      }
    } catch (error) {
      console.error("Error fetching contact details", error);
    }
  };
  useEffect(() => {
    if (filter !== "custom") {
      const { start, end } = getDateRange(filter);
      setStartDate(start);
      setEndDate(end);
    }
  }, [filter]);

  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate, contactID]);

  useEffect(() => {
    if (id) {
      fetchContactPerson();
    }
  }, [id]);
  // Totals
  const totals = [...transactions].reduce(
    (acc, t) => {
      acc.paymentSale +=
        (t.Credit > 0 && t.Discount !== "1") ||
        (!t.saleID && !t.purchaseID && t.Discount !== "1")
          ? t.Credit || 0
          : 0;

      acc.purchaseReceived += t.Debit > 0 && t.Discount !== "1" ? t.Debit : 0;
      acc.discountReceived += t.Discount === "1" ? t.Credit || 0 : 0;
      acc.discount += t.Discount === "1" ? t.Debit || 0 : 0;
      acc.closingBalance += (t.TotalCredit || 0) - (t.TotalDebit || 0);

      return acc;
    },
    {
      paymentSale: 0,
      purchaseReceived: 0,
      discountReceived: 0,
      discount: 0,
      closingBalance: 0,
    },
  );
  const handlePrint = () => {
    printExpense(printRef);
  };
  return (
    <div className="" ref={printRef}>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex justify-between">
        <div className="">
          {" "}
          <h1>{contactDetails?.name}</h1>
          <h1>{contactDetails?.mobile}</h1>
          <h1>{contactDetails?.address}</h1>
          {contactDetails?.contactPerson && (
            <h1>Contact Person: {contactDetails.contactPerson}</h1>
          )}
        </div>
        <div className="flex items-start border p-2 border-gray-300 rounded-lg gap-2 font-bold">
          {businessDetails.logo && (
            <img
              src={businessDetails.logo}
              height={70}
              width={70}
              alt="dokanpat"
              className="h-fit border rounded-full border-gray-300 p-2"
            />
          )}
          <div>
            <h1 className="pt-3">{businessDetails?.businessName}</h1>
            <h1 className="text-sm">{businessDetails?.address}</h1>
            <h1 className="text-sm">{businessDetails?.contactNumber}</h1>
            {!!businessDetails?.email && (
              <h1 className="text-sm">{businessDetails?.email}</h1>
            )}
            {!!businessDetails?.website && (
              <h1 className="text-sm">{businessDetails?.website}</h1>
            )}
          </div>
        </div>
        <h1>
          Closing Balance{" "}
          {contactDetails?.ClosingBalance > 0 ? "Payable" : "Recievable"}{" "}
          {Math.abs(contactDetails?.ClosingBalance)}
        </h1>
      </div>

      {/* Transactions Table */}
      <div className="overflow-auto py-5">
        {/* Filter */}
        <div
          className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4"
          id="no-print"
        >
          <div className="flex flex-col w-full">
            <label className="font-medium mb-1">Select Period:</label>
            <select
              className="global_dropdown w-full"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
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
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd-MM-yyyy"
              className="global_input w-full"
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="font-medium mb-1">End Date:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd-MM-yyyy"
              className="global_input w-full"
            />
          </div>
        </div>
        <table className="global_table">
          <thead className="global_thead">
            <tr>
              <th className="global_th">#</th>
              <th className="global_th">Date</th>
              <th className="global_th">Type</th>
              <th className="global_th">Payment /Sale</th>
              <th className="global_th">Received/Purchase</th>

              {transactions.some((t) => t.Discount === "1") && (
                <>
                  <th className="global_th">Discount Received</th>{" "}
                  <th className="global_th">Discount</th>
                </>
              )}
              <th className="global_th">Closing Balance</th>
              <th className="global_th">Note</th>
              <th className="global_th" id="no-print">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {transactions.length > 0 ? (
              transactions.map((t, i) => {
                // Determine transaction type
                let type = "Direct Txn";
                if (t.saleID) type = "Sale";
                else if (t.purchaseID) type = "Purchase";
                else if (t.purchasereturnID) type = "Purchase Return";
                else if (t.salereturnID) type = "Sale Return";
                else if (t.serviceID) type = "Service";
                else if (t.Discount === "1" && t.Credit > 0)
                  type = "Discount Received";
                else if (t.Discount === "1" && t.Debit > 0)
                  type = "Discount Payment";
                // Calculate columns
                const paymentSale =
                  t.Credit > 0 && t.Discount !== "1"
                    ? (t.Credit || 0).toFixed(2)
                    : "0.00";

                const purchaseReceived =
                  t.Debit > 0 && t.Discount !== "1"
                    ? (t.Debit || 0).toFixed(2)
                    : "0.00";

                const discountReceived =
                  t.Discount === "1" && t.Credit > 0
                    ? (t.Credit || 0).toFixed(2)
                    : "0.00";

                const discount =
                  t.Discount === "1" && t.Debit > 0
                    ? (t.Debit || 0).toFixed(2)
                    : "0.00";

                // Closing Balance logic
                const balance = (t.TotalCredit || 0) - (t.TotalDebit || 0);

              
                return (
                  <tr key={t._id}>
                    <td className="global_td">{i + 1}</td>
                    <td className="global_td whitespace-nowrap">
                      {" "}
                      <h1 className="text-nowrap">
                        {" "}
                        {formatDate(t.CreatedDate)}{" "}
                        <TimeAgo date={t.CreatedDate} />
                      </h1>
                    </td>
                    <td className="global_td">{type}</td>
                    <td className="global_td">{paymentSale}</td>
                    <td className="global_td">{purchaseReceived}</td>

                    {transactions.some((t) => t.Discount === "1") && (
                      <>
                        {" "}
                        <td className="global_td">{discountReceived}</td>{" "}
                        <td className="global_td">{discount}</td>
                      </>
                    )}

                    <td
                      className={`global_td ${
                        balance > 0
                          ? "text-green-600"
                          : balance < 0
                          ? "text-red-600"
                          : ""
                      }`}
                    >
                      {t.TotalDebit - t.TotalCredit > 0
                        ? `Payable: ${(t.TotalDebit - t.TotalCredit).toFixed(
                            2,
                          )}`
                        : t.TotalDebit - t.TotalCredit < 0
                        ? `Receivable: ${Math.abs(
                            t.TotalDebit - t.TotalCredit,
                          ).toFixed(2)}`
                        : "0.00"}
                    </td>
                    <td className="global_td">{t.note || "-"}</td>
                    <td className="global_td text-center" id="no-print">
                      {t.saleID && (
                        <Link
                          to={`/Invoice/1/${t.saleID}`}
                          className="global_button"
                        >
                          Sale
                        </Link>
                      )}
                      {t.purchaseID && (
                        <Link
                          to={`/PurchaseDetails/${t.purchaseID}`}
                          className="global_button"
                        >
                          Purchase
                        </Link>
                      )}

                      {t.purchasereturnID && (
                        <Link
                          to={`/PurchaseReturnDetails/${t.purchasereturnID}`}
                          className="global_edit"
                        >
                          Purchase Return
                        </Link>
                      )}
                      {t.salereturnID && (
                        <Link
                          to={`/SaleReturnDetails/${t.salereturnID}`}
                          className="global_edit"
                        >
                          Sale Return
                        </Link>
                      )}
                      {!t.saleID &&
                        !t.purchaseID &&
                        !t.salereturnID &&
                        !t.purchasereturnID && !t.serviceID && (
                          <Link
                            to={`/TransactionDetails/${t._id}`}
                            className="global_button"
                          >
                            Details
                          </Link>
                        )}
                      {t.serviceID && (
                        <Link
                          to={`/ServiceDetails/${t.serviceID}`}
                          className="global_button"
                        >
                          Service
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-4">
                  No Transactions Found
                </td>
              </tr>
            )}

            {/* Totals Row */}
            <tr className="font-bold bg-gray-100 dark:bg-gray-800">
              <td colSpan="3" className="text-right px-2">
                Total
              </td>
              <td className="global_td">{totals.paymentSale.toFixed(2)}</td>
              <td className="global_td">
                {totals.purchaseReceived.toFixed(2)}
              </td>
              {transactions.some((t) => t.Discount === "1") && (
                <>
                  {" "}
                  <td className="global_td">
                    {totals.discountReceived.toFixed(2)}
                  </td>
                  <td className="global_td">{totals.discount.toFixed(2)}</td>
                </>
              )}
              <td className="global_td">
                {/* {totals.closingBalance.toFixed(2)} */}
                <h2 className="">
                  {contactDetails.ClosingBalance > 0 ? "Payable" : "Receivable"}{" "}
                  <span className="">
                    {Math.abs(contactDetails.ClosingBalance || 0)
                      .toFixed(2)
                      .toLocaleString()}
                  </span>
                </h2>
              </td>
              <td className="global_td" colSpan="2"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-16">
        <h1 className="border-t">Authorization Signature</h1>
        <h1 className="border-t">Customer Signature</h1>
      </div>

      <p className="text-center text-sm border-t border-gray-400 mt-3">
        <span className="text-gray-500">Software Developed by</span>{" "}
        <span className="font-semibold">Bseba.com</span>
      </p>

      <button onClick={handlePrint} className="global_button" id="no-print">
        Print
      </button>
    </div>
  );
}

export default Transaction;
