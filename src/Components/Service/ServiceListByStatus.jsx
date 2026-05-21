import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../Helper/axios_resonse_interceptor";
import loadingStore from "../../Zustand/LoadingStore";
import { ErrorToast } from "../../Helper/FormHelper";
import TimeAgo from "../../Helper/UI/TimeAgo";
import { printElement } from "../../Helper/Printer";

const ServiceListByStatus = () => {
  const { status: statusParam } = useParams();
  const navigate = useNavigate();
  const { setGlobalLoader } = loadingStore();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const printTableRef = useRef(null);
  const [rowsForPrint, setRowsForPrint] = useState(null);

  const statusLabel = statusParam ? decodeURIComponent(statusParam) : "";

  useEffect(() => {
    if (!statusLabel) return;

    const fetchList = async () => {
      setGlobalLoader(true);
      try {
        const path = `/ServiceListByStatus/${page}/${limit}/${encodeURIComponent(statusLabel)}`;
        const res = await api.get(path);

        if (res.data.status === "Success") {
          setRows(res.data.data || []);
          setTotal(Number(res.data.total) || 0);
        } else {
          setRows([]);
          setTotal(0);
          ErrorToast(res.data.message || "Failed to load services");
        }
      } catch (err) {
        console.error(err);
        setRows([]);
        setTotal(0);
        ErrorToast(err.response?.data?.message || "Failed to load services");
      } finally {
        setGlobalLoader(false);
      }
    };

    fetchList();
  }, [page, limit, statusLabel]);

  useEffect(() => {
    if (!rowsForPrint) return;
    const id = requestAnimationFrame(() => {
      printElement(printTableRef, "Services by status");
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
    if (!statusLabel) return;
    const fetchCount = Math.max(total, rows.length, 1);
    setGlobalLoader(true);
    try {
      const path = `/ServiceListByStatus/1/${fetchCount}/${encodeURIComponent(statusLabel)}`;
      const res = await api.get(path);
      if (res.data.status !== "Success") {
        ErrorToast(res.data.message || "Failed to load services for print");
        return;
      }
      const data = res.data.data || [];
      if (data.length === 0) {
        ErrorToast("No services to print");
        return;
      }
      setRowsForPrint(data);
    } catch (err) {
      console.error(err);
      ErrorToast(err.response?.data?.message || "Failed to load services for print");
    } finally {
      setGlobalLoader(false);
    }
  };

  if (!statusLabel) {
    return (
      <div className="global_container">
        <p className="text-gray-500">Invalid status.</p>
        <button type="button" className="global_button mt-4" onClick={() => navigate("/ServiceReport")}>
          Back to service report
        </button>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="global_container">
      <div className="global_sub_container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <button
              type="button"
              onClick={() => navigate("/ServiceReport")}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2"
            >
              ← Service report
            </button>
            <h1 className="text-xl font-semibold">
              Services · <span className="text-emerald-600 dark:text-emerald-400">{statusLabel}</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {total} service{total !== 1 ? "s" : ""} total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Per page</label>
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
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No services in this status.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="global_table w-full min-w-[900px]">
              <thead className="global_thead">
                <tr>
                  <th className="global_th">#</th>
                  <th className="global_th">No</th>
                  <th className="global_th">Customer</th>
                  <th className="global_th">Service</th>
                  <th className="global_th">Serial</th>
                  <th className="global_th text-right">Cost</th>
                  <th className="global_th text-right">Paid</th>
                  <th className="global_th text-right">Due</th>
                  <th className="global_th text-right">Refund</th>
                  <th className="global_th">Status</th>
                  <th className="global_th">Created</th>
                  <th className="global_th">Delivery</th>
                  <th className="global_th"> </th>
                </tr>
              </thead>
              <tbody className="global_tbody">
                {rows.map((item, index) => (
                  <tr key={item._id} className="global_tr">
                    <td className="global_td">{(page - 1) * limit + index + 1}</td>
                    <td className="global_td font-medium">{item.No}</td>
                    <td className="global_td">
                      <div className="flex flex-col">
                        <span>{item.Customer?.name}</span>
                        <span className="text-xs text-gray-500">{item.Customer?.mobile}</span>
                      </div>
                    </td>
                    <td className="global_td">{item.Name}</td>
                    <td className="global_td">{item.Serial || "—"}</td>
                    <td className="global_td text-right">৳{item.Cost}</td>
                    <td className="global_td text-right text-green-600">৳{item.Paid}</td>
                    <td className={`global_td text-right ${item.Due > 0 ? "text-red-500 font-semibold" : ""}`}>
                      ৳{item.Due}
                    </td>
                    <td className="global_td text-right text-amber-600 dark:text-amber-400">
                      ৳{item.Refund ?? 0}
                    </td>
                    <td className="global_td">{item.Status}</td>
                    <td className="global_td text-sm whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")}{" "}
                      <TimeAgo date={item.createdAt} />
                    </td>
                    <td className="global_td text-sm whitespace-nowrap">
                      {new Date(item.DeliveryDate).toLocaleDateString("en-GB").replace(/\//g, "-")}
                    </td>
                    <td className="global_td">
                      <Link
                        to={`/ServiceDetails/${item._id}`}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > 0 && (
          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              className="global_button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="global_button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}

        <button type="button" onClick={handlePrint} className="global_button mt-5">
          Print list
        </button>
      </div>

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
            <h1 className="text-xl font-bold mb-1">Services by status</h1>
            <p className="text-sm text-gray-600 mb-4">
              Status: <strong>{statusLabel}</strong>
              {" · "}
              {rowsForPrint.length} service{rowsForPrint.length !== 1 ? "s" : ""}
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
                  <th className="border border-gray-400 px-2 py-1 text-right">Refund</th>
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
                    <td className="border border-gray-400 px-2 py-1 text-right">৳{item.Refund ?? 0}</td>
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
    </div>
  );
};

export default ServiceListByStatus;
