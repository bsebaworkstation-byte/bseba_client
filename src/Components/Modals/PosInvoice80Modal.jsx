import { useEffect, useRef, useState, useMemo } from "react";

import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { ErrorToast } from "../../Helper/FormHelper";
import { getBusinessDetails } from "../../Helper/SessionHelper";
import Barcode from "react-barcode";
import loadingStore from "../../Zustand/LoadingStore";
import { numberToWords } from "../../Helper/UI/NumberToWord";
import { printPosElement } from "../../Helper/PosInvoicePrint";
import api from "../../Helper/axios_resonse_interceptor";
import { print58mm } from "../../Helper/print58mm";
import { print80mm } from "../../Helper/print80mm";
import { formatCurrency } from "../../Helper/formatCurrency";


const PosInvoice80Modal = ({
  open,
  setOpen,
  posInvoiceID,
  printSize = null,
}) => {
  const [details, setDetails] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const printRef = useRef(null);

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

  // Disable background scroll when modal is open
  useEffect(() => {
    let printTimer;

    (async () => {
      if (open) {
        document.body.classList.add("overflow-hidden");

        if (posInvoiceID) {
          await getSaleDetailsByID(posInvoiceID);

          // 🔹 auto print after 1 second
          printTimer = setTimeout(() => {
            handlePrint_80_or_58_or_Auto();
          }, 1000);
        }
      } else {
        document.body.classList.remove("overflow-hidden");
      }
    })();

    return () => {
      document.body.classList.remove("overflow-hidden");
      if (printTimer) clearTimeout(printTimer);
    };
  }, [open]);

  const handlePrint_80_or_58_or_Auto = () => {
    if (printSize === 58) {
      print58mm(printRef);
    } else if (printSize === 80) {
      print80mm(printRef);
    } else if (printSize === null) {
      printPosElement(printRef);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0000006c] flex items-center justify-center center-remove">
      <div
        id="no-print"
        className="flex relative text-[12px] text-gray-700 font-[700] dark:text-white flex-col bg-white dark:bg-[#1E2939] rounded-lg max-w-lg w-full mx-4 overflow-y-auto max-h-screen"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <div className="p-1 font-[700]" ref={printRef}>
          {/* Details top */}
          <div className="text-[14px] tracking-tight leading-4 text-center">
            <h1 className="font-[700] text-[16px]">
              {getBusinessDetails()?.businessName}
            </h1>
            <p className="font-[500]">{getBusinessDetails()?.address}</p>
            <h1>{getBusinessDetails()?.contactNumber}</h1>
          </div>
          <div className="flex justify-between text-[14px]">
            {/* Customer */}
            {details?.Customer && (
              <div className=" w-1/2">
                <p>{details?.Customer.name}</p>
                <p>{details?.Customer.mobile}</p>
              </div>
            )}
            {/* Invoice Summary */}
            <div className="w-1/2">
              {details?.SaleSummary.BillTo && (
                <p className="flex gap-2">
                  <span>Bill To</span>
                  <span>{details?.SaleSummary.BillTo}</span>
                </p>
              )}
              <p className="flex justify-end">
                <span>#{details?.SaleSummary.Reference}</span>
              </p>

              {/* -----------------Barcode-----------------  */}
              {/* <p className="flex justify-end">
                <Barcode
                  value={details?.SaleSummary.Reference}
                  width={0.8}
                  height={20}
                  fontSize={14}
                  displayValue={false}
                  margin={0}
                />
              </p> */}
              {/* ----------------------------------  */}

              <p className="flex flex-col items-end gap-1">
                <span>
                  {(() => {
                    const d = new Date(details?.SaleSummary.Date);

                    const day = String(d.getDate()).padStart(2, "0");
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const year = d.getFullYear();

                    return `${day}-${month}-${year}`;
                  })()}
                </span>

                <span>
                  {(() => {
                    const d = new Date(details?.SaleSummary.Date);
                    return d.toLocaleString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    });
                  })()}
                </span>
              </p>
            </div>
          </div>
          <p className="text-[14px]">{details?.Customer.address}</p>
          <h1 className="text-center text-[14px]">
            Created-{details?.Users?.fullName}
          </h1>

          {/* Sale Product */}
          <div className="w-full text-[14px]  font-bold">
            <div className="w-full">
              <div className="border-y">
                <h1 className={`text-left py-1 w-full `}>
                  Product's Description
                </h1>
              </div>

              {groupedProducts?.map((p) => (
                <div key={p.id} className="border-b">
                  <h1 className="py-1">{p.name}</h1>

                  <h1 className="flex justify-between">
                    <span>
                      {" "}
                      {p.quantity} {p.unit} x {p.price}{" "}
                    </span>
                    <span> {formatCurrency(p.total)}</span>
                  </h1>
                </div>
              ))}

              <div className="">
                {/* Total */}
                {details?.SaleSummary?.grandTotal > 0 && (
                  <div className="flex justify-between w-full">
                    <h1>Total</h1>
                    <h1>{formatCurrency(details.SaleSummary.total)}</h1>
                  </div>
                )}

                {/* Discount */}
                {details?.SaleSummary.discount > 0 && (
                  <div className="flex justify-between w-full">
                    <h1>Discount</h1>

                    <h1>{formatCurrency(details?.SaleSummary?.discount)}</h1>
                  </div>
                )}

                {/* Other */}
                {details?.SaleSummary?.outherAmount > 0 && (
                  <div className="flex justify-between w-full">
                    <h1>{details?.SaleSummary?.outher || "Other"}</h1>
                    <h1>{formatCurrency(details.SaleSummary.outherAmount)}</h1>
                  </div>
                )}

                {details?.SaleSummary?.discount > 0 ||
                details?.SaleSummary?.outherAmount > 0 ? (
                  <div className="flex justify-between w-full">
                    <p>Grand Total</p>
                    <p>
                      {formatCurrency(details?.SaleSummary?.grandTotal || 0)}
                    </p>
                  </div>
                ) : (
                  ""
                )}

                {/* Paid */}
                {details?.SaleSummary?.paid > 0 && (
                  <div className="flex justify-between w-full">
                    <h1>Paid</h1>
                    <h1>{details.SaleSummary.paid.toFixed(2)}</h1>
                  </div>
                )}

                {/* Previous Balance */}
                {details?.SaleSummary?.PreviousBalance ? (
                  <div className="flex justify-between w-full">
                    <p>
                      {" "}
                      {details.SaleSummary.PreviousBalance < 0
                        ? "Previous Due"
                        : "Advanced"}
                    </p>
                    <p>
                      {formatCurrency(
                        Math.abs(details.SaleSummary.PreviousBalance || 0),
                      )}
                    </p>
                  </div>
                ) : (
                  ""
                )}

                {/* Current Current  */}
                {details?.SaleSummary?.CurrentBalance ? (
                  <div className="flex justify-between w-full">
                    <p>
                      {details.SaleSummary.CurrentBalance < 0
                        ? "Total Due"
                        : "Balance"}
                    </p>
                    <p>
                      {formatCurrency(
                        Math.abs(details.SaleSummary.CurrentBalance || 0),
                      )}
                    </p>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>

          <hr />
          {!!details?.SaleSummary?.grandTotal && (
            <h1 className="text-[14px]">
              {" "}
              {numberToWords(details?.SaleSummary?.grandTotal)}
            </h1>
          )}
          <hr />
               {getBusinessDetails()?.invoiceFooter && (
                        <p className="text-center text-sm">
                          {getBusinessDetails()?.invoiceFooter}
                        </p>
                      )}
          
          <hr />
          <p className="text-center text-[13px] ">Bseba.com</p>

          <div className="flex gap-2" id="no-print">
            <button
              className="global_button_red w-full"
              onClick={() => {
                setOpen(false);
              }}
            >
              close
            </button>
            <button
              className="global_button w-full"
              onClick={handlePrint_80_or_58_or_Auto}
            >
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosInvoice80Modal;
