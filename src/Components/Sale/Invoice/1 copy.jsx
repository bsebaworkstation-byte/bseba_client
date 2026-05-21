import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
// import { printElement } from "../../../Helper/SessionHelper";
import loadingStore from "../../../Zustand/LoadingStore";
import {
  getBusinessDetails,
  getName,
} from "../../../Helper/SessionHelper";
import { printElement } from "../../../Helper/Printer";
import api from "../../../Helper/axios_resonse_interceptor";

const Invoice1 = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const businessDetails = getBusinessDetails();
  const printRef = useRef();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/SalesDetailsByID/${id}`);
      if (res.data?.status === "Success") {
        setData(res.data.data);
        // console.log(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching invoice:", err);
    } finally {
      setGlobalLoader(false);
    }
  };

  const handlePrint = () => {
    printElement(printRef, `Invoice-${id}`);
  };

  const subtotal =
    data?.Products?.reduce(
      (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0),
      0
    ) || 0;

  const taxRate = Number(data?.SaleSummary?.TaxRate) || 0;
  const discountRate = Number(data?.SaleSummary?.DiscountRate) || 0;
  const discount = (subtotal * discountRate) / 100;
  const tax = ((subtotal - discount) * taxRate) / 100;
  const total = subtotal - discount + tax;

  const formatCurrency = (amount) => Number(amount || 0).toFixed(2);

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
      {/* Printable Invoice */}
      <div
        style={{
          width: "210mm",
          // minHeight: "297mm",
          margin: "0 auto",
          // padding: "10mm",
          background: "white",
          boxSizing: "border-box",
        }}
      >
        <div
          ref={printRef}
          className="min-h-[266mm] p-5 dark:bg-gray-800 flex flex-col justify-between "
        >
          <div>
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-300 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="bg-orange-600  w-12 h-12 text-white  font-bold text-xl rounded dark:text-gray-50">
                    <img src={businessDetails?.logo} alt="" />
                  </div>
                  <div>
                    <h1 className="font-bold dark:text-gray-50 text-lg uppercase tracking-widest">
                      {businessDetails?.businessName}
                    </h1>

                    <p className="text-xs dark:text-gray-50 text-gray-600 mt-1">
                      {businessDetails?.address || "Company Address"}
                    </p>
                    <p className="text-xs dark:text-gray-50 text-gray-600">
                      {businessDetails?.contactNumber || "+880 000 000 000"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {formatDate(new Date())}
                </p>
              </div>

              <div className="text-right">
                <h2 className="text-3xl font-bold uppercase tracking-widest dark:text-gray-50">
                  Invoice
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  #{data?.SaleSummary?.Reference || "0000"}
                </p>
                <div className="mt-3 text-xs dark:text-gray-50 text-gray-600">
                  <p>
                    <span className="font-semibold">Invoice No:</span>{" "}
                    {data?.SaleSummary?.Reference || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Date:</span>{" "}
                    {formatDate(data?.SaleSummary?.Date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice To */}
            <div className="flex justify-between mt-6 mb-4 text-sm items-stretch">
              {/* Left: Client Info */}
              <div className="flex-1   rounded-md p-3 mr-4 flex flex-col justify-between">
                <h3 className="font-semibold uppercase text-orange-600 mb-1">
                  Invoice To:
                </h3>
                <div>
                  <p className="font-medium">
                    {data?.Customer?.name || "Client Name"}
                  </p>
                  <p>{data?.Customer?.mobile || "N/A"}</p>
                  <p>{data?.Customer?.address || "Address not provided"}</p>
                </div>
              </div>

              {/* Right: Empty Box / Optional Invoice Info */}
              <div className="w-2/4  rounded-md  flex  justify-between bg-gray-100 dark:bg-gray-700">
                <span className="text-sm ml-3 bg-orange-600 w-2 h-[100%]"></span>
                <div className="text-right flex items-center gap-12 p-3">
                  <div className="flex items-start flex-col">
                    <span className="text-gray-800 text-left text-sm font-semibold dark:text-gray-50 ">
                      Invoice Number
                    </span>
                    <p className="text-gray-600 dark:text-gray-50">
                      {data?.SaleSummary?.Reference || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-start flex-col">
                    <span className="text-gray-800 text-left text-sm font-semibold dark:text-gray-50">
                      Date Information
                    </span>
                    <p className="text-gray-600 dark:text-gray-50">
                      {formatDate(
                        data?.SaleSummary?.DueDate || data?.SaleSummary?.Date
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* ===============================  */}
            <div className="border border-gray-400 rounded-md overflow-hidden">
              <table className="w-full table-fixed border-collapse">
                {/* HEADER */}
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-50 text-sm font-semibold uppercase">
                  <tr>
                    <th className="w-12 border-r border-gray-300 px-2 py-2 text-left">
                      No
                    </th>

                    <th className="border-r border-gray-300 px-2 py-2 text-left">
                      Item Description
                    </th>

                    <th className="w-28 border-r border-gray-300 px-2 py-2 text-center">
                      Price
                    </th>

                    <th className="w-24 border-r border-gray-300 px-2 py-2 text-center">
                      Qty
                    </th>

                    <th className="w-28 px-2 py-2 text-right">Total</th>
                  </tr>
                </thead>
              </table>

              {/* BODY WITH SCROLL */}
              <div className="h-[350px] overflow-y-auto">
                <table className="w-full table-fixed border-collapse">
                  <tbody>
                    {data?.Products?.length > 0 ? (
                      data.Products.map((item, index) => {
                        const totalItem =
                          (Number(item.price) || 0) *
                          (Number(item.quantity) || 0);

                        return (
                          <tr
                            key={index}
                            className="text-sm border-b border-gray-200"
                          >
                            <td className="w-12 px-2 py-2">{index + 1}</td>

                            <td className="px-2 py-2">{item.name}</td>

                            <td className="w-28 px-2 py-2 text-center">
                              ৳{Number(item.price).toFixed(2)}
                            </td>

                            <td className="w-24 px-2 py-2 text-center">
                              {item.quantity}
                            </td>

                            <td className="w-28 px-2 py-2 text-right">
                              ৳{totalItem.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center text-gray-500 py-6"
                        >
                          No items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ===============================  */}

            {/* Summary + Notes Row */}
            <div className="grid grid-cols-2 gap-6 mt-6 border-t border-gray-300 pt-4">
              {/* RIGHT — NOTES */}
              <div className="text-xs text-gray-600 dark:text-gray-50">
                <h4 className="font-semibold text-sm mb-1">Notes</h4>

                <p>
                  {data?.SaleSummary?.note &&
                  data?.SaleSummary?.note.trim() !== ""
                    ? data.note
                    : "No additional notes provided."}
                </p>
              </div>
              {/* LEFT — SUMMARY */}
              <div className="text-sm">
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between">
                    <span> Total:</span>
                    <span>
                      ৳{formatCurrency(data?.SaleSummary?.total.toFixed(2))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Grand Total:</span>
                    <span>
                      ৳{formatCurrency(data?.SaleSummary?.grandTotal || 0)} Tk
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span> Total:</span>
                    <span>
                      ৳{formatCurrency(data?.SaleSummary?.grandTotal || 0)} Tk
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span> Previous Balance:</span>
                    <span>
                      ৳{" "}
                      {formatCurrency(data?.SaleSummary?.PreviousBalance || 0)}{" "}
                      Tk
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span> Due Amount:</span>
                    <span>
                      ৳ {formatCurrency(data?.SaleSummary?.dueAmount || 0)} Tk
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span> Paid:</span>
                    <span>
                      ৳{formatCurrency(data?.SaleSummary?.paid || 0)} Tk
                    </span>
                  </div>

                  <div className="flex justify-between font-semibold  border-gray-300 mt-2 pt-2 text-orange-600">
                    <span>Current Balance:</span>
                    <span>
                      ৳ {formatCurrency(data?.SaleSummary?.CurrentBalance || 0)}{" "}
                      Tk
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Signature + Footer */}
          <div className="flex justify-between items-center mt-10 border-t pt-6">
            <div>
              <p className="text-sm font-medium border-t border-gray-400 inline-block pt-1">
                {getName() || "Steven Joe"}
              </p>
              <p className="text-xs text-gray-500">Accounting Manager</p>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-semibold text-orange-600">
                Thank you for choosing {businessDetails?.businessName}!
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-center">
        <div id="no-print" className="flex gap-4 mt-6">
          <button onClick={handlePrint} className="global_button">
            Print Invoice1
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice1;
