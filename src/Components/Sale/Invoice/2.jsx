import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
// import { printElement } from "../../../Helper/SessionHelper";
import loadingStore from "../../../Zustand/LoadingStore";
import { getBusinessDetails } from "../../../Helper/SessionHelper";
import { printElement } from "../../../Helper/Printer";
import api from "../../../Helper/axios_resonse_interceptor";
import { formatCurrency } from "../../../Helper/formatCurrency";
import Barcode from "react-barcode";
import { numberToWords } from "../../../Helper/UI/NumberToWord";
import { numberToWordaGlobal } from "../../../Helper/UI/NumberToWordGlobal";


const Invoice2 = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const [showHead, setShowHead] = useState(true);
  const businessDetails = getBusinessDetails();
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
    printElement(printRef, "Sale details");
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
        ref={printRef}
        className="flex flex-col justify-between px-5 min-w-3xl overflow-x-auto"
      >
        {showHead && (
          <div>
            <div className="flex items-start w-full">
              {/* Left: Logo */}
              <div className="w-1/4 flex justify-start">
                {businessDetails?.logo && (
                  <img
                    className="w-16 h-16 object-contain"
                    src={businessDetails.logo}
                    alt="logo"
                  />
                )}
              </div>

              {/* Center: Business Name & TIN */}
              <div className="w-1/2 flex flex-col items-center text-center">
                <p className="font-bold text-2xl">
                  {businessDetails?.businessName || ""}
                </p>
                <p className="text-sm">{businessDetails?.tagline || ""}</p>
                <p className="text-sm">{businessDetails?.tin || ""}</p>
              </div>

              {/* Right: Address, Mobile, Tagline */}
              <div className="w-1/4 flex flex-col items-end text-right">
                <p className="font-semibold">
                  {businessDetails?.address || ""}
                </p>
                <p className="text-sm">
                  {businessDetails?.contactNumber || ""}
                </p>
                <p className="text-sm text-center">
                  {businessDetails?.email || ""}
                </p>
                <p className="text-sm text-center">
                  {businessDetails?.website || ""}
                </p>
              </div>
            </div>

            <div className="text-center text-xl font-semibold bg-gray-200 mt-1.5">
              Invoice/Bill
            </div>
          </div>
        )}

        <div className="my-1.5 flex items-end justify-between">
          <div>
           
            {data?.SaleSummary?.BillTo ? (
              <p className="px-3">Name: {data?.SaleSummary?.BillTo}</p>
            ) : (
              ""
            )}
            {data?.Customer?.address ? (
              <p className="px-3">Address: {data?.Customer?.address}</p>
            ) : (
              ""
            )}
            {data?.Customer?.mobile ? (
              <p className="px-3">Mobile: {data?.Customer?.mobile}</p>
            ) : (
              ""
            )}
          </div>

          <div className="flex justify-end items-end">
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

        {/* ========Product Table=======  */}
        <div>
          {/* BODY TABLE WITH SCROLL */}
          <div className="overflow-y-auto">
            <table className="w-full">
              <thead className="text-sm uppercase">
                <tr>
                  <th className="px-2 py-1 border border-gray-300 text-center">
                    Sl. No.
                  </th>
                  <th className="w-1/2 px-2 py-1 border border-gray-300 text-left">
                    Product
                  </th>
                  <th className="px-2 py-1 border border-gray-300 text-center">
                    Quantity
                  </th>
                  <th className=" px-2 py-1 border border-gray-300 text-end">
                    Unit Price
                  </th>

                  <th className="px-2 py-1 border border-gray-300 text-right">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {groupedProducts.length > 0 ? (
                  groupedProducts.map((item, index) => {
                    const totalItem =
                      (Number(item.price) || 0) * (Number(item.quantity) || 0);

                    return (
                      <tr key={index} className="text-sm">
                        <td className="px-2 py-1 border border-gray-200 text-center">
                          {index + 1}
                        </td>
                        {/* Name, warranty & serials */}
                        <td className="px-2 py-1 border border-gray-200 text-left">
                          <h1 className="font-medium"> {item.name}</h1>
                          {!!item?.warranty && (
                            <>
                              {" "}
                              <h3 className="text-xs flex justify-between w-40">
                                {" "}
                                <span>Warranty Days</span>
                                {item?.warranty}
                              </h3>
                              <h1 className="flex flex-wrap gap-5 w-full"></h1>
                            </>
                          )}
                          <span>{item?.serialNos?.join(", ")}</span>
                        </td>
                        <td className="px-2 py-1 border border-gray-200 text-center">
                          {item?.quantity}{" "}
                          <span className="capitalize">{item?.unit}</span>
                        </td>
                        <td className="px-2 py-1 border border-gray-200 text-end">
                          {Number(item.price).toFixed(2)}
                        </td>

                        <td className="px-2 py-1 border border-gray-200 text-end">
                          {totalItem.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-gray-500 py-4">
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="text-sm">
                  <td className="px-2 py-1 border border-gray-200 text-center font-semibold">
                    Total
                  </td>
                  <td className="px-2 py-1 border border-gray-200 text-center font-semibold"></td>
                  <td className="px-2 py-1 border border-gray-200 text-center font-semibold">
                    {total?.totalQty}
                  </td>
                  <td className="px-2 py-1 border border-gray-200 text-center font-semibold"></td>
                  <td className="px-2 py-1 border text-end border-gray-200  font-semibold">
                    {formatCurrency(total?.totalPrice)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Totals */}

        <div className="flex justify-between print:flex-nowrap mt-0.5"></div>

        <div className="flex px-1 gap-4 mt-0.5 rounded-lg print:flex print:flex-row mb-10">
          {/* LEFT */}
          <div className="flex flex-col gap-1 w-[65%] print:w-[65%]">
            {" "}
            <div>
              <span className="text-sm">
                In Word : {numberToWordaGlobal(data?.SaleSummary?.grandTotal)}
              </span>

              {data?.SaleSummary?.note && (
                <p className="text-sm mt-1 break-words whitespace-normal">
                  Note: {data?.SaleSummary?.note}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-[35%] print:w-[35%]">
            {" "}
            <div className="flex ml-3 flex-col space-y-1 text-nowrap text-[12px] lg:text-[15px] font-[500] print:space-y-0 print:gap-1">
              {/* Total */}
              <p className="flex justify-between whitespace-nowrap">
                <span>Total:</span>
                <span>{formatCurrency(data?.SaleSummary?.total)}</span>
              </p>

              {/* Discount */}
              {data?.SaleSummary?.discount > 0 && (
                <p className="flex justify-between whitespace-nowrap">
                  <span>Discount:</span>
                  <span>{formatCurrency(data?.SaleSummary?.discount)}</span>
                </p>
              )}

              {/* Other */}
              {data?.SaleSummary?.outher && (
                <p className="flex justify-between whitespace-nowrap">
                  <span>{data?.SaleSummary?.outher}:</span>
                  <span>
                    {formatCurrency(data?.SaleSummary?.outherAmount)} 
                  </span>
                </p>
              )}

              {/* Grand Total */}
              {data?.SaleSummary?.discount > 0 ||
              data?.SaleSummary?.outherAmount > 0 ? (
                <p className="flex justify-between whitespace-nowrap">
                  <span>Grand Total:</span>
                  <span>
                    {formatCurrency(data?.SaleSummary?.grandTotal)}
                  </span>
                </p>
              ) : (
                ""
              )}

              {/* Due */}
              {data?.Summary?.dueAmount > 0 ? (
                <p className="flex justify-between whitespace-nowrap">
                  <span>Due Amount:</span>
                  <span>{formatCurrency(data?.SaleSummary?.dueAmount)} Tk</span>
                </p>
              ) : (
                ""
              )}

              {/* Advance */}
              {data?.Summary?.dueAmount < 0 ? (
                <p className="flex justify-between whitespace-nowrap">
                  <span>Advance:</span>
                  <span>
                    {formatCurrency(Math.abs(data?.SaleSummary?.dueAmount))} 
                  </span>
                </p>
              ) : (
                ""
              )}

              {/* Paid */}
              {data?.SaleSummary?.paid ? (
                <p className="flex justify-between whitespace-nowrap">
                  <span>Paid:</span>
                  <span>{formatCurrency(data?.SaleSummary?.paid)}</span>
                </p>
              ) : (
                ""
              )}

              {/* Previous Balance */}
              {data?.SaleSummary?.PreviousBalance ? (
                <p className="flex justify-between whitespace-nowrap">
                  <span>
                    {data?.SaleSummary?.PreviousBalance < 0
                      ? "Previous Due:"
                      : "Advanced:"}
                  </span>
                  <span>
                    {formatCurrency(
                      Math.abs(data?.SaleSummary?.PreviousBalance),
                    )}{" "}
                  
                  </span>
                </p>
              ) : (
                ""
              )}

              {/* Current Balance */}
              {data?.SaleSummary?.CurrentBalance ? (
                <p className="flex justify-between whitespace-nowrap">
                  <span>
                    {data?.SaleSummary?.CurrentBalance < 0
                      ? "Total Due:"
                      : "Balance:"}
                  </span>
                  <span>
                    {formatCurrency(
                      Math.abs(data?.SaleSummary?.CurrentBalance),
                    )}{" "}
                  
                  </span>
                </p>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="flex gap-14 justify-between">
          <h1 className="border-t">Customer Signature</h1>
          <h1 className="border-t">Authorization Signature</h1>
        </div>

        <p className="text-center">{getBusinessDetails()?.invoiceFooter}</p>
        <p className="  text-center text-sm border-t mt-1 border-gray-300">
          <span className="text-gray-500">Software Developed by</span>{" "}
          <span className="font-semibold">Bseba.com</span>
        </p>
      </div>
      {/* Buttons */}
      <div
        id="no-print"
        className="flex items-center justify-center gap-4 mt-6"
      >
        <button onClick={handlePrint} className="global_button">
          Print Invoice
        </button>
      </div>
    </div>
  );
};

export default Invoice2;
