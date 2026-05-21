import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import loadingStore from "../../../Zustand/LoadingStore";
import { getBusinessDetails } from "../../../Helper/SessionHelper";
import { ErrorToast } from "../../../Helper/FormHelper";
import { numberToWords } from "../../../Helper/UI/NumberToWord";
import { printElement } from "../../../Helper/Printer";
import Barcode from "react-barcode";
import api from "../../../Helper/axios_resonse_interceptor";
import { formatCurrency } from "../../../Helper/formatCurrency";
import formatDateToLocal from "../../../Helper/formatDate";

const Invoice8 = () => {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const [showHead, setShowHead] = useState(true);

  //   const printRef = useRef(null);
  const printRef = useRef();

  const getSaleDetailsByID = async (id) => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/SalesDetailsByID/${id}`);

      if (res.data.status === "Success") {
        setDetails(res.data.data);
      } else {
        ErrorToast(res.data.message);
      }
    } catch (error) {
      ErrorToast(error.message);
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const businessDetails = getBusinessDetails();
  useEffect(() => {
    if (id) getSaleDetailsByID(id);
  }, [id]);

  const handlePrint = () => {
    printElement(printRef, "Sale details");
  };

  const groupedProducts = useMemo(() => {
    if (!details?.Products) return [];
    return Object.values(
      details.Products.reduce((acc, p) => {
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
  }, [details]);

  if (!details) return <div className="p-4">Loading...</div>;

  return (
    <div>
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

      <div className="px-5 min-w-3xl overflow-x-auto" ref={printRef}>
        <div className="flex justify-between gap-4 items-end mb-3 w-full">
          {/* LEFT: Customer Info */}
          <div className="w-1/3 flex justify-start">
            <div className="font-semibold mt-2">
              <h1 className="text-[16px]">
                { details?.SaleSummary?.BillTo || details?.Customer?.name
                  ? `Name: ${details?.SaleSummary?.BillTo || details?.Customer?.name}`
                  : ""}
              </h1>
              <p className="text-[13px]">
                {details?.Customer?.mobile
                  ? `Mobile: ${details.Customer.mobile}`
                  : ""}
              </p>
              <p className="text-[13px]">
                {details?.Customer?.address
                  ? `Address: ${details.Customer.address}`
                  : ""}
              </p>
            </div>
          </div>

          {/* CENTER: Business Info */}

          {showHead ? (
            <div className="w-1/3 flex flex-col justify-center items-center text-center">
              <div className="h-[70px] flex items-center justify-center">
                {businessDetails?.logo && (
                  <img
                    src={businessDetails.logo}
                    height={70}
                    width={70}
                    alt="logo"
                    className="object-contain"
                  />
                )}
              </div>

              <h1 className="font-semibold  text-center text-lg text-nowrap">
                {businessDetails?.businessName || ""}
              </h1>
              <p className="text-sm text-center">
                {businessDetails?.tagline || ""}
              </p>

              <p className="text-sm text-center">
                {businessDetails?.tin || ""}
              </p>
              <p className="text-sm font-semibold text-center">
                {businessDetails?.address || ""}
              </p>
              <p className="text-sm text-center">
                {businessDetails?.contactNumber || ""}
              </p>
              <p className="text-sm text-center">
                {businessDetails?.email || ""}
              </p>
              <p className="text-sm text-center">
                {businessDetails?.website || ""}
              </p>
            </div>
          ) : (
            ""
          )}

          {/* RIGHT: Invoice Info */}
          <div className="w-1/3 flex flex-col text-[12px] lg:text-[13px] font-[500] items-end text-right">
            <h1 className="text-[16px] lg:text-xl font-semibold rounded-tl-full bg-green-100 text-gray-800 text-center px-6 py-3 w-full">
              Invoice
            </h1>

            <p>Invoice No: {details?.SaleSummary?.Reference || ""}</p>

            <div className="my-1">
              <Barcode
                value={details?.SaleSummary?.Reference || "000000"}
                width={1.4}
                height={24}
                fontSize={14}
                displayValue={false}
                margin={0}
              />
            </div>

            <p>Date: {formatDateToLocal(details?.SaleSummary?.Date)}</p>

            <p>
              {" "}
              {details?.Users?.fullName
                ? `Created By: ${details?.Users?.fullName}`
                : ""}
            </p>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <div className="flex flex-col justify-between ">
            <table className="global_table ">
              <thead className="global_thead">
                <tr className="global_tr">
                  <th className="global_print_th">SL</th>
                  <th className="global_print_th">Product</th>
                  {details?.Products.some(
                    (p) => p.warranty && p.warranty > 0,
                  ) && <th className="global_print_th">Warranty</th>}
                  <th className="global_print_th w-15">Qty</th>
                  <th className="global_print_th text-end">Price</th>
                  <th className="global_print_th text-end">Total</th>
                </tr>
              </thead>
              <tbody className="print-group">
                {groupedProducts?.map((p, i) => (
                  <tr key={p._id}>
                    <td className="global_td  text-center">{i + 1}</td>
                    <td className="global_td">
                      <h1 className="felx flex-col gap-1"> {p.name}</h1>{" "}
                      {p.serialNos && (
                        <h1 className="flex flex-wrap gap-1">
                          {p.serialNos.map((s) => {
                            return (
                              <span className="border border-gray-200 rounded-md text-xs">
                                {s}
                              </span>
                            );
                          })}
                        </h1>
                      )}
                    </td>
                    {details?.Products.some(
                      (p) => p.warranty && p.warranty > 0,
                    ) && (
                      <td className="global_td text-center">
                        {p.warranty || 0} Days
                      </td>
                    )}
                    <td className="global_td text-center">
                      {p.quantity} {p.unit}
                    </td>
                    <td className="global_td text-end">{p.price.toFixed(2)}</td>
                    <td className="global_td text-end">{p.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="global_tr font-semibold text-black dark:text-white">
                  <td className="global_td">Total</td>
                  {details?.Products.some(
                    (p) => p.warranty && p.warranty > 0,
                  ) && <td className="global_td"></td>}
                  <td className="global_td"></td>
                  <td className="global_td text-center">
                    {details?.Products?.reduce(
                      (sum, p) => sum + Number(p.quantity),
                      0,
                    )}
                  </td>
                  <td className="global_td"></td>

                  <td className="global_td text-end">
                    {details?.Products?.reduce(
                      (sum, p) => sum + Number(p.total),
                      0,
                    ).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex px-1 mt-0.5 gap-4 rounded-lg print:flex print:flex-row mb-16">
          {/* LEFT */}
          <div className="flex flex-col gap-1 w-[65%] print:w-[65%]">
            <span className="italic text-sm">
              <span className="rounded-md text-gray-800 font-semibold">In Word :</span>{" "}
              {numberToWords(details?.SaleSummary?.grandTotal)}
            </span>

            <div className="text-sm lg:text-base">
              {details?.SaleSummary?.note ? (
                <p className="text-sm mt-1 break-words whitespace-normal">
                  <strong>Note:</strong> {details?.SaleSummary?.note}
                </p>
              ) : (
                ""
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-[35%] print:w-[35%]">
            <p className="flex justify-between whitespace-nowrap">
              <strong>Total:</strong>
              {formatCurrency(details?.SaleSummary?.total || 0)} Tk
            </p>

            {details?.SaleSummary?.discount > 0 && (
              <p className="flex justify-between whitespace-nowrap">
                <strong>Discount:</strong>
                {formatCurrency(details?.SaleSummary?.discount || 0)} Tk
              </p>
            )}

            {details?.SaleSummary?.outher && (
              <p className="flex justify-between whitespace-nowrap">
                <strong>{details.SaleSummary.outher}:</strong>
                {formatCurrency(details?.SaleSummary?.outherAmount)} Tk
              </p>
            )}

            {details?.SaleSummary?.discount > 0 ||
            details?.SaleSummary?.outherAmount > 0 ? (
              <p className="flex justify-between whitespace-nowrap">
                <strong>Grand Total:</strong>
                {formatCurrency(details?.SaleSummary?.grandTotal)} Tk
              </p>
            ) : (
              ""
            )}
            {/* Paid  */}
            {details?.SaleSummary?.paid ? (
              <p className="flex justify-between whitespace-nowrap">
                <strong>Paid:</strong>
                {formatCurrency(details?.SaleSummary?.paid)} Tk
              </p>
            ) : (
              ""
            )}
          </div>
        </div>

        <div className="flex gap-20 justify-between">
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

      {/* head title and print */}
      <div className="flex justify-center items-center py-5">
        <button
          onClick={() => {
            handlePrint();
          }}
          className="global_button lg:w-fit w-full"
        >
          Print Invoice
        </button>
      </div>
    </div>
  );
};

export default Invoice8;
