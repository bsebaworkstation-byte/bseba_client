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
import { numberToWordsInBangla } from "../../../Helper/bangla/NumberToWordInBangla";
import formatDateToLocalInBangla from "../../../Helper/bangla/formatDateInBangla";
import { formatNumberToBangla } from "../../../Helper/bangla/numberInBangla";
const OneB = () => {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const [showHead, setShowHead] = useState(true);
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

  const formatNumberNotTofixed = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "";

    return new Intl.NumberFormat("bn-BD", {
      useGrouping: true,
    }).format(num);
  };

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
                {details?.SaleSummary?.BillTo || details?.Customer?.name ? `নাম: ${details.SaleSummary.BillTo || details.Customer.name}` : ""}
              </h1>
              <p className="text-[13px]">
                {details?.Customer?.mobile
                  ? `মোবাইল: ${details.Customer.mobile}`
                  : ""}
              </p>
              <p className="text-[13px]">
                {details?.Customer?.address
                  ? `ঠিকানা: ${details.Customer.address}`
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
            <h1 className="text-[16px] lg:text-xl font-semibold rounded-tl-full border text-center px-6 py-3 w-full border-gray-300">
              বিক্রয় রশিদ
            </h1>

            <div className="flex flex-col justify-start items-start w-full border-b border-r border-l pl-3 border-gray-300">
              <p>রশিদ নং: {details?.SaleSummary?.Reference || ""}</p>

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

              <p>
                তারিখ: {formatDateToLocalInBangla(details?.SaleSummary?.Date)}
              </p>

              <p>তৈরি করেছেন: {details?.Users?.fullName || ""}</p>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <div className="flex flex-col justify-between ">
            <table className="global_table border border-gray-300 dark:border-gray-600">
              <thead>
                <tr>
                  <th className="border border-gray-300 dark:border-gray-600">
                    নং
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600">
                    পণ্য বিবরণ
                  </th>
                  {details?.Products.some(
                    (p) => p.warranty && p.warranty > 0,
                  ) && (
                    <th className="border border-gray-300 dark:border-gray-600">
                      ওয়ারেন্টি
                    </th>
                  )}
                  <th className=" border border-gray-300 dark:border-gray-600">
                    পরিমাণ
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600">
                    দর
                  </th>
                  <th className=" text-end border border-gray-300 dark:border-gray-600 pr-2">
                    মোট
                  </th>
                </tr>
              </thead>
              <tbody className="print-group">
                {groupedProducts?.map((p, i) => (
                  <tr key={p._id}>
                    <td className="global_td text-center">
                      {new Intl.NumberFormat("bn-BD").format(i + 1)}
                    </td>
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
                    ) ? (
                      <td className="global_td text-center">
                        {formatNumberNotTofixed(p.warranty || 0)} দিন
                      </td>
                    ) : (
                      ""
                    )}
                    <td className="global_td text-center">
                      <span className="font-bold">
                        {formatNumberNotTofixed(p?.quantity)} {p.unit}
                      </span>
                    </td>
                    <td className="global_td text-center">
                      <span className="font-bold">
                        {formatNumberToBangla(p?.price)}
                      </span>{" "}
                    </td>
                    <td className="global_td text-end">
                      <span className="font-bold">
                        {formatNumberToBangla(p.total.toFixed(2))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className=" font-semibold text-center">
                  <td className="global_td">
                    <span className="font-bold">মোট</span>
                  </td>
                  {details?.Products.some(
                    (p) => p.warranty && p.warranty > 0,
                  ) && <td className="global_td"></td>}
                  <td className="global_td"></td>
                  <td className="global_td text-center">
                    <span className="font-bold">
                      {formatNumberNotTofixed(
                        details?.Products?.reduce(
                          (sum, p) => sum + Number(p.quantity),
                          0,
                        ),
                      )}{" "}
                    </span>
                  </td>
                  <td className="global_td"></td>

                  <td className="global_td text-end">
                    <span className="font-bold">
                      {formatNumberToBangla(
                        details?.Products?.reduce(
                          (sum, p) => sum + Number(p.total),
                          0,
                        ),
                      )}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex px-1 mt-0.5 rounded-lg print:flex print:flex-row gap-3 mb-10">
          {/* LEFT */}
          <div className="flex flex-col gap-1 w-[65%] print:w-[65%]">
            {" "}
            <span className=" text-sm font-semibold">
              কথায় : {numberToWordsInBangla(details?.SaleSummary?.grandTotal)}
            </span>
            {details?.SaleSummary?.note ? (
              <p className="text-sm mt-1 break-words whitespace-normal">
                <strong>নোট:</strong> {details?.SaleSummary?.note}
              </p>
            ) : (
              ""
            )}
          </div>

          {/* RIGHT */}
          <div className="w-[35%] print:w-[35%]">
            {" "}
            <div className="flex flex-col">
              <p className="flex justify-between font-bold">
                <strong>মোট:</strong>
                {formatNumberToBangla(details?.SaleSummary?.total || 0)} টাকা
              </p>

              {details?.SaleSummary?.discount > 0 && (
                <p className="flex justify-between font-bold">
                  <strong>ছাড়:</strong>
                  {formatNumberToBangla(
                    details?.SaleSummary?.discount || 0,
                  )}{" "}
                  টাকা
                </p>
              )}

              {details?.SaleSummary?.outher && (
                <p className="flex justify-between font-bold">
                  <strong>{details.SaleSummary.outher}:</strong>
                  {formatNumberToBangla(
                    details?.SaleSummary?.outherAmount,
                  )}{" "}
                  টাকা
                </p>
              )}

              {details?.SaleSummary?.discount > 0 ||
              details?.SaleSummary?.outherAmount > 0 ? (
                <p className="font-bold flex gap-3 justify-between">
                  <strong>সর্বমোট:</strong>
                  {formatNumberToBangla(details?.SaleSummary?.grandTotal)} টাকা
                </p>
              ) : (
                ""
              )}

              {/* Paid  */}
              {details?.SaleSummary?.paid ? (
                <p className="font-bold flex justify-between">
                  <strong>জমা:</strong>
                  {formatNumberToBangla(details?.SaleSummary?.paid)} টাকা
                </p>
              ) : (
                ""
              )}

              {details?.SaleSummary?.PreviousBalance ? (
                <p className="font-bold flex justify-between">
                  <strong>
                    {details.SaleSummary.PreviousBalance < 0
                      ? "পূর্ববর্তী বকেয়া"
                      : "অগ্রিম"}
                  </strong>
                  {formatNumberToBangla(
                    Math.abs(details.SaleSummary.PreviousBalance),
                  )}{" "}
                  টাকা
                </p>
              ) : (
                ""
              )}

              {/* Current Current  */}
              {details?.SaleSummary?.CurrentBalance ? (
                <p className="flex font-bold justify-between">
                  <strong>
                    {details.SaleSummary.CurrentBalance < 0
                      ? "মোট বকেয়া"
                      : "ব্যালেন্স"}
                  </strong>
                  {formatNumberToBangla(
                    Math.abs(details.SaleSummary.CurrentBalance),
                  )}{" "}
                  টাকা
                </p>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-20 ">
          <h1 className="border-t">গ্রাহকের স্বাক্ষর</h1>
          <h1 className="border-t">অনুমোদনকারী স্বাক্ষর</h1>
        </div>

        {/* business Footer */}
        {getBusinessDetails()?.invoiceFooter && (
          <p className="text-center text-sm">
            {getBusinessDetails()?.invoiceFooter}
          </p>
        )}

        <p className="text-center text-sm border-t border-gray-400">
          <span className="text-gray-500">সফটওয়্যার নির্মাতা</span>{" "}
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

export default OneB;
