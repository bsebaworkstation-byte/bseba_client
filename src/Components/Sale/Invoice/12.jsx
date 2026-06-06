import { useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import Barcode from "react-barcode";
import loadingStore from "../../../Zustand/LoadingStore";
import { getBusinessDetails } from "../../../Helper/SessionHelper";
import api from "../../../Helper/axios_resonse_interceptor";
import formatDateToLocal from "../../../Helper/formatDate";
import { numberToWords } from "../../../Helper/UI/NumberToWord";
import { formatCurrency, formatCurrencyToBangla } from "../../../Helper/formatCurrency";
import { printElement } from "../../../Helper/Printer";
import formatDateToLocalInBangla from "../../../Helper/bangla/formatDateInBangla";
import { numberToWordsInBangla } from "../../../Helper/bangla/NumberToWordInBangla";

const Invoice12 = () => {
    const { setGlobalLoader } = loadingStore();
    const { id } = useParams();
    const [details, setDetails] = useState(null);
    const [showHead, setShowHead] = useState(false);
    const printRef = useRef();
    const businessDetails = getBusinessDetails();

    const fetchdetails = async () => {
        setGlobalLoader(true);
        try {
            const { data } = await api.get(`/SalesDetailsByID/${id}`);
            if (data?.status === "Success") {
                setDetails(data.data);
            }
        } catch (error) {
            console.error("Error fetching sale details:", error);
        } finally {
            setGlobalLoader(false);
        }
    };

    useEffect(() => {
        fetchdetails();
    }, [id]);

    const handlePrint = () => {
        printElement(printRef, `Invoice-${id}`);
    };

    const groupedProducts = useMemo(() => {
        if (!details?.Products) return [];
        return Object.values(
            details.Products.reduce((acc, p) => {
                const key = `${p.id}-${p.price}-${p.warranty}`;
                if (!acc[key]) {
                    acc[key] = {
                        ...p,
                        quantity: Number(p.quantity),
                        total: Number(p.total),
                        serialNos: [...p.serialNos],
                    };
                } else {
                    acc[key].quantity += Number(p.quantity);
                    acc[key].total += Number(p.total);
                    acc[key].serialNos.push(...p.serialNos);
                }
                return acc;
            }, {}),
        );
    }, [details]);

    const total = (groupedProducts ?? []).reduce(
        (acc, item) => ({
            totalQty: acc.totalQty + (Number(item?.quantity) || 0),
            totalPrice:
                acc.totalPrice +
                (Number(item?.price) || 0) * (Number(item?.quantity) || 0),
        }),
        { totalQty: 0, totalPrice: 0 },
    );

    const hasWarranty = groupedProducts?.some((p) => p.warranty);

    // Brand colour used in the curved letterhead decoration
    const accent = "#7FD6D6"; // soft cyan/turquoise as per the reference letterhead
    const accentSoft = "#CFEFEF";
    const accentDeep = "black";

    const toBanglaNumber = (num) =>
        new Intl.NumberFormat('bn-BD', {
            useGrouping: false,
        }).format(num);

    return (
        <div className="global_container">
            {/* Toggle for letterhead head */}
            <div className="mb-3 print:hidden w-fit">
                <label className="flex items-center gap-2 text-sm">
                    <input
                        className="accent-blue-500"
                        type="checkbox"
                        checked={showHead}
                        onChange={() => setShowHead(!showHead)}
                    />
                    <span className="dark:text-gray-300">হেডিং সহ </span>
                </label>
            </div>

            <div
                style={{
                    width: "210mm",
                    margin: "0 auto",
                    boxSizing: "border-box",
                }}
            >
                <div
                    ref={printRef}
                    className="relative flex flex-col min-h-[270mm] bg-white text-gray-900"
                    style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
                >
                    {/* Decorative SVG background - curves & circles */}
                    {showHead && (
                        <svg
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            viewBox="0 0 800 1130"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            {/* Top-left blob behind the header */}
                            <path
                                d="M0,0 L520,0 C500,55 470,90 420,115 C360,140 290,150 220,170 C140,195 70,210 0,250 Z"
                                fill={accent}
                                opacity="0.2"
                            />
                            {/* Top-right small curve */}
                            <path
                                d="M800,0 L800,170 C760,140 720,120 690,90 C660,60 640,30 620,0 Z"
                                fill={accent}
                                opacity="0.2"
                            />
                            {/* Right side mid curve */}
                            <path
                                d="M800,180 C740,210 700,260 720,330 C735,390 790,420 800,430 Z"
                                fill={accentSoft}
                                opacity="0.3"
                            />
                            {/* Bottom-left small circle */}
                            <circle cx="60" cy="900" r="55" fill={accentSoft} opacity="0.4" />
                            <circle cx="20" cy="970" r="35" fill={accent} opacity="0.40" />
                            {/* Bottom-right large circle */}
                            <circle
                                cx="690"
                                cy="970"
                                r="150"
                                fill={accentSoft}
                                opacity="0.4"
                            />
                            <circle cx="600" cy="1080" r="55" fill={accent} opacity="0.40" />
                        </svg>
                    )}

                    {/* Watermark (centered logo + business name) */}
                    {showHead && businessDetails?.logo && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="flex flex-col items-center opacity-[0.05]">
                                <img
                                    src={businessDetails.logo}
                                    alt="watermark"
                                    style={{ width: "260px", height: "260px" }}
                                    className="object-contain"
                                />
                                <span
                                    className="font-bold tracking-wide"
                                    style={{ color: accentDeep, fontSize: "44px" }}
                                >
                                    {businessDetails?.businessName || ""}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* ============== HEADER (letterhead) ============== */}
                    {showHead ? (
                        <div className="relative px-8 pt-6 pb-3">
                            <div className="flex items-center gap-4">
                                {businessDetails?.logo && (
                                    <img
                                        src={businessDetails.logo}
                                        alt="logo"
                                        className="object-contain"
                                        style={{ width: "78px", height: "78px" }}
                                    />
                                )}
                                <div className="flex flex-col">
                                    <h1
                                        className="leading-none font-bold"
                                        style={{ color: accentDeep, fontSize: "42px" }}
                                    >
                                        {businessDetails?.businessName || ""}
                                    </h1>
                                    {businessDetails?.tagline && (
                                        <p
                                            className="mt-1 font-semibold"
                                            style={{ color: accentDeep, fontSize: "14px" }}
                                        >
                                            {businessDetails.tagline}
                                        </p>
                                    )}
                                    {businessDetails?.subTagline && (
                                        <p
                                            className="font-bold tracking-wide"
                                            style={{ color: "#D9352B", fontSize: "11px" }}
                                        >
                                            {businessDetails.subTagline}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* contact bar (rounded white pill) */}
                            <div
                                className="mt-3 relative overflow-hidden inline-flex pr-10 flex-col rounded-md bg-[#4ed3d3] text-white px-4 py-2 text-[12px] font-semibold"

                            >
                                {/* Angle shape */}
                                <div className="absolute -top-3 right-[-28px] w-10 h-18 bg-white transform -rotate-20"></div>
                                {businessDetails?.address && (
                                    <p
                                        className="flex items-center gap-2"
                                        style={{ color: "white" }}
                                    >
                                        <span style={{ color: "white" }}>&#9679;</span>
                                        <span>{businessDetails.address} </span>
                                    </p>
                                )}
                                <p
                                    className="flex items-center gap-3 flex-wrap"
                                    style={{ color: "white" }}
                                >
                                    {businessDetails?.contactNumber && (
                                        <span className="flex items-center gap-1">
                                            <span style={{ color: "white" }}>&#9742;</span>
                                            {businessDetails.contactNumber}
                                        </span>
                                    )}
                                    {businessDetails?.email && (
                                        <span className="flex items-center gap-1">
                                            <span style={{ color: "white" }}>&#9993;</span>
                                            {businessDetails.email}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="pt-0" />
                    )}

                    {/* ============== INVOICE META ============== */}
                    <div className="relative px-8 mt-2">
                        <div className="flex flex-col items-center mb-2">
                            <h2
                                className="px-6 py-1 rounded-full font-bold tracking-widest"
                                style={{
                                    background: accent,
                                    color: "#0f3a3a",
                                    letterSpacing: "4px",
                                    fontSize: "16px",
                                }}
                            >
                                বিক্রয় রশিদ
                            </h2>
                        </div>

                        <div className="flex justify-between gap-4 items-start text-[12.5px]">
                            {/* Left: Customer info */}
                            <div className="w-1/2">

                                {details?.SaleSummary?.BillTo || details?.Customer?.name && (
                                    <p className="font-semibold text-[16px]">
                                        {details?.SaleSummary?.BillTo || details?.Customer?.name}
                                    </p>
                                )}
                                {details?.Customer?.mobile && (
                                    <p className="text-[14px] font-semibold">মোবাইল: {(details.Customer.mobile)}</p>
                                )}
                                {details?.Customer?.address && (
                                    <p className="text-[14px] font-semibold">ঠিকানা: {details.Customer.address}</p>
                                )}
                            </div>

                            {/* Right: Invoice info */}
                            <div className="w-1/2 flex flex-col items-end text-right">
                                <p>
                                    <span className="font-semibold">রশিদ নং:</span>{" "}
                                    {details?.SaleSummary?.Reference || ""}
                                </p>
                                <div className="my-1">
                                    <Barcode
                                        value={details?.SaleSummary?.Reference || "000000"}
                                        width={1.4}
                                        height={24}
                                        fontSize={14}
                                        displayValue={false}
                                        margin={0}
                                    />
                                </div>
                                <p>
                                    <span className="font-semibold">তারিখ:</span>{" "}
                                    {formatDateToLocalInBangla(details?.SaleSummary?.Date)}
                                </p>
                                {details?.Users?.fullName && (
                                    <p>
                                        <span className="font-semibold">তৈরি করেছেন:</span>{" "}
                                        {details.Users.fullName}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ============== PRODUCT TABLE ============== */}
                    <div className="relative px-8 mt-3">
                        <table className="w-full border-collapse text-sm text-[18px]">
                            <thead>
                                <tr style={{ background: accent, color: "#0f3a3a" }}>
                                    <th
                                        className="p-1 text-left"
                                        style={{ border: `1px solid ${accentDeep}` }}
                                    >
                                        নং
                                    </th>
                                    <th
                                        className="p-1 text-left"
                                        style={{ border: `1px solid ${accentDeep}` }}
                                    >
                                        পণ্য বিবরণ
                                    </th>
                                    <th
                                        className="p-1 text-center"
                                        style={{ border: `1px solid ${accentDeep}` }}
                                    >
                                        পরিমাণ
                                    </th>
                                    {hasWarranty && (
                                        <th
                                            className="p-1 text-center"
                                            style={{ border: `1px solid ${accentDeep}` }}
                                        >
                                            Warranty
                                        </th>
                                    )}
                                    <th
                                        className="p-1 text-end"
                                        style={{ border: `1px solid ${accentDeep}` }}
                                    >
                                        দর
                                    </th>
                                    <th
                                        className="p-1 text-end"
                                        style={{ border: `1px solid ${accentDeep}` }}
                                    >
                                        মোট
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="[&>tr>td]:align-top">
                                {groupedProducts?.length > 0 ? (
                                    groupedProducts.map((p, i) => (
                                        <tr key={i}>
                                            <td
                                                className="p-1 text-center font-semibold"
                                                style={{ border: `1px solid ${accentDeep}` }}
                                            >
                                                {i + 1}
                                            </td>
                                            <td
                                                className="p-1"
                                                style={{ border: `1px solid ${accentDeep}` }}
                                            >
                                                <span className="flex flex-col text-[15px] font-semibold">
                                                    <span>{p?.name}</span>
                                                    {p?.serialNos?.length > 0 && (
                                                        <span className="text-xs font-normal">
                                                            {p.serialNos.join(", ")}
                                                        </span>
                                                    )}
                                                </span>
                                            </td>
                                            <td
                                                className="p-1 text-[15px] text-center whitespace-nowrap"
                                                style={{ border: `1px solid ${accentDeep}` }}
                                            >
                                                <span className="font-semibold">                                                {toBanglaNumber(p?.quantity)}</span> {p?.unit}
                                            </td>
                                            {hasWarranty && (
                                                <td
                                                    className="p-1 text-[15px] text-center font-semibold whitespace-nowrap"
                                                    style={{ border: `1px solid ${accentDeep}` }}
                                                >
                                                    {p?.warranty ? `${p.warranty} Days` : ""}
                                                </td>
                                            )}
                                            <td
                                                className="p-1 text-end font-semibold whitespace-nowrap"
                                                style={{ border: `1px solid ${accentDeep}` }}
                                            >
                                                {formatCurrencyToBangla(p?.price)}
                                            </td>
                                            <td
                                                className="p-1 text-end font-semibold whitespace-nowrap"
                                                style={{ border: `1px solid ${accentDeep}` }}
                                            >
                                                {formatCurrencyToBangla(p?.total)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={hasWarranty ? 6 : 5}
                                            className="text-center p-1"
                                            style={{ border: `1px solid ${accentDeep}` }}
                                        >
                                            No items found
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                            <tfoot className="text-[18px] font-semibold">
                                <tr
                                    style={{
                                        background: accentSoft,
                                        color: "#0f3a3a",
                                    }}
                                    className="font-semibold text-[18px]"
                                >
                                    <td
                                        colSpan="2"
                                        className="p-2"
                                        style={{ border: `1px solid ${accentDeep}` }}
                                    >
                                        মোট
                                    </td>
                                    <td
                                        className="p-2 text-center"
                                        style={{ border: `1px solid ${accentDeep}` }}
                                    >
                                        {formatCurrencyToBangla(total?.totalQty)}
                                    </td>
                                    {hasWarranty && (
                                        <td
                                            className="p-2"
                                            style={{ border: `1px solid ${accentDeep}` }}
                                        />
                                    )}
                                    <td
                                        className="p-2"
                                        style={{ border: `1px solid ${accentDeep}` }}
                                    />
                                    <td
                                        className="p-2 text-end"
                                        style={{ border: `1px solid ${accentDeep}` }}
                                    >
                                        {formatCurrencyToBangla(total?.totalPrice)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* ============== TOTALS / NOTE ============== */}
                    <div className="relative px-8 flex gap-2 mt-2">
                        <div className="flex flex-col gap-1 w-[50%]">
                            <span className="text-[18px]">
                                <span className="font-semibold" style={{ color: "black" }}>
                                    কথায়:
                                </span>{" "}
                                <span className="font-bold text-[15px]">{numberToWordsInBangla(details?.SaleSummary?.grandTotal)}</span>
                            </span>
                            {details?.SaleSummary?.note && (
                                <p className="text-sm break-words whitespace-normal">
                                    <span className="font-semibold" style={{ color: "black" }}>
                                        Note:
                                    </span>{" "}
                                    {details.SaleSummary.note}
                                </p>
                            )}
                        </div>

                        <div className="w-[50%] text-[18px]">
                            <p className="flex justify-between font-semibold">
                                <span>মোট:</span>
                                <span>{formatCurrencyToBangla(details?.SaleSummary?.total)} টাকা</span>
                            </p>

                            {details?.SaleSummary?.discount > 0 && (
                                <p className="flex justify-between font-semibold">
                                    <span>Discount:</span>
                                    <span>
                                        {formatCurrencyToBangla(details?.SaleSummary?.discount)} টাকা
                                    </span>
                                </p>
                            )}

                            {details?.SaleSummary?.outher && (
                                <p className="flex justify-between font-semibold">
                                    <span>{details.SaleSummary.outher}:</span>
                                    <span>
                                        {formatCurrencyToBangla(details?.SaleSummary?.outherAmount)} টাকা
                                    </span>
                                </p>
                            )}

                            {(details?.SaleSummary?.discount > 0 ||
                                details?.SaleSummary?.outherAmount > 0) && (
                                    <p
                                        className="flex justify-between font-bold"
                                        style={{ color: "black" }}
                                    >
                                        <span>Grand Total:</span>
                                        <span>
                                            {formatCurrencyToBangla(details?.SaleSummary?.grandTotal)} টাকা
                                        </span>
                                    </p>
                                )}

                            {details?.SaleSummary?.PreviousBalance ? (
                                <p className="flex justify-between font-semibold">
                                    <span>
                                        {details.SaleSummary.PreviousBalance < 0
                                            ? "পূর্ববর্তী বকেয়া:"
                                            : "অগ্রিম:"}
                                    </span>
                                    <span>
                                        {formatCurrencyToBangla(
                                            Math.abs(details.SaleSummary.PreviousBalance),
                                        )}{" "}
                                        টাকা
                                    </span>
                                </p>
                            ) : null}


                            {details?.SaleSummary?.paid ? (
                                <p className="flex justify-between font-semibold">
                                    <span>জমা:</span>
                                    <span>{formatCurrencyToBangla(details?.SaleSummary?.paid)} টাকা</span>
                                </p>
                            ) : null}



                            {details?.SaleSummary?.CurrentBalance ? (
                                <p className="flex justify-between font-semibold">
                                    <span>
                                        {details.SaleSummary.CurrentBalance < 0
                                            ? "মোট বকেয়া:"
                                            : "ব্যালেন্স:"}
                                    </span>
                                    <span>
                                        {formatCurrencyToBangla(
                                            Math.abs(details.SaleSummary.CurrentBalance),
                                        )}{" "}
                                        টাকা
                                    </span>
                                </p>
                            ) : null}
                        </div>
                    </div>

                    {/* spacer pushes signature row to the bottom of the A4 page */}
                    <div className="flex-1" />

                    {/* ============== SIGNATURES ============== */}
                    <div className="relative px-8 pb-6 mt-10">
                        <div className="flex justify-between items-end">
                            <div className="text-center">
                                <div
                                    style={{
                                        borderTop: `1px solid black`,
                                        minWidth: "180px",
                                    }}
                                />
                                <p
                                    className="italic text-[13px] mt-1"
                                    style={{ color: "black" }}
                                >
                                    গ্রাহকের স্বাক্ষর
                                </p>
                            </div>
                            <div className="text-center">
                                <div
                                    style={{
                                        borderTop: `1px solid ${"black"}`,
                                        minWidth: "180px",
                                    }}
                                />
                                <p
                                    className="italic text-[13px] mt-1"
                                    style={{ color: "black" }}
                                >
                                    অনুমোদনকারী স্বাক্ষর
                                </p>
                            </div>
                        </div>

                        {/* business footer */}
                        {businessDetails?.invoiceFooter && (
                            <p className="text-center text-sm mt-2">
                                {businessDetails.invoiceFooter}
                            </p>
                        )}
                        <p className="text-center text-[11px] mt-1">
                            <span className="text-gray-500">সফটওয়্যার নির্মাতা</span>{" "}
                            <span className="font-semibold">Bseba.com</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Print Button */}
            <div className="flex items-center justify-center">
                <button
                    onClick={handlePrint}
                    id="no-print"
                    className="global_button mt-5"
                >
                    Print Invoice
                </button>
            </div>
        </div>
    );
};

export default Invoice12;
