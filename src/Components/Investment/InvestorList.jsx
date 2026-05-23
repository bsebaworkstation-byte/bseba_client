import React, { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import api from "../../Helper/axios_resonse_interceptor";
import loadingStore from "../../Zustand/LoadingStore";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { formatCurrency } from "../../Helper/formatCurrency";
import GlobalPhoneInput from "../../Helper/GlobalPhoneInput";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";

const InvestorList = () => {
  const { setGlobalLoader } = loadingStore();
  const [investors, setInvestors] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", mobile: "" });

  const heading = useTextTranslate(HeadingTranslate);
  const table = useTextTranslate(GlobalTableTranslator);
  const formTrans = useTextTranslate(GlobalFormTranslator);
  const btn = useTextTranslate(GlobalBtnTranslator);

  const fetchInvestors = useCallback(async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get("/InvestorList");
      if (res.data.status === "success") {
        setInvestors(res.data.data || []);
      } else {
        ErrorToast(res.data.message || "Failed to fetch investor list");
        setInvestors([]);
      }
    } catch (error) {
      ErrorToast(
        error.response?.data?.message || "Failed to fetch investor list",
      );
      setInvestors([]);
    } finally {
      setGlobalLoader(false);
    }
  }, [setGlobalLoader]);

  useEffect(() => {
    fetchInvestors();
  }, [fetchInvestors]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ name: "", mobile: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name?.trim()) {
      ErrorToast("Investor name is required");
      return;
    }

    if (!form.mobile?.trim()) {
      ErrorToast("Mobile number is required");
      return;
    }

    setGlobalLoader(true);
    try {
      const res = await api.post("/AddInvestor", {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
      });

      if (res.data.status === "success") {
        SuccessToast("Investor created successfully");
        resetForm();
        fetchInvestors();
      } else {
        ErrorToast(res.data.message || "Failed to create investor");
      }
    } catch (error) {
      ErrorToast(
        error.response?.data?.message || "Failed to create investor",
      );
    } finally {
      setGlobalLoader(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd-MM-yyyy");
    } catch {
      return String(date);
    }
  };

  const filteredInvestors = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return investors;

    return investors.filter((investor) => {
      const haystack = [
        investor.name,
        investor.mobile,
        investor.UserMobile,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [investors, search]);

  const totalBalance = useMemo(
    () =>
      filteredInvestors.reduce(
        (sum, investor) => sum + Number(investor.balance || 0),
        0,
      ),
    [filteredInvestors],
  );

  return (
    <div className="global_container">
      <div className="global_sub_container mb-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          {heading("addInvestor")}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {formTrans("customerName")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={formTrans("customerName")}
              className="global_input"
              required
            />
          </div>

          <GlobalPhoneInput
            label={formTrans("mobile")}
            required
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
          />

          <div className="flex gap-3">
            <button type="submit" className="global_button w-full">
              {btn("create")}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="global_edit w-full"
            >
              {btn("cancel")}
            </button>
          </div>
        </form>
      </div>

      <div className="global_sub_container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="global_heading">{heading("investorList")}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Showing {filteredInvestors.length} of {investors.length} investors
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or mobile..."
            className="global_input w-full md:max-w-xs"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr>
                <th className="global_th">#</th>
                <th className="global_th">{table("name")}</th>
                <th className="global_th">{table("mobile")}</th>
                <th className="global_th">{table("userMobile")}</th>
                <th className="global_th">{table("balance")}</th>
                <th className="global_th">{table("date")}</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {filteredInvestors.length > 0 ? (
                filteredInvestors.map((investor, index) => (
                  <tr key={investor._id} className="global_tr">
                    <td className="global_td">{index + 1}</td>
                    <td className="global_td font-medium">{investor.name}</td>
                    <td className="global_td">{investor.mobile || "-"}</td>
                    <td className="global_td">{investor.UserMobile || "-"}</td>
                    <td
                      className={`global_td font-medium ${
                        Number(investor.balance) < 0
                          ? "text-red-500"
                          : Number(investor.balance) > 0
                            ? "text-green-500"
                            : ""
                      }`}
                    >
                      {formatCurrency(Number(investor.balance || 0))}
                    </td>
                    <td className="global_td">
                      {formatDate(investor.CreatedDate)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="global_td text-center py-8">
                    No investors found
                  </td>
                </tr>
              )}
            </tbody>
            {filteredInvestors.length > 0 && (
              <tfoot>
                <tr className="global_tr font-semibold bg-gray-50 dark:bg-gray-800/50">
                  <td colSpan={4} className="global_td text-right">
                    Total Balance
                  </td>
                  <td
                    className={`global_td ${
                      totalBalance < 0
                        ? "text-red-500"
                        : totalBalance > 0
                          ? "text-green-500"
                          : ""
                    }`}
                  >
                    {formatCurrency(totalBalance)}
                  </td>
                  <td className="global_td" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvestorList;
