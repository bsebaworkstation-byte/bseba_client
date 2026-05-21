import React, { useEffect, useRef, useState } from "react";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { printElement } from "../../Helper/Printer";
import Swal from "sweetalert2";
import loadingStore from "../../Zustand/LoadingStore";
import { useNavigate } from "react-router-dom";
import api from "../../Helper/axios_resonse_interceptor";
import { can } from "../../Helper/permissionChecker";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";

const SaleReturnList = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const { setGlobalLoader } = loadingStore();
  const printRef = useRef(null);
  const navigate = useNavigate();

  // language translator
  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);
  const formTrans = useTextTranslate(GlobalFormTranslator);

  const fetchReturns = async (pageNumber = 1, searchTerm = "") => {
    // setLoading(true);
    setGlobalLoader(true);
    try {
      const res = await api.get(`/SaleReturnList/${pageNumber}/${limit}/0`);

      if (res.data.status === "Success") {
        let data = res.data.data;

        // Apply search filter locally (by referenceNo or note)
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          data = data.filter(
            (ret) =>
              ret.referenceNo?.toLowerCase().includes(term) ||
              ret.note?.toLowerCase().includes(term),
          );
        }

        setReturns(data);
        setTotal(res.data.total || data.length);
      } else {
        ErrorToast("Failed to fetch sale returns");
      }
    } catch (err) {
      console.error(err);
      ErrorToast("Something went wrong while fetching sale returns");
    } finally {
      // setLoading(false);
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchReturns(page, search);
  }, [page, search]);

  // handle delete function
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title:
        '<span class="global-font-color">এই বিক্রয় রিটার্ন ডিলিট করবেন??</span>',
      html: '<p class="form-custom-label">ডিলিট করলে এই তথ্য আর ফেরত পাবেন না।</p>',
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
          "rounded-lg border border-white/20 dark:border-gray-700/50 shadow-xl backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 global-border",
        confirmButton:
          "px-4 py-2 bg-red-600/90 hover:bg-red-700/90 text-white rounded-md font-medium transition-colors backdrop-blur-sm ml-3 btn btn-sm global-gradient-color",
        cancelButton:
          "px-4 py-2 bg-white/90 dark:bg-gray-700/90 hover:bg-gray-100/90 dark:hover:bg-gray-600/90 text-gray-800 dark:text-gray-200 border border-white/20 dark:border-gray-600/50 rounded-md font-medium transition-colors ml-2 backdrop-blur-sm btn btn-sm global-border-btn",
        title: "text-lg font-semibold global-swal2-title-custom",
        htmlContainer: "mt-2 global-swal2-html-custom",
      },
      buttonsStyling: false,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const response = await api.get(`/DeleteSaleReturn/${id}`);

      //  এখানে চেক করো সব ধরনের success status
      if (
        response.data.status?.toLowerCase() === "success" ||
        response.data.statusCode === 200
      ) {
        SuccessToast(
          response.data.message || "Sale return deleted successfully.",
        );

        //  সঙ্গে সঙ্গে UI থেকে item remove
        setReturns((prev) => prev.filter((item) => item._id !== id));

        // total সংখ্যা কমাও
        setTotal((prevTotal) => Math.max(prevTotal - 1, 0));
      } else {
        ErrorToast(response.data.message || "Failed to delete sale return.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      ErrorToast("Failed to delete sale return.");
    }
  };

  const handlePrint = () => {
    printElement(printRef, "testing");
  };

  const handleAction = (action, returnId) => {
    switch (action) {
      case "view1":
        navigate(`/SaleReturnDetails/${returnId}`);
        break;
      case "view2":
        navigate(`/SaleReturnDetailsV2/${returnId}`);
        break;
      case "delete":
        handleDelete(returnId);
        break;
      default:
        break;
    }
  };

  return (
    <div className="global_container">
      <div className="global_sub_container">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          {heading("saleReturnList")}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Showing {returns.length} of {total} Sales
        </p>

        <div className="flex gap-2 items-center justify-end">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search by Reference or Note"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to first page on search
              }}
              className="global_input w-full lg:w-64"
            />
          </div>
          <div>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setPage(1);
              }}
              className="global_dropdown"
            >
              {[10, 20, 50, 100].map((opt) => (
                <option key={opt} value={opt}>
                  {opt} per page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="global_sub_container">
        {/* Table and pagination under below */}
        {loading ? (
          <div>Loading...</div>
        ) : returns.length === 0 ? (
          <div className="text-center">No sale returns found</div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              {" "}
              <table className="global_table w-full" ref={printRef}>
                <thead className="global_thead">
                  <tr className="global_tr">
                    <th className="global_th">#</th>
                    <th className="global_th">{table("reference")}</th>
                    <th className="global_th">{table("customer")} </th>
                    <th className="global_th">{table("mobile")}</th>
                    <th className="global_th">{table("address")} </th>
                    <th className="global_th">{table("total")}</th>
                    <th className="global_th">{formTrans("note")}</th>
                    <th className="global_th">{table("date")}</th>
                    <th className="global_th">{table("action")}</th>
                  </tr>
                </thead>
                <tbody className="global_tbody">
                  {returns.map((ret, idx) => (
                    <tr className="global_tr" key={ret._id}>
                      <td className="global_td">
                        {(page - 1) * limit + idx + 1}
                      </td>
                      <td className="global_td">{ret.referenceNo}</td>
                      <td className="global_td">
                        {ret?.contact?.name || "N/A"}
                      </td>
                      <td className="global_td">
                        {ret?.contact?.mobile || "N/A"}
                      </td>
                      <td className="global_td">
                        {ret?.contact?.address || "N/A"}
                      </td>
                      <td className="global_td min-w-[100px]">
                        {ret?.total?.toFixed(2)}
                      </td>
                      <td className="global_td">{ret?.note || "N/A"}</td>
                      <td className="global_td">
                        {(() => {
                          const d = new Date(ret.CreatedDate);
                          const day = String(d.getDate()).padStart(2, "0");
                          const month = String(d.getMonth() + 1).padStart(
                            2,
                            "0",
                          );
                          const year = d.getFullYear();
                          return `${day}-${month}-${year}`;
                        })()}
                      </td>

                      <td className="global_td">
                        <select
                          className="global_dropdown"
                          defaultValue=""
                          onChange={(e) => {
                            const action = e.target.value;
                            e.target.value = ""; // reset select
                            handleAction(action, ret._id);
                          }}
                        >
                          <option value="" disabled>
                            Select
                          </option>
                          <option value="view1">View 1</option>
                          <option value="view2">View 2</option>

                          {can("isAdmin") && (
                            <option value="delete">Delete</option>
                          )}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > 0 && (
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-r-md rounded-l-full ${
                    page === 1
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "global_button"
                  }`}
                >
                  {table("previous")}
                </button>

                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {table("page")} {page} {table("of")} {Math.ceil(total / limit)}
                </span>

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                  className={`px-4 py-2 rounded-l-md rounded-r-full ${
                    page >= Math.ceil(total / limit)
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "global_button"
                  }`}
                >
                  {table("next")}
                </button>
              </div>
            )}
          </div>
        )}
        {returns.length === 0 ? (
          ""
        ) : (
          <button
            onClick={() => {
              handlePrint();
            }}
            className="global_button mt-5 lg:w-fit w-full"
          >
            print
          </button>
        )}
      </div>
    </div>
  );
};

export default SaleReturnList;
