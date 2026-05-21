import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import api from "../../Helper/axios_resonse_interceptor";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";

const PurchaseReturn = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { setGlobalLoader } = loadingStore();
  const [loading, setLoading] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [returnData, setReturnData] = useState({ total: 0, note: "" });
  const [error, setError] = useState(null);
  // language translator
  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);
  const formTrans = useTextTranslate(GlobalFormTranslator);

  useEffect(() => {
    const fetchPurchaseDetails = async () => {
      setGlobalLoader(true);
      try {
        const res = await api.get(`/PurchasesDetailsByID/${id}`);
        setPurchaseDetails(res.data.data);
      } catch (err) {
        // alert("Failed to load purchase details.");
        ErrorToast("Failed to load purchase details.");
      } finally {
        setGlobalLoader(false);
      }
    };
    fetchPurchaseDetails();
  }, [id]);

  const handleProductSelection = (product, isSelected) => {
    if (isSelected) {
      setSelectedProducts([
        ...selectedProducts,
        { ...product, returnQty: 0, selectedSerialNos: [] },
      ]);
    } else {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
    }
  };

  const handleSerialNoSelection = (productId, serialNo, isSelected) => {
    setSelectedProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updatedSerials = isSelected
            ? [...p.selectedSerialNos, serialNo]
            : p.selectedSerialNos.filter((s) => s !== serialNo);
          return {
            ...p,
            selectedSerialNos: updatedSerials,
            returnQty: updatedSerials.length,
          };
        }
        return p;
      }),
    );
  };

  const handleQtyChange = (productId, qty) => {
    setSelectedProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const originalQty =
            purchaseDetails.Products.find((prod) => prod.id === productId)
              ?.quantity || 0;
          if (qty > originalQty) {
            ErrorToast("Return quantity cannot exceed purchase quantity.");
            return { ...p, returnQty: originalQty };
          }
          return { ...p, returnQty: qty };
        }
        return p;
      }),
    );
  };

  const calculateReturnTotal = () => {
    return selectedProducts.reduce(
      (sum, p) => sum + p.unitCost * p.returnQty,
      0,
    );
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    const totalReturn = calculateReturnTotal();
    setReturnData({ ...returnData, total: totalReturn });

    const payload = {
      PurchaseReturn: {
        contactID: purchaseDetails.Supplier.id,
        purchaseID: id,
        total: totalReturn,
        note: returnData.note,
      },
      ReturnProduct: selectedProducts.map((p) => ({
        productID: p.id,
        productLineID: p.Productlines,
        qty: p.returnQty,
        amount: p.unitCost,
        total: p.unitCost * p.returnQty,
        serialNos: p.selectedSerialNos,
      })),
    };

    try {
      setLoading(true);
      const res = await api.post(`/PurchaseReturn`, payload);
      if (res.data.status === "Success") {
        SuccessToast("Purchase return submitted successfully!");
        navigate("/PurchaseReturnList");
      } else {
        alert(res.data.message || "Failed to submit return.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting return.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (error) return <div className="container mt-5">{error}</div>;
  if (!purchaseDetails) return null;

  return (
    <div className="container mt-5">
      <div className="card mb-4 shadow-sm">
        <div className="py-1 flex items-center justify-center m-0 p-0 font-semibold">
          <h3 className="mb-4 text-center  text-2xl">
            {heading("purchasesReturn")}
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Supplier Details */}
            <div className=" p-4 rounded-lg ">
              <h5 className="text-lg font-semibold mb-2">
                {heading("supplierDetails")}
              </h5>
              <hr className="mb-2" />
              <p>
                <strong>{formTrans("name")}:</strong> {purchaseDetails.Supplier.name}
              </p>
              <p>
                <strong>{formTrans("mobile")}:</strong> {purchaseDetails.Supplier.mobile}
              </p>
              <p>
                <strong>{formTrans("address")}:</strong> {purchaseDetails.Supplier.address}
              </p>
            </div>

            {/* Purchase Info */}
            <div className=" p-4 ">
              <h5 className="text-lg font-semibold mb-2">
                {heading("purchaseInfo")}
              </h5>
              <hr className="mb-2" />
              <p>
                <strong>{table("date")}:</strong> {purchaseDetails.PurchaseSummary.Date}
              </p>
              <p>
                <strong>{table("reference")}:</strong>{" "}
                {purchaseDetails.PurchaseSummary.Reference}
              </p>
              <p>
                <strong>{formTrans("note")}:</strong>{" "}
                {purchaseDetails.PurchaseSummary.note || "-"}
              </p>
            </div>

            {/* Purchase Summary */}
            <div className="border p-4 border-gray-300 rounded-lg ">
              <h6 className="text-center text-lg font-semibold mb-4">
                {heading("purchasesSummary")}
              </h6>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-medium">{table("total")}:</label>
                  <input
                    type="text"
                    readOnly
                    value={purchaseDetails.PurchaseSummary.total}
                    className="bg-gray-100 dark:bg-gray-800 border dark:border-gray-500 border-gray-300 rounded-md px-3 py-1 text-right w-32"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="font-medium">{formTrans("totalPaid")}:</label>
                  <input
                    type="text"
                    readOnly
                    value={purchaseDetails.PurchaseSummary.paid}
                    className="bg-gray-100 border border-gray-300  dark:border-gray-500 dark:bg-gray-800   rounded-md px-3 py-1 text-right w-32"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="font-medium">{table("dueAmount")}:</label>
                  <input
                    type="text"
                    readOnly
                    value={purchaseDetails.PurchaseSummary.dueAmount}
                    className="bg-gray-100 border border-gray-300 dark:bg-gray-800  dark:border-gray-500 rounded-md px-3 py-1 text-right w-32"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card p-3 shadow-sm mb-3 overflow-auto">
        <table className="global_table w-full">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th">#</th>
              <th className="global_th">{table("name")}</th>
              <th className="global_th">{table("qty")}</th>
              <th className="global_th">{table("amount")}</th>
              <th className="global_th">{table("total")}</th>
              <th className="global_th">{table("select")}</th>
              <th className="global_th">{table("return")} {table("qty")}</th>
              <th className="global_th">{table("serialNos")}</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {purchaseDetails.Products.map((prod, index) => (
              <tr className="global_tr" key={index}>
                <td className="global_td">{index + 1}</td>
                <td className="global_td">{prod.name}</td>
                <td className="global_td">{prod.quantity}</td>
                <td className="global_td">{prod.unitCost}</td>
                <td className="global_td">{prod.total}</td>
                <td className="global_td">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      handleProductSelection(prod, e.target.checked)
                    }
                  />
                </td>
                <td className="global_td">
                  <input
                    type="number"
                    className="form-control form-control-sm global_input"
                    value={
                      selectedProducts.find((p) => p.id === prod.id)
                        ?.returnQty || ""
                    }
                    onChange={(e) =>
                      handleQtyChange(prod.id, parseFloat(e.target.value) || 0)
                    }
                    disabled={prod.serialNos && prod.serialNos.length > 0}
                  />
                </td>
                <td className="global_td">
                  {prod.serialNos?.length > 0 &&
                    prod.serialNos.map((s, i) => (
                      <label key={i} className="me-2">
                        {s}{" "}
                        <input
                          type="checkbox"
                          onChange={(e) =>
                            handleSerialNoSelection(
                              prod.id,
                              s,
                              e.target.checked,
                            )
                          }
                        />
                      </label>
                    ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-end text-danger mt-2">
          <strong className="text-red-500">
            {table("total")} {table("return")} {table("amount")}: {calculateReturnTotal()}
          </strong>
        </div>
      </div>

      {/* Return Note & Submit */}
      <div className="card p-3 shadow-sm">
        <form onSubmit={handleReturnSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              {table("return")} {formTrans("note")}:
            </label>
            <textarea
              className="form-control global_input"
              value={returnData.note}
              onChange={(e) =>
                setReturnData({ ...returnData, note: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="text-end">
            <button type="submit" className="global_button">
              {btn("create")} {table("return")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseReturn;
