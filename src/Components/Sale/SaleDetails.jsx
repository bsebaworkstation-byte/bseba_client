import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import loadingStore from "../../Zustand/LoadingStore";
import { getBusinessDetails, getToken } from "../../Helper/SessionHelper";
import { ErrorToast } from "../../Helper/FormHelper";
import { numberToWords } from "../../Helper/UI/NumberToWord";
import { printElement } from "../../Helper/Printer";
import api from "../../Helper/axios_resonse_interceptor";
import Barcode from "react-barcode";

const SaleDetails = () => {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const { setGlobalLoader } = loadingStore();

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

  const formatCurrency = (amount) => Number(amount || 0).toFixed(2);
  //   const formatDate = (dateStr) => {
  //     if (!dateStr) return "";
  //     const date = new Date(dateStr);
  //     const day = date.getDate().toString().padStart(2, "0");
  //     const month = (date.getMonth() + 1).toString().padStart(2, "0");
  //     const year = date.getFullYear();
  //     return `${day}-${month}-${year}`;
  //   };

  const businessDetails = getBusinessDetails();
  useEffect(() => {
    if (id) getSaleDetailsByID(id);
  }, [id]);

  const handlePrint = () => {
    printElement(printRef, "Sale details");
  };

  if (!details) return <div className="p-4">Loading...</div>;

  return (
    <div className="">
      <div ref={printRef}>
        {/* Headers */}
        <div className="flex justify-between px-1 lg:px-5 py-3 my-4 rounded-lg">
          <div className="flex flex-col gap-1">
            <div className="text-lg lg:text-2xl font-semibold flex flex-col">
              {" "}
              <div className="flex items-start border p-2 border-gray-300 rounded-lg gap-2">
                {businessDetails.logo ? (
                  <img
                    src={businessDetails.logo}
                    height={70}
                    width={70}
                    alt="dokanpat"
                    className="h-fit border rounded-full border-gray-300 p-2"
                  />
                ) : (
                  ""
                )}
                <div>
                  <h1 className="pt-3">{businessDetails.businessName}</h1>
                  <h1 className="text-sm">{businessDetails.address}</h1>
                </div>
              </div>
              <div>
                <h1 className="text-[16px]">{details?.Customer.name}</h1>
                <p className="text-[13px]">{details?.Customer.mobile}</p>
                <p className="text-[13px]">{details?.Customer.address}</p>
              </div>
            </div>
          </div>
          {/* right er Invoice */}
          <div className="flex flex-col text-[12px] lg:text-[13px] w-1/3 font-[500]">
            <h1 className="text-[16px] lg:text-xl text-wrap lg:text-nowrap font-semibold rounded-tl-full bg-green-100 text-gray-800  text-center pl-6 pr-1 lg:px-10 py-3">
              Invoice
            </h1>
            <p>Invoice No: {details?.SaleSummary?.Reference}</p>
            <Barcode
              value={details?.SaleSummary?.Reference}
              width={1.4}
              height={20}
              fontSize={14}
              displayValue={false}
              margin={0}
            />
            <p>
              Date:{" "}
              {details?.SaleSummary?.Date
                ? (() => {
                    const d = new Date(details.SaleSummary.Date);
                    const day = String(d.getDate()).padStart(2, "0");
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const year = d.getFullYear();
                    return `${day}-${month}-${year}`;
                  })()
                : ""}
            </p>
            <p>Name : {details?.Users.fullName}</p>

            {/* <p className="break-words max-w-[110px] lg:w-full">
              {businessDetails.email}
            </p>
            <p>{businessDetails.website}</p> */}
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto lg:px-5">
          <div className="h-[55vh] flex flex-col justify-between ">
            <table className="global_table ">
              <thead className="global_thead">
                <tr className="global_tr">
                  <th className="global_print_th w-6/100">SL</th>
                  <th className="global_print_th w-46/100">Product</th>
                  {details?.Products.some(
                    (p) => p.warranty && p.warranty > 0
                  ) && <th className="global_print_th w-8/100">Warranty</th>}
                  <th className="global_print_th w-10/100">Qty</th>
                  <th className="global_print_th w-14/100">Price</th>
                  <th className="global_print_th w-16/100">Total</th>
                </tr>
              </thead>
              <tbody>
                {details?.Products?.map((p, i) => (
                  <tr key={p.id}>
                    <td className="global_td  text-center">{i + 1}</td>
                    <td className="global_td text-center">
                      <h1 className="felx flex-col gap-1">
                        {" "}
                        {p.name} {p.brand}
                      </h1>{" "}
                      {p.serialNos && (
                        <h1 className="flex gap-2 justify-center">
                          {p.serialNos.map((s) => {
                            return (
                              <span className="border border-gray-200 rounded-md px-2">
                                {s}
                              </span>
                            );
                          })}
                        </h1>
                      )}
                    </td>
                    {details?.Products.some(
                      (p) => p.warranty && p.warranty > 0
                    ) && (
                      <td className="global_td text-center">
                        {p.warranty || 0}
                      </td>
                    )}
                    <td className="global_td text-center">
                      {p.quantity} {p.unit}
                    </td>
                    <td className="global_td text-center">{p.price}</td>
                    <td className="global_td text-center">{p.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* blank space */}
            <div className="flex-grow">
              <table className="w-full h-full">
                <tbody className="h-full">
                  <tr className="global_tr font-semibold text-black">
                    <td className="global_td   w-6/100" colSpan={1}></td>
                    <td className="global_td  w-46/100" colSpan={2}></td>
                    {details?.Products.some(
                      (p) => p.warranty && p.warranty > 0
                    ) && <td className="global_td  w-8/100" colSpan={3}></td>}
                    <td className="global_td  w-10/100" colSpan={4}></td>
                    <td className="global_td  w-14/100 text-end "></td>
                    <td className="global_td  w-16/100 text-end "></td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* footer */}
            <div className="">
              <table className="w-full">
                <tfoot>
                  <tr className="global_tr font-semibold text-black dark:text-white">
                    <td className="global_td w-52/100">Total</td>
                    {details?.Products.some(
                      (p) => p.warranty && p.warranty > 0
                    ) && <td className="global_td w-8/100"></td>}
                    <td className="global_td w-10/100">
                      {details?.Products?.reduce(
                        (sum, p) => sum + Number(p.quantity),
                        0
                      )}
                    </td>
                    <td className="global_td w-14/100"></td>
                    <td className="global_td w-16/100">
                      {details?.Products?.reduce(
                        (sum, p) => sum + Number(p.total),
                        0
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between px-1 lg:px-5 py-3 my-4 rounded-lg">
          <div className="flex flex-col gap-1">
            <div className=" flex items-center gap-2">
              <span className="rounded-md">In Word :</span>
              <span className="italic text-green-500 dark:text-green-400 text-sm">
                {numberToWords(details?.SaleSummary?.grandTotal)}
              </span>
            </div>

            <div className="text-sm lg:text-base">
              {details.SaleSummary.note === "" ? null : (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  <strong className="text-gray-800 dark:text-gray-100">
                    Note:
                  </strong>{" "}
                  {details?.SaleSummary?.note}
                </p>
              )}
            </div>
          </div>
          {/* right er Invoice */}
          <div className="flex flex-col space-y-1 text-[12px] lg:text-[15px] w-1/3 font-[500]">
            <p className="flex justify-between">
              <strong>Total:</strong>
              {formatCurrency(details.SaleSummary.total || 0)} Tk
            </p>
            {details.SaleSummary.discount > 0 && (
              <p className="flex justify-between">
                <strong>Discount:</strong>
                {formatCurrency(details.SaleSummary.discount || 0)} Tk
              </p>
            )}
            {details.SaleSummary.outher && (
              <p className="flex justify-between">
                <strong>{details.SaleSummary.outher}:</strong>
                {formatCurrency(details.SaleSummary.outherAmount)} Tk
              </p>
            )}
            <p className="dark:text-white text-black flex justify-between">
              <strong>Grand Total:</strong>
              {formatCurrency(details.SaleSummary.grandTotal || 0)} Tk
            </p>

            {/* Due */}
            {details.Summary?.dueAmount > 0 && (
              <p className="dark:text-white text-black flex justify-between">
                <strong>due Amount:</strong>
                {formatCurrency(details.SaleSummary.dueAmount || 0)} Tk
              </p>
            )}

            {/* Advanced */}
            {details.Summary?.dueAmount < 0 && (
              <p className="dark:text-white text-black flex justify-between">
                <strong>Advance:</strong>
                {formatCurrency(details.SaleSummary.dueAmount || 0)} Tk
              </p>
            )}
            {/* Paid  */}
            {
              <p className="dark:text-white text-black flex justify-between">
                <strong>Paid:</strong>
                {formatCurrency(details.SaleSummary.paid || 0)} Tk
              </p>
            }
            {/* Current Current  */}
            {details?.SaleSummary?.CurrentBalance !== null &&
              details?.SaleSummary?.CurrentBalance !== undefined &&
              details?.SaleSummary?.CurrentBalance !== 0 && (
                <p className="dark:text-white text-red-500 flex justify-between">
                  <strong>Current Balance:</strong>
                  {formatCurrency(details.SaleSummary.CurrentBalance || 0)} Tk
                </p>
              )}

            {/* Previous Balance  */}
            {details?.SaleSummary?.PreviousBalance !== null &&
              details?.SaleSummary?.PreviousBalance !== undefined &&
              details?.SaleSummary?.PreviousBalance !== 0 && (
                <p className="dark:text-white text-black flex justify-between">
                  <strong>Previous Balance:</strong>
                  {formatCurrency(details.SaleSummary.PreviousBalance || 0)} Tk
                </p>
              )}
          </div>
        </div>
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

export default SaleDetails;
