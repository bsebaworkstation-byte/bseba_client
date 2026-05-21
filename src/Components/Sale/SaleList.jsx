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
import isAdmin from "../../Helper/isAdmin";

const SaleList = () => {
  const [sales, setSales] = useState([]);
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
  const toggleRow = (id) => {
    setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // language translator
  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);
  const formTrans = useTextTranslate(GlobalFormTranslator);

  const fetchSales = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/SalesList/${page}/${limit}/${search || 0}`);
      if (res.data.status === "Success") {
        let data = res.data.data;
        setSales(data);
        setTotal(res.data.total || data.length);
      } else {
        ErrorToast("Failed to fetch sales");
      }
    } catch (err) {
      console.error(err);
      ErrorToast("Something went wrong while fetching sales");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, search, limit]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
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
    });

    if (!result.isConfirmed) return;

    try {
      const response = await api.get(`/DeleteSales/${id}`);

      if (
        response.data.status?.toLowerCase() === "success" ||
        response.data.statusCode === 200
      ) {
        SuccessToast(
          response.data.message || "Sale return deleted successfully.",
        );
        setSales((prev) => prev.filter((item) => item._id !== id));
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

      case "Invoice5":
        navigate(`/Invoice/5/${saleId}`);
        break;

      case "banglaInvoice":
        navigate(`/Invoice/6/${saleId}`);
        break;

      case "Invoice7":
        navigate(`/Invoice/7/${saleId}`);
        break;

      case "Invoice8":
        navigate(`/Invoice/8/${saleId}`);
        break;

      case "Invoice9":
        navigate(`/Invoice/9/${saleId}`);
        break;

      case "Vat Invoice":
        navigate(`/Invoice/10/${saleId}`);
        break;

      case "Invoice11":
        navigate(`/Invoice/11/${saleId}`);
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
          {heading("saleList")}
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
              Showing {sales.length} of {total} Sales
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
        {sales.length === 0 ? (
          <div className="text-center">No sales found</div>
        ) : (
          <div className="overflow-auto">
            <table className="global_table w-full" ref={printRef}>
              <thead className="global_thead">
                <tr>
                  <th className="global_th">{table("no")}</th>
                  <th className="global_th">{table("name")}</th>
                  <th className="global_th">{formTrans("grandTotal")}</th>
                  <th className="global_th">{table("paid")}</th>
                  <th className="global_th">{table("due")}</th>
                  <th className="global_th">{table("createdBy")}</th>
                  <th className="global_th">{table("date")}</th>
                  {isAdmin() && (
                    <th className="global_th">
                      <button
                        onClick={() => {
                          sales.map((s) => toggleRow(s._id));
                        }}
                        className="w-full cursor-pointer"
                      >
                        {formTrans("profit")}
                      </button>
                    </th>
                  )}

                  {isAdmin() && <th className="global_th">Edit Sale</th>}

                  <th className="global_th">{table("action")}</th>
                </tr>
              </thead>
              <tbody className="global_tbody">
                {sales.map((sale) => (
                  <tr key={sale._id} className="global_tr">
                    <td className="global_td">
                      <Link
                        to={`/Invoice/${getBusinessDetails()?.invoice || 1}/${
                          sale._id
                        }`}
                      >
                        {" "}
                        {sale.referenceNo}
                      </Link>{" "}
                    </td>
                    <td className="global_td">
                      {sale?.BillTo || sale.Customer?.[0]?.name || ""}
                    </td>
                    <td className="global_td">{sale.grandTotal.toFixed(2)}</td>
                    <td className="global_td">{sale?.paid?.toFixed(2)}</td>
                    <td className="global_td">
                      {sale?.dueAmount?.toFixed(2) || 0}
                    </td>
                    <td className="global_td min-w-[100px]">
                      {sale.Users?.[0]?.fullName}
                    </td>
                    {/* <td className="global_td">
                      {new Date(sale.CreatedDate).toLocaleDateString("en-GB")}
                    </td> */}
                    <td className="global_td">
                      {new Date(sale.CreatedDate)
                        .toLocaleDateString("en-GB")
                        .replace(/\//g, "-")}{" "}
                      <TimeAgo date={sale.CreatedDate} />
                    </td>
                    {isAdmin() && (
                      <td className="global_td">
                        <div className="flex flex-col items-center justify-center">
                          {/* Toggle Button */}
                          <button
                            onClick={() => toggleRow(sale._id)}
                            className="text-gray-700 dark:text-white hover:text-green-600 cursor-pointer text-xl transition-colors duration-200 hover:scale-110"
                          >
                            {openRows[sale._id] ? (
                              <AiOutlineEye />
                            ) : (
                              <AiOutlineEyeInvisible />
                            )}
                          </button>

                          {/* Profit Content */}
                          {openRows[sale._id] && (
                            <div className="mt-1 text-sm font-medium text-green-600">
                              {sale.profit.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    {isAdmin() && (
                      <td className="global_edit">
                        <Link to={`/EditSale/${sale._id}`}>Edit Sale</Link>
                      </td>
                    )}
                    <td className="global_td">
                      <select
                        className="global_dropdown"
                        defaultValue=""
                        onChange={(e) => {
                          const action = e.target.value;
                          e.target.value = ""; // reset select
                          handleAction(action, sale._id);
                        }}
                      >
                        <option value="" disabled>
                          Select
                        </option>
                        <option value="Invoice">Invoice</option>
                        <option value="Inv-80mm">Inv-80mm</option>
                        <option value="Inv-58mm">Inv-58mm</option>
                        {can("isAdmin") && (
                          <option value="delete">Delete</option>
                        )}
                        {can("SaleReturn") && (
                          <option value="return">Return</option>
                        )}
                        <option value="challan">Challan</option>
                        <option value="Invoice1">Invoice 1</option>
                        <option value="Invoice2">Invoice 2</option>
                        <option value="Invoice3">Invoice 3</option>
                        <option value="Invoice4">Invoice 4</option>
                        <option value="Invoice5">Invoice 5</option>
                        <option value="banglaInvoice">Invoice6 Bangla</option>
                        <option value="Invoice7">Invoice 7</option>
                        <option value="Invoice8">Invoice 8</option>
                        <option value="Invoice9">Invoice 9</option>
                        <option value="Invoice11">Invoice 11</option>

                        <option value="ChallanBangla">Challan Bangla</option>
                      </select>
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

export default SaleList;
