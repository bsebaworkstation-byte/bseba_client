import React, { useEffect, useRef, useState } from "react";
import loadingStore from "../../Zustand/LoadingStore";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper"; // ✅ SuccessToast যোগ করা হয়েছে
import { Link } from "react-router-dom";
import { printElement } from "../../Helper/Printer";
import { MdDeleteOutline } from "react-icons/md";
import { FaRegEye } from "react-icons/fa";
import Swal from "sweetalert2";
import api from "../../Helper/axios_resonse_interceptor";
import { can } from "../../Helper/permissionChecker";
import formatDateToLocal from "../../Helper/formatDate";
import TimeAgo from "../../Helper/UI/TimeAgo";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";

const PurchaseList = () => {
  const { setGlobalLoader } = loadingStore();
  const [purchases, setPurchases] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const printRef = useRef(null);
  // language translator
  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);

  const fetchPurchases = async () => {
    setGlobalLoader(true);
    try {
      const keyword = searchKeyword.trim() === "" ? 0 : searchKeyword;
      const res = await api.get(`/PurchasesList/${page}/${limit}/${keyword}`);

      if (res.data.status === "Success") {
        const purchasesDAta = res.data.data || [];
        setPurchases(purchasesDAta);
        setTotal(res.data.total || 0);
      } else {
        ErrorToast("Failed to fetch purchases");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
    } finally {
      setGlobalLoader(false);
    }
  };

  //  Delete Function
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
        title: "text-lg font-semibold",
        htmlContainer: "mt-2",
      },
      buttonsStyling: false,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setGlobalLoader(true);
          const response = await api.get(`/DeletePurchase/${id}`);
          if (String(response?.data?.status).toLowerCase() === "success") {
            SuccessToast(response.data.message || "Deleted Successfully");
            fetchPurchases();
          } else {
            ErrorToast(response.data?.message || "Delete failed");
          }
        } catch (error) {
          ErrorToast(
            error?.response?.data?.message || "faild to delete purchase",
          );
        } finally {
          setGlobalLoader(false);
        }
      }
    });
  };

  //Return function
  // const handleReturn = (id) => {
  //   console.log("retuend product id", id);
  // };

  useEffect(() => {
    fetchPurchases();
  }, [page, limit, searchKeyword]);

  return (
    <div className="global_container">
      {/* Header: Title + Per page + Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            {heading("purchaseList")}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Showing {purchases.length} of {total} Purchases
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          <input
            type="text"
            placeholder="Search by Supplier Name or Reference..."
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setPage(1);
            }}
            className="global_input"
          />
          <select
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value));
              setPage(1);
            }}
            className="global_dropdown"
          >
            {[20, 50, 100, 200].map((opt) => (
              <option key={opt} value={opt}>
                {opt} per page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="global_sub_container overflow-auto rounded-lg">
        <table className="global_table w-full" ref={printRef}>
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th">{table("no")}</th>
              <th className="global_th">{table("supplier")}</th>
              {/* <th className="global_th">Company</th>
              <th className="global_th">Address</th> */}
              <th className="global_th">{table("grandTotal")}</th>
              <th className="global_th">{table("paid")}</th>
              <th className="global_th">{table("due")}</th>
              <th className="global_th">{table("createdBy")}</th>
              <th className="global_th">{table("date")}</th>
              {can("ViewPurchases") && (
                <th className="global_th" id="no-print">
                  {table("action")}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="global_tbody">
            {purchases.length === 0 ? (
              <tr className="global_tr">
                <td colSpan={10} className="text-center py-4 text-gray-500">
                  No purchases found
                </td>
              </tr>
            ) : (
              purchases.map((p, idx) => (
                <tr className="global_tr" key={p._id}>
                  <td className="global_td">
                    {" "}
                    <Link
                      className="text-nowrap"
                      to={
                        can("ViewPurchases") ? `/PurchaseDetails/${p._id}` : "#"
                      }
                    >
                      {p?.referenceNo}
                    </Link>
                  </td>
                  <td className="global_td">
                    {
                      <span className="flex flex-col">
                        <span> {p.Supplier?.name || ""} </span>

                        <span>{p.Supplier?.address || ""}</span>
                      </span>
                    }
                  </td>
                  {/* <td className="global_td">
                    {p.Supplier?.[0]?.company || ""}
                  </td>
                  <td className="global_td min-w-[150px] max-w-[200px] truncate">
                    {p.Supplier?.[0]?.address || ""}
                  </td> */}
                  <td className="global_td">{p.grandTotal?.toFixed(2)}</td>
                  <td className="global_td">{p.paid?.toFixed(2)}</td>
                  <td className="global_td">{p.dueAmount?.toFixed(2)}</td>
                  <td className="global_td">{p.Users?.fullName || ""}</td>
                  <td className="global_td min-w-[100px]">
                    <span className="flex flex-col">
                      <span> {formatDateToLocal(p?.CreatedDate)} </span>

                      <span>
                        <TimeAgo date={p?.CreatedDate} />
                      </span>
                    </span>
                  </td>
                  {can("ViewPurchases") && (
                    <td className="global_td text-center" id="no-print">
                      <span>
                        <Link
                          className="global_button"
                          to={`/PurchaseDetails/${p._id}`}
                        >
                          {btn("view")}
                        </Link>
                        <Link
                          to={`/PurchaseReturn/${p._id}`}
                          className=" global_edit cursor-pointer mx-1"
                        >
                         {btn("return")}
                        </Link>
                        <span
                          onClick={() => handleDelete(p._id)}
                          className="global_button_red cursor-pointer  "
                        >
                          {btn("delete")}
                        </span>
                      </span>
                    </td>
                  )}
                </tr>
              ))
            )}
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

      <button
        onClick={() => {
          printElement(printRef, "any");
        }}
        className="global_button mt-5"
      >
        {btn("print")}
      </button>
    </div>
  );
};

export default PurchaseList;
