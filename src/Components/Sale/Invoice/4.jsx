import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
// import { printElement } from "../../../Helper/SessionHelper";
import loadingStore from "../../../Zustand/LoadingStore";
import { getBusinessDetails, getName } from "../../../Helper/SessionHelper";
import { printElement } from "../../../Helper/Printer";
import { numberToWords } from "../../../Helper/UI/NumberToWord";
import api from "../../../Helper/axios_resonse_interceptor";
import Barcode from "react-barcode";
import { formatCurrency } from "../../../Helper/formatCurrency";

const Invoice4 = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const { setGlobalLoader } = loadingStore();
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
    } catch (err) {
      console.error("Error fetching invoice:", err);
    } finally {
      setGlobalLoader(false);
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      printElement(printRef, `Invoice-${id}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const customer = data?.Customer || {};
  const user = data?.Users || {};
  const summary = data?.SaleSummary || {};

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

  const products = groupedProducts || [];

  return (
    <div className="global_container">
      {/* show toggle */}
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
      <div
        style={{
          width: "210mm",
          minHeight: "10mm",
          margin: "0 auto",
          // padding: "10mm",
          background: "white",
          boxSizing: "border-box",
        }}
      >
        <div
          ref={printRef}
          className="flex flex-col p-2 dark:bg-gray-800 justify-between px-5 min-w-3xl overflow-x-auto"
        >
          <div>
            {/* Header */}
            {showHead && (
              <>
                <div className="flex justify-between items-start gap-8">
                  {/* Left: Logo */}
                  <div>
                    <div className="flex items-center gap-2">
                      {/* business logo */}
                      {businessDetails?.logo ? (
                        <div className="w-[120px] overflow-hidden flex items-center justify-center">
                          <img
                            src={businessDetails?.logo}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        ""
                      )}

                      <div>
                        <span className="text-3xl font-bold text-red-600">
                          {businessDetails?.businessName || ""}
                        </span>
                        <p>{businessDetails?.tagline || ""}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Business Info */}
                  <div className="text-right text-sm">
                    {businessDetails?.address && (
                      <p>{businessDetails?.address}</p>
                    )}
                    {businessDetails?.contactNumber && (
                      <p>{businessDetails?.contactNumber}</p>
                    )}
                    <p className="text-sm">{businessDetails?.email || ""}</p>
                    <p className="text-sm">{businessDetails?.website || ""}</p>
                    <p className="text-sm">{businessDetails?.tin || ""}</p>
                  </div>
                </div>

                <hr className="my-2 border-gray-300" />
              </>
            )}

            {/* Customer Details & Invoice Info */}
            <div className="flex justify-between items-end text-sm">
              {/* Bill To */}
              <div className="w-1/2">
                {data?.SaleSummary?.BillTo || data?.Customer?.name ? (
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

              {/* Invoice Details */}
              <div className="text-right w-1/2 flex flex-col justify-end items-end">
                <p>
                  <span className="font-bold">Invoice #</span>{" "}
                  {summary.Reference || "N/A"}
                </p>
                <p>
                  <span className="font-bold">Date:</span>{" "}
                  {formatDate(summary.Date)}
                </p>
                <p className="font-bold">
                  {data?.Users?.fullName
                    ? `CreatedBy: ${data?.Users?.fullName}`
                    : ""}
                </p>
                {console.log(summary)}
                <div>
                  <Barcode
                    value={summary?.Reference || "000000"}
                    width={1.4}
                    height={15}
                    fontSize={12}
                    displayValue={false}
                    margin={0}
                  />
                </div>
              </div>
            </div>

            {/* Item Table */}
            <div className="mt-2 border border-gray-400">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-400">
                    <th className="py-1 px-2 text-left w-10 border-r border-gray-400">
                      SN
                    </th>
                    <th className="py-1 px-2 text-left border-r border-gray-400">
                      Product Name
                    </th>
                    <th className="py-1 px-2 text-center w-20 border-r border-gray-400">
                      Qty
                    </th>
                    <th className="py-1 px-2 text-right w-24 border-r border-gray-400">
                      Price
                    </th>
                    <th className="py-1 px-2 text-right w-24">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 last:border-none"
                    >
                      <td className="py-1 px-2 border-r border-gray-400">
                        {index + 1}
                      </td>
                      <td className="py-1 px-2 border-r border-gray-400">
                        <span className="flex flex-col">
                          <span>{item.name}</span>
                          <span className="text-xs">
                            {item?.warranty
                              ? `Warranty days (${item?.warranty})`
                              : ""}{" "}
                            {item?.serialNos?.join(", ")}
                          </span>
                        </span>
                      </td>
                      <td className="py-1 px-2 text-center border-r border-gray-400">
                        {item.quantity} {item?.unit}
                      </td>
                      <td className="py-1 px-2 text-right border-r border-gray-400">
                        {formatCurrency(item.price)} Tk
                      </td>
                      <td className="py-1 px-2 text-right">
                        {formatCurrency(item.total)} Tk
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <td colSpan="2" className="py-2 px-2 font-bold">
                      Total
                    </td>
                    <td className="py-2 px-2 text-center font-bold">
                      {total?.totalQty}
                    </td>
                    <td className="py-2 px-2 "></td>
                    <td className="py-2 px-2 text-right">
                      {formatCurrency(total?.totalPrice)}Tk
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="flex justify-between gap-6 mt-1.5 mb-10">
              <div>
                <p>
                  <span className="font-bold">In Words:</span>{" "}
                  {numberToWords(summary?.grandTotal)}
                </p>

                <p className="text-sm mt-1 whitespace-normal">
                  {data?.SaleSummary?.note &&
                    `Notes:${data?.SaleSummary?.note}`}
                </p>
              </div>

              <div className="border border-gray-400 h-fit min-w-68">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-1 px-2">Total</td>
                      <td className="py-1 px-2 text-right">
                        {formatCurrency(summary.total || 0)} Tk
                      </td>
                    </tr>

                    {/* discount */}
                    {data?.SaleSummary.discount > 0 && (
                      <tr className="border-b border-gray-200">
                        <td className="py-1 px-2">Discount</td>
                        <td className="py-1 px-2 text-right">
                          {formatCurrency(data?.SaleSummary?.discount || 0)} Tk
                        </td>
                      </tr>
                    )}

                    {/* author amount */}
                    {data?.SaleSummary?.outher && (
                      <tr className="border-b border-gray-200">
                        <td className="py-1 px-2">
                          {data?.SaleSummary?.outher}
                        </td>
                        <td className="py-1 px-2 text-right">
                          {formatCurrency(data?.SaleSummary?.outherAmount || 0)}{" "}
                          Tk
                        </td>
                      </tr>
                    )}

                    {/* grand total */}
                    {data?.SaleSummary?.discount > 0 ||
                      data?.SaleSummary?.outherAmount > 0 ? (
                      <tr className="border-b border-gray-200">
                        <td className="py-1 px-2">Grand Total</td>
                        <td className="py-1 px-2 text-right">
                          {formatCurrency(data?.SaleSummary?.grandTotal || 0)}{" "}
                          Tk
                        </td>
                      </tr>
                    ) : (
                      ""
                    )}

                    {/* paid */}
                    {data?.SaleSummary?.paid ? (
                      <tr className="border-b border-gray-200">
                        <td className="py-1 px-2">Paid</td>
                        <td className="py-1 px-2 text-right">
                          {formatCurrency(data?.SaleSummary?.paid || 0)} Tk
                        </td>
                      </tr>
                    ) : (
                      ""
                    )}

                    {/* previes balance */}
                    {data?.SaleSummary?.PreviousBalance ? (
                      <tr className="border-b border-gray-200">
                        <td className="py-1 px-2">
                          {data?.SaleSummary?.PreviousBalance < 0
                            ? "Previous  Due"
                            : "Advanced"}
                        </td>
                        <td className="py-1 px-2 text-right">
                          {formatCurrency(
                            Math.abs(data?.SaleSummary?.PreviousBalance || 0),
                          )}{" "}
                          Tk
                        </td>
                      </tr>
                    ) : (
                      ""
                    )}

                    {data?.SaleSummary?.CurrentBalance ? (
                      <tr className="border-b border-gray-200">
                        <td className="py-1 px-2">
                          {data.SaleSummary.CurrentBalance < 0
                            ? "Total Due"
                            : "Balance"}
                        </td>
                        <td className="py-1 px-2 text-right">
                          {formatCurrency(
                            Math.abs(data.SaleSummary.CurrentBalance || 0),
                          )}{" "}
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

            <div className="flex gap-12 justify-between mt-15">
              <h1 className="border-t">Customer Signature</h1>
              <h1 className="border-t">Authorization Signature</h1>
            </div>

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

          {/* PRINT BUTTON */}
          <div id="no-print" className="flex items-center justify-center">
            <button onClick={handlePrint} className="global_button">
              Print
            </button>
          </div>
        </div>
      </div>
      {/* Printable Area */}
    </div>
  );
};

export default Invoice4;
