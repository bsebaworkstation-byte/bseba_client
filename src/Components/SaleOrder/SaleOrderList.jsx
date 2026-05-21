import React, { useEffect, useState } from "react";
import loadingStore from "../../Zustand/LoadingStore";
import { Link } from "react-router-dom";
import api from "../../Helper/axios_resonse_interceptor";

export default function SaleOrderList() {
  const { setGlobalLoader } = loadingStore();

  const [product, setProduct] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [perPage, setPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSaleOrderList = async (page = 1, keyword = "0") => {
    const search = keyword.trim() || "0";
    setGlobalLoader(true);
    try {
      const { data } = await api.get(
        `/SaleOrderList/${page}/${perPage}/${search}`
      );

      if (data.status === "Success") {
        setProduct(data.data);
        // calculate total pages
        const totalRecords = data.total || data.data.length; // API থেকে total record number
        setTotalPages(Math.ceil(totalRecords / perPage));
      }
    } catch (err) {
      console.log(err);
    } finally {
      setGlobalLoader(false);
    }
  };

  // search debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      setCurrentPage(1); // search করলে page reset
      fetchSaleOrderList(1, searchKey);
    }, 300);
    return () => clearTimeout(delay);
  }, [searchKey, perPage]);

  // page change effect
  useEffect(() => {
    fetchSaleOrderList(currentPage, searchKey);
  }, [currentPage, perPage]);

  // console.log(product);
  return (
    <div className="global_container">
      <h4 className="global_heading">Order List</h4>

      {/* search and per page */}
      <div className="flex justify-between items-center mb-6 gap-3">
        <div className="w-full">
          <input
            onChange={(e) => setSearchKey(e.target.value)}
            type="search"
            placeholder="search "
            className="global_input w-full max-w-xs"
          />
        </div>
        <div className="w-full max-w-30">
          <select
            className="global_dropdown"
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
          >
            <option disabled>Select Option</option>
            <option value={20}>20</option>
            <option value={40}>40</option>
            <option value={60}>60</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* table */}
      <div className="global_sub_container w-full overflow-auto">
        <table className="global_table">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th">#</th>
              <th className="global_th">reference no</th>
              <th className="global_th">Customer</th>
              <th className="global_th">Total</th>
              <th className="global_th">discount</th>
              <th className="global_th">grand total</th>
              <th className="global_th">action</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {product.map((p, i) => (
              <tr className="global_tr" key={p._id}>
                <td className="global_td">
                  {(currentPage - 1) * perPage + i + 1}
                </td>
                <td className="global_td">{p?.referenceNo || "N/A"}</td>
                <td className="global_td">{p?.Contacts[0]?.name || "N/A"}</td>
                <td className="global_td">{p?.total || 0}</td>
                <td className="global_td">{p?.discount ?? 0}</td>
                <td className="global_td">{p?.grandTotal || 0}</td>
                <td className="global_td flex space-x-2">
                  <button className="global_button ">
                    <Link to={`/saleOrderDetails/${p._id}`}>Details</Link>
                  </button>
                  <button>
                    {p?.sale ? (
                      ""
                    ) : (
                      <Link
                        className="global_edit"
                        to={`/saleOrderEdit/${p._id}`}
                      >
                        Create Sale
                      </Link>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-l-full rounded-r-md text-sm ${
            currentPage === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          Prev
        </button>

        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-r-full rounded-l-md text-sm ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
