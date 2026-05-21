import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import loadingStore from "../../../Zustand/LoadingStore";
import { getBusinessDetails } from "../../../Helper/SessionHelper";
import { printElement } from "../../../Helper/Printer";
import api from "../../../Helper/axios_resonse_interceptor";
import formatDateToLocal from "../../../Helper/formatDate";
import { formatCurrency } from "../../../Helper/formatCurrency";
import Barcode from "react-barcode";
import { numberToWords } from "../../../Helper/UI/NumberToWord";

const Invoice6 = () => {
  const { setGlobalLoader } = loadingStore();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [showHead, setShowHead] = useState(true);
  const printRef = useRef();
  const businessDetails = getBusinessDetails();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/SalesDetailsByID/${id}`);
      if (res.data?.status === "Success") {
        setData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching sale details:", error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const handlePrint = () => {
    printElement(printRef, `Invoice-${id}`);
  };

  const groupedProducts = useMemo(() => {
    if (!data?.Products) return [];
    return Object.values(
      data.Products.reduce((acc, p) => {
        const key = `${p.id}-${p.price}-${p.warranty}`;
        if (!acc[key]) {
          acc[key] = {
            ...p,
            quantity: Number(p.quantity),
            total: Number(p.total),
            serialNos: [...p.serialNos],
          };
        } else {
          acc[key].quantity += Number(p.quantity);
          acc[key].total += Number(p.total);
          acc[key].serialNos.push(...p.serialNos);
        }
        return acc;
      }, {}),
    );
  }, [data]);

  const total = (groupedProducts ?? []).reduce(
    (acc, item) => ({
      totalQty: acc.totalQty + (Number(item?.quantity) || 0),
      totalPrice:
        acc.totalPrice +
        (Number(item?.price) || 0) * (Number(item?.quantity) || 0),
    }),
    { totalQty: 0, totalPrice: 0 },
  );

  return (
    <div className="global_container dark:bg-gray-900 dark:text-gray-100">
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
          background: "white",
          boxSizing: "border-box",
        }}
        className="dark:bg-gray-800 dark:text-gray-100"
      >
        <div
          ref={printRef}
          className="flex flex-col justify-between px-5 min-w-3xl overflow-x-auto"
        >
          {/* content  */}
          <div>
            {/* Header */}

            {showHead ? (
              <div className="border-b-2 border-green-400">
                <div className="flex flex-col items-center justify-center">
                  {businessDetails?.logo ? (
                    <div>
                      <img
                        className="w-16 h-16"
                        src={businessDetails?.logo}
                        alt=""
                      />
                    </div>
                  ) : (
                    ""
                  )}

                  <div>
                    <p className="text-2xl font-semibold text-green-500">
                      {businessDetails?.businessName || ""}
                    </p>
                    <p className="text-sm text-center">
                      {businessDetails?.tagline}
                    </p>
                    <p className="text-sm text-center">
                      {businessDetails?.tin}
                    </p>
                    <p className="text-sm">
                      {" "}
                      {businessDetails?.address || ""} -{" "}
                      {businessDetails?.contactNumber}
                    </p>
                    <p className="text-sm text-center">
                      {businessDetails?.email || ""}
                    </p>
                    <p className="text-sm text-center">
                      {businessDetails?.website || ""}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {/* Bill To / Invoice Info */}
            <div className="flex justify-between my-1 text-sm">
              <div className="w-1/2">
                {data?.SaleSummary?.BillTo || data?.Customer?.name ||
                data?.Customer?.address ||
                data?.Customer?.mobile ? (
                  <div>
                    
                    { data?.SaleSummary?.BillTo || data?.Customer?.name ? (
                      <p>Name: {data?.SaleSummary?.BillTo || data?.Customer?.name}</p>
                    ) : (
                      ""
                    )}
                    {data?.Customer?.address ? (
                      <p>Address: {data?.Customer?.address}</p>
                    ) : (
                      ""
                    )}
                    {data?.Customer?.mobile ? (
                      <p>Mobile: {data?.Customer?.mobile}</p>
                    ) : (
                      ""
                    )}
                  </div>
                ) : (
                  ""
                )}
              </div>

              <div className="flex justify-end items-end w-1/2">
                <div className="font-semibold text-sm">
                  <p>Invoice No: {data?.SaleSummary?.Reference}</p>
                  <Barcode
                    value={data?.SaleSummary.Reference || "000000"}
                    width={1.4}
                    height={24}
                    fontSize={14}
                    displayValue={false}
                    margin={0}
                  />
                  <p>Date: {formatDateToLocal(data?.SaleSummary?.Date)}</p>
                  <p>Created By : {data?.Users.fullName}</p>
                </div>
              </div>
            </div>

            {/* table */}
            <table className="w-full border-collapse min-h-[400px] mb-2 text-sm">
              <thead>
                <tr className="bg-sky-100 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 py-1 px-2 text-left">
                    SL
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 py-1 px-2 text-left">
                    Product
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 py-1 px-2 text-center">
                    Qty
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 py-1 px-2 text-center">
                    Warranty
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 py-1 px-2 text-right">
                    Price
                  </th>
                </tr>
              </thead>

              {/* tbody fix to keep content top */}
              <tbody className="[&>tr>td]:align-top">
                {groupedProducts?.length > 0 ? (
                  groupedProducts.map((p, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {/* SL */}
                      <td className="border border-gray-300 dark:border-gray-600 py-1 px-2 text-center">
                        {i + 1}
                      </td>

                      {/* Product */}
                      <td className="border border-gray-300 dark:border-gray-600 py-1 px-2">
                        <span className="flex flex-col">
                          <span>{p?.name}</span>
                          <span className="text-xs">
                            {p?.serialNos?.join(", ")}
                          </span>
                        </span>
                      </td>

                      {/* Qty */}
                      <td className="border border-gray-300 dark:border-gray-600 py-1 px-2 text-center">
                        {p?.quantity} {p?.unit}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 py-1 px-2 text-center">
                        {p?.warranty} Days
                      </td>

                      {/* Price */}
                      <td className="border border-gray-300 dark:border-gray-600 py-1 px-2 text-right">
                        ৳{p?.price?.toFixed(2) || ""}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center border border-gray-300 dark:border-gray-600 py-1 px-2"
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
                  <td className="border border-gray-300 text-center dark:border-gray-600 p-2">
                    {total?.totalQty}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2"></td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-right text-green-700 dark:text-green-400">
                    {/* ৳{grandTotal.toFixed(2)} */}
                    {formatCurrency(data?.SaleSummary?.total?.toFixed(2))}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Notes & Footer */}

            <div className="flex justify-between gap-3 items-start text-sm mb-10">
              {/* LEFT - NOTES */}
              <div className="w-2/3">
                <p className="text-green-500">
                  {numberToWords(data?.SaleSummary?.grandTotal)}
                </p>

                <p className="text-sm mt-1 break-words whitespace-normal">
                  {data?.SaleSummary?.note
                    ? `NOTES: ${data?.SaleSummary?.note}`
                    : ""}
                </p>
              </div>

              {/* RIGHT - SUMMARY ROW ITEMS */}
              <div className="w-1/3">
                <div className="flex justify-between">
                  <p className="font-semibold">Total</p>
                  <p className="text-green-700 dark:text-green-400 font-bold text-base">
                    {formatCurrency(data?.SaleSummary?.total)} Tk
                  </p>
                </div>

                {/* Discount */}
                {data?.SaleSummary?.discount > 0 ? (
                  <p className="flex justify-between">
                    <span className="font-semibold">Discount:</span>
                    <span className="text-green-700 dark:text-green-400 font-bold text-base">
                      {formatCurrency(data?.SaleSummary?.discount || 0)} Tk
                    </span>
                  </p>
                ) : (
                  ""
                )}

                {/* Other */}
                {data?.SaleSummary?.outher ? (
                  <p className="flex justify-between">
                    <span className="font-semibold">
                      {data?.SaleSummary?.outher}:
                    </span>
                    <span className="text-green-700 dark:text-green-400 font-bold text-base">
                      {formatCurrency(data?.SaleSummary?.outherAmount)} Tk
                    </span>
                  </p>
                ) : (
                  ""
                )}

                {/* Grand Total */}
                {data?.SaleSummary?.discount > 0 ||
                data?.SaleSummary?.outherAmount > 0 ? (
                  <p className="flex justify-between">
                    <span className="font-semibold">Grand Total:</span>
                    <span className="text-green-700 dark:text-green-400 font-bold text-base">
                      {formatCurrency(data?.SaleSummary?.grandTotal)} Tk
                    </span>
                  </p>
                ) : (
                  ""
                )}

                {/* Paid */}
                {data?.SaleSummary?.paid ? (
                  <p className="flex justify-between">
                    <span className="font-semibold">Paid:</span>
                    <span className="text-green-700 dark:text-green-400 font-bold text-base">
                      {formatCurrency(data?.SaleSummary?.paid)} Tk
                    </span>
                  </p>
                ) : (
                  ""
                )}

                {console.log(data?.SaleSummary?.paid)}
                {/* Previous Balance */}
                {data?.SaleSummary?.PreviousBalance ? (
                  <p className="flex justify-between">
                    <span className="font-semibold">
                      {data?.SaleSummary?.PreviousBalance < 0
                        ? "Previous Due:"
                        : "Advanced:"}
                    </span>
                    <span className="text-green-700 dark:text-green-400 font-bold text-base">
                      {formatCurrency(
                        Math.abs(data?.SaleSummary?.PreviousBalance),
                      )}{" "}
                      Tk
                    </span>
                  </p>
                ) : (
                  ""
                )}

                {/* Current Balance */}
                {data?.SaleSummary?.CurrentBalance ? (
                  <p className="flex justify-between">
                    <span className="font-semibold">
                      {data?.SaleSummary?.CurrentBalance < 0
                        ? "Total Due:"
                        : "Balance:"}
                    </span>
                    <span className="text-green-700 dark:text-green-400 font-bold text-base">
                      {formatCurrency(
                        Math.abs(data?.SaleSummary?.CurrentBalance || 0),
                      )}{" "}
                      Tk
                    </span>
                  </p>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex gap-20">
              <h1 className="border-t">Customer Signature</h1>
              <h1 className="border-t">Authorization Signature</h1>
            </div>

            <div>
              {/* business Footer */}
              {getBusinessDetails()?.invoiceFooter && (
                <p className="text-center text-sm">
                  {getBusinessDetails()?.invoiceFooter}
                </p>
              )}

              <p className="text-center text-sm border-t border-gray-400">
                <span className="text-gray-500">Software Developed by</span>{" "}
                <span className="font-semibold">Bseba.com</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="flex items-center justify-center">
        <button
          onClick={handlePrint}
          id="no-print"
          className="global_button mt-5"
        >
          Print Invoice
        </button>
      </div>
    </div>
  );
};

export default Invoice6;
