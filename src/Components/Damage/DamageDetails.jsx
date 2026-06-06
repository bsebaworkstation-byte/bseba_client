import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorToast } from "../../Helper/FormHelper";
import { getBusinessDetails } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { printElement } from "../../Helper/Printer";
import api from "../../Helper/axios_resonse_interceptor";
import { formatCurrency } from "../../Helper/formatCurrency";
import formatDateToLocal from "../../Helper/formatDate";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";

const DamageDetails = () => {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const businessDetails = getBusinessDetails();
  const printRef = useRef(null);

  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const formTrans = useTextTranslate(GlobalFormTranslator);
  const table = useTextTranslate(GlobalTableTranslator);

  const fetchDetails = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/DamageDetailsByID/${id}`);
      if (res.data.status === "Success") {
        setDetails(res.data.data);
      } else {
        ErrorToast(res.data.message || "Failed to fetch damage details");
      }
    } catch (error) {
      ErrorToast(
        error.response?.data?.message || "Failed to fetch damage details",
      );
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const handlePrint = () => printElement(printRef, "Damage Details");

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (!details) {
    return (
      <div className="global_container text-center py-10 text-gray-500">
        Loading damage details...
      </div>
    );
  }

  const summary = details.DamageSummary || {};
  const products = details.Products || [];

  return (
    <div className="global_container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h4 className="global_heading">{heading("damageDetails")}</h4>
        <div className="flex gap-3" id="no-print">
          <Link to="/DamageList" className="global_button">
            {btn("back") || "Back"}
          </Link>
          <button onClick={handlePrint} className="global_button">
            {btn("print")}
          </button>
        </div>
      </div>

      <div ref={printRef} className="px-2">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6 border p-4 rounded border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-100 mb-2 border-b border-gray-200 dark:border-gray-600 pb-1">
              {table("createdBy")}
            </h3>
            <p>{details.Users?.name || "N/A"}</p>
            <p>{details.Users?.mobile || ""}</p>
          </div>

          <div className="flex items-center gap-3">
            {businessDetails?.logo ? (
              <img
                className="w-12 h-12 rounded-full object-cover"
                src={businessDetails.logo}
                alt="logo"
              />
            ) : null}
            <div>
              <h1 className="font-bold text-xl">
                {businessDetails?.businessName || "Your Business"}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {businessDetails?.address}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {businessDetails?.contactNumber}
              </p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="font-bold text-2xl text-red-600">Damage Details</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {table("date")}: {formatDate(summary.Date)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {table("reference")}: {summary.Reference || "N/A"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {formatDateToLocal(summary.Date)}
            </p>
          </div>
        </div>

        <div className="global_sub_container overflow-auto rounded-lg mb-6">
          <table className="global_table w-full">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">#</th>
                <th className="global_th">{formTrans("product")}</th>
                <th className="global_th text-center">{table("qty")}</th>
                <th className="global_th text-end">{formTrans("price")}</th>
                <th className="global_th text-end">{table("total")}</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {products.length === 0 ? (
                <tr className="global_tr">
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr className="global_tr" key={product.id || index}>
                    <td className="global_td text-left">{index + 1}</td>
                    <td className="global_td">{product.name || "N/A"}</td>
                    <td className="global_td text-left">
                      {product.quantity ?? 0} {product.unit || "N/A"}
                    </td>
                    <td className="global_td text-left">
                      {formatCurrency(product.price || 0)}
                    </td>
                    <td className="global_td text-left">
                      {formatCurrency(product.total || 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {products.length > 0 && (
              <tfoot>
                <tr className="global_tr font-semibold">
                  <td className="global_td" colSpan={2}>
                    {table("total")}
                  </td>
                  <td className="global_td text-center">
                    {products.reduce(
                      (sum, item) => sum + Number(item.quantity || 0),
                      0,
                    )}
                  </td>
                  <td className="global_td" />
                  <td className="global_td text-left">
                    {formatCurrency(
                      products.reduce(
                        (sum, item) => sum + Number(item.total || 0),
                        0,
                      ),
                    )}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {summary.note ? (
              <span>
                {formTrans("note")}: {summary.note}
              </span>
            ) : null}
          </div>
          <div className="border border-gray-200 dark:border-gray-600 rounded p-4 w-full md:w-80 bg-gray-50 dark:bg-gray-700">
            <p className="flex justify-between">
              <strong>{table("total")}:</strong>
              <span>{formatCurrency(summary.total || 0)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DamageDetails;
