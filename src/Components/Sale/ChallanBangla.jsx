import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { getBusinessDetails } from "../../Helper/SessionHelper";
import api from "../../Helper/axios_resonse_interceptor";
import { printElement } from "../../Helper/Printer";
import formatDateToLocalInBangla from "../../Helper/bangla/formatDateInBangla";

const Challan = () => {
  const { setGlobalLoader } = loadingStore();
  const { id } = useParams();
  const [details, setDetails] = useState(null);
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

  const formatNumberNotTofixed = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "";

    return new Intl.NumberFormat("bn-BD", {
      useGrouping: true,
    }).format(num);
  };

  return (
    <div className="global_container dark:bg-gray-900 dark:text-gray-100">
      <div
        style={{
          width: "210mm",
          margin: "0 auto",
          // padding: "10mm",
          background: "white",
          boxSizing: "border-box",
        }}
        className="dark:bg-gray-800 dark:text-gray-100"
      >
        <div
          ref={printRef}
          className="flex flex-col px-4 justify-between min-h-[266mm] bg-white dark:bg-gray-800 dark:text-gray-100"
        >
          {/* content  */}
          <div>
            {/* Headers */}{" "}
            <div className="flex justify-between my-2 items-end rounded-lg">
              <div className="flex flex-col gap-1">
                <div className="text-lg lg:text-2xl font-semibold flex flex-col">
                  {businessDetails?.businessName ||
                  businessDetails?.logo ||
                  businessDetails?.address ||
                  businessDetails?.mobile ? (
                    <div className="flex items-start border p-2 border-gray-300 rounded-lg gap-2">
                      {businessDetails.logo ? (
                        <img
                          src={businessDetails.logo}
                          height={70}
                          width={70}
                          className="h-fit"
                        />
                      ) : (
                        ""
                      )}
                      <div>
                        <h1 className="pt-3">
                          {businessDetails?.businessName}
                        </h1>
                        <h1 className="text-sm">{businessDetails?.address}</h1>
                        <h1 className="text-sm">{businessDetails?.mobile}</h1>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}

                  { details?.SaleSummary?.BillTo || details?.Customer?.name ||
                  details?.Customer?.mobile ||
                  details?.Customer?.address ? (
                    <div>
                      <h1 className="text-[16px]">{details?.SaleSummary?.BillTo || details?.Customer?.name}</h1>
                      <p className="text-[13px]">{details?.Customer?.mobile}</p>
                      <p className="text-[13px]">
                        {details?.Customer?.address}
                      </p>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              {/* right er Invoice */}
              <div className="flex flex-col text-[12px] lg:text-[13px] w-1/3 font-[500]">
                <h1 className="text-[16px] lg:text-xl text-wrap lg:text-nowrap font-semibold rounded-tl-full bg-green-100 text-gray-800  text-center pl-6 pr-1 lg:px-10 py-3">
                  চালান
                </h1>
                {console.log(details)}
                <p>চালান নং: {details?.SaleSummary?.Reference}</p>
                <p>
                  তারিখ: {formatDateToLocalInBangla(details?.SaleSummary?.Date)}
                </p>
                <p>
                  {" "}
                  {details?.Users?.fullName
                    ? `নাম : ${details?.Users?.fullName}`
                    : ""}
                </p>

                <p>
                  {" "}
                  {details?.Users?.mobile
                    ? ` মোবাইল : ${details?.Users?.mobile}`
                    : ""}
                </p>
              </div>
            </div>
            {/* table */}
            <table className="w-full border-collapse min-h-[400px] mb-2 text-sm">
              <thead>
                <tr className="bg-sky-100 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">
                    নং
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">
                    পণ্য বিবরণ
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                    পরিমাণ
                  </th>
                </tr>
              </thead>

              {/* tbody fix to keep content top */}
              <tbody className="[&>tr>td]:align-top">
                {groupedProducts?.length > 0 ? (
                  groupedProducts.map((p, i) => (
                    // details.Products.map((p, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {/* SL */}
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                        {i + 1}
                      </td>

                      {/* Product */}
                      <td className="border border-gray-300 dark:border-gray-600 p-2">
                        <span className="flex flex-col font-semibold">
                          <span>{p?.name}</span>
                          <span>{p?.serialNos?.join(", ")}</span>
                        </span>
                      </td>

                      {/* Qty */}
                      <td className="border font-semibold border-gray-300 dark:border-gray-600 p-2 text-center">
                        {formatNumberNotTofixed(p?.quantity)} {p?.unit}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center border border-gray-300 dark:border-gray-600 p-3"
                    >
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>

              <tfoot>
                <tr className="bg-sky-50 dark:bg-gray-700 font-semibold">
                  <td
                    colSpan="2"
                    className="border border-gray-300 dark:border-gray-600 p-2"
                  >
                    মোট
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 text-center p-2">
                    {formatNumberNotTofixed(total?.totalQty)}
                  </td>
                </tr>
              </tfoot>
            </table>
            <div className="mt-28">
              <div className="flex gap-16 justify-between items-center mb-3">
                <h1 className="border-t">গ্রাহকের স্বাক্ষর</h1>
                <h1 className="border-t">অনুমোদনকারী স্বাক্ষর</h1>
              </div>
              <p className="text-center text-sm border-t border-gray-400">
                <span className="text-gray-500">সফটওয়্যার নির্মাতা</span>{" "}
                <span className="font-semibold">Bseba.com</span>
              </p>
            </div>
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

export default Challan;
