import { useEffect, useState } from "react";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import toast from "react-hot-toast";
import { formatDate } from "../../Helper/utils";
import { Link } from "react-router-dom";

const SerialHistoryModal = ({ open, setOpen, serialID }) => {
  const { setGlobalLoader } = loadingStore();
  const [history, setHistory] = useState(null);

  const fetchSerialHistoryByID = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/SerialDetailsById/${serialID}`);
      if (res.data.status === "Success") {
        // Basic fallback
        setHistory(res.data.data);
      }
    } catch (error) {
      ErrorToast("Failed to load Serial History");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };
  const getRemainingWarranty = (startDate, warrantyDays) => {
    if (!startDate || !warrantyDays) return "-";

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + Number(warrantyDays));

    const today = new Date();

    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? `${diffDays} Days` : "Expired";
  };

  useEffect(() => {
    (async () => {
      if (open) {
        document.body.classList.add("overflow-hidden");
        await fetchSerialHistoryByID();
      } else {
        document.body.classList.remove("overflow-hidden");
      }
    })();
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]);
  const hasPurchase = history?.PurchaseID || history?.PurchaseCreatedDate;

  const hasSales = history?.SalesID || history?.SalesCreatedDate;
  if (!open) return null;
  return (
    <div
      onClick={() => {
        setOpen(false);
      }}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center overflow-y-auto pt-10 px-3"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-black dark:text-white dark:bg-[#1E2939] p-3 rounded-lg w-full sm:w-[90%] max-w-2xl max-h-[90vh] min-h-[70vh] overflow-y-auto shadow-lg"
      >
        <div className="flex justify-end">
          <button
            className="global_button_red"
            onClick={() => {
              setOpen(false);
            }}
          >
            Close
          </button>
        </div>
        <div className="bg-white dark:bg-[#1E2939] rounded-lg w-full max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">Serial History</h2>

          {/* Basic Info */}
          <div className="mb-4 space-y-1">
            <p>
              <b>Serial No:</b> {history?.serialNo ?? "N/A"}
            </p>
            <p>
              <b>Product:</b> {history?.ProductName ?? "N/A"}
            </p>
          </div>

          {/* ================= PURCHASE TABLE ================= */}
          {hasPurchase && (
            <div className="overflow-x-auto">
              <h3 className="font-semibold mt-6 mb-2">Purchase History</h3>

              <table className="global_table">
                <thead className="global_thead">
                  <tr>
                    <th className="global_th">Contact</th>
                    <th className="global_th">Address</th>
                    <th className="global_th">Mobile</th>
                    <th className="global_th min-w-25 text-nowrap">Date</th>
                    <th className="global_th">Warranty</th>
                    <th className="global_th">Remaining</th>
                    <th className="global_th">View</th>
                  </tr>
                </thead>
                <tbody className="global_tbody">
                  <tr className="global_tr">
                    <td className="global_td">
                      {history?.PurchaseContactName ?? "-"}
                    </td>
                    <td className="global_td">
                      {history?.PurchaseAddress ?? "-"}
                    </td>
                    <td className="global_td">
                      {history?.PurchaseMobile ?? "-"}
                    </td>
                    <td className="global_td">
                      {history?.PurchaseCreatedDate
                        ? formatDate(history.PurchaseCreatedDate)
                        : "-"}
                    </td>
                    <td className="global_td">
                      {history?.PurchaseWarranty
                        ? `${history.PurchaseWarranty} Days`
                        : "-"}
                    </td>
                    <td className="global_td">
                      {getRemainingWarranty(
                        history?.PurchaseCreatedDate,
                        history?.PurchaseWarranty
                      )}
                    </td>
                    <td className="global_td">
                      <Link
                        to={`/PurchaseDetails/${history?.PurchaseID}`}
                        className="global_button"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {/* hello */}
          {/* ================= SALES TABLE ================= */}
          {hasSales && (
            <div className="overflow-x-auto">
              <h3 className="font-semibold mt-6 mb-2">Sales History</h3>

              <table className="global_table">
                <thead className="global_thead">
                  <tr>
                    <th className="global_th">Customer</th>
                    <th className="global_th">Address</th>
                    <th className="global_th">Mobile</th>
                    <th className="global_th">Price</th>
                    <th className="global_th min-w-25 text-nowrap">Date</th>
                    <th className="global_th">Warranty</th>
                    <th className="global_th">Remaining</th>
                    <th className="global_th">View</th>
                  </tr>
                </thead>
                <tbody className="global_tbody">
                  <tr className="global_tr">
                    <td className="global_td">
                      {history?.SalesContactName ?? "-"}
                    </td>
                    <td className="global_td">{history?.SaleAddress ?? "-"}</td>
                    <td className="global_td">{history?.SaleMobile ?? "-"}</td>
                    <td className="global_td">{history?.SalesPrice ?? "-"}</td>
                    <td className="global_td">
                      {history?.SalesCreatedDate
                        ? formatDate(history.SalesCreatedDate)
                        : "-"}
                    </td>
                    <td className="global_td">
                      {history?.SaleWarranty
                        ? `${history.SaleWarranty} Days`
                        : "-"}
                    </td>
                    <td className="global_td">
                      {getRemainingWarranty(
                        history?.SalesCreatedDate,
                        history?.SaleWarranty
                      )}
                    </td>
                    <td className="global_td">
                      <Link
                        to={`/Invoice/1/${history?.SalesID}`}
                        className="global_button"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ================= NO DATA ================= */}
          {!hasPurchase && !hasSales && (
            <p className="text-center mt-6 text-gray-500">
              No purchase or sales history found
            </p>
          )}
        </div>

        {hasSales && (
          <div className="w-full py-2 flex">
            <Link
              className="global_button w-full text-center"
              to={`/SaleReturn/${history?.SalesID}`}
            >
              Sale Return
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SerialHistoryModal;
