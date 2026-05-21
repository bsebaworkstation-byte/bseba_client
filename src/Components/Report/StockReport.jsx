import React, { useState, useEffect, useRef } from "react";
import { FaPrint } from "react-icons/fa";
import Select from "react-select";
import loadingStore from "../../Zustand/LoadingStore";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import api from "../../Helper/axios_resonse_interceptor";
import { printElement } from "../../Helper/Printer";

const REPORT_COLUMNS = [
  { id: "productName", label: "Product", sortKey: "productName" },
  { id: "brandName", label: "Brand", sortKey: "brandName" },
  { id: "categoryName", label: "Category", sortKey: "categoryName" },
  { id: "purchase", label: "Purchase" },
  { id: "purchaseReturn", label: "Purchase Return" },
  { id: "totalSold", label: "Total Sold" },
  { id: "return", label: "Return" },
  { id: "damage", label: "Damage" },
  { id: "alertQty", label: "Alert Qty" },
  { id: "rate", label: "Rate" },
  { id: "stock", label: "Stock" },
  { id: "stockValue", label: "Stock Value" },
  { id: "purchaseDate", label: "Purchase Date" },
];

const defaultColumnVisibility = Object.fromEntries(
  REPORT_COLUMNS.map((c) => [c.id, true])
);

const StockReport = () => {
  const printRef = useRef(null);
  const { setGlobalLoader } = loadingStore();
  const [summaryData, setSummaryData] = useState({
    totalStockValue: 0,
    totalProducts: 0,
    totalBrands: 0,
    totalCategories: 0,
  });
  const [brandData, setBrandData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "productName",
    direction: "ascending",
  });
  const [columnVisibility, setColumnVisibility] = useState(
    () => ({ ...defaultColumnVisibility })
  );

  const toggleColumnVisibility = (columnId) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const footerLabelColSpan = Math.max(
    1,
    REPORT_COLUMNS.filter(
      (c) =>
        columnVisibility[c.id] &&
        !["stock", "stockValue", "purchaseDate"].includes(c.id)
    ).length
  );

  // Fetch summary info
  const fetchSummaryData = async () => {
    setGlobalLoader(true);
    try {
      const response = await api.get(`/Summary`);
      setSummaryData({
        totalStockValue: response.data.totalStockValue,
        totalProducts: response.data.totalProducts,
        totalBrands: response.data.totalBrands,
        totalCategories: response.data.totalCategories,
      });
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    } finally {
      setGlobalLoader(false);
    }
  };

  // Fetch brands and categories
  useEffect(() => {
    const fetchData = async () => {
      setGlobalLoader(true);
      try {
        const brandRes = await api.get(`/GetBrands`);
        setBrandData(brandRes.data.data);

        const categoryRes = await api.get(`/GetCategory`);
        setCategoryData(categoryRes.data.data);
      } catch (err) {
        console.error("Failed to fetch brands/categories:", err);
      } finally {
        setGlobalLoader(false);
      }
    };
    fetchData();
  }, []);

  // Fetch summary initially
  useEffect(() => {
    fetchSummaryData();
  }, []);

  // Handle filter
  const handleBrandChange = async (selectedOption) => {
    if (!selectedOption) {
      setProductsData([]);
      return;
    }
    try {
      const res = await api.get(`/ProductListByBrand/${selectedOption.value}`);
      setProductsData(res.data.data);
    } catch (err) {
      console.error("Error fetching brand products:", err);
    }
  };

  const handleCategoryChange = async (selectedOption) => {
    if (!selectedOption) {
      setProductsData([]);
      return;
    }
    try {
      const res = await api.get(
        `/ProductListByCategory/${selectedOption.value}`
      );
      setProductsData(res.data.data);
    } catch (err) {
      console.error("Error fetching category products:", err);
    }
  };

  // Sorting
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...productsData].sort((a, b) => {
    const key = sortConfig.key;
    let aValue = a[key];
    let bValue = b[key];

    if (key === "stockValue" || key === "calculatedStock") {
      aValue = parseFloat(aValue || 0);
      bValue = parseFloat(bValue || 0);
    } else if (key === "CreatedDate") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
    return 0;
  });

  const renderSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? "↑" : "↓";
    }
    return "";
  };

  const handlePrint = () => {
    printElement(printRef, "Stock Report");
  };

  return (
    <div className="global_container">
      {/* Table */}
      <div className="global_sub_container ">
        <div ref={printRef}>
        <div className="flex flex-wrap justify-between items-center gap-3">
          <h1 className="global_heading">Product List</h1>
          <button
            type="button"
            onClick={handlePrint}
            className="global_button_red flex items-center gap-2 shrink-0 print:hidden"
          >
            <FaPrint /> Print
          </button>
        </div>
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
          {/* Product Brand */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">
              By Product Brand
            </label>
            <Select
              options={brandData.map((b) => ({
                value: b._id,
                label: b.name,
              }))}
              onChange={handleBrandChange}
              placeholder="Select Brand"
              isClearable
              classNamePrefix="react-select"
              // className="w-full"
              menuPortalTarget={document.body}
              styles={getReactSelectStyles()}
            />
          </div>

          {/* Product Category */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">
              By Product Category
            </label>
            <Select
              options={categoryData.map((c) => ({
                value: c._id,
                label: c.name,
              }))}
              onChange={handleCategoryChange}
              placeholder="Select Category"
              isClearable
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              styles={getReactSelectStyles()}
            />
          </div>
        </div>
        <div
          className="flex flex-wrap justify-end gap-x-5 gap-y-2 p-3 text-sm print:hidden"
          id="no-print"
        >
          {REPORT_COLUMNS.map((col) => (
            <label
              key={col.id}
              htmlFor={`stock-report-col-${col.id}`}
              className="inline-flex items-center gap-2 cursor-pointer"
            >
              <span>{col.label}</span>
              <input
                id={`stock-report-col-${col.id}`}
                type="checkbox"
                name={col.id}
                checked={columnVisibility[col.id]}
                onChange={() => toggleColumnVisibility(col.id)}
                className="w-4 h-4 accent-green-600 cursor-pointer"
              />
            </label>
          ))}
        </div>
        <div className=" overflow-x-auto ">
          <table className="global_table">
            <thead className="global_thead">
              <tr>
                {REPORT_COLUMNS.map((col) => {
                  if (!columnVisibility[col.id]) return null;
                  const sortKey = col.sortKey;
                  return (
                    <th
                      key={col.id}
                      className="global_th"
                      {...(sortKey
                        ? { onClick: () => requestSort(sortKey) }
                        : {})}
                    >
                      {col.label}
                      {sortKey ? ` ${renderSortIcon(sortKey)}` : ""}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="global_tbody">
              {sortedProducts.map((p, i) => {
                const calculatedStock =
                  (p.qty - p.qtySold || 0) +
                  (p.qtyReturn || 0) -
                  ((p.qtyDamage || 0) + (p.purchaseReturn || 0));
                const stockValue = (p.unitCost * calculatedStock).toFixed(2);

                if (!calculatedStock) return null;

                return (
                  <tr key={i}>
                    {columnVisibility.productName && (
                      <td className="global_td">{p.productName}</td>
                    )}
                    {columnVisibility.brandName && (
                      <td className="global_td">{p.brandName || "N/A"}</td>
                    )}
                    {columnVisibility.categoryName && (
                      <td className="global_td">{p.categoryName || "N/A"}</td>
                    )}
                    {columnVisibility.purchase && (
                      <td className="global_td">{p.qty || "N/A"}</td>
                    )}
                    {columnVisibility.purchaseReturn && (
                      <td className="global_td">
                        {p.purchaseReturn || "N/A"}
                      </td>
                    )}
                    {columnVisibility.totalSold && (
                      <td className="global_td">{p.qtySold || "N/A"}</td>
                    )}
                    {columnVisibility.return && (
                      <td className="global_td">{p.qtyReturn || "N/A"}</td>
                    )}
                    {columnVisibility.damage && (
                      <td className="global_td">{p.qtyDamage || "N/A"}</td>
                    )}
                    {columnVisibility.alertQty && (
                      <td className="global_td">{p.alertQuantity || "N/A"}</td>
                    )}
                    {columnVisibility.rate && (
                      <td className="global_td">{p.unitCost || "N/A"}</td>
                    )}
                    {columnVisibility.stock && (
                      <td className="global_td">{calculatedStock || "N/A"}</td>
                    )}
                    {columnVisibility.stockValue && (
                      <td className="global_td">{stockValue || "N/A"}</td>
                    )}
                    {columnVisibility.purchaseDate && (
                      <td className="global_td">
                        {new Date(p.CreatedDate)
                          .toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                          })
                          .replace(/\//g, "-")}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td
                  className="global_td"
                  colSpan={footerLabelColSpan}
                  style={{ textAlign: "right" }}
                >
                  Total Stock & Value:
                </td>
                {columnVisibility.stock && (
                  <td className="global_td">
                    {sortedProducts.reduce((total, p) => {
                      const qty = p.qty || 0;
                      const qtySold = p.qtySold || 0;
                      const qtyReturn = p.qtyReturn || 0;
                      const qtyDamage = p.qtyDamage || 0;
                      const purchaseReturn = p.purchaseReturn || 0;
                      return (
                        total +
                        (qty -
                          qtySold +
                          qtyReturn -
                          qtyDamage -
                          purchaseReturn)
                      );
                    }, 0)}
                  </td>
                )}
                {columnVisibility.stockValue && (
                  <td className="global_td">
                    {sortedProducts
                      .reduce((total, p) => {
                        const qty = p.qty || 0;
                        const qtySold = p.qtySold || 0;
                        const qtyReturn = p.qtyReturn || 0;
                        const qtyDamage = p.qtyDamage || 0;
                        const purchaseReturn = p.purchaseReturn || 0;
                        const calculatedStock =
                          qty -
                          qtySold +
                          qtyReturn -
                          qtyDamage -
                          purchaseReturn;
                        return total + (p.unitCost || 0) * calculatedStock;
                      }, 0)
                      .toFixed(2)}
                  </td>
                )}
                {columnVisibility.purchaseDate && (
                  <td className="global_td"></td>
                )}
              </tr>
            </tfoot>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
};

export default StockReport;
