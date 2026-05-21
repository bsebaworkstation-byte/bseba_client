import { useEffect, useState } from "react";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import api from "../../Helper/axios_resonse_interceptor";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";

const PurchaseReturnList = () => {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { setGlobalLoader } = loadingStore();
  // language translator
  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);
  const formTrans = useTextTranslate(GlobalFormTranslator);

  // Fetch purchase return list
  const fetchPurchaseReturns = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/PurchaseReturnList/${page}/${limit}/${search || 0}`,
      );
      if (res.data.status === "Success") {
        const reversedData = (res.data.data || []).slice().reverse();

        setReturns(reversedData);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      ErrorToast("Failed to load purchase return list");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchPurchaseReturns();
  }, [page, limit, search]);

  // Delete Handle (if needed)
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
          const response = await api.get(`/DeletePurchaseReturn/${id}`);

          if (response.data.status === "Success") {
            SuccessToast(response.data.message);
            setReturns((prev) => prev.filter((r) => r._id !== id));
            setTotal((prevTotal) => prevTotal - 1);
          } else {
            ErrorToast(response.data.message);
          }
        } catch (error) {
          ErrorToast(
            error.response?.data?.message || "Failed to delete return",
          );
        } finally {
          setGlobalLoader(false);
        }
      }
    });
  };

  return (
    <div className="global_container">
      <div className="global_sub_container">
        {/* Header + Search + Limit */}
        <div className="py-2">
          <h2 className="text-xl font-semibold flex flex-col">
            {heading("purchaseReturnList")}
            <span className="text-sm">
              Showing {returns.length} of {total} records
            </span>
          </h2>
          <div className=" flex gap-3 flex-col sm:flex-row justify-end ">
            <input
              type="text"
              placeholder="Search returns..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="global_input max-w-xs"
            />

            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setPage(1);
              }}
              className="global_dropdown sm:w-fit"
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
        {returns.length > 0 ? (
          <div>
            <div className="overflow-x-auto">
              <table className="global_table">
                <thead className="global_thead">
                  <tr className="">
                    <th className="global_th">#</th>
                    <th className="global_th">{table("reference")} {table("no")}</th>
                    <th className="global_th">{table("customer")}</th>
                    <th className="global_th">{table("mobile")}</th>
                    <th className="global_th">{table("address")}</th>
                    <th className="global_th">{table("total")}</th>
                    <th className="global_th">{formTrans("note")}</th>
                    <th className="global_th">{table("date")}</th>
                    <th className="global_th">{table("action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((returnProduct, i) => (
                    <tr key={returnProduct._id}>
                      <td className="global_td">{i + 1}</td>
                      <td className="global_td">{returnProduct.referenceNo}</td>
                      <td className="global_td">
                        {returnProduct.contact?.name || "N/A"}
                      </td>
                      <td className="global_td">
                        {returnProduct.contact?.mobile || "N/A"}
                      </td>
                      <td className="global_td">
                        {returnProduct.contact?.address || "N/A"}
                      </td>
                      <td className="global_td">
                        {returnProduct.total.toFixed(2)}
                      </td>
                      <td className="global_td">{returnProduct.note || "-"}</td>
                      {/* <td className="global_td">
                        {new Date(
                          returnProduct.CreatedDate
                        ).toLocaleDateString()}
                      </td> */}
                      <td className="global_td">
                        {new Date(returnProduct.CreatedDate)
                          .toLocaleDateString("en-GB")
                          .replace(/\//g, "-")}
                      </td>
                      <td className="global_td">
                        <button
                          onClick={() =>
                            navigate(
                              `/PurchaseReturnDetails/${returnProduct._id}`,
                            )
                          }
                          className="global_button"
                        >
                          {btn("view")}
                        </button>
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
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No purchase returns found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseReturnList;
