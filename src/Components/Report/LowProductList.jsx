import React, { useEffect, useState } from "react";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";

const LowProductList = () => {
  const [lowProductList, setLowProductList] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("0");
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { setGlobalLoader } = loadingStore();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Fetch Data
  const fetchData = async (pageNum = 1, limit = perPage, keyword = "0") => {
    try {
      setGlobalLoader(true);
      const res = await api.get(
        `/ProductLowstockList/${pageNum}/${limit}/${keyword}`
      );

      if (res.data.status === "Success") {
        setLowProductList(res.data.data || []);
        setTotal(res.data.pageInfo.totalItems || 0);
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

  // Sorting logic
  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const sortedData = () => {
    if (!lowProductList || !sortConfig.key) return lowProductList;
    return [...lowProductList].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
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

  // Per page change
  const perPageOnChange = (e) => {
    setPerPage(parseInt(e.target.value));
    setPage(1);
  };

  // Table rows
  const renderTableRows = () => {
    const data = sortedData();
    if (loading) {
      return (
        <tr>
          <td colSpan="9" className="text-center py-3 text-gray-500">
            Loading...
          </td>
        </tr>
      );
    }

    if (data.length === 0) {
      return (
        <tr>
          <td colSpan="9" className="text-center py-3 text-gray-500">
            No data found
          </td>
        </tr>
      );
    }

    return data.map((item, index) => {
      const dangerClass =
        item.stock <= item.alertQuantity ? "text-red-600 " : "";
      return (
        <tr key={item._id}>
          <td className={`global_td ${dangerClass}`}>
            {(page - 1) * perPage + index + 1}
          </td>
          <td className={`global_td ${dangerClass}`}>{item.productName}</td>
          <td className={`global_td ${dangerClass}`}>{item.brandName}</td>
          <td className={`global_td ${dangerClass}`}>{item.categoryName}</td>
          <td className={`global_td ${dangerClass}`}>{item.totalQty}</td>
          <td className={`global_td ${dangerClass}`}>{item.totalQtySold}</td>
          <td className={`global_td ${dangerClass}`}>{item.totalQtyReturn}</td>
          <td className={`global_td ${dangerClass}`}>{item.stock}</td>
          <td className={`global_td ${dangerClass}`}>{item.alertQuantity}</td>
        </tr>
      );
    });
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="global_container">
      <div className="global_sub_container">
        {/* Title */}
        <div className="">
          <h5 className="text-xl font-semibold mb-3">Low Stock Product</h5>
        </div>

        {/* Search and Per Page */}
        <div className="flex flex-col md:flex-row-reverse md:items-center md:justify-between gap-3 mt-4">
          {/* Search box */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2">
            <input
              onChange={(e) => setSearchKeyword(e.target.value || "0")}
              type="text"
              className="global_input w-full sm:w-auto"
              placeholder="Search..."
            />
            {/* Optional search button */}
            {/* 
    <button
      onClick={() => {
        setPage(1);
        fetchData(1, perPage, searchKeyword);
      }}
      className="global_button w-full sm:w-auto"
    >
      Search
    </button> 
    */}
          </div>

          {/* Per Page Selector */}
          <div className="w-full md:w-auto flex flex-wrap sm:flex-nowrap items-center justify-between md:justify-center gap-2">
            <p className="text-sm">Show</p>
            <select
              onChange={perPageOnChange}
              value={perPage}
              className="global_input global_dropdown w-full sm:w-auto"
            >
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
            <p className="text-sm">entries</p>
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
                  onClick={() => handleSort("productName")}
                >
                  Product Name {renderSortIcon("productName")}
                </th>
                <th
                  className="global_th"
                  onClick={() => handleSort("brandName")}
                >
                  Brand Name {renderSortIcon("brandName")}
                </th>
                <th
                  className="global_th"
                  onClick={() => handleSort("categoryName")}
                >
                  Category Name {renderSortIcon("categoryName")}
                </th>
                <th
                  className="global_th"
                  onClick={() => handleSort("totalQty")}
                >
                  Total Purchase {renderSortIcon("totalQty")}
                </th>
                <th
                  className="global_th"
                  onClick={() => handleSort("totalQtySold")}
                >
                  Total Sold {renderSortIcon("totalQtySold")}
                </th>
                <th
                  className="global_th "
                  onClick={() => handleSort("totalQtyReturn")}
                >
                  Total Return {renderSortIcon("totalQtyReturn")}
                </th>
                <th className="global_th" onClick={() => handleSort("stock")}>
                  Stock {renderSortIcon("stock")}
                </th>
                <th
                  className="global_th"
                  onClick={() => handleSort("alertQuantity")}
                >
                  Alert Quantity {renderSortIcon("alertQuantity")}
                </th>
              </tr>
            </thead>
            <tbody className="global_tbody">{renderTableRows()}</tbody>
          </table>
        </div>

        {/* Manual Pagination */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-r-md rounded-l-full dark:text-gray-800 ${
              page === 1 ? "bg-gray-200 cursor-not-allowed" : "global_button"
            }`}
          >
            Previous
          </button>

          <span className="text-sm">
            Page {page} of {totalPages || 1}
          </span>

          <button
            onClick={() =>
              setPage((p) => (p < totalPages ? p + 1 : totalPages))
            }
            disabled={page >= totalPages}
            className={`px-4 py-2 rounded-l-md rounded-r-full dark:text-gray-800 ${
              page >= totalPages
                ? "bg-gray-200 cursor-not-allowed"
                : "global_button"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default LowProductList;
