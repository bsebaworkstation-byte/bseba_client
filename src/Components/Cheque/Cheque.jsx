import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../Helper/axios_resonse_interceptor";
import loadingStore from "../../Zustand/LoadingStore";
import { ErrorToast, SuccessToast, ConfirmToast } from "../../Helper/FormHelper";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

export default function Cheque() {
  const { setGlobalLoader } = loadingStore();

  // State
  const [cheques, setCheques] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("Pending");
  const [typeFilter, setTypeFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // Made limit stateful with setter
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [actionLoading, setActionLoading] = useState({});



  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);



  // Fetch cheques
  const fetchCheques = useCallback(async () => {
    setGlobalLoader(true);

    try {
      let url = "";
      switch (status) {
        case "Pending":
          url = "/PendingChequeList";
          break;
        case "Deposited":
          url = "/DepositedChequeList";
          break;
        case "Bounce":
          url = "/BounceChequeList";
          break;
        case "Cleared":
          url = `/ClearedChequeList/${page}/${limit}`;
          break;
        default:
          url = "/PendingChequeList";
      }

      const res = await api.get(url);

      if (res.data.status === "success") {
        setCheques(res.data.data || []);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
          setTotalRecords(res.data.pagination.totalRecords || 0);
        }
      } else {
        ErrorToast(res.data.message || "Failed to fetch cheque list");
        setCheques([]);
      }
    } catch (error) {
      console.error("Fetch cheques error:", error);
      ErrorToast(error.response?.data?.message || "Failed to fetch cheques");
      setCheques([]);
    } finally {
      setGlobalLoader(false);
    }
  }, [status, page, limit, setGlobalLoader]);

  // Fetch counts whenever cheques are updated or status changes
  useEffect(() => {
    fetchCheques();
  }, [fetchCheques,]);

  // Reset page when limit changes
  useEffect(() => {
    if (status === "Cleared") {
      setPage(1);
    }
  }, [limit, status]);

  const formatDate = useCallback((date) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd-MM-yyyy");
    } catch {
      return String(date);
    }
  }, []);

  // Calculate totals based on filtered cheques
  const calculateTotals = useCallback((chequesList) => {
    return chequesList.reduce((acc, cheque) => {
      const amount = parseFloat(cheque.amount || 0);
      if (cheque.type === "Payment") {
        acc.totalPayment += amount;
      } else if (cheque.type === "Receive") {
        acc.totalReceive += amount;
      }
      acc.grandTotal = acc.totalReceive - acc.totalPayment;
      return acc;
    }, { totalPayment: 0, totalReceive: 0, grandTotal: 0 });
  }, []);

  // Apply filters (search and type)
  const filteredCheques = useMemo(() => {
    let filtered = cheques;

    // Apply search filter
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter((c) => {
        const searchString = `${c.contactDetails?.name || ""} ${c.contactDetails?.mobile || ""} ${c.chequeNo || ""} ${c.amount || ""}`.toLowerCase();
        return searchString.includes(searchLower);
      });
    }

    // Apply type filter
    if (typeFilter !== "All") {
      filtered = filtered.filter((c) => c.type === typeFilter);
    }

    return filtered;
  }, [cheques, debouncedSearch, typeFilter]);

  // Calculate totals for filtered cheques
  const totals = useMemo(() => calculateTotals(filteredCheques), [filteredCheques, calculateTotals]);

  const handleAction = async (id, action, endpoint, payload = {}) => {
    if (action === "Bounce" || action === "Clear") {
      const confirmed = await ConfirmToast(
        `Are you sure you want to ${action.toLowerCase()} this cheque?`,
        "Confirm Action"
      );
      if (!confirmed) return;
    }

    setActionLoading(prev => ({ ...prev, [id]: true }));

    try {
      const res = await api.post(endpoint, {
        ChequeID: id,
        [`${action.toLowerCase()}Date`]: new Date().toISOString(),
        ...payload
      });

      if (res.data.status === "success") {
        SuccessToast(`Cheque ${action.toLowerCase()}ed successfully`);
        await fetchCheques();
      } else {
        ErrorToast(res.data.message || `${action} failed`);
      }
    } catch (error) {
      console.error(`${action} error:`, error);
      ErrorToast(error.response?.data?.message || `${action} failed`);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: '<span class="text-gray-900 dark:text-white">Are you sure?</span>',
      html: '<p class="text-gray-600 dark:text-gray-300">This action cannot be undone!</p>',
      icon: "warning",
      showCancelButton: true,
      background: "rgba(255, 255, 255, 0.2)",
      backdrop: `
      rgba(0,0,0,0.4)
      url("/images/nyan-cat.gif")
      left top
      no-repeat
    `,
      customClass: {
        popup:
          "rounded-lg border border-white/20 dark:border-gray-700/50 shadow-xl backdrop-blur-lg bg-white/80 dark:bg-gray-800/80",
        confirmButton:
          "px-4 py-2 bg-red-600/90 hover:bg-red-700/90 text-white rounded-md font-medium transition-colors backdrop-blur-sm ml-3",
        cancelButton:
          "px-4 py-2 bg-white/90 dark:bg-gray-700/90 hover:bg-gray-100/90 dark:hover:bg-gray-600/90 text-gray-800 dark:text-gray-200 border border-white/20 dark:border-gray-600/50 rounded-md font-medium transition-colors ml-2 backdrop-blur-sm",
      },
      buttonsStyling: false,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {

          setGlobalLoader(true);

          const response = await api.get(`/DeleteCheque/${id}`);

          if (String(response?.data?.status).toLowerCase() === "success") {

            SuccessToast(response.data.message || "Deleted Successfully");

            await fetchCheques(); 

          } else {

            ErrorToast(response.data?.message || "Delete failed");

          }

        } catch (error) {

          ErrorToast(error?.response?.data?.message || "Failed to delete");

        } finally {

          setGlobalLoader(false);

        }
      }
    });
  };

  const handleClear = (id) => handleAction(id, "Clear", "/ClearCheque");
  const handleDeposit = (id) => handleAction(id, "Deposit", "/DepositCheque");
  const handleBounce = (id) => handleAction(id, "Bounce", "/BounceCheque");

  const getStatusBadgeClass = (status) => {
    const classes = {
      Pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      Deposited: "bg-blue-100 text-blue-700 border border-blue-200",
      Cleared: "bg-green-100 text-green-700 border border-green-200",
      Bounce: "bg-red-100 text-red-700 border border-red-200"
    };
    return classes[status] || "bg-gray-100 text-gray-700 border border-gray-200";
  };

  // Limit options
  const limitOptions = [5, 10, 25, 50, 100];

  return (
    <div className="global_container">
      <div className="global_sub_container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Cheque Management</h1>
          <Link
            to="/AddCheque"
            className="global_button bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + Add New Cheque
          </Link>
        </div>

        {/* Status Tabs with counts */}


        {/* Search and Type Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name, mobile, cheque no, or amount..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="global_input flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Type Filter Dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[150px]"
          >
            <option value="All">All Types</option>
            <option value="Payment">Payment</option>
            <option value="Receive">Receive</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-600 font-medium mb-1">Total Payment</div>
            <div className="text-2xl font-bold text-red-700">
              ৳{totals.totalPayment.toFixed(2)}
            </div>
            <div className="text-xs text-red-500 mt-1">
              {filteredCheques.filter(c => c.type === "Payment").length} cheques
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium mb-1">Total Receive</div>
            <div className="text-2xl font-bold text-green-700">
              ৳{totals.totalReceive.toFixed(2)}
            </div>
            <div className="text-xs text-green-500 mt-1">
              {filteredCheques.filter(c => c.type === "Receive").length} cheques
            </div>
          </div>

          <div className={`${totals.grandTotal >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} rounded-lg p-4`}>
            <div className={`text-sm ${totals.grandTotal >= 0 ? 'text-blue-600' : 'text-orange-600'} font-medium mb-1`}>
              {totals.grandTotal >= 0 ? 'Net Receivable' : 'Net Payable'}
            </div>
            <div className={`text-2xl font-bold ${totals.grandTotal >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              ৳{Math.abs(totals.grandTotal).toFixed(2)}
              {totals.grandTotal < 0 && <span className="text-sm ml-1">(Payable)</span>}
            </div>
            <div className={`text-xs ${totals.grandTotal >= 0 ? 'text-blue-500' : 'text-orange-500'} mt-1`}>
              {filteredCheques.length} total cheques
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="global_table w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="global_th px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="global_th px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="global_th px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                <th className="global_th px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cheque No</th>
                <th className="global_th px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="global_th px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                <th className="global_th px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cheque Date</th>
                <th className="global_th px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="global_th px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="global_th px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCheques.length > 0 ? (
                filteredCheques.map((c, index) => (
                  <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                    <td className="global_td px-4 py-3">{(page - 1) * limit + index + 1}</td>
                    <td className="global_td px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {c.contactDetails?.name || "-"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {c.contactDetails?.mobile || "-"}
                        </span>
                        {c.contactDetails?.contactPerson && (
                          <span className="text-xs text-gray-400">
                            {c.contactDetails.contactPerson}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="global_td px-4 py-3">
                      <span className="text-gray-900">{c.accountDetails?.name || "-"}</span>
                    </td>
                    <td className="global_td px-4 py-3 font-mono">{c.chequeNo || "-"}</td>
                    <td className="global_td px-4 py-3">
                      <span className={`font-semibold ${c.type === "Payment" ? "text-red-600" : "text-green-600"
                        }`}>
                        ৳{parseFloat(c.amount || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="global_td px-4 py-3">{formatDate(c.issueDate)}</td>
                    <td className="global_td px-4 py-3">{formatDate(c.chequeDate)}</td>
                    <td className="global_td px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${c.type === "Payment"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                        }`}>
                        {c.type || "-"}
                      </span>
                    </td>
                    <td className="global_td px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(c.status)}`}>
                        {c.status || "Unknown"}
                      </span>
                    </td>
                    <td className="global_td px-4 py-3">
                      <div className="flex gap-2">
                        {c.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleClear(c._id)}
                              disabled={actionLoading[c._id]}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm transition-colors"
                            >
                              {actionLoading[c._id] ? "..." : "Clear"}
                            </button>
                            <button
                              onClick={() => handleDeposit(c._id)}
                              disabled={actionLoading[c._id]}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm transition-colors"
                            >
                              {actionLoading[c._id] ? "..." : "Deposit"}
                            </button>
                            <button
                              onClick={() => handleDelete(c._id)}
                              disabled={actionLoading[c._id]}
                              className="global_button_red"
                            >
                              {actionLoading[c._id] ? "..." : "Delete"}
                            </button>
                          </>
                        )}

                        {c.status === "Deposited" && (
                          <>
                            <button
                              onClick={() => handleClear(c._id)}
                              disabled={actionLoading[c._id]}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm transition-colors"
                            >
                              {actionLoading[c._id] ? "..." : "Clear"}
                            </button>
                            <button
                              onClick={() => handleBounce(c._id)}
                              disabled={actionLoading[c._id]}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 text-sm transition-colors"
                            >
                              {actionLoading[c._id] ? "..." : "Bounce"}
                            </button>
                          </>
                        )}

                        {c.status === "Bounce" && (
                          <button
                            onClick={() => handleClear(c._id)}
                            disabled={actionLoading[c._id]}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm transition-colors"
                          >
                            {actionLoading[c._id] ? "..." : "Clear"}
                          </button>
                        )}

                        {c.status === "Cleared" && (
                          <span className="text-sm text-gray-400 italic">Completed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-500">
                    {cheques.length === 0 ? "No cheques found" : "No matching records"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Results Info and Limit Dropdown */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-600 gap-4">
          <div>
            Showing {filteredCheques.length} of {status === "Cleared" ? totalRecords : cheques.length} cheques
            {typeFilter !== "All" && ` (filtered by ${typeFilter})`}
          </div>

          {/* Limit Dropdown - Only show for Cleared tab */}
          {status === "Cleared" && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Show:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {limitOptions.map(option => (
                  <option key={option} value={option}>{option} per page</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Pagination for Cleared */}
        {status === "Cleared" && totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <select
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}