import { useParams } from "react-router-dom";
import loadingStore from "../../../Zustand/LoadingStore";
import { useEffect, useMemo, useRef, useState } from "react";
import { getBusinessDetails } from "../../../Helper/SessionHelper";
import api from "../../../Helper/axios_resonse_interceptor";
import formatDateToLocal from "../../../Helper/formatDate";
import { numberToWordaGlobal } from "../../../Helper/UI/NumberToWordGlobal";
import { formatCurrency } from "../../../Helper/formatCurrency";
import Barcode from "react-barcode";
import { printElement } from "../../../Helper/Printer";

const WithVat = () => {
  const { setGlobalLoader } = loadingStore();
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const [showHead, setShowHead] = useState(true);
  const printRef = useRef();
  const businessDetails = getBusinessDetails();

  const fetchdetails = async () => {
    setGlobalLoader(true);
    try {
      const { data } = await api.get(`/SalesDetailsByID/${id}`);
      if (data?.status === "Success") {
        setDetails(data.data);
      }
    } catch (error) {
      console.error("Error fetching sale details:", error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchdetails();
  }, [id]);

  const handlePrint = () => {
    printElement(printRef, `Invoice-${id}`);
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

  const total = (groupedProducts ?? []).reduce(
    (acc, item) => ({
      totalQty: acc.totalQty + (Number(item?.quantity) || 0),
      totalPrice:
        acc.totalPrice +
        (Number(item?.price) || 0) * (Number(item?.quantity) || 0),
    }),
    { totalQty: 0, totalPrice: 0 },
  );

  const hasWarranty = groupedProducts?.some((p) => p.warranty);

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

          <div
            className={`flex justify-between gap-4 items-start w-full ${showHead ? "mt-0" : "mt-0"
              }`}
          >
            {/* LEFT: Customer Info */}
            <div className="w-1/2 flex justify-start">
              <div className="font-semibold mt-2">
                {showHead ? (
                  <div className="flex items-start gap-2">
                    {businessDetails?.logo && (
                      <img
                        src={businessDetails.logo}
                        height={70}
                        width={70}
                        alt="logo"
                        className="object-contain"
                      />
                    )}
                    <div>
                      <h1 className="font-semibold text-lg">
                        {businessDetails?.businessName || ""}
                      </h1>
                      <p className="text-sm font-semibold">
                        {businessDetails?.address || ""}
                      </p>
                      <p className="text-sm">
                        {businessDetails?.contactNumber || ""}
                      </p>
                    </div>
                  </div>
                ) : (
                  ""
                )}
                <h1 className="text-[16px]">
                  {details?.SaleSummary?.BillTo || details?.Customer?.name
                    ? `${details?.SaleSummary?.BillTo || details?.Customer?.name}`
                    : ""}
                </h1>
                <p className="text-[13px]">
                  {details?.Customer?.mobile
                    ? `${details.Customer.mobile}`
                    : ""}
                </p>
                <p className="text-[13px]">
                  {details?.Customer?.address
                    ? `${details.Customer.address}`
                    : ""}
                </p>
              </div>
            </div>

            {/* CENTER: Business Info */}
            {showHead ? (
              <div className="w-1/3 flex flex-col justify-center items-center mt-4">
                <div className="gap-2 flex justify-center items-start">
                  <div></div>
                </div>
                <p className="text-sm text-center">
                  {businessDetails?.tin || ""}
                </p>
                <p className="text-sm text-center">
                  {businessDetails?.tagline || ""}
                </p>

                <p className="text-sm text-center">
                  {businessDetails?.website || ""}
                </p>
              </div>
            ) : (
              ""
            )}

            <div
              className={`w-1/3 flex flex-col text-[12px] lg:text-[13px] font-[500] items-end text-right`}
            >
              <h1 className="text-[16px] lg:text-xl font-semibold rounded-tl-full bg-green-100 text-gray-800 text-center px-6 py-3 w-full">
                TAX INVOICE
              </h1>

              <p>No: {details?.SaleSummary?.Reference || ""}</p>

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

          {/* table */}
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-gray-300 dark:border-gray-600 p-1 text-left">
                  S.No
                </th>
                <th className="border border-gray-300 dark:border-gray-600 p-1 text-left">
                  Product Description
                </th>

                <th className="border border-gray-300 dark:border-gray-600 p-1 text-center">
                  Qty
                </th>
                {hasWarranty ? (
                  <th className="border border-gray-300 dark:border-gray-600 p-1 text-left">
                    Warranty
                  </th>
                ) : (
                  ""
                )}
                <th className="border border-gray-300 dark:border-gray-600 p-1 text-end">
                  U/Price
                </th>
                <th className="border border-gray-300 dark:border-gray-600 p-1 text-end">
                  Vat %
                </th>
                <th className="border border-gray-300 dark:border-gray-600 p-1 text-end">
                  Vat Amt
                </th>
                <th className="border border-gray-300 text-end dark:border-gray-600 p-1 ">
                  Amount
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
                    <td className="border font-semibold border-gray-300 dark:border-gray-600 p-1 text-center">
                      {i + 1}
                    </td>

                    {/* Product */}
                    <td className="border border-gray-300 dark:border-gray-600 p-1">
                      <span className="flex flex-col font-semibold">
                        <span>{p?.name}</span>
                        <span className="text-xs">
                          {p?.serialNos?.join(", ")}
                        </span>
                      </span>
                    </td>

                    {/* Qty */}

                    <td className="border font-semibold border-gray-300 dark:border-gray-600 p-1 text-center text-nowrap">
                      {p?.quantity} {p?.unit}
                    </td>
                    {hasWarranty ? (
                      <td className="border font-semibold text-nowrap border-gray-300 dark:border-gray-600 p-1 text-center">
                        {p?.warranty ? `${p?.warranty} Days` : ""}
                      </td>
                    ) : (
                      ""
                    )}
                    <td className="border text-nowrap font-semibold border-gray-300 dark:border-gray-600 p-1 text-end">
                      {p?.price}
                    </td>
                    <td className="border text-nowrap font-semibold border-gray-300 dark:border-gray-600 p-1 text-end">
                      {p?.vatPercentage}
                    </td>
                    <td className="border text-nowrap font-semibold border-gray-300 dark:border-gray-600 p-1 text-end">
                      {p?.vat}
                    </td>
                    <td className="border font-semibold text-nowrap border-gray-300 dark:border-gray-600 p-1 text-end">
                      {formatCurrency((p?.price || 0) * (p?.quantity || 0) + (p?.vat || 0))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center border border-gray-300 dark:border-gray-600 p-1 border-none bg-transparent p-0 h-4"
                    style={{ border: "none", background: "transparent", height: "16px" }}
                  >
                    No items found
                  </td>
                </tr>
              )}
            </tbody>

            <tfoot>
              <tr className="bg-sky-50 dark:bg-gray-700 font-semibold">
                <td
                  colSpan="4"
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
                <td className="border text-end border-gray-300 dark:border-gray-600 text-center p-2">
                  {formatCurrency(total?.totalPrice)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="flex px-1 mt-0.5 gap-2 rounded-lg print:flex print:flex-row">
            {/* LEFT */}
            <div className="flex flex-col gap-1 w-[65%] print:w-[65%] mb-20">
              {" "}
              <span>
                Total Amount IN Word:{" "}
                <span className="text-sm gap-10"> {businessDetails?.currency || "Tk"} <span></span>
                  {numberToWordaGlobal(details?.SaleSummary?.grandTotal)}
                </span>
              </span>
              {details?.SaleSummary?.note ? (
                <p className="text-sm mt-1 break-words whitespace-normal">
                  Note: {details?.SaleSummary?.note}
                </p>
              ) : (
                ""
              )}
            </div>
            {/* RIGHT */}
            <div className="w-[35%] print:w-[35%]">
              {" "}
              <div>
                <p className="flex justify-between whitespace-nowrap font-semibold">
                  <span>GrossTotal</span>
                  {formatCurrency(details?.SaleSummary?.total)}
                </p>


                <p className="flex justify-between whitespace-nowrap font-semibold">
                  <span>Discount:</span>
                  {formatCurrency(details?.SaleSummary?.discount)}
                </p>


                {details?.SaleSummary?.outher && (
                  <p className="flex justify-between whitespace-nowrap font-semibold">
                    <span>{details.SaleSummary.outher}:</span>
                    {formatCurrency(details?.SaleSummary?.outherAmount)}
                  </p>
                )}

                <p className="flex justify-between whitespace-nowrap font-semibold">
                  <span>Tax Amt:</span>
                  {formatCurrency(
                    (details?.SaleSummary?.grandTotal || 0) - (details?.SaleSummary?.vat || 0)
                  )}
                </p>



                <p className="flex justify-between whitespace-nowrap font-semibold">
                  <span>Vat 5%:</span>
                  {formatCurrency(details?.SaleSummary?.vat)}
                </p>

                <p className="flex justify-between whitespace-nowrap font-semibold">
                  <span>GRAND TOTAL:</span>
                  {formatCurrency(details?.SaleSummary?.grandTotal)}
                </p>



                {/* Paid  */}
                {details?.SaleSummary?.paid ? (
                  <p className="flex justify-between whitespace-nowrap font-semibold">
                    <span>Paid:</span>
                    {formatCurrency(details?.SaleSummary?.paid)}
                  </p>
                ) : (
                  ""
                )}

                {details?.SaleSummary?.PreviousBalance ? (
                  <p className="flex justify-between whitespace-nowrap font-semibold">
                    <span>
                      {details.SaleSummary.PreviousBalance < 0
                        ? "Previous Due"
                        : "Advanced"}
                    </span>
                    {formatCurrency(
                      Math.abs(details.SaleSummary.PreviousBalance),
                    )}

                  </p>
                ) : (
                  ""
                )}

                {/* Current Current  */}
                {details?.SaleSummary?.CurrentBalance ? (
                  <p className="flex justify-between whitespace-nowrap font-semibold">
                    <span>
                      {details.SaleSummary.CurrentBalance < 0
                        ? "Total Due"
                        : "Balance"}
                    </span>
                    {formatCurrency(
                      Math.abs(details.SaleSummary.CurrentBalance),
                    )}{" "}

                  </p>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-40 ">
            <h1 className="border-t">Customer Signature</h1>
            <h1 className="border-t">Authorization Signature</h1>
          </div>

          {/* business Footer */}
          {getBusinessDetails()?.invoiceFooter && (
            <p className="text-center text-sm">
              {getBusinessDetails()?.invoiceFooter}
            </p>
          )}
          <p className="text-center text-sm border-t border-gray-400 mt-0.5">
            <span className="text-gray-500">Software Developed by</span>{" "}
            <span className="font-semibold">Bseba.com</span>
          </p>
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

export default WithVat;