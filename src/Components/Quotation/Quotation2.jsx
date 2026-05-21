import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { printElement } from "../../Helper/Printer";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import { numberToWords } from "../../Helper/UI/NumberToWord";
import { getBusinessDetails } from "../../Helper/SessionHelper";
import { formatCurrency } from "../../Helper/formatCurrency";
import formatDateToLocal from "../../Helper/formatDate";

const Quotation2 = () => {
  const { setGlobalLoader } = loadingStore();
  const printRef = useRef();
  const { id } = useParams();
  const [quotationDetails, setQuotationDetails] = useState(null);
  const [showHead, setShowHead] = useState(true);
  const businessDetails = getBusinessDetails();

  // console.log(quotationDetails)

  const fetchQuotationDetails = async () => {
    setGlobalLoader(true);
    try {
      const response = await api.get(`/QuotationDetailsByID/${id}`);
      setQuotationDetails(response.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchQuotationDetails();
  }, [id]);

  const handlePrint = () => {
    printElement(printRef);
  };

  const hasWarranty = quotationDetails?.Products?.some((p) => p.warranty);

  const total = quotationDetails?.Products?.reduce(
    (map, item) => {
      map.totalQty += item.quantity ?? 0;
      map.totalAmount += item?.total ?? 0;
      return map;
    },

    { totalQty: 0, totalAmount: 0 },
  );

  return (
    <div className="global_container">
      {/* show toggle */}
      <div className="mb-3 print:hidden w-fit">
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

      <div
        style={{
          width: "210mm",
          margin: "0 auto",
          // padding: "10mm",

          boxSizing: "border-box",
        }}
      >
        <div
          ref={printRef}
          className="flex flex-col px-4 justify-between min-w-3xl overflow-x-auto"
        >
          {/* content  */}
          <div>
            {/* Headers */}{" "}
            <div className="flex justify-between items-end rounded-lg">
              <div className="flex flex-col gap-1">
                <div className="text-lg lg:text-2xl font-semibold flex flex-col">
                  {showHead ? (
                    <div>
                      {businessDetails?.businessName ||
                      businessDetails?.logo ||
                      businessDetails?.address ||
                      businessDetails?.mobile ? (
                        <div className="flex border p-2 justify-center items-start border-gray-300 rounded-lg gap-2">
                          {businessDetails.logo ? (
                            <img
                              src={businessDetails.logo}
                              className="w-16 h-16"
                            />
                          ) : (
                            ""
                          )}
                          <div>
                            <h1 className="pt-3">
                              {businessDetails?.businessName}
                            </h1>
                            <h1 className="text-sm">
                              {businessDetails?.address}
                            </h1>
                            <h1 className="text-sm">
                              {businessDetails?.contactNumber}
                            </h1>
                          </div>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  ) : (
                    ""
                  )}
                </div>

                <div>
                  {quotationDetails?.QuotationSummary?.BillTo && (
                    <>
                      <p className="font-semibold text-lg">Quotation For</p>
                      <p>{quotationDetails?.QuotationSummary?.BillTo}</p>
                    </>
                  )}
                </div>

              </div>
              {/* right er Invoice */}

              <div className={showHead ? "" : "mt-25"}>
                <div className="bg-green-100 rounded-tl-4xl px-4 py-2">
                  <h2 className="text-green-700 text-xl font-semibold w-full ">
                    Quotation
                  </h2>
                </div>
                <p className="text-sm">
                  No: {quotationDetails?.QuotationSummary?.Reference}
                </p>
                <p className="text-sm">
                  Date:{" "}
                  {formatDateToLocal(quotationDetails?.QuotationSummary?.Date)}
                </p>
                <p className="text-sm">
                  Created By: {quotationDetails?.Users?.name}
                </p>
              </div>
            </div>
            {/* table */}
            <table className="w-full border-collapse min-h-[400px] text-sm">
              <thead>
                <tr className="bg-sky-100 dark:bg-gray-700">
                  <th className="border border-gray-300 w-fit dark:border-gray-600 p-2 text-left">
                    No
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">
                    Product
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                    Qty
                  </th>
                  {hasWarranty ? (
                    <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                      Warranty
                    </th>
                  ) : (
                    ""
                  )}

                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                    Price
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                    Total
                  </th>
                </tr>
              </thead>

              {/* tbody fix to keep content top */}
              <tbody className="[&>tr>td]:align-top">
                {quotationDetails?.Products?.length > 0 ? (
                  quotationDetails?.Products?.map((p, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 h-fit dark:hover:bg-gray-700"
                    >
                      {/* SL */}
                      <td className="border w-fit border-gray-300 dark:border-gray-600 p-2">
                        {i + 1} {console.log(p)}
                      </td>

                      {/* Product */}
                      <td className="border border-gray-300 dark:border-gray-600 p-2">
                        <span className="flex flex-col font-semibold">
                          <span>{p?.name}</span>
                          <span>{p?.serialNos?.join(", ")}</span>
                        </span>
                      </td>

                      {/* Qty */}
                      <td className="border font-semibold border-gray-300 dark:border-gray-600 p-2  text-nowrap">
                        {p?.quantity} {p?.unit}
                      </td>
                      {hasWarranty ? (
                        <td className="border font-semibold border-gray-300 dark:border-gray-600 p-2 ">
                          {p?.warranty ? `${p?.warranty} Days` : ""}
                        </td>
                      ) : (
                        ""
                      )}
                      <td className="border font-semibold border-gray-300 dark:border-gray-600 p-2">
                        {formatCurrency(p?.price)}
                      </td>
                      <td className="border font-semibold border-gray-300 dark:border-gray-600 p-2 ">
                        {formatCurrency(p?.total)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center border border-gray-300 dark:border-gray-600 p-3"
                    >
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>

              <tfoot>
                <tr className="bg-sky-50 dark:bg-gray-700 font-semibold">
                  <td
                    colSpan="2"
                    className="border border-gray-300 dark:border-gray-600 p-2"
                  >
                    Total
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 text-center p-2">
                    {total?.totalQty}
                  </td>
                  {hasWarranty ? (
                    <td className="border border-gray-300 dark:border-gray-600 text-center p-2"></td>
                  ) : (
                    ""
                  )}
                  <td className="border border-gray-300 dark:border-gray-600 text-center p-2"></td>
                  <td className="border border-gray-300 dark:border-gray-600 text-center p-2">
                    {formatCurrency(total?.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
            <div className="flex gap-2 rounded-lg print:flex print:flex-row">
              {/* LEFT */}
              <div className="flex flex-col gap-1 w-[65%] print:w-[65%] mb-20">
                <div>
                  <p className="font-semibold dark:text-gray-300">
                    Amount in Words:{" "}
                    <span className="text-sm">
                      {" "}
                      {numberToWords(
                        quotationDetails?.QuotationSummary?.grandTotal,
                      )}
                    </span>
                  </p>

                  {quotationDetails?.QuotationSummary?.note && (
                    <p className="dark:text-gray-400">
                      <span className="font-semibold">Note:</span>{" "}
                      {quotationDetails?.QuotationSummary?.note}
                    </p>
                  )}
                </div>
              </div>

              {/* RIGHT */}
              <div className="w-[35%] print:w-[35%]">
                <div className="flex justify-between items-center font-semibold">
                  <span > Total:</span>
                  <span>
                    {formatCurrency(quotationDetails?.QuotationSummary?.total)}{" "}
                    Tk
                  </span>
                </div>

                {/* discount */}
                {quotationDetails?.QuotationSummary?.discount ? (
                  <div className="flex justify-between items-center font-semibold">
                    <span >Discount:</span>
                    <span>
                      {formatCurrency(
                        quotationDetails?.QuotationSummary?.discount,
                      )}
                      Tk
                    </span>
                  </div>
                ) : (
                  ""
                )}
                {quotationDetails?.QuotationSummary?.discount ? (
                  <div className="flex justify-between items-center font-semibold">
                    <th>Grand Total:</th>
                    <td>
                      {formatCurrency(
                        quotationDetails?.QuotationSummary?.grandTotal,
                      )}
                      Tk
                    </td>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div>
              <div className="flex gap-16 items-center mb-3">
                <h1 className="border-t">Customer Signature</h1>
                <h1 className="border-t">Authorization Signature</h1>
              </div>
              <p className="text-center text-sm border-t border-gray-400">
                <span className="text-gray-500">Software Developed by</span>{" "}
                <span className="font-semibold">Bseba.com</span>
              </p>
            </div>
            {/* Print Button */}
            <div className="flex items-center justify-center mb-3">
              <button
                onClick={handlePrint}
                id="no-print"
                className="global_button mt-5"
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quotation2;
5;
