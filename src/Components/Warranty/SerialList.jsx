import React, { useEffect, useState } from "react";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import { formatDate } from "../../Helper/utils";
import TimeAgo from "../../Helper/UI/TimeAgo";
import SerialHistoryModal from "../Modals/SerialHistoryModal";
import { Link } from "react-router-dom";
import { can } from "../../Helper/permissionChecker";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";

const SerialList = () => {
  const [serials, setSerials] = useState([]);
  const { setGlobalLoader } = loadingStore();
  const [serialSearch, setSerailSearch] = useState("");
  const [serialID, setSerialID] = useState(null);
  const [serialHistoryModal, setSerialHistoryModal] = useState(false);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  // language translator
  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);
  const formTrans = useTextTranslate(GlobalFormTranslator);

  // Fetch products
  const fetchSerials = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/SerialList/${page}/${limit}/${serialSearch || 0}`,
      );
      if (res.data.status === "Success") {
        setSerials(res.data.data);
        setTotal(res.data.total);
      } else {
        setSerials([]);
      }
    } catch (error) {
      // ErrorToast("Failed to load serial products");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSerials();
    }, 500);

    // Cleanup: আগের timeout cancel করা হবে
    return () => clearTimeout(timer);
  }, [serialSearch, limit, page, total]);

  return (
    <div className="global_container">
      <div className="global_sub_container">
        {/* Header + Search + Limit */}
        <div className="py-2">
          <div className="flex flex-col gap-2 lg:flex-row justify-between lg:items-center">
            <div>
              <h2 className="text-xl font-semibold flex flex-col pb-2">
                {heading("serialList")}
              </h2>
              <div>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(parseInt(e.target.value));
                    setPage(1);
                  }}
                  className="global_dropdown"
                >
                  {[10, 20, 50, 100].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt} per page
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Showing {serials.length} of {total} Sales
                </p>
              </div>
            </div>

            <input
              type="text"
              placeholder="Search Serial..."
              value={serialSearch}
              onChange={(e) => {
                setSerailSearch(e.target.value);
              }}
              className="global_input w-full lg:w-lg"
            />
          </div>
        </div>

        {/* Table */}
        {serials.length > 0 ? (
          <div>
            <div className="overflow-x-auto">
              <table className="global_table">
                <thead className="global_thead">
                  <tr>
                    <th className="global_th">{table("no")}</th>
                    <th className="global_th">{table("serial")} {table("no")}</th>
                    <th className="global_th">{table("productName")}</th>
                    <th className="global_th">{table("stock")}</th>
                    <th className="global_th">{formTrans("purchase")} {table("date")}</th>
                    <th className="global_th">{table("action")}</th>
                  </tr>
                </thead>
                <tbody className="global_tbody">
                  {serials.map((serial, index) => (
                    <tr className="global_tr" key={serial._id}>
                      <td className="global_td">{index + 1}</td>
                      <td className="global_td">{serial?.serialNo}</td>
                      <td className="global_td">{serial?.productName}</td>
                      <td className="global_td">
                        {serial?.inStock === "0" ? "No" : "Yes"}{" "}
                        {serial?.rma === "1" && (
                          <Link className="global_button" to={"/RMA"}>
                            In RMA
                          </Link>
                        )}
                      </td>
                      <td className="global_td">
                        {formatDate(serial?.CreatedDate)}{" "}
                        <TimeAgo date={serial?.CreatedDate} />
                      </td>
                      <td className="global_td">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSerialID(serial._id);
                              setTimeout(() => {
                                setSerialHistoryModal(true);
                              }, 50);
                            }}
                            className="global_button"
                          >
                          {btn("view")}
                          </button>
                          {can("ReceivedWarranty") &&
                            serial.rma !== "1" &&
                            serial.inStock === "0" &&
                            !serial?.OldSerialNo && (
                              <Link
                                to={`/receivedWarranty/${serial._id}`}
                                className="global_button"
                              >
                               {btn("warantyReceived")}
                              </Link>
                            )}
                          {!!serial?.OldSerialNo && (
                            <span className="px-2 py-1 shadow-lg bg-gray-200 dark:bg-gray-700">
                              {serial?.OldSerialNo}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {total > 0 && (
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-r-md rounded-l-full ${
                    page === 1
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "global_button"
                  }`}
                >
                  {table("previous")}
                </button>

                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {table("page")} {page} {table("of")} {Math.ceil(total / limit)}
                </span>

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                  className={`px-4 py-2 rounded-l-md rounded-r-full ${
                    page >= Math.ceil(total / limit)
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "global_button"
                  }`}
                >
                  {table("next")}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found.</p>
          </div>
        )}
        <SerialHistoryModal
          open={serialHistoryModal}
          setOpen={setSerialHistoryModal}
          serialID={serialID}
        />
      </div>
    </div>
  );
};

export default SerialList;
