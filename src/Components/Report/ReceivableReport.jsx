import React, { useEffect, useMemo, useRef, useState } from "react";
import { MdOutlineMarkEmailRead } from "react-icons/md";
import { printElement } from "../../Helper/Printer";
import { Link } from "react-router-dom";
import { FaSortUp, FaSortDown } from "react-icons/fa";
import { SuccessToast, ErrorToast, IsMobile } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import { getBusinessDetails } from "../../Helper/SessionHelper";

function ReceivableReport() {
  const [dueAmount, setDueAmount] = useState(0);
  const { setGlobalLoader } = loadingStore();
  const [receivables, setReceivables] = useState([]);
  const [searchkey, setSearchKey] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [smsSent, setSmsSent] = useState({});
  const componentRef = useRef();

  //  Fetch data from API
  const fetchedReceivableData = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/CreditTransactionReport`);

      if (res.data.status === "Success") {
        setReceivables(res.data.data || []);
        setDueAmount(res.data.totalBalance || 0);
      } else {
        ErrorToast("Failed to fetch data");
      }
    } catch (error) {
      ErrorToast("Failed to fetch receivable data");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchedReceivableData();
  }, []);

  //  Handle search
  const handleSearch = (e) => setSearchKey(e.target.value);

  //  Sorting logic
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  //  Filter + Sort
  const filteredAndSortedData = useMemo(() => {
    let sorted = [...receivables];

    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.key]?.toString().toLowerCase() || "";
        const bValue = b[sortConfig.key]?.toString().toLowerCase() || "";
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return sorted.filter((r) => {
      const searchLower = searchkey.toLowerCase();
      return (
        r?.name?.toLowerCase().includes(searchLower) ||
        r?.address?.toLowerCase().includes(searchLower) ||
        r?.mobile?.toLowerCase().includes(searchLower)
      );
    });
  }, [receivables, searchkey, sortConfig]);

  //  Total of filtered data
  const totalFilteredBalance = filteredAndSortedData.reduce(
    (sum, item) => sum + Math.abs(item.balance || 0),
    0
  );

  //  Send SMS
  const handleSendSMS = async (mobile, balance, id) => {
    setGlobalLoader(true);
    const businessDetails = getBusinessDetails();

    const message = `Bseba.com - Dear Customer, Your Current Due On ${
      businessDetails?.businessName
    } is ${Math.abs(balance).toFixed(2)}.`;

    try {
      await api.post(`/sendSMS`, { mobile, message });
      SuccessToast("SMS Sent Successfully");
      setSmsSent((prev) => ({ ...prev, [id]: true }));
    } catch (error) {
      ErrorToast("Failed to send SMS");
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      <div className="global_sub_container">
        <h1 className="text-xl font-semibold mb-3">Receivable Report</h1>
        <div className="mb-4">
          <span className="font-medium">Total Due: </span>
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

      <div ref={componentRef} className="global_sub_container overflow-auto ">
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
                Balance{" "}
                {sortConfig.key === "balance" &&
                  (sortConfig.direction === "asc" ? (
                    <FaSortUp />
                  ) : (
                    <FaSortDown />
                  ))}
              </th>

              <th className="global_th" id="no-print">
                Send SMS
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
                    <td className="global_td">
                      {Math.abs(item.balance).toFixed(2)}
                    </td>

                    {/* ✅ SMS Send Button */}
                    <td className="global_td text-center" id="no-print">
                      {IsMobile(item.mobile) && (
                        <button
                          onClick={() =>
                            handleSendSMS(item.mobile, item.balance, item._id)
                          }
                          disabled={smsSent[item._id]}
                          className={`p-2 rounded ${
                            smsSent[item._id]
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          <MdOutlineMarkEmailRead color="white" size={20} />
                        </button>
                      )}
                    </td>

                    {/* ✅ View Button */}
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
                  <td className="global_td">
                    {totalFilteredBalance.toFixed(2)}
                  </td>
                  <td colSpan="2" className="global_td" id="no-print"></td>
                </tr>
              </>
            ) : (
              <tr>
                <td
                  colSpan="7"
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
          onClick={() => printElement(componentRef, "Receivable Report")}
          className="global_button w-60"
        >
          Print
        </button>
      </div>
    </div>
  );
}

export default ReceivableReport;
