import { useEffect, useRef, useState } from "react";
import { getBusinessDetails } from "../../Helper/SessionHelper";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { printElement } from "../../Helper/Printer";
import { Link, useNavigate } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Swal from "sweetalert2";
import TimeAgo from "../../Helper/UI/TimeAgo";
import api from "../../Helper/axios_resonse_interceptor";
import PosInvoice80Modal from "../Modals/PosInvoice80Modal";
import { can } from "../../Helper/permissionChecker";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";
import { formatDate } from "../../Helper/utils";

const CustomerReport = () => {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const { setGlobalLoader } = loadingStore();
  const printRef = useRef(null);
  const navigate = useNavigate();
  // 🔹 Row-wise profit toggle state
  const [openRows, setOpenRows] = useState({}); // _id: boolean
  const [posPrinterModal, setPosPrinterModal] = useState(false);
  const [posInvoiceID, setPosInvoiceID] = useState(false);
  const [printSize, setPrintSize] = useState(null);
  const [showTotalInvoice, setShowTotalInvoice] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [showTotalSales, setShowTotalSales] = useState(true);
  const [showTotalProfit, setShowTotalProfit] = useState(true);
  const [showCreatedDate, setShowCreatedDate] = useState(true);

  const toggleRow = (id) => {
    setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // language translator
  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);
  const formTrans = useTextTranslate(GlobalFormTranslator);

  const fetchReports = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/CoustomersReport/${page}/${limit}/${search || 0}`,
      );
      if (res.data.status === "Success") {
        let data = res.data.data;
        setReports(data);
        setTotal(res.data.total || data.length);
      } else {
        ErrorToast("Failed to fetch reports");
      }
    } catch (err) {
      console.error(err);
      ErrorToast("Something went wrong while fetching reports");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, search, limit]);

  const handlePrint = () => {
    printElement(printRef, "SaleList");
  };

  const handleAction = (action, saleId) => {
    switch (action) {
      case "Invoice":
        navigate(`/Invoice/${getBusinessDetails()?.invoice || 1}/${saleId}`);
        break;
      case "Inv-80mm":
        setPrintSize(80);
        setPosInvoiceID(saleId);
        setTimeout(() => {
          setPosPrinterModal(true);
        }, 300); // 300ms delay – চাইলে বাড়াতে পারো
        break;

      case "Inv-58mm":
        setPrintSize(58);
        setPosInvoiceID(saleId);
        setTimeout(() => {
          setPosPrinterModal(true);
        }, 300);
        break;
      case "delete":
        handleDelete(saleId);
        break;
      case "return":
        navigate(`/SaleReturn/${saleId}`);
        break;
      case "challan":
        navigate(`/Challan/${saleId}`);
        break;
      case "Invoice1":
        navigate(`/Invoice/1/${saleId}`);
        break;
      case "Invoice2":
        navigate(`/Invoice/2/${saleId}`);
        break;
      case "Invoice3":
        navigate(`/Invoice/3/${saleId}`);
        break;
      case "Invoice4":
        navigate(`/Invoice/4/${saleId}`);
        break;

      case "Invoice6":
        navigate(`/Invoice/6/${saleId}`);
        break;
      case "banglaInvoice":
        navigate(`/Invoice//${saleId}`);
        break;
      case "Invoice8":
        navigate(`/Invoice/8/${saleId}`);
        break;
      case "Invoice9":
        navigate(`/Invoice/9/${saleId}`);
        break;
      case "ChallanBangla":
        navigate(`/ChallanBangla/${saleId}`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="global_container">
      <div className="global_sub_container">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          {heading("Report")}
        </h1>

        {/* Search & Limit */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
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
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Showing {reports.length} of {total} reports
            </p>
          </div>

          <div className="flex flex-col lg:flex-row my-2 gap-3">
            <input
              type="text"
              placeholder="Search by Reference or Customer"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="global_input w-full lg:w-64"
            />
          </div>
        </div>

        {/* Table */}
        {reports.length === 0 ? (
          <div className="text-center">No reports found</div>
        ) : (
          <div className="overflow-auto">
            <div className="justify-start flex gap-5 p-3 text-sm" id="no-print">
              {/* Total Invoice */}
              <label htmlFor="totalInvoice">Total Invoice</label>
              <input
                type="checkbox"
                name="totalInvoice"
                checked={showTotalInvoice}
                onChange={() => setShowTotalInvoice(!showTotalInvoice)}
                className="w-4 h-4 accent-green-600 cursor-pointer"
              />

              {/* Balance */}
              <label htmlFor="balance">Balance</label>
              <input
                type="checkbox"
                name="balance"
                checked={showBalance}
                onChange={() => setShowBalance(!showBalance)}
                className="w-4 h-4 accent-green-600 cursor-pointer"
              />

              {/* Total Sales */}
              <label htmlFor="totalSales">Total Sales</label>
              <input
                type="checkbox"
                name="totalSales"
                checked={showTotalSales}
                onChange={() => setShowTotalSales(!showTotalSales)}
                className="w-4 h-4 accent-green-600 cursor-pointer"
              />

              {/* Total Profit */}
              <label htmlFor="totalProfit">Total Profit</label>
              <input
                type="checkbox"
                name="totalProfit"
                checked={showTotalProfit}
                onChange={() => setShowTotalProfit(!showTotalProfit)}
                className="w-4 h-4 accent-green-600 cursor-pointer"
              />

              {/* Created Date */}
              <label htmlFor="createdDate">Created Date</label>
              <input
                type="checkbox"
                name="createdDate"
                checked={showCreatedDate}
                onChange={() => setShowCreatedDate(!showCreatedDate)}
                className="w-4 h-4 accent-green-600 cursor-pointer"
              />
            </div>

            <table className="global_table w-full" ref={printRef}>
              <thead className="global_thead">
                <tr>
                  <th className="global_th">{table("no")}</th>
                  <th className="global_th">{table("name")}</th>
                  <th className="global_th">{table("address")}</th>
                  <th className="global_th">Mobile</th>
                  {showTotalInvoice && (
                    <th className="global_th">Total Invoice</th>
                  )}
                  {showBalance && <th className="global_th">Balance</th>}
                  {showTotalSales && <th className="global_th">Total Sales</th>}
                  {showCreatedDate && <th className="global_th">Join Date</th>}
                  {showTotalProfit && (
                    <th className="global_th">{formTrans("profit")}</th>
                  )}
                  <th className="global_th" id="no-print">
                    Ledger
                  </th>
                </tr>
              </thead>
              <tbody className="global_tbody">
                {reports.map((item, index) => (
                  <tr key={index} className="global_tr">
                    {/* No */}
                    <td className="global_td">{index + 1}</td>
                    {/* Customer Name */}
                    <td className="global_td">
                      {item?.contactDetails?.name || "N/A"}
                    </td>
                    {/* Address */}
                    <td className="global_td">
                      {item?.contactDetails?.address || "-"}
                    </td>
                    {/* Mobile */}
                    <td className="global_td">
                      {item?.contactDetails?.mobile || "-"}
                    </td>
                    {/* Total Sales Count */}
                    {showTotalInvoice && (
                      <td className="global_td">{item?.totalSalesCount}</td>
                    )}
                    {/* Balance */}
                    {showBalance && (
                      <td
                        className={`global_td font-medium ${
                          item?.contactDetails?.balance < 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {item?.contactDetails?.balance ?? 0}
                      </td>
                    )}
                    {/* Total Sales Amount */}
                    {showTotalSales && (
                      <td className="global_td">
                        {item?.totalSalesAmount?.toFixed(2)}
                      </td>
                    )}
                    {/* Join Date */}
                    {showCreatedDate && (
                      <td className="global_td">
                        {formatDate(item?.contactDetails?.createdAt)}
                        <TimeAgo date={item?.contactDetails?.createdAt} />
                      </td>
                    )}
                    {/* Profit Toggle */}
                    {showTotalProfit && (
                      <td className="global_td">
                        {item?.totalProfit?.toFixed(2)}
                      </td>
                    )}
                    {/* Ledger */}
                    <td className="global_td" id="no-print">
                      <Link
                        to={`/Transaction/${item?.contactDetails?._id}`}
                        className="global_button"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {total > 0 && (
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-r-md rounded-l-full ${
                    page === 1
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "global_button"
                  }`}
                >
                  {table("previous")}
                </button>

                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {table("page")} {page} {table("of")}{" "}
                  {Math.ceil(total / limit)}
                </span>

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                  className={`px-4 py-2 rounded-l-md rounded-r-full ${
                    page >= Math.ceil(total / limit)
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "global_button"
                  }`}
                >
                  {table("next")}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Print Button */}
        <button onClick={handlePrint} className="global_button mt-5">
          Print
        </button>
      </div>
      <PosInvoice80Modal
        posInvoiceID={posInvoiceID}
        open={posPrinterModal}
        setOpen={setPosPrinterModal}
        printSize={printSize}
      />
    </div>
  );
};

export default CustomerReport;
