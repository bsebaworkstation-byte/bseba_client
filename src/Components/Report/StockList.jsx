import { useEffect, useState, useRef } from "react";
import api from "../../Helper/axios_resonse_interceptor";
import loadingStore from "../../Zustand/LoadingStore";
import { ErrorToast } from "../../Helper/FormHelper";
import { printExpense } from "../../Helper/PrintExpense";

export default function StockList() {
  const printRef = useRef();
  const { setGlobalLoader } = loadingStore();
  // state
  const [stocks, setStocks] = useState([]);
  const [showPurchasePrice, setShowPurchasePrice] = useState(true);
  const [showStockValue, setShowStockValue] = useState(true);
  const [showSalePrice, setShowSalePrice] = useState(true);

  const fetchStocks = async () => {
    setGlobalLoader(true);
    try {
      const { data } = await api.get("/StockList");
      if (data.status === "Success") {
        setStocks(data.data || []);
      }
    } catch (error) {
      ErrorToast(error.message);
      setStocks([]);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);
  const handlePrint = () => {
    printExpense(printRef);
  };
  return (
    <div className="lg:p-5 p-2" ref={printRef}>
      <div className="flex justify-between items-center">
        <h4 className="global_heading">Stock List</h4>
        <button
          onClick={handlePrint}
          className="global_button my-5"
          id="no-print"
        >
          Print
        </button>
      </div>
      <div className="justify-end flex gap-5 p-3 text-sm" id="no-print">
        <label htmlFor="purchasePrice">Purchase Price</label>
        <input
          type="checkbox"
          name="purchasePrice"
          checked={showPurchasePrice}
          onChange={() => setShowPurchasePrice(!showPurchasePrice)}
          className="
    w-4 h-4 
    accent-green-600 
    cursor-pointer
  "
        />
        <label htmlFor="stockValue">Stock Value</label>
        <input
          type="checkbox"
          name="stockValue"
          checked={showStockValue}
          onChange={() => setShowStockValue(!showStockValue)}
          className="
    w-4 h-4 
    accent-green-600 
    cursor-pointer
  "
        />
        <label htmlFor="salePrice">Sale Price</label>
        <input
          type="checkbox"
          name="salePrice"
          checked={showSalePrice}
          onChange={() => setShowSalePrice(!showSalePrice)}
          className="
    w-4 h-4 
    accent-green-600 
    cursor-pointer
  "
        />
      </div>
      <div className="w-full overflow-auto">
        <table className="global_table">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th">#</th>
              <th className="global_th">name</th>
              <th className="global_th">Brand</th>
              <th className="global_th">Category</th>
              <th className="global_th text-center">Stock</th>
              {showPurchasePrice && (
                <th className="global_th">Purchase Price</th>
              )}
              {showStockValue && <th className="global_th">Stock Value</th>}
              {showSalePrice && <th className="global_th">Sale Price</th>}
            </tr>
          </thead>
          <tbody className="global_tbody">
            {stocks.map((item, index) => (
              <tr className="global_tr">
                <td className="global_td">{index + 1}</td>
                <td className="global_td min-w-30">{item?.name || "N/A"}</td>
                <td className="global_td">{item?.BrandName || "N/A"}</td>
                <td className="global_td">{item?.CategoryName || "N/A"}</td>
                <td className="global_td text-center">{item?.qty}</td>

                {showPurchasePrice && (
                  <td className="global_td">
                    {item?.unitCost?.toFixed(2) || "N/A"}
                  </td>
                )}

                {showStockValue && (
                  <td className="global_td">
                    {(item?.qty * item.unitCost).toFixed(2) || 0}
                  </td>
                )}
                {showSalePrice && (
                  <td className="global_td">
                    {item?.mrp?.toFixed(2) || "N/A"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot className="global_tfoot">
            <tr className="global_tr">
              <td className="global_td"></td>
              <td className="global_td">Total</td>
              <td className="global_td"></td>
              <td className="global_td"></td>
              <td className="global_td"></td>
              {showPurchasePrice && <td className="global_td"></td>}
              {showStockValue && (
                <td className="global_td">
                  {stocks
                    .reduce(
                      (total, item) => total + item?.qty * item.unitCost,
                      0
                    )
                    .toFixed(2) || 0}
                </td>
              )}
              {showSalePrice && <td className="global_td"></td>}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
