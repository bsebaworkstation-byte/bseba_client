import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import loadingStore from "../../Zustand/LoadingStore";
import { SuccessToast } from "../../Helper/FormHelper";
import api from "../../Helper/axios_resonse_interceptor";
import { can } from "../../Helper/permissionChecker";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";

const QuotationList = () => {
  const [quotationList, setQuotationList] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("0");
  const [perPage, setPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { setGlobalLoader } = loadingStore();

  // language translator
  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);
  const formTrans = useTextTranslate(GlobalFormTranslator);

  //  Debounce timer so it doesn’t spam API calls too fast
  let searchTimer;

  useEffect(() => {
    fetchData(currentPage, perPage, searchKeyword);
  }, [searchKeyword, perPage, currentPage]);

  const fetchData = async (page = 1, limit = 10, keyword = "0") => {
    try {
      setGlobalLoader(true);
      const response = await api.get(
        `/QuotationList/${page}/${limit}/${keyword}`,
      );
      setQuotationList(response.data.data);
      setTotal(response.data.total);
    } catch (err) {
      console.error("Failed to load quotation list", err);
    } finally {
      setGlobalLoader(false);
    }
  };

  // Pagination setup
  const totalPages = Math.ceil(total / perPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  //  Text Filter (onChange)
  const handleTextFilter = (value) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      setSearchKeyword(value.trim() === "" ? "0" : value);
    }, 400);
  };

  const handleDelete = async (id) => {
    // console.log(id);
    // const res = await axios.get(`${BaseURL}/DeleteQuotation/${id}`, {
    //   headers: { token: getToken() },
    // });

    // if (res.data.status === "Success") {
    //   alert("item dileted");
    // }
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
          const res = await api.get(`/DeleteQuotation/${id}`);
          if (res.data.status === "Success") {
            SuccessToast(res.data.message);
            fetchData();
          } else {
            ErrorToast(res.data.message);
          }
        } catch (error) {
          ErrorToast(error.res?.data?.message || "Failed to delete Brand");
        } finally {
          setGlobalLoader(false);
        }
      }
    });
  };

  const action = (value, id) => {
    console.log(value, id);
    switch (value) {
      case "quotation1":
        navigate(`/QuotationDetails/${id}/quotation`);
        break;
      case "quotation2":
        navigate(`/QuotationDetails/${id}/invoice`);
        break;
      case "quotation3":
        navigate(`/QuotationDetails/3/${id}`);
        break;
      case "edit":
        navigate(`/EditQuotation/${id}`);
        break;
      case "delete":
        handleDelete(id);
    }
  };

  return (
    <div className="global_container">
      <div className="global_sub_container">
        <h1 className="global_heading">
          {heading("quotationList")} ({total})
        </h1>

        {/*  Filters Section */}
        <div className="flex flex-col gap-4 mb-4">
          {/* Row 1: Search Inputs */}
          {/* Text Filter */}
          <div className="max-w-xs">
            <label className="block text-sm font-medium mb-1">
              {formTrans("search")} :
            </label>
            <input
              type="text"
              placeholder="Type to filter..."
              className="global_input w-full"
              onChange={(e) => handleTextFilter(e.target.value)}
            />
          </div>

          {/* Row 2: Entries Dropdown */}
          <div className="flex items-center justify-end gap-2 w-full">
            <label className="block text-sm font-medium mb-1 sm:mb-0">
              Entries:
            </label>
            <select
              onChange={(e) => setPerPage(parseInt(e.target.value))}
              value={perPage}
              className=" global_dropdown py-1!  w-20"
            >
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
          </div>
        </div>
      </div>
      {/* table coantainer  */}
      <div className="global_sub_container overflow-x-auto">
        {/*  Table */}
        <table className="global_table">
          <thead className="global_thead">
            <tr>
              <th className="global_th">#</th>
              <th className="global_th">{table("reference")}</th>
              <th className="global_th">{table("customer")} {table("name")}</th>
              <th className="global_th">{table("total")}</th>
              <th className="global_th">{formTrans("profit")}</th>
              {/* <th className="global_th">Warranty</th> */}
              <th className="global_th">{table("createdBy")}</th>
              <th className="global_th">{table("date")}</th>

              <th className="global_th ">{table("action")}</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {quotationList.length > 0 ? (
              quotationList.map((item, index) => (
                <tr className="global_tr" key={item._id}>
                  <td className="global_td">
                    {(currentPage - 1) * perPage + (index + 1)}
                  </td>
                  <td className="global_td">{item.referenceNo}</td>
                  <td className="global_td">{item?.BillTo || "N/A"}</td>
                  <td className="global_td">{item.total}</td>
                  <td className="global_td">{item.profit ?? 0}</td>
                  {/* <td className="global_td">{item.warranty ?? 0}</td> */}

                  <td className="global_td">
                    {item.Users?.[0]?.fullName ?? ""}
                  </td>

                  <td className="global_td">
                    {new Date(item.CreatedDate)
                      .toLocaleDateString("en-GB")
                      .replace(/\//g, "-")}
                  </td>

                  <td className="global_td ">
                    <div className="flex gap-3">
                      <select
                        defaultValue=""
                        onChange={(e) => action(e.target.value, item._id)}
                        className="border border-gray-300 outline-0 py-1 px-3 rounded-md dark:bg-gray-800"
                      >
                        <option value="" disabled>
                          Select Quotation
                        </option>
                        <option value="quotation1">Quotation </option>
                        <option value="quotation3">Quotation 2</option>
                        <option value="quotation2">Invoice Type</option>
                        <option value="edit"> Edit</option>
                        {can("isAdmin") ? (
                          <option value="delete">Delete</option>
                        ) : (
                          ""
                        )}
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        {/* Previous Button */}
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-l-full rounded-r-md text-sm ${
            currentPage === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {table("previous")}
        </button>

        {/* Page Info */}
        <span className="text-sm">
          {table("page")} {currentPage} {table("of")} {totalPages}
        </span>

        {/* Next Button */}
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-r-full rounded-l-md text-sm ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {table("next")}
        </button>
      </div>
    </div>
  );
};

export default QuotationList;
