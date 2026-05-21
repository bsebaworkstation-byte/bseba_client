import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import { getDateRange } from "../../Helper/dateRangeHelper";
import DatePicker from "react-datepicker";
import { FaCalendarAlt } from "react-icons/fa";
import TimeAgo from "../../Helper/UI/TimeAgo";
import "react-datepicker/dist/react-datepicker.css";
import {
  dateRangeOptions,
  translateDatePickerText,
} from "../../TranslationText/TranslateTextDateRange";
import useLanguageStore from "../../Zustand/languageStore";
import { formatNumber } from "../../Helper/FormatNumber";

export default function BalanceTransferReport() {
  const { id } = useParams();
  const { setGlobalLoader } = loadingStore();
  const [allReport, setAllReport] = useState([]);
  const { lang } = useLanguageStore();

  // date
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState("Today");
  const [initialized, setInitialized] = useState(false);

  const { data = [], account, totalIN, totalOUT } = allReport;

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

  //   fetchaccountreport
  const fetchAccountReport = async () => {
    if (!startDate || !endDate) return;
    const start = toISO(startDate);
    const end = toISO(endDate, true);
    setGlobalLoader(true);
    try {
      const { data } = await api.get(
        `/BalanceTransferReport/${id}/${start}/${end}`
      );
      if (data.status === "Success") {
        setAllReport(data || []);
      }
    } catch (error) {
      console.log(error);
      setAllReport([]);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    const { start, end } = getDateRange("Today");
    setStartDate(new Date(start));
    setEndDate(new Date(end));
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      fetchAccountReport();
    }
  }, [startDate, endDate, id, initialized]);

  return (
    <div className="global_container">
      {/* date */}
      <div className="flex flex-col md:justify-between md:flex-row md:items-center">
        {/* RANGE SELECT */}

        <div>
          <select
            value={selectedRange}
            onChange={(e) => {
              const value = e.target.value;

              setSelectedRange(value);

              if (value !== "Custom") {
                const { start, end } = getDateRange(value);

                setStartDate(new Date(start));

                setEndDate(new Date(end));
              }
            }}
            className="global_dropdown max-w-40"
          >
            {Object.values(dateRangeOptions).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label[lang]}
              </option>
            ))}
          </select>
        </div>

        {/* date picker */}

        <div className="flex gap-4 pb-4">
          <div>
            <label className="block text-sm">
              {
                <label className="block text-sm">
                  {translateDatePickerText.start_date[lang]}
                </label>
              }
            </label>

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
            <label className="block text-sm">
            {  <label className="block text-sm">
                {translateDatePickerText.end_date[lang]}
              </label>}
            </label>

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

      {/* summary */}

      <div className="border-gray-300 border border-l-5 border-l-red-600 w-fit mb-5 rounded-lg p-3">
        <h4 className="font-semibold">{account?.name}</h4>
        <p
          className={`font-semibold text-lg ${
            account?.balance > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {formatNumber(account?.balance)}
        </p>
      </div>
      {/* table */}

      <div className="global_sub_container">
        <div className="w-full overflow-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">#</th>
                <th className="global_th">Date</th>
                <th className="global_th text-left">Particulars</th>
                <th className="global_th text-right">In Amount</th>
                <th className="global_th text-right">Out Amount</th>
                <th className="global_th">Note</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr
                    className="global_tr hover:bg-gray-50 transition-colors"
                    key={index}
                  >
                    <td className="global_td">{index + 1}</td>
                    <td className="global_td">
                      <div className="flex flex-col">
                        <span>
                          {(() => {
                            const d = new Date(item.CreatedDate);
                            return `${String(d.getDate()).padStart(
                              2,
                              "0"
                            )}-${String(d.getMonth() + 1).padStart(
                              2,
                              "0"
                            )}-${d.getFullYear()}`;
                          })()}
                        </span>
                        <small className="text-gray-400">
                          <TimeAgo date={item.CreatedDate} />
                        </small>
                      </div>
                    </td>
                    {/* Particulars column: In hole 'From' er nam, Out hole 'To' er nam */}
                    <td className="global_td">
                      {item.Type === "IN"
                        ? `From: ${item.From}`
                        : `To: ${item.To}`}
                    </td>
                    {/* IN Amount Column */}
                    <td className="global_td font-semibold text-green-600">
                      {item.Type === "IN" ? formatNumber(item.Amount) : "---"}
                    </td>
                    {/* OUT Amount Column */}
                    <td className="global_td font-semibold text-red-600">
                      {item.Type === "OUT" ? formatNumber(item.Amount) : "---"}
                    </td>
                    <td className="global_td italic text-gray-500 text-xs">
                      {item?.note || "---"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="global_tr">
                  <td
                    colSpan="6"
                    className="global_td text-center py-10 text-gray-400"
                  >
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>
            {/* Table Footer with Totals */}
            <tfoot>
              <tr>
                <td colSpan="3" className="global_td">
                  Total:
                </td>
                <td className="global_td text-green-600">
                  {formatNumber(totalIN)}
                </td>
                <td className="global_td text-red-600">
                  {formatNumber(totalOUT)}
                </td>
                <td className="global_td ">
                  
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
