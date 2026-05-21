import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getBusinessDetails, getToken } from "../../Helper/SessionHelper";
import { printElement } from "../../Helper/Printer";
import { ErrorToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";

const PurchaseReturnDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const printRef = useRef(null);
  const { setGlobalLoader } = loadingStore();
  const businessDetails = getBusinessDetails();

  useEffect(() => {
    const fetchDetails = async () => {
      setGlobalLoader(true);
      try {
        const res = await api.get(`/PurchaseReturnDetails/${id}`);
        if (res.data.status === "Success") {
          setData(res.data.data);
        } else {
          setError("Failed to load details");
        }
      } catch (err) {
        setError("Failed to load Purchase return details");
      } finally {
        setGlobalLoader(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (error)
    return (
      // <div className="p-6 text-center text-red-500 font-medium">{error}</div>
      ErrorToast(error)
    );

  // if (!data)
  //   return (
  //     <div className="p-6 text-center text-gray-500 font-medium">
  //       Loading details...
  //     </div>
  //   );

  const handlePrint = () => printElement(printRef, "Purchase Details");

  return (
    <div className="global_container">
      <div
        ref={printRef}
        className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6 w-full max-w-4xl mx-auto print:w-[210mm] print:min-h-[297mm]"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {businessDetails?.businessName}
          </h2>
          <h3>{businessDetails?.contactNumber}</h3>

          <p className="text-gray-600 dark:text-gray-300 text-base mt-1">
            Purchase Return Details
          </p>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 text-[16px] md:grid-cols-3 gap-6 mb-8 border border-gray-200 dark:border-gray-700 rounded-lg p-4 print:grid-cols-3">
          {/* Customer Info */}
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold mb-1 text-lg text-gray-800 dark:text-gray-100 border-b border-gray-300 dark:border-gray-700 pb-1">
              Customer Details
            </h3>
            <p>
              <span className="font-semibold text-gray-900 dark:text-gray-200">
                Name:
              </span>{" "}
              {data?.contact?.name || "N/A"}
            </p>
            <p>
              <span className="font-semibold text-gray-900 dark:text-gray-200">
                Mobile:
              </span>{" "}
              {data?.contact?.mobile || "N/A"}
            </p>
            <p>
              <span className="font-semibold text-gray-900 dark:text-gray-200">
                Address:
              </span>{" "}
              {data?.contact?.address || "N/A"}
            </p>
          </div>

          {/* Purchase Info */}
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold mb-1 text-lg text-gray-800 dark:text-gray-100 border-b border-gray-300 dark:border-gray-700 pb-1">
              Purchase Information
            </h3>
            <p>
              <span className="font-semibold text-gray-900 dark:text-gray-200">
                Date:
              </span>{" "}
              {new Date(
                data?.purchaseDetails?.CreatedDate
              ).toLocaleDateString()}
            </p>
            <p>
              <span className="font-semibold text-gray-900 dark:text-gray-200">
                Reference:
              </span>{" "}
              {data?.purchaseDetails?.referenceNo || "-"}
            </p>
            <p>
              <span className="font-semibold text-gray-900 dark:text-gray-200">
                Total:
              </span>{" "}
              {data?.purchaseDetails?.total?.toFixed(2) || "0.00"}
            </p>
          </div>

          {/* Return Summary */}
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold mb-1 text-lg text-gray-800 dark:text-gray-100 border-b border-gray-300 dark:border-gray-700 pb-1">
              Purchase Return Summary
            </h3>
            <p>
              <span className="font-semibold text-gray-900 dark:text-gray-200">
                Date:
              </span>{" "}
              {new Date(data?.CreatedDate).toLocaleDateString()}
            </p>
            <p>
              <span className="font-semibold text-gray-900 dark:text-gray-200">
                Reference:
              </span>{" "}
              {data?.referenceNo || "-"}
            </p>
            <p>
              <span className="font-semibold text-gray-900 dark:text-gray-200">
                Created By:
              </span>{" "}
              {data?.userDetails?.fullName || "Unknown"}
            </p>
          </div>
        </div>

        {/* Purchase Products Table */}
        <div className="mb-8">
          <h4 className="text-lg mb-2 text-green-600 dark:text-green-400 font-semibold">
            Purchase Products
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 dark:border-gray-700 text-sm">
              <thead className="bg-green-100 dark:bg-green-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-right">Quantity</th>
                  <th className="px-3 py-2 text-right">Price</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {data?.purchaseProducts?.map((p, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2 text-right">{p.qty}</td>
                    <td className="px-3 py-2 text-right">
                      {p.unitCost?.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {p.total?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 dark:bg-gray-800 font-semibold">
                <tr>
                  <td colSpan="4" className="px-3 py-2 text-right">
                    Purchase Total
                  </td>
                  <td className="px-3 py-2 text-right">
                    {data?.purchaseDetails?.total?.toFixed(2) || "0.00"}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Return Products Table */}
        <div className="mb-8">
          <h4 className="font-semibold mb-2 text-lg text-red-600 dark:text-red-400">
            Purchase Return Products
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 dark:border-gray-700 text-sm">
              <thead className="bg-green-100 dark:bg-green-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-right">Qty Returned</th>
                  <th className="px-3 py-2 text-right">Price</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {data?.purchaseReturnProducts?.map((p, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2 text-right">{p.qty}</td>
                    <td className="px-3 py-2 text-right">
                      {p.amount?.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {p.total?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 dark:bg-gray-800 font-semibold">
                <tr>
                  <td colSpan="4" className="px-3 py-2 text-right">
                    Return Total
                  </td>
                  <td className="px-3 py-2 text-right">
                    {data?.total?.toFixed(2) || "0.00"}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Print Button */}
        <div className="text-center mt-6 print:hidden">
          <button className="global_button" onClick={handlePrint}>
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReturnDetails;
