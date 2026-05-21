import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
// import { printElement } from "../../../Helper/SessionHelper";
import loadingStore from "../../../Zustand/LoadingStore";
import { getBusinessDetails } from "../../../Helper/SessionHelper";
import { printElement } from "../../../Helper/Printer";
import api from "../../../Helper/axios_resonse_interceptor";
import { formatCurrency } from "../../../Helper/formatCurrency";
import { numberToWords } from "../../../Helper/UI/NumberToWord";
import Barcode from "react-barcode";
import formatDateToLocal from "../../../Helper/formatDate";

const Invoice3 = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const businessDetails = getBusinessDetails();
  const [showHead, setShowHead] = useState(true);
  const printRef = useRef();

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

      <div
        style={{
          width: "210mm",
          // minHeight: "297mm",
          margin: "0 auto",
          // padding: "10mm",
          background: "white",
          boxSizing: "border-box",
        }}
      >
        <div
          ref={printRef}
          className="flex dark:bg-gray-800 justify-between flex-col px-5 min-w-3xl overflow-x-auto"
        >
          {showHead ? (
            <div className="flex items-start">
              {/* business Details  */}
              <div className="w-14 h-16 text-white  font-bold text-xl  dark:text-gray-50">
                {businessDetails?.logo ? (
                  <img src={businessDetails?.logo} alt="" />
                ) : (
                  ""
                )}
              </div>

              <div className="flex justify-center w-full items-center">
                <div className="text-center ">
                  <h1 className="text-xl font-bold">
                    {businessDetails?.businessName || ""}
                  </h1>
                  <p>{businessDetails?.tagline || ""}</p>

                  <p className="text-sm">{businessDetails?.tin || ""}</p>
                  <p className="text-sm">
                    {businessDetails?.contactNumber || ""}
                  </p>
                  <p className="text-sm">{businessDetails?.address || ""}</p>

                  <p className="text-sm">{businessDetails?.email || ""}</p>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}

          <div className="flex items-end w-full print:break-inside-avoid">
            {/* LEFT: Bill To */}
            <div className="w-1/2">
              <div className="min-h-[70px]">
                {(data?.SaleSummary?.BillTo ||
                  data?.Customer?.name ||
                  data?.Customer?.address ||
                  data?.Customer?.mobile) && (
                  <>
                   

                    <p>
                      {data?.SaleSummary?.BillTo && `Name: ${data.SaleSummary.BillTo}`}
                      {data?.Customer?.name && !data?.SaleSummary?.BillTo && `Name: ${data.Customer.name}`}
                    </p>
                    <p>
                      {data?.Customer?.address &&
                        `Address: ${data.Customer.address}`}
                    </p>
                    <p>
                      {data?.Customer?.mobile &&
                        `Mobile: ${data.Customer.mobile}`}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT: Invoice Info */}
            <div className="flex w-1/2 justify-end items-end">
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
                <p>
                  Date:{" "}
                  {data?.SaleSummary?.Date
                    ? (() => {
                        const d = new Date(data.SaleSummary.Date);

                        // Date part
                        const day = String(d.getDate()).padStart(2, "0");
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const year = d.getFullYear();

                        // Time part (12-hour format)
                        let hours = d.getHours();
                        const minutes = String(d.getMinutes()).padStart(2, "0");
                        const ampm = hours >= 12 ? "PM" : "AM";
                        hours = hours % 12;
                        hours = hours ? hours : 12; // 0 => 12

                        return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
                      })()
                    : ""}
                </p>
                <p>Created By : {data?.Users.fullName}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center p-1.5 bg-gray-50 dark:bg-gray-700 border-y border-gray-200">
            <h2 className="text-xl font-bold uppercase tracking-wide">
              Invoice Total
            </h2>
            <span className="text-xl font-bold">
              ৳{formatCurrency(data?.SaleSummary?.grandTotal)}
            </span>
          </div>

          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left text-gray-700">
                  <th className="py-2 dark:text-gray-50">DESCRIPTION</th>
                  <th className="py-2 w-10 dark:text-gray-50">QTY</th>
                  <th className="py-2 text-right w-24 dark:text-gray-50">
                    UNIT PRICE
                  </th>
                  <th className="py-2 text-right w-24 dark:text-gray-50">
                    AMOUNT
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupedProducts?.length > 0 ? (
                  groupedProducts.map((item, index) => {
                    const lineTotal =
                      (Number(item.price) || 0) * (Number(item.quantity) || 0);
                    return (
                      <tr key={index} className="border-b border-gray-100 h-8">
                        <td className="py-1">
                          <span className="flex flex-col gap-0.5">
                            <span>
                              {item.name}{" "}
                              {item?.warranty
                                ? `- Warranty days (${item?.warranty})`
                                : ""}
                            </span>
                            <span>
                              <span>{item?.serialNos?.join(", ")}</span>
                            </span>
                          </span>
                        </td>
                        <td className="py-1">
                          {item.quantity} {item?.unit}
                        </td>
                        <td className="py-1 text-right">
                          ৳{formatCurrency(item.price)}
                        </td>
                        <td className="py-1 text-right font-semibold">
                          ৳{formatCurrency(lineTotal)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <></>
                )}
              </tbody>
              <tfoot>
                <tr className="border-b border-gray-100 h-8">
                  <td className="py-1 font-semibold">Total</td>
                  <td className="py-1">{total?.totalQty}</td>
                  <td className="py-1 text-center"></td>
                  <td className="py-1 text-right">
                    {formatCurrency(total?.totalPrice)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex px-1 mt-0.5 gap-4 rounded-lg print:flex print:flex-row">
            {/* LEFT */}
            <div className="flex flex-col gap-1 w-[65%] print:w-[65%]">
              {" "}
              <div className="text-sm">
                <p className="font-semibold pb-1">
                  {numberToWords(data?.SaleSummary?.grandTotal)}
                </p>

                <p className="text-sm mt-1 mb-10 break-words whitespace-normal">
                  {data?.SaleSummary?.note ? (
                    <span className="mb-10">Note: {data?.SaleSummary?.note}</span>
                  ) : (
                    ""
                  )}
                    
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="w-[35%] print:w-[35%]">
              <span className="flex justify-between whitespace-nowrap">
                <span>Total</span>
                <span> ৳ {formatCurrency(data?.SaleSummary?.total)}</span>
              </span>

              {/* discount */}
              {data?.SaleSummary.discount > 0 && (
                <span className="flex justify-between whitespace-nowrap">
                  <span>Discount</span>
                  <span>৳ {formatCurrency(data?.SaleSummary?.discount)}</span>
                </span>
              )}

              {/* author */}
              {data?.SaleSummary.outher > 0 && (
                <span className="flex justify-between whitespace-nowrap">
                  <span> {data?.SaleSummary?.outher}</span>
                  <span>
                    ৳ {formatCurrency(data?.SaleSummary?.outherAmount)}
                  </span>
                </span>
              )}

              {/* grand total */}
              {data?.SaleSummary?.discount > 0 ||
              data?.SaleSummary?.outherAmount > 0 ? (
                <span className="flex justify-between whitespace-nowrap">
                  <span> Grand Total</span>
                  <span>৳ {formatCurrency(data?.SaleSummary?.grandTotal)}</span>
                </span>
              ) : (
                ""
              )}

              {/* paid */}
              {data?.SaleSummary.paid > 0 && (
                <span className="flex justify-between whitespace-nowrap">
                  <span> Paid</span>
                  <span>৳ {formatCurrency(data?.SaleSummary?.paid)}</span>
                </span>
              )}

              {/* previes balance */}
              {data?.SaleSummary?.PreviousBalance ? (
                <span className="flex justify-between whitespace-nowrap">
                  <span>
                    {" "}
                    {data?.SaleSummary?.PreviousBalance < 0
                      ? "Previous  Due"
                      : "Advanced"}
                  </span>
                  <span>
                    {" "}
                    ৳{" "}
                    {formatCurrency(
                      Math.abs(data?.SaleSummary?.PreviousBalance),
                    )}
                  </span>
                </span>
              ) : (
                ""
              )}

              {/* current balance */}
              {data?.SaleSummary?.CurrentBalance ? (
                <span className="flex justify-between whitespace-nowrap">
                  <span>
                    {data.SaleSummary.CurrentBalance < 0
                      ? "Total Due"
                      : "Balance"}
                  </span>
                  <span>
                    {formatCurrency(Math.abs(data.SaleSummary.CurrentBalance))}
                  </span>
                </span>
              ) : (
                ""
              )}

            </div>
          </div>

          <div className="flex gap-10 justify-between mt-10">
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
      </div>

      <div
        id="no-print"
        className="flex items-center justify-center gap-4 mt-6"
      >
        <button onClick={handlePrint} className="global_button ">
          Print Invoice
        </button>
      </div>
    </div>
  );
};

export default Invoice3;
