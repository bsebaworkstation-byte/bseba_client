import React, { Fragment, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { BsCheckSquare, BsSquare } from "react-icons/bs";
import api from "../../Helper/axios_resonse_interceptor";

const StockProduct = () => {
  const [productList, setProductList] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showUnitCost, setShowUnitCost] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = async (page, limit, keyword = "") => {
    try {
      setLoading(true);
      setProductList([]);
      const response = await api.get(
        `/StockProduct2/${page}/${limit}/${keyword || "0"}`
      );

      if (response.data.status === "Fail") {
        Swal.fire(response.data.message);
      } else {
        setProductList(response.data.data);
        setTotal(response.data.pagination.totalProducts);
      }
    } catch (err) {
      console.error("Failed to load Product list or No Product", err);
      Swal.fire("Error", "Failed to load Product list or No Product", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, perPage, searchKeyword);
  }, [perPage, searchKeyword, currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(1, perPage, searchKeyword);
  };

  return (
    <div className="global_container">
      <div className="global_sub_container flex flex-col gap-3 md:flex-row justify-between ">
        <div>
          <h1 className="global_heading">Product List (Lite)</h1>
          {/* Toggle Button */}
          <div>
            <button
              className="flex w-full md:w-auto items-center md:justify-center gap-3 border-[1px] border-gray-300 px-3 py-1 rounded-lg "
              onClick={() => setShowUnitCost(!showUnitCost)}
            >
              <span>
                {showUnitCost ? (
                  <BsCheckSquare size={14} />
                ) : (
                  <BsSquare size={14} />
                )}
              </span>
              <span>
                {showUnitCost ? "Hide Purchase Price" : "Show Purchase Price"}
              </span>
            </button>
          </div>
        </div>

        <div>
          {/* Search */}
          <div>
            <div className="flex items-center justify-center gap-3 ">
              <input
                className="global_input"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                type="text"
                placeholder="Search.."
              />
              <button className="global_button" onClick={handleSearch}>
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="global_sub_container">
        <div className=" overflow-x-auto ">
          <div>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <table className="global_table">
                <thead className="global_thead">
                  <tr>
                    <th className="global_th">#</th>
                    <th className="global_th">Name</th>
                    <th className="global_th">Barcode</th>
                    <th className="global_th">Sale Price</th>
                    <th className="global_th">DP</th>
                    <th className="global_th">Stock</th>
                    {showUnitCost && <th className="global_th">Purchase</th>}
                  </tr>
                </thead>
                <tbody className="global_tbody">
                  {productList.length === 0 ? (
                    <tr>
                      <td
                        className="text-center py-5"
                        colSpan={showUnitCost ? 7 : 6}
                      >
                        No Products Found
                      </td>
                    </tr>
                  ) : (
                    productList.map((item, index) => (
                      <tr key={item.ProductlinesId}>
                        <td className="global_td">{index + 1}</td>
                        <td className="global_td">{item.name}</td>
                        <td className="global_td">{item.barcode || "N/A"}</td>
                        <td className="global_td">{item.mrp}</td>
                        <td className="global_td">{item.dp}</td>
                        <td className="global_td">{item.stock}</td>
                        {showUnitCost && <td>{item.unitCost}</td>}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockProduct;
