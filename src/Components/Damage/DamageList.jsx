import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { ErrorToast } from "../../Helper/FormHelper";
import { printElement } from "../../Helper/Printer";
import api from "../../Helper/axios_resonse_interceptor";
import formatDateToLocal from "../../Helper/formatDate";
import TimeAgo from "../../Helper/UI/TimeAgo";
import { formatCurrency } from "../../Helper/formatCurrency";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";

const DamageList = () => {
  const { setGlobalLoader } = loadingStore();
  const [damages, setDamages] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const printRef = useRef(null);

  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);

  const fetchDamages = async () => {
    setGlobalLoader(true);
    try {
      const keyword = searchKeyword.trim() === "" ? 0 : searchKeyword;
      const res = await api.get(`/DamageList/${page}/${limit}/${keyword}`);

      if (res.data.status === "Success") {
        setDamages(res.data.data || []);
        setTotal(res.data.total || 0);
      } else {
        ErrorToast("Failed to fetch damage list");
      }
    } catch (error) {
      setDamages([]);
      setTotal(0);
      ErrorToast("Something went wrong while fetching damage list");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchDamages();
  }, [page, limit, searchKeyword]);

  const totalAmount = damages.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0,
  );

  return (
    <div className="global_container">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            {heading("damageList")}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Showing {damages.length} of {total} damages
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          <input
            type="text"
            placeholder="Search by reference..."
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
            {[5, 20, 50, 100].map((opt) => (
              <option key={opt} value={opt}>
                {opt} per page
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="global_sub_container overflow-auto rounded-lg">
        <table className="global_table w-full" ref={printRef}>
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th">#</th>
              <th className="global_th">{table("reference")}</th>
              <th className="global_th">{table("total")}</th>
              <th className="global_th">{table("createdBy")}</th>
              <th className="global_th">{table("date")}</th>
              <th className="global_th" id="no-print">
                {table("action")}
              </th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {damages.length === 0 ? (
              <tr className="global_tr">
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No damage records found
                </td>
              </tr>
            ) : (
              damages.map((item, idx) => (
                <tr className="global_tr" key={item._id}>
                  <td className="global_td">
                    {(page - 1) * limit + idx + 1}
                  </td>
                  <td className="global_td">
                    <Link
                      to={`/DamageDetails/${item._id}`}
                      className="text-nowrap"
                    >
                      {item.referenceNo || "N/A"}
                    </Link>
                  </td>
                  <td className="global_td">
                    {formatCurrency(item.total || 0)}
                  </td>
                  <td className="global_td">
                    {item.Users?.[0]?.fullName || "N/A"}
                  </td>
                  <td className="global_td min-w-[100px]">
                    <span className="flex flex-col">
                      <span>{formatDateToLocal(item.CreatedDate)}</span>
                      <span>
                        <TimeAgo date={item.CreatedDate} />
                      </span>
                    </span>
                  </td>
                  <td className="global_td" id="no-print">
                    <Link
                      to={`/DamageDetails/${item._id}`}
                      className="global_button"
                    >
                      {btn("view")}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {damages.length > 0 && (
            <tfoot>
              <tr className="global_tr">
                <td colSpan={2} className="global_td font-medium">
                  {table("total")}
                </td>
                <td className="global_td font-medium">
                  {formatCurrency(totalAmount)}
                </td>
                <td colSpan={3} className="global_td" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

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
        onClick={() => printElement(printRef, "DamageList")}
        className="global_button mt-5"
      >
        {btn("print")}
      </button>
    </div>
  );
};

export default DamageList;
