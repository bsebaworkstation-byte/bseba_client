import React, { useEffect, useRef, useState } from "react";
import { AiOutlineEye } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";

const CoustomerReport = () => {
  const [coustomerList, setCoustomerList] = useState([]);
  const { setGlobalLoader } = loadingStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortColumn, setSortColumn] = useState("totalSalesAmount");
  const [selectedColumns, setSelectedColumns] = useState({
    totalInvoice: true,
    balance: true,
    totalSales: true,
    totalProfit: true,
    createdDate: true,
  });

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const navigate = useNavigate();
  const componentRef = useRef();

  useEffect(() => {
    const fetchSales = async () => {
      setGlobalLoader(true);
      try {
        const response = await api.get(`/CoustomersReport/${page}//${limit}`);

        if (response.data?.success) {
          toast.success("Customer report loaded successfully ");
        }
        setCoustomerList(response.data.data);
      } catch (error) {
        toast.error(" Failed to fetch sales data");
      } finally {
        setGlobalLoader(false);
      }
    };
    fetchSales();
  }, []);

  const handleSort = (column) => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(order);
    setSortColumn(column);

    const sortedData = [...coustomerList].sort((a, b) => {
      let aValue = a[column];
      let bValue = b[column];

      if (column === "contactDetails.name") {
        aValue = a.contactDetails?.name?.toLowerCase() || "";
        bValue = b.contactDetails?.name?.toLowerCase() || "";
      } else if (column === "contactDetails.mobile") {
        aValue = a.contactDetails?.mobile?.toLowerCase() || "";
        bValue = b.contactDetails?.mobile?.toLowerCase() || "";
      } else if (column === "balance") {
        aValue = a.contactDetails?.balance || 0;
        bValue = b.contactDetails?.balance || 0;
      } else if (column === "CreatedDate") {
        aValue = new Date(a.contactDetails?.CreatedDate);
        bValue = new Date(b.contactDetails?.CreatedDate);
      }

      if (aValue < bValue) return order === "asc" ? -1 : 1;
      if (aValue > bValue) return order === "asc" ? 1 : -1;
      return 0;
    });

    setCoustomerList(sortedData);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const filteredData = coustomerList.filter((customer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.contactDetails?.name?.toLowerCase().includes(searchLower) ||
      customer.contactDetails?.address?.toLowerCase().includes(searchLower) ||
      customer.contactDetails?.mobile?.toLowerCase().includes(searchLower)
    );
  });

  const handleColumnToggle = (column) => {
    setSelectedColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  return (
    <div className="global_container">
      <ToastContainer position="top-right" autoClose={2000} />
      {/* Print, Search, and Column Selection */}
      <div className="global_sub_container">
        <div className="row">
          <div className="col-6">
            <input
              type="text"
              placeholder="Search by Name or Mobile"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="global_input"
            />
          </div>
          <div className="col-6 d-flex justify-content-end">
            {/* <ReactToPrint
              trigger={() => (
                <button className="btn btn-sm global-gradient-color text-white">
                  Print Report
                </button>
              )}
              content={() => componentRef.current}
              documentTitle="Customer Report"
              pageStyle="print"
            /> */}
          </div>
        </div>
        {/* flex flex-row */}
        {/* Column toggle checkboxes */}
        <div className="">
          <div
            className="mt-3 grid gap-2 
                  grid-cols-3 
                  md:flex md:flex-row md:flex-wrap md:items-center md:gap-3"
          >
            {Object.keys(selectedColumns).map((key) => (
              <div className="form-check flex items-center" key={key}>
                <input
                  className="form-check-input accent-blue-600"
                  type="checkbox"
                  checked={selectedColumns[key]}
                  onChange={() => handleColumnToggle(key)}
                />
                <label className="form-check-label ml-1 text-sm">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="global_sub_container">
        {/* Table */}
        <div className="mt-3">
          <div className=" overflow-auto">
            <div
              className="table-container global-custom-scrollbar"
              ref={componentRef}
            >
              <table className="global_table">
                <thead className="global_thead">
                  <tr>
                    <th className="global_th">#</th>
                    <th
                      className="global_th"
                      onClick={() => handleSort("contactDetails.name")}
                      style={{ cursor: "pointer" }}
                    >
                      Customer Name
                    </th>
                    <th className="global_th">Address</th>
                    <th
                      className="global_th"
                      onClick={() => handleSort("contactDetails.mobile")}
                      style={{ cursor: "pointer" }}
                    >
                      Mobile
                    </th>
                    {selectedColumns.totalInvoice && (
                      <th
                        className="global_th"
                        onClick={() => handleSort("totalSalesCount")}
                        style={{ cursor: "pointer" }}
                      >
                        Total Invoice
                      </th>
                    )}
                    {selectedColumns.balance && (
                      <th
                        className="global_th"
                        onClick={() => handleSort("balance")}
                        style={{ cursor: "pointer" }}
                      >
                        Balance
                      </th>
                    )}
                    {selectedColumns.totalSales && (
                      <th
                        className="global_th"
                        onClick={() => handleSort("totalSalesAmount")}
                        style={{ cursor: "pointer" }}
                      >
                        Total Sales
                      </th>
                    )}
                    {selectedColumns.totalProfit && (
                      <th
                        className="global_th"
                        onClick={() => handleSort("totalProfit")}
                        style={{ cursor: "pointer" }}
                      >
                        Total Profit
                      </th>
                    )}
                    {selectedColumns.createdDate && (
                      <th
                        className="global_th"
                        onClick={() => handleSort("CreatedDate")}
                        style={{ cursor: "pointer" }}
                      >
                        Created Date
                      </th>
                    )}
                    <th className="global_th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((customer, index) => (
                      <tr
                        className="global_tr"
                        key={customer.contactID || index}
                      >
                        <td className="global_td ">{index + 1}</td>
                        <td className="global_td ">
                          {customer.contactDetails?.name || "N/A"}
                        </td>
                        <td className="global_td ">
                          {customer.contactDetails?.address || "N/A"}
                        </td>
                        <td className="global_td ">
                          {customer.contactDetails?.mobile || "N/A"}
                        </td>

                        {selectedColumns.totalInvoice && (
                          <td className="global_td ">
                            {customer.totalSalesCount || "N/A"}
                          </td>
                        )}
                        {selectedColumns.balance && (
                          <td className="global_td ">
                            {customer.contactDetails?.balance?.toFixed(2) ||
                              "N/A"}
                          </td>
                        )}
                        {selectedColumns.totalSales && (
                          <td className="global_td ">
                            {new Intl.NumberFormat("en-IN").format(
                              customer.totalSalesAmount?.toFixed(2),
                            )}
                          </td>
                        )}
                        {selectedColumns.totalProfit && (
                          <td className="global_td ">
                            {new Intl.NumberFormat("en-IN").format(
                              customer.totalProfit?.toFixed(2),
                            )}
                          </td>
                        )}
                        {selectedColumns.createdDate && (
                          <td className="global_td ">
                            {formatDate(customer.contactDetails?.CreatedDate)}
                          </td>
                        )}
                        <td className="d-print-none global_td text-center ">
                          {customer.contactID ? (
                            <div className="text-center">
                              <button
                                onClick={() =>
                                  navigate(`/Transaction/${customer.contactID}`)
                                }
                                className="global_button"
                              >
                                Details
                              </button>
                              {/* <AiOutlineEye
                                onClick={() =>
                                  navigate(`/Transaction/${customer.contactID}`)
                                }
                                style={{ cursor: "pointer" }}
                              /> */}
                            </div>
                          ) : (
                            <span className="text-muted">No ID</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={12} className="text-center text-muted py-3">
                        No Customer Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoustomerReport;
