import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { printElement } from "../../Helper/Printer";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import { numberToWords } from "../../Helper/UI/NumberToWord";
import { formatCurrency } from "../../Helper/formatCurrency";

const QuotationDetails = () => {
  const { setGlobalLoader } = loadingStore();
  const printRef = useRef();
  const { id, type } = useParams();
  const [quotationDetails, setQuotationDetails] = useState(null);
  const [error, setError] = useState(null);
  const [showHead, setShowHead] = useState(true);

  console.log(type);
  useEffect(() => {
    const fetchQuotationDetails = async () => {
      setGlobalLoader(true);
      try {
        const response = await api.get(`/QuotationDetailsByID/${id}`);
        setQuotationDetails(response.data.data);
      } catch (err) {
        setError("Failed to load quotation details. Please try again later.");
      } finally {
        setGlobalLoader(false);
      }
    };
    fetchQuotationDetails();
  }, [id]);

  if (error) {
    return <div className="p-6 text-red-600 dark:text-red-400">{error}</div>;
  }

  if (!quotationDetails) {
    return (
      <div className="p-6 text-gray-500 dark:text-gray-300">Loading...</div>
    );
  }

  const businessDetails =
    JSON.parse(localStorage.getItem("businessDetails")) || {};
  const { businessName, contactNumber, address, logo, invoiceFooter } =
    businessDetails;

  const handlePrint = () => {
    printElement(printRef);
  };

  const hasWarranty = quotationDetails?.Products?.some((p) => p.warranty);

  return (
    <div
      ref={printRef}
      className="
       px-5 min-w-3xl overflow-x-auto max-w-4xl mx-auto
      "
    >
      {/* Header Toggle */}
      <div className="mb-3 print:hidden">
        <label className="flex items-center gap-2 text-sm">
          <input
            className="accent-blue-500 "
            type="checkbox"
            checked={showHead}
            onChange={() => setShowHead(!showHead)}
          />
          <span className="dark:text-gray-300">With Head</span>
        </label>
      </div>

      {/* Quotation Summary */}

      {showHead && logo && (
        <div className="flex justify-center items-center">
          <img className="w-16 h-16" src={logo} alt="" />
        </div>
      )}

      <div className="flex justify-between items-end mb-2">
        <div>
          {showHead && (
            <div>
              <h2 className="font-bold">{businessName || "Beseba.com"}</h2>
              {contactNumber && <p className="text-sm">{contactNumber}</p>}
              {address && <p className="dark:text-gray-300">{address}</p>}
            </div>
          )}

          {quotationDetails.QuotationSummary.BillTo && (
            <>
              <p className="font-semibold text-green-600 dark:text-green-400">
                {type === "quotation" ? "Quotation To" : "Invoice To"}
              </p>
              <p className="dark:text-gray-300">
                {quotationDetails?.QuotationSummary?.BillTo}
              </p>
            </>
          )}
        </div>
        <div>
          <div className="bg-green-100 rounded-tl-4xl px-4 py-2 mt-1.5">
            <h2 className="text-green-700 text-xl font-semibold w-full ">
              {type === "quotation" ? "Quotation" : "Invoice"}
            </h2>
          </div>
          <p className="text-sm">
            No: {quotationDetails?.QuotationSummary?.Reference}
          </p>
          <p className="text-sm">
            Date:{" "}
            {new Date(
              quotationDetails.QuotationSummary.Date,
            ).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
          <p className="text-sm">Created By: {quotationDetails.Users?.name}</p>
        </div>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 dark:border-gray-700 text-sm">
          <thead className="bg-green-50 dark:bg-gray-800 text-green-700 dark:text-green-300">
            <tr>
              <th className="border dark:border-gray-700 px-2 py-1 text-center">
                No.
              </th>
              <th className="border dark:border-gray-700 px-2 py-1 text-left">
                Product Name
              </th>
              <th className="border dark:border-gray-700 px-2 py-1 text-center">
                Qty
              </th>

              {hasWarranty && (
                <th className="border dark:border-gray-700 px-2 py-1 text-center">
                  Warranty
                </th>
              )}

              <th className="border dark:border-gray-700 px-2 py-1 text-center">
                Price
              </th>
              <th className="border dark:border-gray-700 px-2 py-1 text-right">
                Total
              </th>
            </tr>
          </thead>

          <tbody>
            {quotationDetails.Products.map((p, i) => (
              <tr key={i} className="dark:text-gray-300">
                <td className="border dark:border-gray-700 px-2 py-1 text-center">
                  {i + 1}
                </td>
                <td className="border dark:border-gray-700 px-2 py-1">
                  {p.name}
                </td>
                <td className="border dark:border-gray-700 px-2 py-1 text-center">
                  {p.quantity} {p.unit}
                </td>
                {hasWarranty && (
                  <td className="border dark:border-gray-700 px-2 py-1 text-center">
                    {p.warranty || ""}
                  </td>
                )}

                <td className="border dark:border-gray-700 px-2 py-1 text-center">
                  {formatCurrency(p.price)}
                </td>
                <td className="border dark:border-gray-700 px-2 py-1 text-right">
                  {formatCurrency(p.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex mt-2 gap-2 rounded-lg print:flex print:flex-row">
        {/* LEFT */}
        <div className="flex flex-col gap-1 w-[65%] print:w-[65%] mb-20">
          <div>
            <p className="font-semibold dark:text-gray-300">
              Amount in Words:{" "}
              <span className="text-sm">
                {" "}
                {numberToWords(quotationDetails.QuotationSummary.grandTotal)}
              </span>
            </p>

            {quotationDetails.QuotationSummary.note && (
              <p className="dark:text-gray-400">
                <span className="font-semibold">Note:</span>{" "}
                {quotationDetails.QuotationSummary.note}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-[35%] print:w-[35%]">
          <div>
            <table className="w-full border dark:border-gray-700 text-sm mt-3 sm:mt-0">
              <tbody>
                <tr>
                  <th className="border dark:border-gray-700 px-2 py-1 text-left">
                    Total:
                  </th>
                  <td className="border dark:border-gray-700 px-2 py-1 text-right">
                    {quotationDetails.QuotationSummary.total.toLocaleString()}{" "}
                    Tk
                  </td>
                </tr>

                {quotationDetails.QuotationSummary.discount ? (
                  <tr>
                    <th className="border dark:border-gray-700 px-2 py-1 text-left">
                      Discount:
                    </th>
                    <td className="border dark:border-gray-700 px-2 py-1 text-right">
                      {formatCurrency(quotationDetails?.QuotationSummary?.discount)}
                      Tk
                    </td>
                  </tr>
                ) : (
                  ""
                )}

                {quotationDetails.QuotationSummary.discount ? (
                  <tr>
                    <th className="border dark:border-gray-700 px-2 py-1 text-left">
                      Grand Total:
                    </th>
                    <td className="border dark:border-gray-700 px-2 py-1 text-right">
                      {formatCurrency(quotationDetails.QuotationSummary.grandTotal)}
                      Tk
                    </td>
                  </tr>
                ) : (
                  ""
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 flex gap-20 items-center">
        <div>
          <p className="text-xs border-t-2 border-gray-300">
            Customer Signature
          </p>
        </div>
        <div>
          <p className="text-xs border-t-2 border-gray-300">
            Authorized Signature
          </p>
        </div>
      </div>

      <div>
        <p className=" text-xs text-center border-t border-gray-500 mt-3">
          <span className="text-gray-500">Software Developed by</span>{" "}
          <span className="font-semibold">Bseba.com</span>
        </p>
      </div>

      {/* Print Button */}
      <div className="text-center">
        <button
          onClick={handlePrint}
          id="no-print"
          className="global_button mt-5 "
        >
          Print
        </button>
      </div>
    </div>
  );
};

export default QuotationDetails;
