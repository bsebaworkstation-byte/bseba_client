import React, { useEffect, useState } from "react";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import { formatDate } from "../../Helper/utils";
import TimeAgo from "../../Helper/UI/TimeAgo";
import SerialHistoryModal from "../Modals/SerialHistoryModal";
import { Link } from "react-router-dom";
import WarrantyProcessModal from "../Modals/WarrantyProcessModal";
import SupplierRecieveWarrantyModal from "../Modals/SupplierRecieveWarrantyModal";
import RecieveFromSupplierModal from "../Modals/RecieveFromSupplierModal";
import DeliveryWarrantyModal from "../Modals/DeliveryWarrantyModal";
import WarrantyPrinterModal from "../Modals/WarrrantyPrinterModal";
import { can } from "../../Helper/permissionChecker";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";
const RMA = () => {
  const [activeList, setActiveList] = useState("In-House");
  const [RMAInfo, setRMAInfo] = useState([]);
  const [inHouseWarraynList, setInHouseWarrantyList] = useState([]);
  const [inProcessWarraynList, setInProcessWarrantyList] = useState([]);
  const [readyWarraynList, setReadyWarrantyList] = useState([]);
  const [deliveryWarrantyList, setDeliveryWarrantyList] = useState([]);
  const { setGlobalLoader } = loadingStore();
  const [inHousePage, setInHousePage] = useState(1);
  const [inHouseLimit, setInHouseLimit] = useState(20);
  const [inHouseSearch, setInHouseSearch] = useState("");
  const [inProcessPage, setInProcessPage] = useState(1);
  const [inProcessLimit, setInProcessLimit] = useState(20);
  const [inProcessSearch, setInProcessSearch] = useState("");
  const [readyPage, setReadyPage] = useState(1);
  const [readyLimit, setReadyLimit] = useState(20);
  const [readySearch, setReadySearch] = useState("");
  const [deliveryPage, setDeliveryPage] = useState(1);
  const [deliveryLimit, setDeliveryLimit] = useState(20);
  const [deliverySearch, setDeliverySearch] = useState("");
  const [total, setTotal] = useState(0);
  const [warrantyProcessModal, setWarrantyProcessModal] = useState(false);
  const [warrantyProcessID, setWarrantyProcessID] = useState(null);
  const [supplierRecievedModal, setSupplierRecievedModal] = useState(false);
  const [supplierRecieveProcessID, setSupplierRecieveProcessID] =
    useState(null);
  const [recieveFromSupplierModal, setRecieveFromSupplierModal] =
    useState(false);
  const [recieveFromSupplierData, setRecieveFromSupplierData] = useState(null);
  const [deliveryWarrantyModal, setDeliveryWarrantyModal] = useState(false);
  const [deliveryWarrantyData, setDeliveryWarrantyData] = useState(null);
  const [printDataModal, setPrintDataModal] = useState(false);
  const [printData, setPrintData] = useState(null);

  // language translator
  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);
  const formTrans = useTextTranslate(GlobalFormTranslator);

  // Fetch products
  const fetchRMAInfo = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/RMAInfo`);
      if (res.data.status === "Success") {
        setRMAInfo(res.data.data);
      }
    } catch (error) {
      // ErrorToast("Failed to load serial products");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const fetchInHouseWarrantyList = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/inHouseWarrantyList/${inHousePage}/${inHouseLimit}/${
          inHouseSearch || 0
        }`,
      );
      if (res.data.status === "Success") {
        setInHouseWarrantyList(res.data.data);
        setTotal(res.data.total);
        setInHousePage(1);
      }
    } catch (error) {
      // ErrorToast("Failed to load serial products");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const fetchInProcessWarrantyList = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/inProcessWarrantyList/${inProcessPage}/${inProcessLimit}/${
          inProcessSearch || 0
        }`,
      );
      if (res.data.status === "Success") {
        setInProcessWarrantyList(res.data.data);
        setTotal(res.data.total);
        setInProcessPage(1);
      }
    } catch (error) {
      // ErrorToast("Failed to load serial products");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const fetchReadyWarrantyList = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/ReadyWarrantyList/${readyPage}/${readyLimit}/${readySearch || 0}`,
      );
      if (res.data.status === "Success") {
        setReadyWarrantyList(res.data.data);
        setTotal(res.data.total);
        setReadyPage(1);
      }
    } catch (error) {
      // ErrorToast("Failed to load serial products");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const fetchDeliveryWarrantyList = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/DeliveryWarrantyList/${deliveryPage}/${deliveryLimit}/${
          deliverySearch || 0
        }`,
      );
      if (res.data.status === "Success") {
        setDeliveryWarrantyList(res.data.data);
        setTotal(res.data.total);
        setDeliveryPage(1);
      }
    } catch (error) {
      // ErrorToast("Failed to load serial products");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchInHouseWarrantyList();
  }, [inHouseLimit, inHouseSearch, inHousePage]);

  useEffect(() => {
    fetchInProcessWarrantyList();
  }, [inProcessLimit, inProcessSearch, inProcessPage]);
  useEffect(() => {
    fetchReadyWarrantyList();
  }, [readyLimit, readySearch, readyPage]);
  useEffect(() => {
    fetchDeliveryWarrantyList();
  }, [deliveryLimit, deliverySearch, deliveryPage]);

  useEffect(() => {
    (async () => {
      if (activeList === "In-House") {
        return await fetchInHouseWarrantyList();
      }
      if (activeList === "In-Process") {
        return await fetchInProcessWarrantyList();
      }

      if (activeList === "Ready-Warranty") {
        return await fetchReadyWarrantyList();
      }
      if (activeList === "Delivery") {
        return await fetchDeliveryWarrantyList();
      }
    })();
  }, [activeList]);

  useEffect(() => {
    fetchRMAInfo();
  }, []);
  const reloadInHouse = () => {
    fetchInHouseWarrantyList();
  };
  const reloadInProcess = () => {
    fetchInProcessWarrantyList();
  };
  const reloadReady = () => {
    fetchReadyWarrantyList();
  };
  const reloadDelivery = () => {
    fetchDeliveryWarrantyList();
  };
  useEffect(() => {
    fetchRMAInfo();
  }, [
    warrantyProcessModal,
    deliveryWarrantyModal,
    recieveFromSupplierModal,
    supplierRecievedModal,
  ]);
  const recieved = RMAInfo.find((item) => item._id === "Received");
  const readyWarranty = RMAInfo.find(
    (item) => item._id === "Ready For Delivery",
  );
  const sendToSupplier = RMAInfo.find(
    (item) => item._id === "Send To Supplier",
  );

  const delivery = RMAInfo.find((item) => item._id === "Delivery");

  return (
    <div>
      <div className="flex flex-wrap gap-5">
        {/* Rma Card */}
        <div
          onClick={() => {
            setActiveList("In-House");
          }}
          className={`border border-gray-200 dark:border-gray-700 shadow-sm p-2 ${
            activeList === "In-House" ? "bg-blue-500 text-white" : ""
          } rounded-md`}
        >
          <h1>
            {btn("inHouse")}
            {recieved && (
              <span className="font-bold text-red-600">{recieved.total}</span>
            )}
          </h1>
        </div>
        <div
          onClick={() => {
            setActiveList("In-Process");
          }}
          className={`border border-gray-200 dark:border-gray-700 shadow-sm p-2 ${
            activeList === "In-Process" ? "bg-blue-500 text-white" : ""
          } rounded-md`}
        >
          <h1>
            {btn("inProcess")}
            {sendToSupplier && (
              <span className="font-bold text-red-600">
                {inProcessWarraynList.length}
              </span>
            )}
          </h1>
        </div>
        <div
          onClick={() => {
            setActiveList("Ready-Warranty");
          }}
          className={`border border-gray-200 dark:border-gray-700 shadow-sm p-2 ${
            activeList === "Ready-Warranty" ? "bg-blue-500 text-white" : ""
          } rounded-md`}
        >
          <h1>
            {btn("readyForDelivery")}
            {readyWarranty && (
              <span className="font-bold text-red-600">
                {readyWarranty.total}
              </span>
            )}
          </h1>
        </div>

        <div
          onClick={() => {
            setActiveList("Delivery");
          }}
          className={`border border-gray-200 dark:border-gray-700 shadow-sm p-2 ${
            activeList === "Delivery" ? "bg-blue-500 text-white" : ""
          } rounded-md`}
        >
          <h1>
            {btn("delivery")}
            {delivery && (
              <span className="font-bold text-red-600">{delivery.total}</span>
            )}
          </h1>
        </div>
      </div>
      {/* In HOuse */}
      {activeList === "In-House" && (
        <div className="py-2">
          <div className="flex flex-col gap-2 lg:flex-row justify-between lg:items-center">
            <div>
              <h2 className="text-xl font-semibold flex flex-col pb-2">
                {heading("serialList")}
              </h2>
              <div>
                <select
                  value={inHouseLimit}
                  onChange={(e) => {
                    setInHouseLimit(parseInt(e.target.value));
                    setInHousePage(1);
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
                  Showing {inHouseWarraynList.length} of {total} RMA
                </p>
              </div>
            </div>

            <input
              type="text"
              placeholder="Search Serial..."
              value={inHouseSearch}
              onChange={(e) => {
                setInHouseSearch(e.target.value);
              }}
              className="global_input w-full lg:w-lg"
            />
          </div>
          {/* Table */}
          {inHouseWarraynList.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="global_table">
                  <thead className="global_thead">
                    <tr>
                      {" "}
                      <th className="global_th min-w-40">{table("name")}</th>
                      <th className="global_th">
                        {table("serial")} {table("no")}
                      </th>
                      <th className="global_th">{formTrans("purchase")}</th>
                      <th className="global_th">{table("purchaseContact")}</th>
                      <th className="global_th min-w-22">{btn("sale")}</th>
                      <th className="global_th">{table("receivedDate")}</th>
                      <th className="global_th">{table("saleContact")}</th>
                      <th className="global_th">{table("charge")}</th>
                      <th className="global_th">{table("paid")}</th>
                      <th className="global_th">{table("status")}</th>
                      <th className="global_th">{formTrans("note")}</th>
                      <th className="global_th">{table("action")}</th>
                    </tr>
                  </thead>
                  <tbody className="global_tbody">
                    {inHouseWarraynList.map((w) => (
                      <tr className="global_tr" key={w._id}>
                        <td className="global_td">{w?.Product}</td>
                        <td className="global_td">{w?.serialNo}</td>
                        <td className="global_td">
                          {formatDate(w?.PurchaseDate)}{" "}
                          <TimeAgo date={w?.PurchaseDate} />
                          <span className="text-nowrap">
                            {" "}
                            {w?.PurchaseWarranty} Days
                          </span>
                        </td>{" "}
                        <td className="global_td">{w?.PurchaseContactName}</td>
                        <td className="global_td">
                          {formatDate(w?.SalesDate)}{" "}
                          <TimeAgo date={w?.SalesDate} />
                          <span className="text-nowrap">
                            {" "}
                            {w?.SaleWarranty} Days
                          </span>
                        </td>
                        <td className="global_td">
                          {formatDate(w?.ReceivedDate)}
                        </td>
                        <td className="global_td">
                          {w?.SalesContactName} ({w?.SaleMobile})
                        </td>
                        <td className="global_td">{w?.Charge}</td>
                        <td className="global_td">{w?.Paid}</td>
                        <td className="global_td">{w?.Status}</td>
                        <td className="global_td">{w?.Note}</td>
                        <td className="global_td">
                          <div className="flex gap-2">
                            {" "}
                            {can("SendWarranty") && (
                              <button
                                onClick={() => {
                                  const id = w._id;
                                  setWarrantyProcessID(id);
                                  setWarrantyProcessModal(true);
                                }}
                                className="global_button"
                              >
                                Send Supplier
                              </button>
                            )}
                            <button
                              onClick={() => {
                                const data = w;
                                setPrintData(data);
                                setPrintDataModal(true);
                              }}
                              className="global_button"
                            >
                              Print
                            </button>
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
                    onClick={() => setInHousePage((p) => Math.max(p - 1, 1))}
                    disabled={inHousePage === 1}
                    className={`px-4 py-2 rounded-r-md rounded-l-full ${
                      inHousePage === 1
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "global_button"
                    }`}
                  >
                    {table("previous")}
                  </button>

                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {table("page")} {inHousePage} {table("of")}{" "}
                    {Math.ceil(total / inHouseLimit)}
                  </span>

                  <button
                    onClick={() => setInHousePage((p) => p + 1)}
                    disabled={inHousePage >= Math.ceil(total / inHouseLimit)}
                    className={`px-4 py-2 rounded-l-md rounded-r-full ${
                      inHousePage >= Math.ceil(total / inHouseLimit)
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "global_button"
                    }`}
                  >
                    {table("next")}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No In House List found.</p>
            </div>
          )}
        </div>
      )}

      {/* IN Process */}
      {/* Header + Search + Limit */}
      {activeList === "In-Process" && (
        <div className="py-2">
          <div className="flex flex-col gap-2 lg:flex-row justify-between lg:items-center">
            <div>
              <h2 className="text-xl font-semibold flex flex-col pb-2">
                In-Process List
              </h2>
              <div>
                <select
                  value={inProcessLimit}
                  onChange={(e) => {
                    setInProcessLimit(parseInt(e.target.value));
                    setInProcessPage(1);
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
                  Showing {inProcessWarraynList.length} of {total} RMA
                </p>
              </div>
            </div>

            <input
              type="text"
              placeholder="Search Serial..."
              value={inProcessSearch}
              onChange={(e) => {
                setInProcessSearch(e.target.value);
              }}
              className="global_input w-full lg:w-lg"
            />
          </div>
          {/* Table */}
          {inProcessWarraynList.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="global_table">
                  <thead className="global_thead">
                    <tr>
                      <th className="global_th min-w-40">Name</th>
                      <th className="global_th">Serial No</th>
                      <th className="global_th">Purchase</th>
                      <th className="global_th">Purchase Contact</th>
                      <th className="global_th min-w-22">Sale</th>
                      <th className="global_th">Received Date</th>
                      <th className="global_th">Sale Contact</th>
                      <th className="global_th">Charge</th>
                      <th className="global_th">Paid</th>
                      <th className="global_th">Status</th>
                      <th className="global_th">Note</th>
                      <th className="global_th">Action</th>
                    </tr>
                  </thead>
                  <tbody className="global_tbody">
                    {inProcessWarraynList.map((w) => (
                      <tr className="global_tr" key={w._id}>
                        <td className="global_td">{w?.Product}</td>
                        <td className="global_td">{w?.serialNo}</td>
                        <td className="global_td">
                          {formatDate(w?.PurchaseDate)}{" "}
                          <TimeAgo date={w?.PurchaseDate} />
                          <span className="text-nowrap">
                            {" "}
                            {w?.PurchaseWarranty} Days
                          </span>
                        </td>{" "}
                        <td className="global_td">{w?.PurchaseContactName}</td>
                        <td className="global_td">
                          {formatDate(w?.SalesDate)}{" "}
                          <TimeAgo date={w?.SalesDate} />
                          <span className="text-nowrap">
                            {" "}
                            {w?.SaleWarranty} Days
                          </span>
                        </td>
                        <td className="global_td">
                          {formatDate(w?.ReceivedDate)}
                        </td>
                        <td className="global_td">
                          {w?.SalesContactName} ({w?.SaleMobile})
                        </td>
                        <td className="global_td">{w?.Charge}</td>
                        <td className="global_td">{w?.Paid}</td>
                        <td className="global_td">{w?.Status}</td>
                        <td className="global_td">{w?.Note}</td>
                        <td className="global_td">
                          {can("ReceivedinWarranty") &&
                            w?.Status === "Supplier Received" && (
                              <button
                                onClick={() => {
                                  const id = w._id;
                                  setRecieveFromSupplierData(w);
                                  setRecieveFromSupplierModal(true);
                                }}
                                className="global_button"
                              >
                                Recieve From Supplier
                              </button>
                            )}
                          {w?.Status === "Send To Supplier" && (
                            <button
                              onClick={() => {
                                const id = w._id;
                                setSupplierRecieveProcessID(id);
                                setSupplierRecievedModal(true);
                              }}
                              className="global_edit"
                            >
                              Mark Supplier Received
                            </button>
                          )}
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
                    onClick={() => setInHousePage((p) => Math.max(p - 1, 1))}
                    disabled={inProcessPage === 1}
                    className={`px-4 py-2 rounded-r-md rounded-l-full ${
                      inProcessPage === 1
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "global_button"
                    }`}
                  >
                    Previous
                  </button>

                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {inProcessPage} of {Math.ceil(total / inProcessLimit)}
                  </span>

                  <button
                    onClick={() => setInProcessPage((p) => p + 1)}
                    disabled={
                      inProcessPage >= Math.ceil(total / inProcessLimit)
                    }
                    className={`px-4 py-2 rounded-l-md rounded-r-full ${
                      inProcessPage >= Math.ceil(total / inProcessLimit)
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "global_button"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No In Proceess List found.
              </p>
            </div>
          )}
        </div>
      )}
      {/* Ready Warranty */}
      {/* Header + Search + Limit */}
      {activeList === "Ready-Warranty" && (
        <div className="py-2">
          <div className="flex flex-col gap-2 lg:flex-row justify-between lg:items-center">
            <div>
              <h2 className="text-xl font-semibold flex flex-col pb-2">
                Ready List
              </h2>
              <div>
                <select
                  value={readyLimit}
                  onChange={(e) => {
                    setReadyLimit(parseInt(e.target.value));
                    setReadyPage(1);
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
                  Showing {readyWarraynList.length} of {total} RMA
                </p>
              </div>
            </div>

            <input
              type="text"
              placeholder="Search Serial..."
              value={readySearch}
              onChange={(e) => {
                setReadySearch(e.target.value);
              }}
              className="global_input w-full lg:w-lg"
            />
          </div>
          {/* Table */}
          {readyWarraynList.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="global_table">
                  <thead className="global_thead">
                    <tr>
                      <th className="global_th min-w-40">Name</th>
                      <th className="global_th">Serial No</th>
                      <th className="global_th">Purchase</th>
                      <th className="global_th">Purchase Contact</th>
                      <th className="global_th min-w-22">Sale</th>
                      <th className="global_th">Received Date</th>
                      <th className="global_th">Sale Contact</th>
                      <th className="global_th">Charge</th>
                      <th className="global_th">Paid</th>
                      <th className="global_th">Status</th>
                      <th className="global_th">Note</th>
                      {can("DeliveryWarranty") && (
                        <th className="global_th">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="global_tbody">
                    {readyWarraynList.map((w) => (
                      <tr className="global_tr" key={w._id}>
                        <td className="global_td">{w?.Product}</td>
                        <td className="global_td">
                          <h1 className="flex flex-col">
                            {w?.serialNo}{" "}
                            {!!w?.NewserialNo && (
                              <span className="text-nowrap">
                                New {w?.NewserialNo}
                              </span>
                            )}
                          </h1>
                        </td>
                        <td className="global_td">
                          {formatDate(w?.PurchaseDate)}{" "}
                          <TimeAgo date={w?.PurchaseDate} />
                          <span className="text-nowrap">
                            {" "}
                            {w?.PurchaseWarranty} Days
                          </span>
                        </td>{" "}
                        <td className="global_td">{w?.PurchaseContactName}</td>
                        <td className="global_td">
                          {formatDate(w?.SalesDate)}{" "}
                          <TimeAgo date={w?.SalesDate} />
                          <span className="text-nowrap">
                            {" "}
                            {w?.SaleWarranty} Days
                          </span>
                        </td>
                        <td className="global_td">
                          {formatDate(w?.ReceivedDate)}
                        </td>
                        <td className="global_td">
                          {w?.SalesContactName} ({w?.SaleMobile})
                        </td>
                        <td className="global_td">{w?.Charge}</td>
                        <td className="global_td">{w?.Paid}</td>
                        <td className="global_td">{w?.Status}</td>
                        <td className="global_td">{w?.Note}</td>
                        {can("DeliveryWarranty") && (
                          <td className="global_td">
                            <button
                              onClick={() => {
                                const data = w;
                                setDeliveryWarrantyData(data);
                                setDeliveryWarrantyModal(true);
                              }}
                              className="global_button"
                            >
                              Deliver
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {total > 0 && (
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={() => setReadyPage((p) => Math.max(p - 1, 1))}
                    disabled={readyPage === 1}
                    className={`px-4 py-2 rounded-r-md rounded-l-full ${
                      readyPage === 1
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "global_button"
                    }`}
                  >
                    Previous
                  </button>

                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {readyPage} of {Math.ceil(total / readyLimit)}
                  </span>

                  <button
                    onClick={() => setReadyPage((p) => p + 1)}
                    disabled={readyPage >= Math.ceil(total / readyLimit)}
                    className={`px-4 py-2 rounded-l-md rounded-r-full ${
                      readyPage >= Math.ceil(total / readyLimit)
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "global_button"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No Ready List found.</p>
            </div>
          )}
        </div>
      )}

      {/* Delivery */}
      {activeList === "Delivery" && (
        <div className="py-2">
          <div className="flex flex-col gap-2 lg:flex-row justify-between lg:items-center">
            <div>
              <h2 className="text-xl font-semibold flex flex-col pb-2">
                Delivery List
              </h2>
              <div>
                <select
                  value={deliveryLimit}
                  onChange={(e) => {
                    setDeliveryLimit(parseInt(e.target.value));
                    setDeliveryPage(1);
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
                  Showing {deliveryWarrantyList.length} of {total} RMA
                </p>
              </div>
            </div>

            <input
              type="text"
              placeholder="Search Serial..."
              value={deliverySearch}
              onChange={(e) => {
                setDeliverySearch(e.target.value);
              }}
              className="global_input w-full lg:w-lg"
            />
          </div>
          {/* Table */}
          {deliveryWarrantyList.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="global_table">
                  <thead className="global_thead">
                    <tr>
                      <th className="global_th min-w-40">Name</th>
                      <th className="global_th">Serial No</th>
                      <th className="global_th">Purchase</th>
                      <th className="global_th">Purchase Contact</th>
                      <th className="global_th min-w-22">Sale</th>
                      <th className="global_th">Received Date</th>
                      <th className="global_th">Sale Contact</th>
                      <th className="global_th">Charge</th>
                      <th className="global_th">Paid</th>
                      <th className="global_th">Status</th>
                      <th className="global_th">Note</th>
                      <th className="global_th">Action</th>
                    </tr>
                  </thead>
                  <tbody className="global_tbody">
                    {deliveryWarrantyList.map((w) => (
                      <tr className="global_tr" key={w._id}>
                        <td className="global_td">{w?.Product}</td>
                        <td className="global_td">
                          <h1 className="flex flex-col">
                            {w?.serialNo}{" "}
                            {!!w?.NewserialNo && (
                              <span className="text-nowrap">
                                New {w?.NewserialNo}
                              </span>
                            )}
                          </h1>
                        </td>
                        <td className="global_td">
                          {formatDate(w?.PurchaseDate)}{" "}
                          <TimeAgo date={w?.PurchaseDate} />
                          <span className="text-nowrap">
                            {" "}
                            {w?.PurchaseWarranty} Days
                          </span>
                        </td>{" "}
                        <td className="global_td">{w?.PurchaseContactName}</td>
                        <td className="global_td">
                          {formatDate(w?.SalesDate)}{" "}
                          <TimeAgo date={w?.SalesDate} />
                          <span className="text-nowrap">
                            {" "}
                            {w?.SaleWarranty} Days
                          </span>
                        </td>
                        <td className="global_td">
                          {formatDate(w?.ReceivedDate)}
                        </td>
                        <td className="global_td">
                          {w?.SalesContactName} ({w?.SaleMobile})
                        </td>
                        <td className="global_td">{w?.Charge}</td>
                        <td className="global_td">{w?.Paid}</td>
                        <td className="global_td">{w?.Status}</td>
                        <td className="global_td">{w?.Note}</td>
                        <td className="global_td">
                          {" "}
                          <button
                            onClick={() => {
                              const data = w;
                              setPrintData(data);
                              setPrintDataModal(true);
                            }}
                            className="global_button"
                          >
                            Print
                          </button>
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
                    onClick={() => setDeliveryPage((p) => Math.max(p - 1, 1))}
                    disabled={deliveryPage === 1}
                    className={`px-4 py-2 rounded-r-md rounded-l-full ${
                      deliveryPage === 1
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "global_button"
                    }`}
                  >
                    Previous
                  </button>

                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {deliveryPage} of {Math.ceil(total / deliveryLimit)}
                  </span>

                  <button
                    onClick={() => setDeliveryPage((p) => p + 1)}
                    disabled={readyPage >= Math.ceil(total / deliveryLimit)}
                    className={`px-4 py-2 rounded-l-md rounded-r-full ${
                      deliveryPage >= Math.ceil(total / deliveryLimit)
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "global_button"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No Delivery List found.</p>
            </div>
          )}
        </div>
      )}

      <WarrantyProcessModal
        open={warrantyProcessModal}
        setOpen={setWarrantyProcessModal}
        id={warrantyProcessID}
        reload={reloadInHouse}
      />
      <SupplierRecieveWarrantyModal
        open={supplierRecievedModal}
        setOpen={setSupplierRecievedModal}
        id={supplierRecieveProcessID}
        reload={reloadInProcess}
      />
      <RecieveFromSupplierModal
        open={recieveFromSupplierModal}
        setOpen={setRecieveFromSupplierModal}
        data={recieveFromSupplierData}
        reload={reloadInProcess}
      />
      <DeliveryWarrantyModal
        open={deliveryWarrantyModal}
        setOpen={setDeliveryWarrantyModal}
        data={deliveryWarrantyData}
        reload={reloadReady}
      />
      <WarrantyPrinterModal
        open={printDataModal}
        setOpen={setPrintDataModal}
        data={printData}
      />
    </div>
  );
};

export default RMA;
