import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../Helper/axios_resonse_interceptor";
import DatePicker from "react-datepicker";
import { FaCalendarAlt } from "react-icons/fa";
import { getDateRange } from "../../Helper/dateRangeHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { ErrorToast } from "../../Helper/FormHelper";
import { printExpense } from "../../Helper/PrintExpense";
import TimeAgo from "../../Helper/UI/TimeAgo";

export default function SrSaleReport() {
  const { id } = useParams();
  const { setGlobalLoader } = loadingStore();

  // date states
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState("This Month");
  const [initialized, setInitialized] = useState(false);

  //   print
  const printRef = useRef();

  // data state
  const [reportData, setReportData] = useState([]);

  const toISO = (date, end = false) => {
    const d = new Date(date);

    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();

    const hours = end ? "23" : "00";
    const minutes = end ? "59" : "00";
    const seconds = end ? "59" : "00";

    return `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}T${hours}:${minutes}:${seconds}.000Z`;
  };

  const fetchReport = async () => {
    if (!startDate || !endDate) return;

    const start = toISO(startDate);
    const end = toISO(endDate, true);

    setGlobalLoader(true);
    try {
      const { data } = await api.get(`/SRSaleReport/${start}/${end}/${id}`);
      if (data.status === "Success") {
        setReportData(data.data || []);
      }
    } catch (error) {
      ErrorToast(error.message);
      setReportData([]);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    const { start, end } = getDateRange("This Month");

    setStartDate(new Date(start));
    setEndDate(new Date(end));

    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      setReportData([]);
      fetchReport();
    }
  }, [startDate, endDate]);

  const handlePrint = () => {
    printExpense(printRef, "sr Sale Report");
  };

  return (
    <div ref={printRef} className="global_container">
      <div
        id="no-print"
        className="flex flex-col md:justify-between md:flex-row md:items-center"
      >
        {/* RANGE SELECT */}
        <div>
          <select
            value={selectedRange}
            onChange={(e) => {
              const opt = e.target.value;
              setSelectedRange(opt);

              if (opt !== "Custom") {
                const { start, end } = getDateRange(opt);
                setStartDate(new Date(start));
                setEndDate(new Date(end));
              }
            }}
            className="global_dropdown max-w-40"
          >
            {[
              "Custom",
              "Today",
              "Last 30 Days",
              "This Week",
              "Last Week",
              "This Month",
              "Last Month",
              "This Year",
              "Last Year",
            ].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        {/* date picker */}

        <div className="flex gap-4 my-5">
          <div>
            <label className="block text-sm">Start Date</label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-3" />
              <DatePicker
                selected={startDate}
                onChange={(d) => setStartDate(d)}
                dateFormat="dd-MM-yyyy"
                className="global_input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm">End Date</label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-3" />
              <DatePicker
                selected={endDate}
                onChange={(d) => setEndDate(d)}
                dateFormat="dd-MM-yyyy"
                className="global_input pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="global_sub_container">
        <h4 className="global_heading">Sr Sale Report</h4>
        <table className="global_table">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th">Date</th>
              <th className="global_th">Invoice no</th>
              <th className="global_th">total</th>
              <th className="global_th">discount</th>
              <th className="global_th">grandTotal</th>
              <th className="global_th">paid</th>
              <th className="global_th">due</th>
              <th className="global_th">profit</th>
              <th className="global_th">action</th>

            </tr>
          </thead>
          <tbody className="global_tbody">
            {reportData.map((item, index) => (
              <tr key={index} className="global_tr">
                <td className="global_td">
                  {" "}
                  {(() => {
                    const d = new Date(item.CreatedDate);

                    const day = String(d.getDate()).padStart(2, "0");
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const year = d.getFullYear();
                    const formattedDate = `${day}-${month}-${year}`;

                    const formattedTime = d.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    });

                    return `${formattedDate} ${formattedTime}`;
                  })()}{" "}
                  <span>
                    <TimeAgo date={item.CreatedDate} />
                  </span>
                </td>
                <td className="global_td">{item?.referenceNo || "N/A"}</td>
                <td className="global_td">{item?.total || 0}</td>
                <td className="global_td">{item?.discount || 0}</td>
                <td className="global_td">{item?.grandTotal || 0}</td>
                <td className="global_td">{item?.paid || 0}</td>
                <td className="global_td">{item?.dueAmount || 0}</td>
                <td className="global_td">{item?.profit || 0}</td>
              
              <td className="global_td">
                <button className="global_button">
                  <Link to={`/Invoice/1/${item._id}`}>View</Link>
                </button>
              </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="global_tr">
              <td colSpan={2} className="text-green-600 global_td">
                Total
              </td>
              <td className="text-green-600 global_td">
                {reportData.reduce(
                  (acc, item) => acc + Number(item.total || 0),
                  0
                )}
              </td>
              <td className="text-green-600 global_td">
                {reportData.reduce(
                  (acc, item) => acc + Number(item.discount || 0),
                  0
                )}
              </td>
              <td className="text-green-600 global_td">
                {reportData.reduce(
                  (acc, item) => acc + Number(item.grandTotal || 0),
                  0
                )}
              </td>
              <td className="text-green-600 global_td">
                {reportData.reduce(
                  (acc, item) => acc + Number(item.paid || 0),
                  0
                )}
              </td>
              <td className="text-green-600 global_td">
                {reportData.reduce(
                  (acc, item) => acc + Number(item.dueAmount || 0),
                  0
                )}
              </td>
              <td className="text-green-600 global_td">
                {reportData.reduce(
                  (acc, item) => acc + Number(item.profit || 0),
                  0
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <button
        id="no-print"
        onClick={handlePrint}
        className="global_button mt-5"
      >
        Print
      </button>
    </div>
  );
}
