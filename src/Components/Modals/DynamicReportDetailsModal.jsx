import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ErrorToast } from "../../Helper/FormHelper";
import { getBusinessDetails } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import Barcode from "react-barcode";

const DynamicReportDetailsModal = ({ isOpen, onClose, type, id }) => {
  const [details, setDetails] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const businessDetails = getBusinessDetails();

  // API endpoint mapping
  const getApiEndpoint = (type) => {
    const endpoints = {
      purchase: `/PurchasesDetailsByID/${id}`,
      sale: `/SalesDetailsByID/${id}`,
      purchaseReturn: `/PurchaseReturnDetails/${id}`,
      saleReturn: `/SaleReturnDetails/${id}`,
    };
    return endpoints[type];
  };

  // Fetch details
  const fetchDetails = async () => {
    if (!id || !type) return;

    setGlobalLoader(true);
    try {
      const endpoint = getApiEndpoint(type);
      const res = await api.get(endpoint);

      if (res.data.status === "Success") {
        setDetails(res.data.data);
      } else {
        ErrorToast(res.data.message || "Failed to load details");
      }
    } catch (error) {
      ErrorToast(error.message || "Something went wrong");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    if (isOpen && id) {
      fetchDetails();
    }
  }, [isOpen, id, type]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const formatCurrency = (amount) => Number(amount || 0).toFixed(2);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (!isOpen) return null;

  // Render Purchase Details
  const renderPurchaseDetails = () => (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
        <div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-100 mb-2">
            Supplier Details
          </h3>
          <p className="text-sm">{details?.Supplier?.name}</p>
          <p className="text-sm">{details?.Supplier?.mobile}</p>
          <p className="text-sm">{details?.Supplier?.address}</p>
        </div>

        <div className="text-center">
          <h1 className="font-bold text-xl">
            {businessDetails?.businessName || "Your Business"}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {businessDetails?.address}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {businessDetails?.contactNumber}
          </p>
        </div>

        <div className="text-right">
          <h2 className="font-bold text-xl text-green-600">Purchase Invoice</h2>
          <p className="text-sm">
            Date: {formatDate(details?.PurchaseSummary?.Date)}
          </p>
          <p className="text-sm">Ref: {details?.PurchaseSummary?.Reference}</p>
          <div className="flex justify-end mt-2">
            <Barcode
              value={details?.PurchaseSummary?.Reference || ""}
              height={20}
              width={1.35}
              displayValue={false}
              margin={0}
            />
          </div>
          <p className="text-sm">
            Created By: {details?.Users?.fullName || "N/A"}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-auto max-h-[40vh]">
        <table className="global_table">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th text-center">#</th>
              <th className="global_th text-left">Product</th>
              {details?.Products?.some((p) => p.warranty > 0) && (
                <th className="global_th text-center">Warranty</th>
              )}
              <th className="global_th text-center">QTY</th>
              <th className="global_th text-right">Unit Price</th>
              <th className="global_th text-right">Total</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {details?.Products?.map((p, i) => (
              <tr key={i} className="global_tr">
                <td className="global_td text-center">{i + 1}</td>
                <td className="global_td">
                  <div>{p.name}</div>
                  {p.serialNos && (
                    <div className="flex gap-2 flex-wrap mt-1">
                      {p.serialNos.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-xs border border-gray-300 rounded px-1"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                {details?.Products?.some((p) => p.warranty > 0) && (
                  <td className="global_td text-center">{p.warranty || "-"}</td>
                )}
                <td className="global_td text-center">
                  {p.quantity} {p.unitName}
                </td>
                <td className="global_td text-right">
                  {p.unitCost?.toFixed(2)}
                </td>
                <td className="global_td text-right">{p.total?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex justify-end">
        <div className="border border-gray-600 rounded p-4 w-80 bg-gray-50 dark:bg-gray-800">
          <p className="flex justify-between">
            <strong>Total:</strong>
            {formatCurrency(details?.PurchaseSummary?.total || 0)} Tk
          </p>
          {details?.PurchaseSummary?.discount > 0 && (
            <p className="flex justify-between">
              <strong>Discount:</strong>
              {formatCurrency(details?.PurchaseSummary?.discount || 0)} Tk
            </p>
          )}
          {details?.PurchaseSummary?.cost > 0 && (
            <p className="flex justify-between">
              <strong>Other Cost:</strong>
              {formatCurrency(details?.PurchaseSummary?.cost)} Tk
            </p>
          )}
          <p className="flex justify-between font-semibold">
            <strong>Grand Total:</strong>
            {formatCurrency(details?.PurchaseSummary?.grandTotal || 0)} Tk
          </p>
          <p className="flex justify-between">
            <strong>Paid:</strong>
            {formatCurrency(details?.PurchaseSummary?.paid || 0)} Tk
          </p>
          {details?.PurchaseSummary?.dueAmount > 0 && (
            <p className="flex justify-between">
              <strong>Due Amount:</strong>
              {formatCurrency(details?.PurchaseSummary?.dueAmount || 0)} Tk
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Render Sale Details
  const renderSaleDetails = () => (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div>
              <h1 className="font-bold text-xl">
                {businessDetails?.businessName}
              </h1>
              <p className="text-sm">{businessDetails?.address}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Customer Details</h3>
            <p className="text-sm">{details?.Customer?.name}</p>
            <p className="text-sm">{details?.Customer?.mobile}</p>
            <p className="text-sm">{details?.Customer?.address}</p>
          </div>
        </div>

        <div className="text-right">
          <h2 className="font-bold text-xl text-green-600 mb-2">Invoice</h2>
          <p className="text-sm">
            Invoice No: {details?.SaleSummary?.Reference}
          </p>
          <div className="flex justify-end my-2">
            <Barcode
              value={details?.SaleSummary?.Reference || ""}
              width={1.4}
              height={20}
              displayValue={false}
              margin={0}
            />
          </div>
          <p className="text-sm">
            Date: {formatDate(details?.SaleSummary?.Date)}
          </p>
          <p className="text-sm">Created By: {details?.Users?.name}</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto max-h-[40vh]">
        <table className="global_table">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th text-center">#</th>
              <th className="global_th text-left">Product</th>
              {details?.Products?.some((p) => p.warranty > 0) && (
                <th className="global_th text-center">Warranty</th>
              )}
              <th className="global_th text-center">QTY</th>
              <th className="global_th text-right">Price</th>
              <th className="global_th text-right">Total</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {details?.Products?.map((p, i) => (
              <tr key={i} className="global_tr">
                <td className="global_td text-center">{i + 1}</td>
                <td className="global_td">
                  <div>
                    {p.name} {p.brand}
                  </div>
                  {p.serialNos && (
                    <div className="flex gap-2 flex-wrap mt-1">
                      {p.serialNos.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-xs border border-gray-300 rounded px-1"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                {details?.Products?.some((p) => p.warranty > 0) && (
                  <td className="global_td text-center">{p.warranty || 0}</td>
                )}
                <td className="global_td text-center">
                  {p.quantity} {p.unit}
                </td>
                <td className="global_td text-right">{p.price}</td>
                <td className="global_td text-right">{p.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex justify-end">
        <div className="border rounded p-4 w-80 bg-gray-50 dark:bg-gray-800">
          <p className="flex justify-between">
            <strong>Total:</strong>
            {formatCurrency(details?.SaleSummary?.total || 0)} Tk
          </p>
          {details?.SaleSummary?.discount > 0 && (
            <p className="flex justify-between">
              <strong>Discount:</strong>
              {formatCurrency(details?.SaleSummary?.discount || 0)} Tk
            </p>
          )}
          {details?.SaleSummary?.outher && (
            <p className="flex justify-between">
              <strong>{details?.SaleSummary?.outher}:</strong>
              {formatCurrency(details?.SaleSummary?.outherAmount)} Tk
            </p>
          )}
          <p className="flex justify-between font-semibold">
            <strong>Grand Total:</strong>
            {formatCurrency(details?.SaleSummary?.grandTotal || 0)} Tk
          </p>
          <p className="flex justify-between">
            <strong>Paid:</strong>
            {formatCurrency(details?.SaleSummary?.paid || 0)} Tk
          </p>
          {details?.SaleSummary?.dueAmount > 0 && (
            <p className="flex justify-between">
              <strong>Due Amount:</strong>
              {formatCurrency(details?.SaleSummary?.dueAmount || 0)} Tk
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Render Purchase Return Details
  const renderPurchaseReturnDetails = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center pb-4">
        <h2 className="text-2xl font-bold">{businessDetails?.businessName}</h2>
        <p className="text-sm">{businessDetails?.contactNumber}</p>
        <p className="text-sm">{businessDetails?.address}</p>
        <h3 className="text-lg font-semibold text-green-600 mt-2">
          Purchase Return Details
        </h3>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <h3 className="font-semibold mb-2 border-b pb-1">Customer Details</h3>
          <p>
            <strong>Name:</strong> {details?.contact?.name || "N/A"}
          </p>
          <p>
            <strong>Mobile:</strong> {details?.contact?.mobile || "N/A"}
          </p>
          <p>
            <strong>Address:</strong> {details?.contact?.address || "N/A"}
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2 border-b pb-1">
            Purchase Information
          </h3>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(
              details?.purchaseDetails?.CreatedDate
            ).toLocaleDateString()}
          </p>
          <p>
            <strong>Reference:</strong>{" "}
            {details?.purchaseDetails?.referenceNo || "-"}
          </p>
          <p>
            <strong>Total:</strong>{" "}
            {details?.purchaseDetails?.total?.toFixed(2) || "0.00"}
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2 border-b pb-1">Return Summary</h3>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(details?.CreatedDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Reference:</strong> {details?.referenceNo || "-"}
          </p>
          <p>
            <strong>Created By:</strong>{" "}
            {details?.userDetails?.fullName || "Unknown"}
          </p>
        </div>
      </div>

      {/* Purchase Products */}
      <div>
        <h4 className="font-semibold text-green-600 mb-2">Purchase Products</h4>
        <div className="overflow-x-auto max-h-[30vh]">
          <table className="w-full text-sm border">
            <thead className="global_thead">
              <tr>
                <th className="global_th">#</th>
                <th className="global_th text-left">Product</th>
                <th className="global_th text-right">Quantity</th>
                <th className="global_th text-right">Price</th>
                <th className="global_th text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {details?.purchaseProducts?.map((p, i) => (
                <tr key={i} className="border-b">
                  <td className="global_td">{i + 1}</td>
                  <td className="global_td">{p.name}</td>
                  <td className="global_td text-right">{p.qty}</td>
                  <td className="global_td text-right">
                    {p.unitCost?.toFixed(2)}
                  </td>
                  <td className="global_td text-right">
                    {p.total?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Products */}
      <div>
        <h4 className="font-semibold text-red-600 mb-2">Return Products</h4>
        <div className="overflow-x-auto max-h-[30vh]">
          <table className="global_table">
            <thead className="global_thead">
              <tr>
                <th className="global_th text-left">#</th>
                <th className="global_th text-left">Product</th>
                <th className="global_th text-right">Qty Returned</th>
                <th className="global_th text-right">Price</th>
                <th className="global_th text-right">Total</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {details?.purchaseReturnProducts?.map((p, i) => (
                <tr key={i} className="global_tr">
                  <td className="global_td">{i + 1}</td>
                  <td className="global_td">{p.name}</td>
                  <td className="global_td text-right">{p.qty}</td>
                  <td className="global_td text-right">
                    {p.amount?.toFixed(2)}
                  </td>
                  <td className="global_td text-right">
                    {p.total?.toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="font-semibold bg-gray-100 dark:bg-gray-800">
                <td colSpan="4" className="px-2 py-2 text-right">
                  Return Total
                </td>
                <td className="px-2 py-2 text-right">
                  {details?.total?.toFixed(2) || "0.00"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Sale Return Details
  const renderSaleReturnDetails = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center pb-4">
        <h1 className="text-2xl font-bold">{businessDetails?.businessName}</h1>
        <p className="text-sm">{businessDetails?.contactNumber}</p>
        <p className="text-sm">{businessDetails?.address}</p>
        <h2 className="text-lg font-bold text-green-600 mt-2">
          Sale Return Details
        </h2>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <h4 className="font-semibold mb-2 border-b pb-1">Customer Details</h4>
          <p>
            <strong>Name:</strong> {details?.contact?.name}
          </p>
          <p>
            <strong>Mobile:</strong> {details?.contact?.mobile}
          </p>
          <p>
            <strong>Address:</strong> {details?.contact?.address}
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2 border-b pb-1">Sale Information</h4>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(details?.saleDetails?.CreatedDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Reference:</strong> {details?.saleDetails?.referenceNo}
          </p>
          <p>
            <strong>Total:</strong>{" "}
            {formatCurrency(details?.saleDetails?.total)}
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2 border-b pb-1">Return Summary</h4>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(details?.CreatedDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Reference:</strong> {details?.referenceNo}
          </p>
          <p>
            <strong>Created By:</strong> {details?.userDetails?.fullName}
          </p>
        </div>
      </div>

      {/* Sale Products */}
      <div>
        <h4 className="font-semibold mb-2">Sale Products</h4>
        <div className="overflow-x-auto max-h-[30vh]">
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th text-center">#</th>
                <th className="global_th text-left">Product</th>
                <th className="global_th text-center">Quantity</th>
                <th className="global_th text-right">Price</th>
                <th className="global_th text-right">Total</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {details?.saleProducts?.map((p, i) => (
                <tr key={i} className="global_tr">
                  <td className="global_td text-center">{i + 1}</td>
                  <td className="global_td">{p.name}</td>
                  <td className="global_td text-center">{p.qtySold}</td>
                  <td className="global_td text-right">
                    {formatCurrency(p.price)}
                  </td>
                  <td className="global_td text-right">
                    {formatCurrency(p.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Products */}
      <div>
        <h4 className="font-semibold text-red-600 mb-2">Return Products</h4>
        <div className="overflow-x-auto max-h-[30vh]">
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th text-center">#</th>
                <th className="global_th text-left">Product</th>
                <th className="global_th text-center">Qty Returned</th>
                <th className="global_th text-right">Price</th>
                <th className="global_th text-right">Total</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {details?.saleReturnProducts?.map((p, i) => (
                <tr key={i} className="global_tr">
                  <td className="global_td text-center">{i + 1}</td>
                  <td className="global_td">{p.name}</td>
                  <td className="global_td text-center">{p.qty}</td>
                  <td className="global_td text-right">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="global_td text-right">
                    {formatCurrency(p.total)}
                  </td>
                </tr>
              ))}
              <tr className="font-semibold bg-gray-100 dark:bg-gray-800">
                <td colSpan="4" className="px-2 py-2 text-right">
                  Return Total
                </td>
                <td className="px-2 py-2 text-right">
                  {formatCurrency(details?.total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render content based on type
  const renderContent = () => {
    if (!details) {
      return (
        <div className="flex justify-center items-center h-64 text-gray-500">
          Loading...
        </div>
      );
    }

    switch (type) {
      case "purchase":
        return renderPurchaseDetails();
      case "sale":
        return renderSaleDetails();
      case "purchaseReturn":
        return renderPurchaseReturnDetails();
      case "saleReturn":
        return renderSaleReturnDetails();
      default:
        return <div>Unknown type</div>;
    }
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 dark:text-white text-black flex items-center justify-center overflow-y-auto p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold dark:text-white">
            {type === "purchase" && "Purchase Details"}
            {type === "sale" && "Sale Details"}
            {type === "purchaseReturn" && "Purchase Return Details"}
            {type === "saleReturn" && "Sale Return Details"}
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4">{renderContent()}</div>
      </div>
    </div>,
    document.body
  );
};

export default DynamicReportDetailsModal;
