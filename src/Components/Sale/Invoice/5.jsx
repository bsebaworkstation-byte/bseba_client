import { useParams } from "react-router-dom";
// import { printElement } from "../../../Helper/SessionHelper";
import loadingStore from "../../../Zustand/LoadingStore";
import { getBusinessDetails, getName } from "../../../Helper/SessionHelper";
import { printElement } from "../../../Helper/Printer";
import api from "../../../Helper/axios_resonse_interceptor";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatCurrency } from "../../../Helper/formatCurrency";
import Barcode from "react-barcode";
import { numberToWords } from "../../../Helper/UI/NumberToWord";

const Invoice5 = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const { setGlobalLoader } = loadingStore();
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
      console.error("Error fetching receipt:", err);
    } finally {
      setGlobalLoader(false);
    }
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

  const handlePrint = () => {
    printElement(printRef, `DokanpatReceipt-${id}`);
  };

  return (
    <div className="global_container">
      {/* Printable Area - Narrow receipt style */}

      <div ref={printRef} className=" flex items-center justify-center">
        <div
          className=" w-full   p-3"
          style={{ maxWidth: "300px", fontSize: "12px" }}
        >
          {/* Header - Logo and Business Info */}
          <div className="text-center">
            <div className="flex justify-center items-center">
              <span className="text-lg font-bold">
                {businessDetails?.businessName}
              </span>
            </div>
            {/* <h2 className="text-sm font-semibold mt-1">
            {businessDetails?.businessName || "Bseba"}
          </h2> */}

            <p>{businessDetails?.address || "Emergency Road, Boro Bazar"}</p>
            <p>{businessDetails?.contactNumber || "01700000000"}</p>
          </div>

          <hr className="my-2 border-dashed border-gray-400" />

          {/* Customer and Invoice Info */}
          <div className="leading-tight">
            <p>Bill To, {data?.Customer?.name || "Customer"}</p>
            <p>Inv #{data?.SaleSummary?.Reference || id}</p>
            <div>
              <Barcode
                value={data?.SaleSummary?.Reference}
                width={1}
                height={24}
                fontSize={14}
                displayValue={false}
                margin={0}
              />
            </div>
            <p>
              Date:{" "}
              {data?.SaleSummary?.Date
                ? new Date(data.SaleSummary.Date).toLocaleDateString()
                : ""}
            </p>
          </div>

          {/* Item Table */}
          <table className="w-full text-left mt-2">
            <thead>
              <tr className="border-b border-t border-black">
                <th className="py-1 w-1/3">P Name</th>
                <th className="py-1 text-center w-1/12">Qty</th>
                <th className="py-1 text-right w-1/4">Unit P</th>
                <th className="py-1 text-right w-1/4">Total</th>
              </tr>
            </thead>
            <tbody>
              {groupedProducts?.length > 0 &&
                groupedProducts.map((item, index) => {
                  const lineTotal =
                    (Number(item?.price) || 0) * (Number(item?.quantity) || 0);
                  return (
                    <tr key={index} className="leading-tight">
                      <td className="py-0.5">{item?.name}</td>
                      <td className="py-0.5 text-center text-nowrap">
                        {item?.quantity} {item?.unit}
                      </td>
                      <td className="py-0.5 text-right">{item?.price}</td>
                      <td className="py-0.5 text-right font-semibold">
                        {lineTotal}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          <hr className="my-2 border-dashed border-gray-400" />

          {/* Financial Summary */}
          <div className="w-full">
            {/* total */}
            <div className="flex justify-between leading-tight">
              <span className="w-2/3">Total</span>
              <span className="w-1/3 text-right">
                {formatCurrency(data?.SaleSummary?.total)} Tk
              </span>
            </div>

            {/* discount */}
            {data?.SaleSummary.discount > 0 && (
              <div className="flex justify-between leading-tight">
                <span className="w-1/3">Discount</span>
                <span className="w-1/3 text-right">
                  {formatCurrency(data?.SaleSummary?.discount || 0)} Tk
                </span>
              </div>
            )}

            {/* author amount */}
            {data?.SaleSummary?.outher && (
              <div className="flex justify-between leading-tight">
                <span className="w-2/3">{data?.SaleSummary?.outher}</span>
                <span className="w-1/3 text-right">
                  {formatCurrency(data?.SaleSummary?.outherAmount || 0)} Tk
                </span>
              </div>
            )}

            {/* grand total */}
            {data?.SaleSummary?.discount > 0 ||
            data?.SaleSummary?.outherAmount > 0 ? (
              <div className="flex justify-between leading-tight">
                <span className="w-2/3">Grand Total</span>
                <span className="w-1/3 text-right">
                  {formatCurrency(data?.SaleSummary?.grandTotal || 0)} Tk
                </span>
              </div>
            ) : (
              ""
            )}

            {/* paid */}
            {data?.SaleSummary?.paid ? (
              <div className="flex justify-between leading-tight">
                <span className="w-2/3">Paid</span>
                <span className="w-1/3 text-right">
                  {formatCurrency(data?.SaleSummary?.paid || 0)} Tk
                </span>
              </div>
            ) : (
              ""
            )}

            {/* previes balance */}
            {data?.SaleSummary?.PreviousBalance ? (
              <div className="flex justify-between leading-tight">
                <span className="w-2/3">
                  {data?.SaleSummary?.PreviousBalance < 0
                    ? "Previous  Due"
                    : "Advanced"}
                </span>
                <span className="w-1/3 text-right">
                  {formatCurrency(
                    Math.abs(data?.SaleSummary?.PreviousBalance || 0),
                  )}{" "}
                  Tk
                </span>
              </div>
            ) : (
              ""
            )}

            {/* current balance */}
            {data?.SaleSummary?.CurrentBalance ? (
              <div className="flex justify-between leading-tight">
                <span className="w-2/3">
                  {data.SaleSummary.CurrentBalance < 0
                    ? "Total Due"
                    : "Balance"}
                </span>
                <span className="w-1/3 text-right">
                  {formatCurrency(
                    Math.abs(data.SaleSummary.CurrentBalance || 0),
                  )}{" "}
                  Tk
                </span>
              </div>
            ) : (
              ""
            )}
          </div>

          {/* Footer Info */}

          <hr className="my-2 border-dashed border-gray-400" />
          <p className="font-semibold text-sm leading-snug">
            {numberToWords(data?.SaleSummary?.grandTotal)}
          </p>
          <p className="leading-tight">
            Created By: {data?.Users?.fullName || "System User"}
          </p>
          <p className="text-[10px]">
            {data?.SaleSummary?.note ? `Note: ${data?.SaleSummary?.note}` : ""}
          </p>

          <div className="mt-4">
            {/* business Footer */}
            {getBusinessDetails()?.invoiceFooter && (
              <p className="text-center text-sm">
                {getBusinessDetails()?.invoiceFooter}
              </p>
            )}

            <p className="text-center text-sm border-t border-gray-400 mt-2">
              <span className="text-gray-500">Software Developed by</span>{" "}
              <span className="font-semibold">Bseba.com</span>
            </p>
          </div>
        </div>
      </div>

      {/* ===== PRINT BUTTON ===== */}
      <div
        id="no-print"
        className="flex items-center justify-center gap-4 mt-6"
      >
        <button onClick={handlePrint} className="global_button">
          Print Receipt
        </button>
      </div>
    </div>
  );
};

export default Invoice5;
