import React, { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Link, useLocation, useParams } from "react-router-dom";
import api from "../../Helper/axios_resonse_interceptor";
import loadingStore from "../../Zustand/LoadingStore";
import { ErrorToast } from "../../Helper/FormHelper";
import { formatCurrency } from "../../Helper/formatCurrency";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
const InvestmentReport = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const { setGlobalLoader } = loadingStore();
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);

  const heading = useTextTranslate(HeadingTranslate);
  const table = useTextTranslate(GlobalTableTranslator);

  const fetchReport = useCallback(async () => {
    if (!id) return;

    setGlobalLoader(true);
    try {
      const res = await api.get(`/investmentReport/${id}`);
      if (res.data.status === "success") {
        setSummary(res.data.summary || null);
        setRows(res.data.data || []);
      } else {
        ErrorToast(res.data.message || "Failed to load investment report");
        setSummary(null);
        setRows([]);
      }
    } catch (error) {
      ErrorToast(
        error.response?.data?.message || "Failed to load investment report",
      );
      setSummary(null);
      setRows([]);
    } finally {
      setGlobalLoader(false);
    }
  }, [id, setGlobalLoader]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const formatDate = (date) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd-MM-yyyy hh:mm a");
    } catch {
      return String(date);
    }
  };

  const getRowType = (row) => {
    if (row.Credit) return { label: table("receive"), amount: row.Credit, tone: "text-green-600" };
    if (row.Debit) return { label: table("return"), amount: row.Debit, tone: "text-red-600" };
    return { label: "-", amount: 0, tone: "" };
  };

  const totalReceive = Number(summary?.totalReceive || 0);
  const totalReturn = Number(summary?.totalReturn || 0);
  const netBalance = totalReceive - totalReturn;
  const investorName = state?.investorName || "";
  const investorMobile = state?.investorMobile || "";

  return (
    <div className="global_container">
      <div className="global_sub_container mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="global_heading">{heading("investmentReport")}</h1>
            {(investorName || investorMobile) && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {[investorName, investorMobile].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <Link to="/InvestorList" className="global_edit w-fit">
            Back to list
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {table("totalReceive")}
            </p>
            <p className="text-xl font-semibold text-green-600 mt-1">
              {formatCurrency(totalReceive)}
            </p>
          </div>
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {table("totalReturn")}
            </p>
            <p className="text-xl font-semibold text-red-600 mt-1">
              {formatCurrency(totalReturn)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {table("netBalance")}
            </p>
            <p
              className={`text-xl font-semibold mt-1 ${
                netBalance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(netBalance)}
            </p>
          </div>
        </div>
      </div>

      <div className="global_sub_container">
        <div className="overflow-x-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr>
                <th className="global_th">#</th>
                <th className="global_th">{table("date")}</th>
                <th className="global_th">{table("account")}</th>
                <th className="global_th">{table("type")}</th>
                <th className="global_th">{table("amount")}</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {rows.length > 0 ? (
                rows.map((row, index) => {
                  const rowType = getRowType(row);
                  return (
                    <tr key={row._id} className="global_tr">
                      <td className="global_td">{index + 1}</td>
                      <td className="global_td">{formatDate(row.CreatedDate)}</td>
                      <td className="global_td">{row.accountName || "-"}</td>
                      <td className={`global_td font-medium ${rowType.tone}`}>
                        {rowType.label}
                      </td>
                      <td className={`global_td font-medium ${rowType.tone}`}>
                        {formatCurrency(Number(rowType.amount || 0))}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="global_td text-center py-8">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvestmentReport;
