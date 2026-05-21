import React, { useEffect, useMemo, useRef, useState } from "react";
import { printElement } from "../../Helper/Printer";
import { Link } from "react-router-dom";
import { FaSortUp, FaSortDown } from "react-icons/fa";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";

function PayableReport() {
  const [payableAmount, setPayableAmount] = useState(0);
  const { setGlobalLoader } = loadingStore();
  const [payables, setPayables] = useState([]);
  const [searchkey, setSearchKey] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const componentRef = useRef();

  //  Fetch data from API
  const fetchedPayableData = async () => {
    try {
      setGlobalLoader(true);
      const res = await api.get(`/DebitTransactionReport`);

      if (res.data.status === "Success") {
        setPayables(res.data.data || []);
        setPayableAmount(res.data.totalBalance || 0);
      } else {
        console.warn("API returned unsuccessful status", res.data);
      }
    } catch (error) {
      console.error("Failed to fetch payable data", error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchedPayableData();
  }, []);

  // ✅ Update search key
  const handleSearch = (e) => setSearchKey(e.target.value);

  // ✅ Sorting logic
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // ✅ Filter + Sort logic combined
  const filteredAndSortedData = useMemo(() => {
    let sorted = [...payables];

    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.key]?.toString().toLowerCase() || "";
        const bValue = b[sortConfig.key]?.toString().toLowerCase() || "";
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    const searchLower = searchkey.toLowerCase();
    return sorted.filter(
      (p) =>
        p?.name?.toLowerCase().includes(searchLower) ||
        p?.address?.toLowerCase().includes(searchLower) ||
        p?.mobile?.toLowerCase().includes(searchLower)
    );
  }, [payables, searchkey, sortConfig]);

  // ✅ Calculate total balance from filtered data
  const totalFilteredBalance = filteredAndSortedData.reduce(
    (sum, item) => sum + Math.abs(item.balance || 0),
    0
  );

  return (
    <div className="global_container">
      <div className="global_sub_container">
        <h1 className="text-xl font-semibold mb-3">Payable Report</h1>
        <div className="mb-4">
          <span className="font-medium">Total Payable: </span>
          <span>{totalFilteredBalance.toFixed(2)}৳</span>
        </div>

        <div className="flex justify-end items-end">
          <input
            type="text"
            placeholder="Search by name, mobile, address"
            className="global_input max-w-xl"
            value={searchkey}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div ref={componentRef} className="global_sub_container overflow-auto">
        <table className="global_table">
          <thead className="global_thead">
            <tr>
              <th className="global_th">#</th>

              {/* ✅ Sortable Columns */}
              <th
                className="global_th cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Name{" "}
                {sortConfig.key === "name" &&
                  (sortConfig.direction === "asc" ? (
                    <FaSortUp />
                  ) : (
                    <FaSortDown />
                  ))}
              </th>

              <th
                className="global_th cursor-pointer"
                onClick={() => handleSort("mobile")}
              >
                Mobile{" "}
                {sortConfig.key === "mobile" &&
                  (sortConfig.direction === "asc" ? (
                    <FaSortUp />
                  ) : (
                    <FaSortDown />
                  ))}
              </th>

              <th
                className="global_th cursor-pointer"
                onClick={() => handleSort("address")}
              >
                Address{" "}
                {sortConfig.key === "address" &&
                  (sortConfig.direction === "asc" ? (
                    <FaSortUp />
                  ) : (
                    <FaSortDown />
                  ))}
              </th>

              <th
                className="global_th cursor-pointer"
                onClick={() => handleSort("balance")}
              >
                <h1 className=" text-right">
                  {" "}
                  Balance{" "}
                  {sortConfig.key === "balance" &&
                    (sortConfig.direction === "asc" ? (
                      <FaSortUp />
                    ) : (
                      <FaSortDown />
                    ))}
                </h1>
              </th>

              <th className="global_th" id="no-print">
                Balance Sheet
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredAndSortedData.length > 0 ? (
              <>
                {filteredAndSortedData.map((item, index) => (
                  <tr key={item._id} className="border-b global_tr">
                    <td className="global_td">{index + 1}</td>
                    <td className="global_td">{item.name}</td>
                    <td className="global_td">{item.mobile}</td>
                    <td className="global_td">{item.address}</td>
                    <td className="global_td text-right">
                      {Math.abs(item.balance).toFixed(2)}
                    </td>
                    <td className="global_td text-center" id="no-print">
                      <Link
                        to={`/Transaction/${item._id}`}
                        className="global_button"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}

                {/* ✅ Total Row */}
                <tr className="font-semibold bg-gray-100 dark:bg-gray-800">
                  <td colSpan="4" className="text-left global_td">
                    Total:
                  </td>
                  <td className="global_td text-end">
                    {totalFilteredBalance.toFixed(2)}
                  </td>
                  <td colSpan="2" className="global_td" id="no-print"></td>
                </tr>
              </>
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-3 text-gray-500 font-medium"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Print Button */}
      <div className="text-center mt-5">
        <button
          id="no-print"
          onClick={() => printElement(componentRef, "Payable Report")}
          className="global_button w-60"
        >
          Print
        </button>
      </div>
    </div>
  );
}

export default PayableReport;
