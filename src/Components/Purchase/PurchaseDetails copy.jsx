import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ErrorToast } from "../../Helper/FormHelper";
import { getBusinessDetails, getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { printElement } from "../../Helper/Printer";
import api from "../../Helper/axios_resonse_interceptor";
// import Barcode from "react-barcode";

const PurchaseDetails = () => {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const businessDetails = getBusinessDetails();
  const printRef = useRef(null);

  const fetchDetails = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/PurchasesDetailsByID/${id}`);
      if (res.data.status === "Success") setDetails(res.data.data);
      else ErrorToast(res.data.message);
    } catch (error) {
      ErrorToast(error.message || "Something went wrong");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const handlePrint = () => printElement(printRef, "Purchase Details");

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getRemainingWarranty = (purchaseDate, warrantyDays) => {
    if (!purchaseDate || !warrantyDays) return 0;
    const start = new Date(purchaseDate);
    const today = new Date();
    const diffTime = today - start; // milliseconds
    const passedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const remaining = warrantyDays - passedDays;
    return remaining > 0 ? remaining : 0;
  };

  const totalQty = details?.Products?.reduce(
    (sum, p) => sum + Number(p.quantity || 0),
    0
  );
  const totalAmount = details?.Products?.reduce(
    (sum, p) => sum + Number(p.total || 0),
    0
  );

  const primaryColor = "green-600"; // Change this to your theme primary color

  return (
    <div className="global_container dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div
        ref={printRef}
        className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 print:w-[210mm] print:min-h-[297mm]"
      >
        {/* Supplier Info + Shop + Purchase Invoice*/}
        <div className="flex justify-between items-start gap-6 mb-6 border p-4 rounded border-gray-200 dark:border-gray-700">
          {/* Supplier Info */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-700 dark:text-gray-100 mb-2 border-b border-gray-200 dark:border-gray-600 pb-1">
              Supplier Details
            </h3>
            <p>
              <span className="font-semibold">Name:</span>{" "}
              {details?.Supplier?.name}
            </p>
            <p>
              <span className="font-semibold">Mobile:</span>{" "}
              {details?.Supplier?.mobile}
            </p>
            <p>
              <span className="font-semibold">Address:</span>{" "}
              {details?.Supplier?.address}
            </p>
          </div>
          {/* Logo and Shop Name */}
          <div className="flex items-center gap-3">
            <div
              className={` w-12 h-12 rounded-full flex items-center justify-center  text-white font-bold`}
            >
              <img
                className="rounded-full"
                src={businessDetails?.logo}
                alt="logo"
              />
            </div>
            <div>
              <h1 className="font-bold text-xl">
                {businessDetails?.businessName || "Your Business"}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {businessDetails?.address}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {businessDetails?.contactNumber}
              </p>
            </div>
          </div>
          {/* Invoice */}
          <div className="text-right">
            <h2 className={`font-bold text-2xl text-${primaryColor}`}>
              Purchase Invoice
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Date: {formatDate(details?.PurchaseSummary?.Date)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Ref: {details?.PurchaseSummary?.Reference}
            </p>
            
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span>Created By:</span> {details?.Users?.name || "N/A"}
            </p>
            {/* Barcode */}

            <div className="flex justify-end">
              <div className="inline-block leading-none">
                <Barcode
                  value={details?.PurchaseSummary?.Reference || ""}
                  height={20}
                  width={1.35}
                  displayValue={false}
                  margin={0}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto mb-6">
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">#</th>
                <th className="global_th">Product</th>
                {details?.Products.some((p) => p.warranty > 0) && (
                  <>
                    {" "}
                    <th className="global_th">Warranty</th>{" "}
                    <th className="global_th">Remaining</th>
                  </>
                )}
                <th className="global_th">Qty</th>
                <th className="global_th">Unit Price</th>
                <th className="global_th">Total</th>
              </tr>
            </thead>
            <tbody>
              {details?.Products?.map((p, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="global_td">{i + 1}</td>
                  {/* Name and serials if exist */}
                  <td className="global_td">
                    <div className="felx flex-col gap-1">
                      <h1>{p.name}</h1>
                      {p.serialNos && (
                        <h1 className="flex gap-2">
                          {p.serialNos.map((s) => {
                            return (
                              <span className="border border-gray-200 rounded-md px-2">
                                {s}
                              </span>
                            );
                          })}
                        </h1>
                      )}
                    </div>
                  </td>
                  {p.warranty > 0 && (
                    <td className="global_td">{p.warranty}</td>
                  )}
                  {p.warranty > 0 && (
                    <td className="global_td">
                      {getRemainingWarranty(
                        details.PurchaseSummary?.Date,
                        p.warranty
                      )}{" "}
                      days
                    </td>
                  )}
                  <td className="global_td">{p.quantity}</td>
                  <td className="global_td">{p.unitCost}</td>
                  <td className="global_td">{p.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="global_tfoot">
              <tr className="global-tr">
                <td colSpan="2" className="font-bold px-2 text-left">
                  Total
                </td>
                {details?.Products.some((p) => p.warranty > 0) && (
                  <>
                    {" "}
                    <td></td> <td></td>{" "}
                  </>
                )}
                <td className="global_td">{totalQty}</td>
                <td></td>
                <td className="global_td">{totalAmount}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payment Summary */}
        <div className="flex justify-end mb-6">
          <div className="border border-gray-200 dark:border-gray-600 rounded p-4 w-full md:w-80 bg-gray-50 dark:bg-gray-700">
            <h4 className="font-semibold mb-2 border-b border-gray-200 dark:border-gray-600 pb-1 text-gray-700 dark:text-gray-100">
              Payment Summary
            </h4>
            <div className="flex justify-between">
              <span>Subtotal:</span>{" "}
              <span>{details?.PurchaseSummary?.total?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid:</span>{" "}
              <span className="text-green-600 dark:text-green-400">
                {details?.PurchaseSummary?.paid?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-red-600 dark:text-red-400 mt-1">
              <span>Due:</span>{" "}
              <span>{details?.PurchaseSummary?.dueAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-600 pt-2">
          <h1 className="">
            Generated on {formatDate(new Date())} | Thank you for your business
          </h1>
          <hr className="mt-1" />
          <h1> bseba.com</h1>
        </div>
      </div>

      {/* Print Button */}
      <div className="flex justify-end mt-4 print:hidden">
        <button onClick={handlePrint} className="global_button">
          Print Receipt
        </button>
      </div>
    </div>
  );
};

export default PurchaseDetails;
