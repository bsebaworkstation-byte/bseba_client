import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ErrorToast } from "../../Helper/FormHelper";
import { getBusinessDetails } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { printElement } from "../../Helper/Printer";
import Barcode from "react-barcode";
import api from "../../Helper/axios_resonse_interceptor";

const PurchaseDetails = () => {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const businessDetails = getBusinessDetails();
  const printRef = useRef(null);

  const fetchDetails = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/PurchasesDetailsByID/${id}`);
      if (res.data.status === "Success") setDetails(res.data.data);
      else ErrorToast(res.data.message);
    } catch (error) {
      ErrorToast(error.message || "Something went wrong");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const handlePrint = () => printElement(printRef, "Purchase Details");

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getRemainingWarranty = (purchaseDate, warrantyDays) => {
    if (!purchaseDate || !warrantyDays) return 0;

    const start = new Date(purchaseDate);
    const today = new Date();

    const diffTime = today - start; // milliseconds
    const passedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const remaining = warrantyDays - passedDays;

    return remaining > 0 ? remaining : 0;
  };

  const formatCurrency = (amount) => Number(amount || 0).toFixed(2);

  const primaryColor = "green-600"; // Change this to your theme primary color

  return (
    <>
      <div ref={printRef} className="px-5">
        {/* Supplier Info + Shop + Purchase Invoice*/}
        <div className="flex justify-between items-start gap-6 mb-1 border p-2 rounded border-gray-200 dark:border-gray-700">
          {/* Supplier Info */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-700 dark:text-gray-100 mb-2 border-b border-gray-200 dark:border-gray-600 pb-1">
              Supplier Details
            </h3>
            <p>{details?.Supplier?.name}</p>
            <p>{details?.Supplier?.mobile}</p>
            <p>{details?.Supplier?.address}</p>
          </div>
          {/* Logo and Shop Name */}
          <div className="flex items-center gap-3">
            <div
              className={` w-12 h-12 rounded-full flex items-center justify-center  text-white font-bold`}
            >
              {businessDetails?.logo ? (
                <img
                  className="rounded-full"
                  src={businessDetails?.logo}
                  alt="logo"
                />
              ) : (
                ""
              )}
            </div>
            <div>
              <h1 className="font-bold text-xl">
                {businessDetails?.businessName || "Your Business"}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {businessDetails?.address}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {businessDetails?.contactNumber}
              </p>
            </div>
          </div>

          {/* Invoice */}
          <div className="text-right">
            <h2 className={`font-bold text-2xl text-${primaryColor}`}>
              Purchase Invoice
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Date: {formatDate(details?.PurchaseSummary?.Date)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Ref: {details?.PurchaseSummary?.Reference}
            </p>
            {/* Barcode */}

            <div className="flex justify-end">
              <div className="inline-block leading-none">
                <Barcode
                  value={details?.PurchaseSummary?.Reference || ""}
                  height={20}
                  width={1.35}
                  displayValue={false}
                  margin={0}
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span>Created By:</span> {details?.Users?.fullName || "N/A"}
            </p>
          </div>
        </div>

        {/* products */}

        <table className="global_table">
          <thead className="global_thead">
            <tr className="global_tr w-full">
              <th className="global_th text-center px-1">#</th>
              <th className="global_th  text-left px-1">Product</th>
              {details?.Products.some((p) => p.warranty > 0) && (
                <>
                  {" "}
                  <th className="global_th  text-center px-1">Warranty</th>{" "}
                  <th className="global_th  text-center px-1">Remaining</th>
                </>
              )}
              <th className="global_th  text-center px-1">
                <h1 className="text-center w-15">QTY</h1>
              </th>
              <th className="global_th px-1">
                <h1 className="text-end">Price</h1>
              </th>
              <th className="global_th text-end">
                <h1 className="text-end px-1">Total</h1>
              </th>
            </tr>
          </thead>
          <tbody>
            {details?.Products?.map((p, i) => (
              <tr
                key={i}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="global_td text-center">{i + 1}</td>
                {/* Name and serials if exist */}
                <td className="global_td">
                  <div className="felx flex-col gap-1">
                    <h1>{p.name}</h1>
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
                  </div>
                </td>
                {details?.Products.some((p) => p.warranty > 0) && (
                  <>
                    {" "}
                    <td className="global_td text-center">{p.warranty || 0}</td>
                    <td className="global_td text-center text-nowrap">
                      {getRemainingWarranty(
                        details.PurchaseSummary?.Date,
                        p.warranty,
                      ) || 0}{" "}
                      days
                    </td>
                  </>
                )}

                <td className="global_td text-center whitespace-nowrap">
                  {p.quantity} {p.unitName}
                </td>
                <td className="global_td text-right">
                  {p.unitCost.toFixed(2)}
                </td>
                <td className="global_td w-14/100 text-right">
                  {p.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="">
            <tr className="global_tr font-semibold text-black dark:text-white">
              <td className="global_td">Total</td>
              {details?.Products.some((p) => p.warranty > 0) && (
                <>
                  {" "}
                  <td className="global_td"></td>{" "}
                  <td className="global_td"></td>
                </>
              )}
              <td className="global_td"></td>
              <td className="global_td text-center">
                {details?.Products?.reduce(
                  (sum, p) => sum + Number(p.quantity),
                  0,
                )}
              </td>
              <td className="global_td"></td>
              <td className="global_td text-right">
                {details?.Products?.reduce(
                  (sum, p) => sum + Number(p.total),
                  0,
                ).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/*Summary */}
        <div className="flex justify-between">
          <h1 className="text-sm w-1/2">
            {!!details?.PurchaseSummary?.note && (
              <span> Note : {details?.PurchaseSummary?.note}</span>
            )}
          </h1>
          <div className="flex justify-end mb-6 w-1/2">
            <div className="border border-gray-200 dark:border-gray-600 rounded p-4 w-full md:w-80 bg-gray-50 dark:bg-gray-700">
              <p className="flex justify-between">
                <strong>Total:</strong>
                {formatCurrency(details?.PurchaseSummary?.total || 0)} Tk
              </p>
              {details?.PurchaseSummary?.discount > 0 && (
                <p className="flex justify-between">
                  <strong>Discount:</strong>
                  {formatCurrency(details?.PurchaseSummary?.discount || 0)} Tk
                </p>
              )}
              {!!details?.PurchaseSummary?.cost && (
                <p className="flex justify-between">
                  <strong>Other Cost:</strong>
                  {formatCurrency(details?.PurchaseSummary?.cost)} Tk
                </p>
              )}
              <p className="dark:text-white text-black flex justify-between">
                <strong>Grand Total:</strong>
                {formatCurrency(details?.PurchaseSummary?.grandTotal || 0)} Tk
              </p>

              {/* Due */}
              {details?.PurchaseSummary?.dueAmount > 0 && (
                <p className="dark:text-white text-black flex justify-between">
                  <strong>Due Amount:</strong>
                  {formatCurrency(details?.PurchaseSummary?.dueAmount || 0)} Tk
                </p>
              )}

              {/* Advanced */}
              {details?.PurchaseSummary < 0 && (
                <p className="dark:text-white text-black flex justify-between">
                  <strong>Advance:</strong>
                  {formatCurrency(details?.PurchaseSummary?.dueAmount || 0)} Tk
                </p>
              )}
              {/* Paid  */}
              {
                <p className="dark:text-white text-black flex justify-between">
                  <strong>Paid:</strong>
                  {formatCurrency(details?.PurchaseSummary?.paid || 0)} Tk
                </p>
              }

              {/* Previous Balance  */}
              {details?.PurchaseSummary?.PreviousBalance !== null &&
                details?.PurchaseSummary?.PreviousBalance !== undefined &&
                details?.PurchaseSummary?.PreviousBalance !== 0 && (
                  <p className="dark:text-white text-black flex justify-between">
                    <strong>Previous Balance:</strong>
                    {formatCurrency(
                      details?.PurchaseSummary?.PreviousBalance || 0,
                    )}{" "}
                    Tk
                  </p>
                )}
              {/* Current Current  */}
              {details?.PurchaseSummary?.CurrentBalance !== null &&
                details?.PurchaseSummary?.CurrentBalance !== undefined &&
                details?.PurchaseSummary?.CurrentBalance !== 0 && (
                  <p className="dark:text-white text-red-500 flex justify-between">
                    <strong>Current Balance:</strong>
                    {formatCurrency(
                      details?.PurchaseSummary?.CurrentBalance || 0,
                    )}{" "}
                    Tk
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-600 pt-2">
          <h1 className="">
            Generated on {formatDate(new Date())} | Thank you for your business
          </h1>
          <hr className="mt-1" />
          <h1> bseba.com</h1>
        </div>
      </div>

      {/* Print Button */}
      <div className="flex justify-end mt-4 print:hidden" id="no-print">
        <button onClick={handlePrint} className="global_button">
          Print Receipt
        </button>
      </div>
    </>
  );
};

export default PurchaseDetails;
