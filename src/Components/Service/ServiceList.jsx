import { useEffect, useRef, useState } from "react";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { printElement } from "../../Helper/Printer";
import loadingStore from "../../Zustand/LoadingStore";
import TimeAgo from "../../Helper/UI/TimeAgo";
import { Link, useNavigate } from "react-router-dom";
import api from "../../Helper/axios_resonse_interceptor";
import AddServicePaymentModal from "../Modals/AddServicePaymentModal";
import RefundServicePaymentModal from "../Modals/RefundServicePaymentModal";
const SERVICE_STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
  "Delivered",
  // "Cancelled",
];

const ServiceList = () => {
  const [service, setService] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [paymentModalService, setPaymentModalService] = useState(null);
  const [refundModalService, setRefundModalService] = useState(null);
  const [updatePaymentModalService, setUpdatePaymentModalService] = useState(null);
  const [cancelConfirmService, setCancelConfirmService] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const printTableRef = useRef(null);
  const [rowsForPrint, setRowsForPrint] = useState(null);

  // 🔹 Fetch Service
  const fetchService = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/ServiceList/${page}/${limit}/${search || 0}`);

      if (res.data.status === "Success") {
        const rows = res.data.data || [];
        setService(rows);
        const rawTotal =
          res.data.pagination?.total ?? res.data.total ?? res.data.pagination?.count;
        if (rawTotal === undefined || rawTotal === null || rawTotal === "") {
          setTotal(rows.length);
        } else {
          const n = Number(rawTotal);
          setTotal(Number.isFinite(n) && n >= 0 ? n : rows.length);
        }
      } else {
        ErrorToast("Failed to fetch Service");
      }
    } catch (err) {
      console.error(err);
      ErrorToast("Something went wrong");
    } finally {
      setGlobalLoader(false);
    }
  };
const navigate = useNavigate();


  useEffect(() => {
    fetchService();
  }, [page, search, limit]);

  useEffect(() => {
    const handleOutsideActionMenuClick = (event) => {
      if (event.target.closest(".service-action-dropdown")) return;

      document
        .querySelectorAll(".service-action-dropdown[open]")
        .forEach((node) => {
          node.removeAttribute("open");
        });
    };

    document.addEventListener("mousedown", handleOutsideActionMenuClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideActionMenuClick);
    };
  }, []);

  useEffect(() => {
    if (!rowsForPrint) return;
    const id = requestAnimationFrame(() => {
      printElement(printTableRef, "Service List");
      setRowsForPrint(null);
    });
    return () => cancelAnimationFrame(id);
  }, [rowsForPrint]);

  const formatPrintDate = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleDateString("en-GB").replace(/\//g, "-");
    } catch {
      return "—";
    }
  };

  const handlePrint = async () => {
    const fetchCount = Math.max(total, service.length, 1);
    setGlobalLoader(true);
    try {
      const res = await api.get(`/ServiceList/1/${fetchCount}/${search || 0}`);
      if (res.data.status !== "Success") {
        ErrorToast(res.data.message || "Failed to load services for print");
        return;
      }
      const rows = res.data.data || [];
      if (rows.length === 0) {
        ErrorToast("No services to print");
        return;
      }
      setRowsForPrint(rows);
    } catch (err) {
      console.error(err);
      ErrorToast(err.response?.data?.message || "Failed to load services for print");
    } finally {
      setGlobalLoader(false);
    }
  };

  const handleStatusChange = async (id, newStatus, currentStatus, item) => {
    if (!newStatus || newStatus === currentStatus) return;

    setUpdatingStatusId(id);
    try {

      
      if("Cancelled" !== newStatus) {
        setUpdatePaymentModalService(item);
        const res = await api.post(`/UpdateServiceStatus/${id}`, {
          status: newStatus,
        });
  
        if (res.data.status === "Success") {
         
        
          setService((prev) =>
            prev.map((row) =>
              row._id === id ? { ...row, Status: newStatus } : row,
            ),
          );
        } else {
          ErrorToast(res.data.message || "Failed to update status");
        }

      } else {
        setRefundModalService(item);

      }


    } catch (err) {
      console.error(err);
      ErrorToast(
        err.response?.data?.message || "Failed to update status",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };
  
  const openPaymentModal = (item) => {
    setPaymentModalService(item);
  };

  const closeRefundModal = () => {
    setRefundModalService(null);
  };
  const closeUpdatePaymentModal = () => {
    setUpdatePaymentModalService(null);
  };

  const closeCancelConfirmModal = () => {
    setCancelConfirmService(null);
  };

  const handleCancelService = async (item) => {
    if (!item?._id || item.Status === "Cancelled") return;
    // if (Number(item?.Paid) > 0) {
    //   ErrorToast("Refund payments before cancelling");
    //   closeCancelConfirmModal();
    //   return;
    // }

    setUpdatingStatusId(item._id);
    try {
      const res = await api.get(`/CancelledService/${item._id}`);

      if (res.data.status === "Success") {
        SuccessToast("Service cancelled");
        setService((prev) =>
          prev.map((row) =>
            row._id === item._id ? { ...row, Status: "Cancelled" } : row,
          ),
        );
        closeCancelConfirmModal();
      } else {
        ErrorToast(res.data.message || "Failed to cancel service");
      }
    } catch (err) {
      console.error(err);
      ErrorToast(err.response?.data?.message || "Failed to cancel service");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleAction = (action, item) => {
    switch (action) {
        case "addPayment":
          openPaymentModal(item);
          break;
        case "editService":
          navigate(`/EditService/${item._id}`);
          break;
        case "view":
          navigate(`/ServiceDetails/${item._id}`);
          break;
        case "refund":
          openRefundModal(item);
          break;
        case "cancel":
          setCancelConfirmService(item);
          break;
      default:
        break;
    }
  };



  const openRefundModal = (item) => {
    setRefundModalService(item);
  };

  const closePaymentModal = () => {
    setPaymentModalService(null);
  };

  return (
    <div className="global_container">
      <div className="global_sub_container">

        <h1 className="text-xl font-semibold mb-4">Service List</h1>

        {/* 🔹 Filter */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-5">

          <div>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="global_dropdown"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} per page
                </option>
              ))}
            </select>

            <p className="text-sm mt-1">
              Showing {service.length} of {total} Services
            </p>
          </div>

          <input
            type="text"
            placeholder="Search Service..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="global_input w-full md:w-64"
          />
        </div>

        {/* 🔹 Table */}
        {service.length === 0 ? (
          <div className="text-center py-10">No services found</div>
        ) : (
          <div className="overflow-auto">
            <table className="global_table w-full">

              <thead className="global_thead">
                <tr>
                  <th className="global_th">#</th>
                  <th className="global_th">Customer</th>
                  <th className="global_th">Service</th>
                  <th className="global_th">Serial/IMEI</th>
                  <th className="global_th">Cost</th>
                  <th className="global_th">Paid</th>
                  <th className="global_th">Due</th>
                  <th className="global_th">Status</th>
                  <th className="global_th">Date</th>
                  <th className="global_th">Delivery Date</th>
               
                  <th className="global_th">Action</th>
                </tr>
              </thead>

              <tbody className="global_tbody">
                {service.map((item) => (
                  <tr key={item._id} className="global_tr">

                    <td className="global_td">
                      <Link to={`/ServiceDetails/${item._id}`} className="text-xs px-2 leading-tight">
                        {item.No}
                      </Link>
                    </td>
                    <td className="global_td font-semibold">
                      <div className="flex flex-col">
                        <span>{item.Customer?.name}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          {item.Customer?.mobile}
                        </span>
                      </div>
                    </td>

                    <td className="global_td font-semibold">
                      {item.Name}
                    </td>

                    <td className="global_td">{item.Serial}</td>

                    <td className="global_td">৳{item.Cost}</td>

                    <td className="global_td text-green-600">
                      ৳{item.Paid}
                    </td>

                    <td className={`global_td ${item.Due > 0 ? "text-red-500 font-semibold" : ""
                      }`}>
                      ৳{item.Due}
                    </td>

                    <td className="global_td min-w-[140px]">
                      <select
                        className="global_dropdown text-sm py-1.5 w-full max-w-[160px]"
                        value={item.Status || "Pending"}
                        disabled={
                          updatingStatusId === item._id ||
                          // item.Status === "Completed" ||
                          item.Status === "Delivered" ||
                          item.Status === "Cancelled"
                        }
                        onChange={(e) => {
                          const next = e.target.value;
                          handleStatusChange(
                            item._id,
                            next,
                            item.Status,
                            item,
                          );
                        }}
                      >
                        {item.Status &&
                          !SERVICE_STATUSES.includes(item.Status) && (
                            <option value={item.Status}>{item.Status}</option>
                          )}
                        {SERVICE_STATUSES.map((st) => (
                          <option
                            key={st}
                            value={st}
                            disabled={st === "Delivered" && Number(item.Due) > 0 || (item.Status === "Completed" && Number(item.Due) > 0) }
                          >
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="global_td">
                      {new Date(item.createdAt)
                        .toLocaleDateString("en-GB")
                        .replace(/\//g, "-")}{" "}
                      <TimeAgo date={item.createdAt} />
                    </td>
                    <td className="global_td">
                      {new Date(item.DeliveryDate)
                        .toLocaleDateString("en-GB")
                        .replace(/\//g, "-")}
                    </td>

                    <td className="global_td">
                      <select
                        className="global_dropdown"
                        defaultValue=""
                        onChange={(e) => {
                          const action = e.target.value;
                          e.target.value = ""; // reset select
                          handleAction(action, item);
                        }}
                      >
                        <option value="" disabled>
                          Select
                        </option>
                        <option value="addPayment">Add Payment</option>
                        <option value="editService">Edit Service</option>
                        <option value="view">View Service</option>

                        {item.Paid > 0 && item.Status !== "Cancelled" && <option value="refund">Refund</option>}

                        {(
                            item.Paid === 0 &&
                            (
                              item.Status === "Refund" ||
                              item.Status === "Pending" ||
                              item.Due > 0
                            )
                          ) && (
                            <option value="cancel">Cancel</option>
                          )}
                        
                      </select>
                    </td>                    

                  </tr>
                ))}
              </tbody>
            </table>

            {/* 🔹 Pagination */}
            <div className="flex justify-between mt-5">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="global_button"
              >
                Prev
              </button>

              <span>
                Page {page} of{" "}
                {Math.max(1, Math.ceil(total / limit) || 1)}
              </span>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={
                  total <= 0
                    ? true
                    : page >= Math.ceil(total / limit)
                }
                className="global_button"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* 🔹 Print — fetches all rows for current search, prints table only */}
        <button type="button" onClick={handlePrint} className="global_button mt-5">
          Print list
        </button>

      </div>

      {/* Off-screen: full list table for browser print (no actions / links) */}
      <div
        ref={printTableRef}
        className="print-snapshot-root bg-white text-black p-4"
        style={{
          position: "fixed",
          left: "-10000px",
          top: 0,
          width: "297mm",
          maxWidth: "100vw",
          zIndex: -1,
          pointerEvents: "none",
          opacity: rowsForPrint ? 1 : 0,
          visibility: rowsForPrint ? "visible" : "hidden",
        }}
        aria-hidden
      >
        {rowsForPrint && (
          <>
            <h1 className="text-xl font-bold mb-1">Service list</h1>
            <p className="text-sm text-gray-600 mb-4">
              {rowsForPrint.length} service{rowsForPrint.length !== 1 ? "s" : ""}
              {search ? ` · Search: "${search}"` : ""}
              {" · "}
              {new Date().toLocaleString("en-GB")}
            </p>
            <table className="w-full text-xs border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-2 py-1 text-left">#</th>
                  <th className="border border-gray-400 px-2 py-1 text-left">No</th>
                  <th className="border border-gray-400 px-2 py-1 text-left">Customer</th>
                  <th className="border border-gray-400 px-2 py-1 text-left">Mobile</th>
                  <th className="border border-gray-400 px-2 py-1 text-left">Service</th>
                  <th className="border border-gray-400 px-2 py-1 text-left">Serial/IMEI</th>
                  <th className="border border-gray-400 px-2 py-1 text-right">Cost</th>
                  <th className="border border-gray-400 px-2 py-1 text-right">Paid</th>
                  <th className="border border-gray-400 px-2 py-1 text-right">Due</th>
                  <th className="border border-gray-400 px-2 py-1 text-left">Status</th>
                  <th className="border border-gray-400 px-2 py-1 text-left">Date</th>
                  <th className="border border-gray-400 px-2 py-1 text-left">Delivery</th>
                </tr>
              </thead>
              <tbody>
                {rowsForPrint.map((item, index) => (
                  <tr key={item._id || index}>
                    <td className="border border-gray-400 px-2 py-1">{index + 1}</td>
                    <td className="border border-gray-400 px-2 py-1">{item.No ?? "—"}</td>
                    <td className="border border-gray-400 px-2 py-1">
                      {item.Customer?.name ?? "—"}
                    </td>
                    <td className="border border-gray-400 px-2 py-1">
                      {item.Customer?.mobile ?? "—"}
                    </td>
                    <td className="border border-gray-400 px-2 py-1">{item.Name ?? "—"}</td>
                    <td className="border border-gray-400 px-2 py-1">{item.Serial ?? "—"}</td>
                    <td className="border border-gray-400 px-2 py-1 text-right">৳{item.Cost ?? 0}</td>
                    <td className="border border-gray-400 px-2 py-1 text-right">৳{item.Paid ?? 0}</td>
                    <td className="border border-gray-400 px-2 py-1 text-right">৳{item.Due ?? 0}</td>
                    <td className="border border-gray-400 px-2 py-1">{item.Status ?? "—"}</td>
                    <td className="border border-gray-400 px-2 py-1">
                      {formatPrintDate(item.createdAt)}
                    </td>
                    <td className="border border-gray-400 px-2 py-1">
                      {formatPrintDate(item.DeliveryDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
      <AddServicePaymentModal
        open={!!paymentModalService}
        onClose={closePaymentModal}
        service={paymentModalService}
        onSuccess={fetchService}
      />
      <RefundServicePaymentModal
        open={!!refundModalService}
        onClose={closeRefundModal}
        service={refundModalService}
        onSuccess={fetchService}
        
      />

      {cancelConfirmService && (
        <div
          role="presentation"
          onClick={closeCancelConfirmModal}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center overflow-y-auto py-8 px-3"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-service-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-gray-900 dark:bg-[#1E2939] dark:text-white p-6 rounded-2xl w-full max-w-lg shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h2
              id="cancel-service-title"
              className="text-lg font-semibold mb-1"
            >
              Cancel this service?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <span className="font-medium">
                {cancelConfirmService.Name || "Service"}
              </span>
              {cancelConfirmService.Customer?.name && (
                <>
                  {" · "}
                  {cancelConfirmService.Customer.name}
                </>
              )}
              . This cannot be undone from here.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                className="global_button flex-1"
                onClick={closeCancelConfirmModal}
                disabled={updatingStatusId === cancelConfirmService._id}
              >
                No
              </button>
              <button
                type="button"
                className="global_button_red flex-1"
                onClick={() => handleCancelService(cancelConfirmService)}
                disabled={updatingStatusId === cancelConfirmService._id}
              >
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceList;