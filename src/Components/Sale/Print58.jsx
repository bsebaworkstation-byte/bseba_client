import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { printElement } from "../../Helper/Printer";
import api from "../../Helper/axios_resonse_interceptor";

const Print58 = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/SalesDetailsByID/${id}`);
      if (res.data?.status === "Success") {
        setData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching sale details:", error);
    }
  };

  const handlePrint = () => {
    printElement(printRef, `Invoice-58mm-${id}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const numberToWords = (num) => {
    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100)
        return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000)
        return (
          a[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 ? " " + inWords(n % 100) : "")
        );
      if (n < 100000)
        return (
          inWords(Math.floor(n / 1000)) +
          " Thousand" +
          (n % 1000 ? " " + inWords(n % 1000) : "")
        );
      if (n < 10000000)
        return (
          inWords(Math.floor(n / 100000)) +
          " Lakh" +
          (n % 100000 ? " " + inWords(n % 100000) : "")
        );
      return n;
    };
    const [whole, decimal] = num.toString().split(".");
    let words = inWords(parseInt(whole));
    if (decimal && parseInt(decimal) !== 0) {
      words += " Point";
      for (let d of decimal) words += " " + a[d];
    }
    return words;
  };

  return (
    <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-900 py-6 min-h-screen">
      <style>
        {`
        @media print {
          @page {
            size: 58mm auto;
            margin: 0;
          }
          body { background: white !important; }
          #no-print { display: none !important; }
          .invoice-card {
            width: 58mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
          }
        }
        `}
      </style>

      {/* Invoice Card */}
      <div
        ref={printRef}
        className="invoice-card bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-md border border-gray-300 dark:border-gray-700 rounded p-3 w-[58mm] text-[12px]"
      >
        {/* Header */}
        <div className="text-center mb-1">
          <h2 className="text-base font-bold">Tech BD</h2>
          <p className="text-[11px]">01727841588</p>
          <p className="text-[11px]">Dhaka</p>
          <div className="border-t border-dashed border-gray-400 my-1"></div>
        </div>

        {/* Invoice Info */}
        <div className="text-center text-[11px] mb-2">
          <p>
            <strong>Invoice:</strong> {data?.SaleSummary?.Reference}
          </p>
          <p>
            {data?.SaleSummary?.Date ? formatDate(data.SaleSummary.Date) : ""}
          </p>
          <p>
            <strong>Customer:</strong> {data?.Customer?.name}
          </p>
          <p>
            <strong>Contact:</strong> {data?.Customer?.mobile}
          </p>
        </div>

        <div className="border-t border-dashed border-gray-400 my-1"></div>

        {/* Product Table */}
        <div className="text-[11px] mb-2">
          <div className="flex justify-between font-semibold">
            <span>Item</span>
            <span>Total</span>
          </div>
          {data?.Products?.map((p, i) => (
            <div key={i} className="flex justify-between mt-1">
              <span>{p.name}</span>
              <span>{p.total.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-gray-400 my-1"></div>

        {/* Totals */}
        <div className="text-right text-[11px] leading-4">
          <p>
            <strong>Total:</strong> {data?.SaleSummary?.total?.toFixed(2)}
          </p>
          <p>
            <strong>Discount:</strong> {data?.SaleSummary?.discount?.toFixed(2)}
          </p>
          <p>
            <strong>Due Amount:</strong>{" "}
            {data?.SaleSummary?.grandTotal?.toFixed(2)}
          </p>
        </div>

        <div className="border-t border-dashed border-gray-400 my-1"></div>

        {/* Amount in Words */}
        <div className="text-center text-[10px] mt-1">
          {data?.SaleSummary?.grandTotal
            ? `${numberToWords(data.SaleSummary.grandTotal.toFixed(2))} Taka`
            : ""}
        </div>

        <div className="text-center mt-2 text-[11px]">
          <p>.................................</p>
          <p className="font-semibold">Bseba Software</p>
        </div>
      </div>

      {/* Buttons */}
      <div id="no-print" className="flex flex-col items-center gap-2 mt-4">
        <button onClick={handlePrint} className="global_button">
          Print 58MM
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/invoice/80mm/${id}`)}
            className="global_button"
          >
            80MM Invoice
          </button>
          <button
            onClick={() => navigate(`/invoice/a5/${id}`)}
            className="global_button"
          >
            A5 Invoice
          </button>
          <button
            onClick={() => navigate(`/invoice/a4/${id}`)}
            className="global_button"
          >
            A4 Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default Print58;
