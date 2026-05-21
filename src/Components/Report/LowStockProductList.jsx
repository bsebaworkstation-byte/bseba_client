import React, { useEffect, useState } from "react";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";

const LowStockProductList = () => {
  const [lowProductList, setLowProductList] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const t = useTextTranslate(GlobalTableTranslator)
  const table = useTextTranslate(HeadingTranslate)

  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { setGlobalLoader } = loadingStore();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Fetch Data
  const fetchData = async () => {
    try {
      setGlobalLoader(true);

      const res = await api.get(
        `/LowStockProductList/${page}/${perPage}/${searchKeyword || 0}`
      );

      if (res.data.status === "Success") {
        setLowProductList(res.data.data || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error("Failed to load low stock products", err);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchData(page, perPage, searchKeyword);
  }, [page, perPage, searchKeyword]);

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const sortedData = () => {
    if (!lowProductList || !sortConfig.key) return lowProductList;
    return [...lowProductList].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? "";
      const bVal = b[sortConfig.key] ?? "";

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key === key) {
      return (
        <span style={{ color: "red" }}>
          {sortConfig.direction === "asc" ? "▲" : "▼"}
        </span>
      );
    }
    return <span style={{ color: "red" }}>↕</span>;
  };

  const perPageOnChange = (e) => {
    setPerPage(parseInt(e.target.value));
    setPage(1);
  };

  const renderTableRows = () => {
    let data = sortedData();

    if (loading) {
      return (
        <tr>
          <td colSpan="8" className="text-center py-3 text-gray-500">
            Loading...
          </td>
        </tr>
      );
    }

    if (data.length === 0) {
      return (
        <tr>
          <td colSpan="8" className="text-center py-3 text-gray-500">
            No data found
          </td>
        </tr>
      );
    }

    return data.map((item, index) => {
      const dangerClass = item.qty <= 0 ? "text-red-600 font-medium" : "";

      return (
        <tr key={item._id} className="global_tr">
          <td className={`global_td ${dangerClass}`}>
            {(page - 1) * perPage + index + 1}
          </td>
          <td className={`global_td ${dangerClass}`}>{item.name}</td>
          <td className={`global_td ${dangerClass}`}>{item.BrandName}</td>
          <td className={`global_td ${dangerClass}`}>{item.CategoryName}</td>
          <td className={`global_td ${dangerClass}`}>
            {Number(item.unitCost).toFixed(2)}
          </td>
          <td className={`global_td ${dangerClass}`}>{item.mrp}</td>
          <td className={`global_td ${dangerClass}`}>{item.barcode || "-"}</td>
          <td className={`global_td ${dangerClass}`}>{item.qty}</td>
        </tr>
      );
    });
  };

  return (
    <div className="container global_container mx-auto">
      <div className="global_sub_container">
        {/* Title */}
        <div className="">
          <h5 className="text-xl font-semibold mb-3">{table("lowStockHeading")}</h5>
        </div>
        {/* Per Page Selector */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <select
              onChange={perPageOnChange}
              value={perPage}
              className="global_dropdown"
            >
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Showing {lowProductList.length} of {total} Products
            </p>
          </div>

          <div className="flex flex-col lg:flex-row my-2 gap-3">
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setPage(1);
              }}
              className="global_input w-full sm:w-auto"
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr className="">
                <th className="global_th">#</th>
                <th
                  style={{ width: "250px" }}
                  className="global_th"
                  onClick={() => handleSort("name")}
                >
                  {t("productName")} {renderSortIcon("name")}
                </th>
                <th
                  className="global_th"
                  onClick={() => handleSort("BrandName")}
                >
                  {t("brandName")} {renderSortIcon("BrandName")}
                </th>
                <th
                  className="global_th"
                  onClick={() => handleSort("CategoryName")}
                >
                  {t("categoryName")} {renderSortIcon("CategoryName")}
                </th>
                <th
                  className="global_th"
                  onClick={() => handleSort("unitCost")}
                >
                 {t("unitCost")} {renderSortIcon("unitCost")}
                </th>
                <th className="global_th" onClick={() => handleSort("mrp")}>
                  {t("mrp")} {renderSortIcon("mrp")}
                </th>
                <th className="global_th" onClick={() => handleSort("barcode")}>
                  {t("barCode")} {renderSortIcon("barcode")}
                </th>
                <th className="global_th" onClick={() => handleSort("qty")}>
                  {t("stockQty")} {renderSortIcon("qty")}
                </th>
              </tr>
            </thead>
            <tbody className="global_tbody">{renderTableRows()}</tbody>
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
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "global_button"
              }`}
            >
              {t("previous")}
            </button>

            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t("next")} {page} of {Math.ceil(total / perPage)}
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / perPage)}
              className={`px-4 py-2 rounded-l-md rounded-r-full ${
                page >= Math.ceil(total / perPage)
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "global_button"
              }`}
            >
              {t("next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStockProductList;
