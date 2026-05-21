import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { printElement } from "../../Helper/Printer";
import api from "../../Helper/axios_resonse_interceptor";

const Print80 = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/SalesDetailsByID/${id}`);
      if (res.data?.status === "Success") {
        setData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching sale details:", error);
    }
  };

  const handlePrint = () => {
    printElement(printRef, `Invoice-${id}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const numberToWords = (num) => {
    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100)
        return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000)
        return (
          a[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 ? " " + inWords(n % 100) : "")
        );
      if (n < 100000)
        return (
          inWords(Math.floor(n / 1000)) +
          " Thousand" +
          (n % 1000 ? " " + inWords(n % 1000) : "")
        );
      if (n < 10000000)
        return (
          inWords(Math.floor(n / 100000)) +
          " Lakh" +
          (n % 100000 ? " " + inWords(n % 100000) : "")
        );
      return n;
    };
    const [whole, decimal] = num.toString().split(".");
    let words = inWords(parseInt(whole));
    if (decimal && parseInt(decimal) !== 0) {
      words += " Point";
      for (let d of decimal) words += " " + a[d];
    }
    return words;
  };

  return (
    <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-900 py-6 min-h-screen">
      <style>
        {`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body { background: white !important; }
          #no-print { display: none !important; }
          .invoice-card {
            width: 80mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
          }
        }
        `}
      </style>

      {/* Invoice Card */}
      <div
        ref={printRef}
        className="invoice-card bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-md border border-gray-300 dark:border-gray-700 rounded p-4 w-[80mm]"
      >
        {/* Header */}
        <div className="text-center mb-2">
          <h2 className="text-lg font-bold">Tech BD</h2>
          <p>01727841588</p>
          <p>Dhaka</p>
          <div className="border-t border-dashed border-gray-400 my-1"></div>
        </div>

        {/* Invoice Info */}
        <div className="text-center text-sm mb-2">
          <p>
            <strong>Invoice:</strong> {data?.SaleSummary?.Reference}
          </p>
          <p>
            {data?.SaleSummary?.Date ? formatDate(data.SaleSummary.Date) : ""}
          </p>
          <p>
            <strong>Customer:</strong> {data?.Customer?.name}
          </p>
          <p>
            <strong>Contact:</strong> {data?.Customer?.mobile}
          </p>
        </div>

        <div className="border-t border-dashed border-gray-400 my-1"></div>

        {/* Product Table */}
        <div className="text-sm px-2 mb-2">
          <div className="flex justify-between font-semibold">
            <span>Item</span>
            <span>Total</span>
          </div>
          {data?.Products?.map((p, i) => (
            <div key={i} className="flex justify-between mt-1">
              <span>{p.name}</span>
              <span>{p.total.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-gray-400 my-1"></div>

        {/* Totals */}
        <div className="text-right text-sm px-2 leading-5">
          <p>
            <strong>Total:</strong> {data?.SaleSummary?.total?.toFixed(2)}
          </p>
          <p>
            <strong>Discount:</strong> {data?.SaleSummary?.discount?.toFixed(2)}
          </p>
          <p>
            <strong>Due Amount:</strong>{" "}
            {data?.SaleSummary?.grandTotal?.toFixed(2)}
          </p>
        </div>

        <div className="border-t border-dashed border-gray-400 my-1"></div>

        {/* Amount in Words */}
        <div className="text-center text-[12px] font-medium mt-1">
          {data?.SaleSummary?.grandTotal
            ? `${numberToWords(data.SaleSummary.grandTotal.toFixed(2))} Taka`
            : ""}
        </div>

        <div className="text-center mt-2 text-sm">
          <p>.................................</p>
          <p className="font-semibold">Bseba Software</p>
        </div>
      </div>

      {/* Buttons */}
      <div id="no-print" className="flex flex-col items-center gap-2 mt-4">
        <button onClick={handlePrint} className="global_button">
          Print 80MM
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/Print58/${id}`)}
            className="global_button"
          >
            58MM Invoice
          </button>
          <button
            onClick={() => navigate(`/A5Print/${id}`)}
            className="global_button"
          >
            A5 Invoice
          </button>
          <button
            onClick={() => navigate(`/SaleDetails/${id}`)}
            className="global_button"
          >
            A4 Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default Print80;

// ekhane ager componet ta ache
// import React, { useEffect, useRef, useState } from "react";
// import axios from "axios";
// import { useParams } from "react-router-dom";
// import { BaseURL } from "../../Helper/Config";
// import { getToken } from "../../Helper/SessionHelper";
// import { printElement } from "../../Helper/Printer";

// const Print80 = () => {
//   const { id } = useParams();
//   const [data, setData] = useState(null);
//   const printRef = useRef();

//   useEffect(() => {
//     fetchData();
//   }, [id]);

//   const fetchData = async () => {
//     try {
//       const res = await axios.get(`${BaseURL}/SalesDetailsByID/${id}`, {
//         headers: { token: getToken() },
//       });
//       if (res.data?.status === "Success") {
//         setData(res.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching sale details:", error);
//     }
//   };

//   const handlePrint = () => {
//     printElement(printRef, `Invoice-${id}`);
//   };

//   const formatDate = (date) => {
//     return new Date(date).toLocaleString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   // Helper to convert numbers to words
//   const numberToWords = (num) => {
//     const a = [
//       "",
//       "One",
//       "Two",
//       "Three",
//       "Four",
//       "Five",
//       "Six",
//       "Seven",
//       "Eight",
//       "Nine",
//       "Ten",
//       "Eleven",
//       "Twelve",
//       "Thirteen",
//       "Fourteen",
//       "Fifteen",
//       "Sixteen",
//       "Seventeen",
//       "Eighteen",
//       "Nineteen",
//     ];
//     const b = [
//       "",
//       "",
//       "Twenty",
//       "Thirty",
//       "Forty",
//       "Fifty",
//       "Sixty",
//       "Seventy",
//       "Eighty",
//       "Ninety",
//     ];

//     const inWords = (num) => {
//       if (num < 20) return a[num];
//       const digit = num % 10;
//       if (num < 100)
//         return b[Math.floor(num / 10)] + (digit ? "-" + a[digit] : "");
//       if (num < 1000)
//         return (
//           a[Math.floor(num / 100)] +
//           " Hundred" +
//           (num % 100 === 0 ? "" : " " + inWords(num % 100))
//         );
//       if (num < 100000)
//         return (
//           inWords(Math.floor(num / 1000)) +
//           " Thousand" +
//           (num % 1000 !== 0 ? " " + inWords(num % 1000) : "")
//         );
//       if (num < 10000000)
//         return (
//           inWords(Math.floor(num / 100000)) +
//           " Lakh" +
//           (num % 100000 !== 0 ? " " + inWords(num % 100000) : "")
//         );
//       return (
//         inWords(Math.floor(num / 10000000)) +
//         " Crore" +
//         (num % 10000000 !== 0 ? " " + inWords(num % 10000000) : "")
//       );
//     };

//     const [whole, decimal] = num.toString().split(".");
//     let result = inWords(parseInt(whole));
//     if (decimal && parseInt(decimal) !== 0) {
//       result += " Point";
//       for (let digit of decimal) result += " " + a[digit];
//     }
//     return result;
//   };

//   return (
//     <div
//       ref={printRef}
//       className="flex flex-col items-center py-4 bg-gray-50 dark:bg-gray-900"
//     >
//       <div className="bg-white dark:bg-gray-800 dark:text-gray-200 shadow-md p-3 w-[80mm] min-h-[297mm] border border-gray-300 dark:border-gray-700 rounded text-[13px]">
//         {/* Header */}
//         <div className="text-center mb-2">
//           <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
//             Tech BD
//           </h2>
//           <p className="text-gray-700 dark:text-gray-300">01727841588</p>
//           <p className="text-gray-700 dark:text-gray-300 mb-1">Dhaka</p>
//           <hr className="border-gray-300 dark:border-gray-600 my-1" />
//         </div>

//         {/* Invoice Info */}
//         <div className="text-center text-sm mb-2">
//           <p>
//             <span className="font-semibold">Invoice:</span>{" "}
//             {data?.SaleSummary?.Reference}
//           </p>
//           <p>
//             <span className="font-semibold">Date:</span>{" "}
//             {data?.SaleSummary?.Date ? formatDate(data.SaleSummary.Date) : ""}
//           </p>
//           {data?.Customer?.name && (
//             <p>
//               <span className="font-semibold">Customer:</span>{" "}
//               {data.Customer.name}
//             </p>
//           )}
//           {data?.Customer?.mobile && <p>{data.Customer.mobile}</p>}
//         </div>

//         <hr className="border-gray-300 dark:border-gray-600 my-1" />

//         {/* Product Table */}
//         <table className="global_table">
//           <thead className="global_thead">
//             <tr className=" text-white">
//               <th className="p-1 global_th text-left">Item</th>
//               <th className="p-1 global_th text-right">Total</th>
//             </tr>
//           </thead>
//           <tbody className="global_tbody">
//             {data?.Products?.length > 0 ? (
//               data.Products.map((p, i) => (
//                 <tr
//                   key={i}
//                   className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
//                 >
//                   <td className="p-1 global_td text-left">
//                     {p.name}
//                     {p.quantity > 1 && (
//                       <div className="text-[11px] text-gray-500 dark:text-gray-400">
//                         {p.quantity} x {p.price.toFixed(2)}
//                       </div>
//                     )}
//                   </td>
//                   <td className="p-1 global_td  text-right">
//                     {p.total.toFixed(2)}
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td
//                   colSpan="2"
//                   className="text-center py-2 text-gray-500 dark:text-gray-400"
//                 >
//                   No items found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>

//         {/* Summary */}
//         <div className="text-right border-t border-gray-300 dark:border-gray-600 pt-2 space-y-1">
//           <p>
//             Total:{" "}
//             <span className="font-semibold">
//               {data?.SaleSummary?.total?.toFixed(2)}
//             </span>
//           </p>
//           {data?.SaleSummary?.discount > 0 && (
//             <p>
//               Discount:{" "}
//               <span className="font-semibold">
//                 {data.SaleSummary.discount.toFixed(2)}
//               </span>
//             </p>
//           )}
//           <p>
//             Payable:{" "}
//             <span className="font-semibold">
//               {data?.SaleSummary?.grandTotal?.toFixed(2)}
//             </span>
//           </p>
//           {data?.SaleSummary?.dueAmount > 0 && (
//             <p className="text-green-600 dark:text-green-400 font-semibold">
//               Due: {data.SaleSummary.dueAmount.toFixed(2)}
//             </p>
//           )}
//         </div>

//         {/* Amount in Words */}
//         <div className="mt-2 text-center text-xs italic text-gray-500 dark:text-gray-400">
//           {data?.SaleSummary?.grandTotal
//             ? `${numberToWords(
//                 data.SaleSummary.grandTotal.toFixed(2)
//               )} Taka Only`
//             : ""}
//         </div>

//         {/* Footer */}
//         <div className="text-center text-xs mt-3 text-gray-500 dark:text-gray-400">
//           <p>
//             Powered by{" "}
//             <span className="text-red-600 dark:text-red-400 font-semibold">
//               Bseba.com
//             </span>
//           </p>
//         </div>
//       </div>

//       {/* Print Button */}
//       <button
//         onClick={handlePrint}
//         id="no-print"
//         className="global_button mt-5"
//       >
//         Print 80mm Invoice
//       </button>
//     </div>
//   );
// };

// export default Print80;
