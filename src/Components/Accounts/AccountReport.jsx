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
import { Link } from "react-router-dom";

export default function AccountReport() {

    const { id } = useParams();
    const { setGlobalLoader } = loadingStore();
    const { lang } = useLanguageStore();

    const [report, setReport] = useState({});
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [selectedRange, setSelectedRange] = useState("Today");
    const [initialized, setInitialized] = useState(false);

    const { data = [], closingBalance } = report;

    // ISO Date Convert
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

    // Fetch API
    const fetchReport = async () => {

        if (!startDate || !endDate) return;

        const start = toISO(startDate);
        const end = toISO(endDate, true);

        setGlobalLoader(true);

        try {

            const { data } = await api.get(
                `/AcccountReport/${id}/${start}/${end}`
            );

            if (data.status === "Success") {
                setReport(data);
            }

        } catch (error) {
            console.log(error);
            setReport({});
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
            fetchReport();
        }

    }, [startDate, endDate, id, initialized]);

    // Particulars Logic
    const getParticulars = (item) => {

        const name = item.contactDetails?.name || "";
        const mobile = item.contactDetails?.mobile || "";
        const contact = [name, mobile].filter(Boolean).join(" - ");

        // Purchase Payment
        if (item.purchaseID) {
            return `Purchase Payment → ${contact}`;
        }

        // Sale Receive
        if (item.saleID) {
            return `Sale Received → ${contact}`;
        }

        // Salary
        if (item.staffID) {
            return `Salary → ${contact}`;
        }

        // Expense
        if (item.expensesID) {
            return `Expense → ${contact}`;
        }

        // Balance Transfer
        if (item.type === "BalanceTransfer") {

            if (item.Debit > 0) {
                return `Transfer To → ${item.ToAccountName || ""}`;
            }

            if (item.Credit > 0) {
                return `Transfer From → ${item.FromAccountName || ""}`;
            }

        }

        // Received Payment
        if (item.Credit > 0) {
            return `Received From → ${contact}`;
        }

        // Payment
        if (item.Debit > 0) {
            return `Payment → ${contact}`;
        }

        return "---";
    };

    const getReportLink = (item) => {

        if (item.saleID) {
            return `/Invoice/1/${item.saleID}`;
        }

        if (item.purchaseID) {
            return `/PurchaseDetails/${item.purchaseID}`;
        }

        if (item.transactionID) {
            return `/TransactionDetails/${item.transactionID}`;
        }
        if (item.expensesID) {
            return `/ExpenseDetails/${item.expensesID}`;
        }

        return `/${item._id}`;
    };

    const getReportLabel = (item) => {

        if (item.saleID) {
            return "View Sale";
        }

        if (item.purchaseID) {
            return "View Purchase";
        }

        if (item.transactionID) {
            return "View Details";
        }

        if (item.expensesID) {
            return "Expenses Details";
        }

        return "View Report";
    };

    // Totals
    const totalIN = data.reduce((sum, item) => sum + (item.Credit || 0), 0);
    const totalOUT = data.reduce((sum, item) => sum + (item.Debit || 0), 0);

    return (
        <div className="global_container">

            {/* Date Filter */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">

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

                <div className="flex gap-4 pb-4">
                    <div>

                        <label className="block text-sm">
                            {translateDatePickerText.start_date[lang]}
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

                    {/* End Date */}
                    <div>

                        <label className="block text-sm">
                            {translateDatePickerText.end_date[lang]}
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

            {/* Balance Summary */}
            <div className="border border-gray-300 border-l-5 border-l-red-600 w-fit mb-5 rounded-lg p-3">

                <h4 className="font-semibold">Closing Balance</h4>

                <p
                    className={`font-semibold text-lg ${closingBalance > 0 ? "text-green-600" : "text-red-600"
                        }`}
                >
                    {formatNumber(closingBalance)}
                </p>

            </div>

            {/* Ledger Table */}
            <div className="global_sub_container">

                <div className="w-full overflow-auto">

                    <table className="global_table">

                        <thead className="global_thead">

                            <tr className="global_tr">

                                <th className="global_th">#</th>
                                <th className="global_th">Created Date</th>
                                <th className="global_th">Created By</th>
                                <th className="global_th text-left">Particulars</th>
                                <th className="global_th text-right">In Amount</th>
                                <th className="global_th text-right">Out Amount</th>
                                <th className="global_th text-right">Balance</th>
                                <th className="global_th">Note</th>
                                <th className="global_th">Acction</th>

                            </tr>

                        </thead>

                        <tbody className="global_tbody">

                            {data.length > 0 ? (

                                data.map((item, index) => {

                                    const balance =
                                        (item.TotalCredit || 0) - (item.TotalDebit || 0);

                                    return (

                                        <tr key={index} className="global_tr hover:bg-gray-50">

                                            <td className="global_td">{index + 1}</td>

                                            <td className="global_td">

                                                <div className="flex flex-col">

                                                    <span>

                                                        {(() => {
                                                            const d = new Date(item.createdAt);

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
                                                        <TimeAgo date={item.createdAt} /> hit on  {(() => {
                                                            const d = new Date(item.CreatedDate);

                                                            return `${String(d.getDate()).padStart(
                                                                2,
                                                                "0"
                                                            )}-${String(d.getMonth() + 1).padStart(
                                                                2,
                                                                "0"
                                                            )}-${d.getFullYear()}`;
                                                        })()}
                                                    </small>

                                                </div>

                                            </td>
                                            <td className="global_td text-left">
                                                {item.UserDetails}
                                            </td>
                                            <td className="global_td text-left">
                                                <div className="flex flex-col leading-tight">
                                                    <span className="font-medium">
                                                        {getParticulars(item)}
                                                    </span>

                                                    {item?.chequeNo && (
                                                        <span className="text-xs text-gray-400">
                                                            Cheque No: {item.chequeNo}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="global_td text-right text-green-600 font-semibold">
                                                {item.Credit ? formatNumber(item.Credit) : "---"}
                                            </td>

                                            <td className="global_td text-right text-red-600 font-semibold">
                                                {item.Debit ? formatNumber(item.Debit) : "---"}
                                            </td>

                                            <td className="global_td text-right text-blue-600 font-semibold">
                                                {formatNumber(balance)}
                                            </td>

                                            <td className="global_td text-xs text-gray-500 italic">
                                                {item.note || "---"}
                                            </td>
                                            <td className="global_td">
                                                <Link
                                                    to={getReportLink(item)}
                                                    className="global_button"
                                                >
                                                    {getReportLabel(item)}
                                                </Link>
                                            </td>

                                        </tr>

                                    );

                                })

                            ) : (

                                <tr>
                                    <td
                                        colSpan="7"
                                        className="global_td text-center py-10 text-gray-400"
                                    >
                                        No Data Found
                                    </td>
                                </tr>

                            )}

                        </tbody>

                        {/* Footer */}
                        <tfoot>

                            <tr>

                                <td colSpan="4" className="global_td font-semibold">
                                    Total
                                </td>

                                <td className="global_td text-green-600 font-semibold text-end">
                                    {formatNumber(totalIN)}
                                </td>

                                <td className="global_td text-red-600 font-semibold text-end">
                                    {formatNumber(totalOUT)}
                                </td>
                                <td className="global_td text-red-600 font-semibold text-end" ></td>
                                <td className="global_td text-red-600 font-semibold text-end" ></td>
                                <td className="global_td text-red-600 font-semibold text-end" ></td>
                            </tr>

                        </tfoot>

                    </table>

                </div>

            </div>

        </div>
    );
}