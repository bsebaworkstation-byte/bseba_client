import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { printElement } from "../../Helper/Printer";
import api from "../../Helper/axios_resonse_interceptor";

const ChallanA5 = () => {
  const { id } = useParams();
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
    printElement(printRef, `ChallanA5-${id}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, "0")}-${date.toLocaleString(
      "default",
      { month: "short" }
    )}-${date.getFullYear()}`;
  };

  return (
    <div className="global_container">
      {/* Main A5 Container */}
      <div
        ref={printRef}
        className=" "
        style={{
          // A5 সাইজের স্ট্যান্ডার্ড প্রস্থ
          width: "148mm",
          minHeight: "210mm",
          padding: "10mm",
          boxSizing: "border-box",
          overflow: "hidden",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div className="text-center mb-2">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Tech BD
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            01727841588
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-1">Dhaka</p>
          <hr className="border-gray-300 dark:border-gray-600 my-1" />
        </div>

        {/* Challan Title */}
        <div className="text-center text-lg text-green-600 dark:text-green-400 font-semibold mb-3">
          <h4>Challan</h4>
        </div>

        {/* Customer & Invoice Info */}
        <div className="flex justify-between mb-2 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <p className="font-semibold">Challan To:</p>
            <p>{data?.Customer?.name || "N/A"}</p>
            <p>{data?.Customer?.mobile}</p>
            <p>{data?.Customer?.address}</p>
          </div>
          <div className="text-right">
            <p>Invoice: {data?.SaleSummary?.Reference}</p>
            <p>Date: {formatDate(data?.SaleSummary?.Date)}</p>
            <p>Created By: {data?.Users?.name}</p>
          </div>
        </div>

        {/* Product Table */}
        <table className="global_table">
          <thead className="global_thead">
            <tr>
              <th className="p-1 global_th text-center w-[30px]">No.</th>
              <th className="p-1 global_th text-left">Item Description</th>
              <th className="p-1 global_th text-center w-[50px]">QTY</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {data?.Products?.length > 0 ? (
              data.Products.map((p, i) => (
                <tr
                  key={p.id || i}
                  className="border hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="p-1 global_td text-center">{i + 1}</td>
                  <td className="p-1 global_td">{p.name}</td>
                  <td className="p-1 global_td text-center">{p.quantity}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="text-center p-2 global_td dark:text-gray-300"
                >
                  No items found
                </td>
              </tr>
            )}
            <tr className="font-semibold">
              <td colSpan={2} className="p-1 global_td text-right">
                Total Product
              </td>
              <td className="p-1 global_td text-center">
                {data?.Products?.reduce((sum, p) => sum + p.quantity, 0) || 0}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Notes & Signature */}
        {data?.SaleSummary?.note && (
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-2">
            Note:{" "}
            <span className="text-gray-700 dark:text-gray-400">
              {data.SaleSummary.note}
            </span>
          </p>
        )}

        <div className="flex justify-between mt-10 text-sm text-gray-700 dark:text-gray-400">
          <p>Customer Signature</p>
          <p>Authorised Signature</p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs mt-4 text-gray-500 dark:text-gray-400">
          <p>
            Powered by{" "}
            <span className="text-red-600 font-semibold dark:text-red-400">
              Bseba.com
            </span>
          </p>
        </div>
      </div>

      {/* Print Button */}
      <button
        onClick={handlePrint}
        id="no-print"
        className="global_button mt-4"
      >
        Print A5 Challan
      </button>
    </div>
  );
};

export default ChallanA5;
