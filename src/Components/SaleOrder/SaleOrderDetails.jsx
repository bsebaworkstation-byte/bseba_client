import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { numberToWords } from "../../Helper/UI/NumberToWord";
import api from "../../Helper/axios_resonse_interceptor";

export default function SaleOrderDetails() {
  const { id } = useParams();
  const { setGlobalLoader } = loadingStore();

  const [detailsData, setDetailsData] = useState(null);
  const printRef = useRef(null);

  // Fetch Order Details
  const fetchOrderDetails = async () => {
    setGlobalLoader(true);
    try {
      const { data } = await api.get(
        `/SaleOrderDetailsByID/${id}`
      );
      if (data.status === "Success") {
        setDetailsData(data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  if (!detailsData) {
    return <div className="p-6 text-center text-gray-500">No data found</div>;
  }

  const {
    referenceNo,
    total,
    discount,
    grandTotal,
    note,
    User,
    Contact,
    Products,
    CreatedDate,
  } = detailsData;

  const handlePrint = () => {
    window.print();
  };

  const businessDetails =
    JSON.parse(localStorage.getItem("businessDetails")) || {};
  const { businessName, contactNumber, address } = businessDetails;

  // console.log(businessDetails)

  return (
    <div className="flex justify-center py-5">
      <div
        ref={printRef}
        className="
          mx-auto p-2 md:p-6
        "
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-3">
          <h2 className="text-lg font-bold dark:text-white">
            {businessName || "Beseba.com"}
          </h2>
          <p className="dark:text-gray-300">{contactNumber}</p>
          <p className="dark:text-gray-300">{address}</p>
        </div>
        <hr className="border-gray-300 dark:border-gray-700 my-2" />
        {/* Summary */}
        <div className="flex justify-between mb-3 text-sm">
          <div>
            <p>{Contact?.name}</p>
            <p>{Contact?.mobile}</p>
            <p>{Contact?.address}</p>
          </div>

          <div className="text-right dark:text-gray-300">
            <p>No: {referenceNo}</p>
            <p>
              Date:
              {new Date(CreatedDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p>Created By: {User?.name}</p>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 dark:border-gray-700 text-sm">
            <thead className="bg-green-50 dark:bg-gray-800 text-green-700 dark:text-green-300">
              <tr>
                <th className="border dark:border-gray-700 px-2 py-1 text-center">
                  #
                </th>
                <th className="border dark:border-gray-700 px-2 py-1 text-left">
                  Name
                </th>
                <th className="border dark:border-gray-700 px-2 py-1 text-left">
                  Brand
                </th>
                <th className="border dark:border-gray-700 px-2 py-1 text-center">
                  Qty
                </th>
                <th className="border dark:border-gray-700 px-2 py-1 text-center">
                  Price
                </th>
                <th className="border dark:border-gray-700 px-2 py-1 text-right">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {Products.map((p, i) => (
                <tr key={i} className="dark:text-gray-300">
                  <td className="border dark:border-gray-700 px-2 py-1 text-center">
                    {i + 1}
                  </td>
                  <td className="border dark:border-gray-700 px-2 py-1">
                    {p.name}
                  </td>
                  <td className="border dark:border-gray-700 px-2 py-1">
                    {p.brand}
                  </td>
                  <td className="border dark:border-gray-700 px-2 py-1 text-center">
                    {p.quantity} {p.unit}
                  </td>
                  <td className="border dark:border-gray-700 px-2 py-1 text-center">
                    {p.price.toLocaleString("en-IN")}
                  </td>
                  <td className="border dark:border-gray-700 px-2 py-1 text-right">
                    {p.total.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex flex-col  sm:flex-row justify-between mt-4 text-sm">
          <div className="sm:w-1/2">
            <p className="font-semibold dark:text-gray-300">
              Amount in Words: {numberToWords(grandTotal)}
            </p>

            {note && (
              <p className="mt-1 dark:text-gray-400">
                <span className="font-semibold">Note:</span> {note}
              </p>
            )}
          </div>

          <div className="sm:w-1/2 ml-0.5">
            <table className="w-full border dark:border-gray-700 text-sm mt-3 sm:mt-0">
              <tbody>
                <tr>
                  <th className="border dark:border-gray-700 px-2 py-1 text-left">
                    Total:
                  </th>
                  <td className="border dark:border-gray-700 px-2 py-1 text-right">
                    {total.toLocaleString("en-IN")} Tk
                  </td>
                </tr>

                <tr>
                  <th className="border dark:border-gray-700 px-2 py-1 text-left">
                    Discount:
                  </th>
                  <td className="border dark:border-gray-700 px-2 py-1 text-right">
                    {discount.toLocaleString("en-IN")} Tk
                  </td>
                </tr>

                <tr>
                  <th className="border dark:border-gray-700 px-2 py-1 text-left">
                    Grand Total:
                  </th>
                  <td className="border dark:border-gray-700 px-2 py-1 text-right">
                    {grandTotal.toLocaleString("en-IN")} Tk
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs">
          <p className="text-red-500 dark:text-red-400 font-semibold mt-1">
            Bseba.com
          </p>
        </div>

        {/* Print Button */}
        <div className="text-center">
          <button
            onClick={handlePrint}
            className="global_button mt-5"
            id="no-print"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
