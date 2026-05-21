import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBusinessDetails, getToken } from "../../Helper/SessionHelper";
import { printElement } from "../../Helper/Printer";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";

const Challan = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const { setGlobalLoader } = loadingStore();
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, "0")}-${date.toLocaleString(
      "default",
      { month: "short" }
    )}-${date.getFullYear()}`;
  };

  const subtotal =
    data?.Products?.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const unitPrice = Number(item.price) || 0;
      return sum + qty * unitPrice;
    }, 0) || 0;

  const discountRate = Number(data?.SaleSummary?.DiscountRate) || 0;
  const taxRate = Number(data?.SaleSummary?.TaxRate) || 0;
  const discountAmount = (subtotal * discountRate) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * taxRate) / 100;
  const totalAmount = afterDiscount + taxAmount;

  const invoiceTitleStyle =
    "text-4xl font-light tracking-widest text-gray-800 dark:text-gray-200";
  const infoLabelStyle =
    "text-xs font-semibold uppercase text-gray-500 dark:text-gray-400";
  const infoDataStyle = "text-sm text-gray-800 dark:text-gray-300 mb-1";
  const itemTableHeaderStyle =
    "p-2 font-semibold text-xs text-gray-500 uppercase tracking-wider border-b border-gray-300 dark:border-gray-600";
  const itemTableCellStyle =
    "p-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700";
  const totalRowLabelStyle = "text-right font-medium text-sm pr-4";
  const totalRowValueStyle = "text-right font-medium text-sm";

  return (
    <div
      ref={printRef}
      className="flex flex-col items-center py-4 bg-gray-50 dark:bg-gray-900 min-h-screen"
    >
      <div className="print-container bg-white dark:bg-gray-800 dark:text-gray-200 shadow-xl p-10 text-sm w-[210mm] h-[297mm] ">
        <div className="flex justify-end items-center mb-10 relative">
          <div className="relative w-full">
            <div className="mb-5">
              <h1 className="text-xl font-bold">
                {businessDetails?.businessName || ""}
              </h1>
              <p>{businessDetails?.contactNumber}</p>
              <p>{businessDetails?.address}</p>
            </div>
            <hr className="bg-gray-300 dark:bg-gray-700 w-2/5 h-px absolute top-2/2 left-0 transform -translate-y-1/2" />
          </div>

          <h1 className={invoiceTitleStyle}>INVOICE</h1>
        </div>

        <div className="flex justify-between mt-12 mb-10">
          <div>
            <p className={infoLabelStyle}>ISSUED TO:</p>
            <p className={infoDataStyle}>{data?.Customer?.name || "N/A"}</p>
            <p className={infoDataStyle}>{data?.Customer?.mobile}</p>
            <p className={infoDataStyle}>{data?.Customer?.address}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-right">
            <p className={infoLabelStyle}>INVOICE NO:</p>
            <p className={infoDataStyle + " font-semibold"}>
              {data?.SaleSummary?.Reference || "0000"}
            </p>
            <p className={infoLabelStyle}>DATE:</p>
            <p className={infoDataStyle}>
              {formatDate(data?.SaleSummary?.Date)}
            </p>
            <p className={infoLabelStyle}>DUE DATE:</p>
            <p className={infoDataStyle}>
              {formatDate(
                data?.SaleSummary?.DueDate || data?.SaleSummary?.Date
              )}
            </p>
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead className="bg-white dark:bg-gray-800">
            <tr>
              <th className={itemTableHeaderStyle + " text-left w-1/2"}>
                PRODUCT NAME
              </th>
              <th className={itemTableHeaderStyle + " text-right w-1/6"}>
                UNIT PRICE
              </th>
              <th className={itemTableHeaderStyle + " text-center w-1/12"}>
                QTY
              </th>
              <th className={itemTableHeaderStyle + " text-right w-1/4"}>
                TOTAL
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.Products?.length > 0 ? (
              data.Products.map((p, i) => {
                const unitPrice = Number(p.price) || 0;
                const qty = Number(p.quantity) || 0;
                const total = unitPrice * qty;
                return (
                  <tr key={p.id || i}>
                    <td
                      className={itemTableCellStyle + " text-left font-medium"}
                    >
                      {p.name}
                    </td>
                    <td className={itemTableCellStyle + " text-right"}>
                      {unitPrice.toFixed(2)}
                    </td>
                    <td className={itemTableCellStyle + " text-center"}>
                      {qty}
                    </td>
                    <td className={itemTableCellStyle + " text-right"}>
                      {total.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center p-4 text-gray-500 dark:text-gray-400"
                >
                  No billed items found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-end mt-4">
          <div className="w-1/3">
            <div className="flex justify-between py-1">
              <span className={totalRowLabelStyle}>SUBTOTAL</span>
              <span className={totalRowValueStyle}>{subtotal.toFixed(2)}</span>
            </div>

            {discountRate > 0 && (
              <div className="flex justify-between py-1">
                <span className={totalRowLabelStyle}>
                  Discount ({discountRate}%)
                </span>
                <span className={totalRowValueStyle}>
                  -{discountAmount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between py-1 border-b border-gray-300 dark:border-gray-600 mb-2">
              <span className={totalRowLabelStyle}>Tax ({taxRate}%)</span>
              <span className={totalRowValueStyle}>{taxAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between py-2 font-bold text-lg text-gray-800 dark:text-gray-200">
              <span className="pr-4">TOTAL</span>
              <span>{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-20 flex justify-center">
          <div className="text-center">
            <p className="text-xl font-light italic text-gray-700 dark:text-gray-300 border-b border-gray-500 w-64 pb-1"></p>
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
              Authorized Signature
            </p>
          </div>
        </div>

        <div className="absolute bottom-5 left-0 right-0 text-center text-xs text-gray-500 dark:text-gray-400">
          {/* <p>
            Powered by{" "}
            <span className="text-red-600 font-semibold dark:text-red-400">
              Bseba.com
            </span>
          </p> */}
        </div>
      </div>

      <div id="no-print" className="flex gap-4">
        <button onClick={handlePrint} className="global_button mt-5">
          Print Invoice
        </button>
        <Link to={`/A5Print/${id}`} className="global_button mt-5">
          Print A5 Invoice
        </Link>
        <Link to={`/Invoice1/${id}`} className="global_button mt-5">
          Invoice1
        </Link>
        <Link to={`/DemoInvoice/${id}`} className="global_button mt-5">
          Invoice2
        </Link>
        <Link to={`/Invoice3/${id}`} className="global_button mt-5">
          Invoice3
        </Link>
        <Link to={`/Invoice4/${id}`} className="global_button mt-5">
          Invoice4
        </Link>
        <Link to={`/Invoice5/${id}`} className="global_button mt-5">
          Invoice5
        </Link>
      </div>
    </div>
  );
};

export default Challan;
