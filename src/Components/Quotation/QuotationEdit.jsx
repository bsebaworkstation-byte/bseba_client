import React, { useEffect, useState } from "react";
import Select from "react-select";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { MdDelete } from "react-icons/md";
import loadingStore from "../../Zustand/LoadingStore";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../Helper/axios_resonse_interceptor";

const EditQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setGlobalLoader } = loadingStore();
  const [quotation, setQuotation] = useState({
    total: 0,
    profit: 0,
    discount: 0,
    grandTotal: 0,
    BillTo: "",
    note: "",
  });

  const [viewTotalPurchasePrice, setViewTotalPurchasePrice] = useState(false);
  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [quotationProducts, setQuotationProducts] = useState([]);
  const [productsOptions, setProductsOptions] = useState([]);

  // Fetch Products

  const fetchProducts = async () => {
    setGlobalLoader(true);
    try {
      const response = await api.get(`/ProductList/1/30/${searchKeyWord || 0}`);
      if (response.data && response.data.status === "Success") {
        const options = response.data.data.map((p) => ({
          value: p._id,
          label: p.name,
          price: p.mrp || 0,
          purchase: p.unitCost || 0,
        }));
        setProductsOptions(options);
      } else {
        ErrorToast("Failed to fetch products");
      }
    } catch (error) {
      console.error(error);
      ErrorToast("API error while fetching products");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchKeyWord]);

  // Fetch Quotation Details
  useEffect(() => {
    const fetchQuotationDetails = async () => {
      setGlobalLoader(true);
      try {
        const res = await api.get(`/QuotationDetailsByID/${id}`);

        if (res.data?.status?.toLowerCase() === "success" && res.data?.data) {
          const summary = res.data.data.QuotationSummary || {};
          const products = res.data.data.Products || [];

          // Set main quotation summary
          setQuotation({
            total: Number(summary.total || 0),
            profit: Number(summary.profit || 0),
            discount: Number(summary.discount || 0),
            grandTotal: Number(summary.grandTotal || 0),
            BillTo: summary.BillTo || "",
            note: summary.note || "",
          });

          // Map products to number fields
          const mappedProducts = products.map((p) => ({
            value: p.id,
            label: p.name,
            qty: Number(p.quantity || 0),
            price: Number(p.price || 0),
            total: Number(p.total || 0),
            purchase: Number(p.unitCost || 0),
            warranty: Number(p.warranty || 0),
          }));

          setQuotationProducts(mappedProducts);
          calculateTotals(mappedProducts, Number(summary.discount || 0));
        } else {
          ErrorToast("Failed to load quotation details");
        }
      } catch (err) {
        console.log(err);
        ErrorToast("API error while fetching quotation");
      } finally {
        setGlobalLoader(false);
      }
    };

    fetchQuotationDetails();
  }, [id]);

  // Calculate totals & profit
  const calculateTotals = (products, discount = quotation.discount) => {
    const total = products.reduce((sum, p) => sum + (p.total || 0), 0);
    const totalPurchase = products.reduce(
      (sum, p) => sum + (p.purchase || 0) * (p.qty || 0),
      0,
    );
    const disc = Number(discount) || 0;
    const grandTotal = total - disc;
    const profit = total - totalPurchase - disc;

    setQuotation((prev) => ({
      ...prev,
      total,
      grandTotal: grandTotal < 0 ? 0 : grandTotal,
      profit,
      discount: disc,
    }));
  };

  // Add product
  const handleProductSelect = (product) => {
    if (!product) return;
    const exists = quotationProducts.find((p) => p.value === product.value);
    if (exists) return ErrorToast("Product already added");

    const newProduct = {
      ...product,
      qty: 1,
      total: product.price,
      warranty: 0,
    };
    const updated = [...quotationProducts, newProduct];
    setQuotationProducts(updated);
    calculateTotals(updated);
  };

  // Remove product
  const handleRemoveProduct = (index) => {
    const updated = quotationProducts.filter((_, i) => i !== index);
    setQuotationProducts(updated);
    calculateTotals(updated);
  };

  // Update product fields

  const handleProductChange = (index, field, value) => {
    const updated = [...quotationProducts];
    updated[index][field] = value;

    const qty = Number(updated[index].qty) || 0;
    const price = Number(updated[index].price) || 0;

    updated[index].total = qty * price;

    setQuotationProducts(updated);
    calculateTotals(updated, quotation.discount); // <-- এখানে discount explicitly পাঠানো হচ্ছে
  };

  const handleDiscountChange = (value) => {
    const disc = value < 0 ? 0 : Number(value) || 0;
    setQuotation((prev) => ({ ...prev, discount: disc }));
    calculateTotals(quotationProducts, disc);
  };

  // Submit update
  const handleSubmit = async () => {
    // if (!quotation.BillTo) return ErrorToast("Enter customer name");
    if (quotationProducts.length === 0)
      return ErrorToast("Add at least 1 product");

    const payload = {
      Quotation: {
        total: quotation.total,
        profit: quotation.profit,
        discount: quotation.discount,
        grandTotal: quotation.grandTotal,
        oldID: id,
        BillTo: quotation.BillTo,
        note: quotation.note,
      },
      QuotationProduct: quotationProducts.map((p) => ({
        productID: p.value,
        qty: p.qty,
        price: p.price,
        total: p.total,
        warranty: p.warranty,
        unitCost: p.purchase,
      })),
    };

    setGlobalLoader(true);
    try {
      const res = await api.post(`/CreateQuotation`, payload);

      if (res.data.status?.toLowerCase() === "success") {
        SuccessToast("Quotation updated successfully!");
        navigate("/QuotationList");
      } else {
        ErrorToast("Update failed");
      }
    } catch (err) {
      console.log(err);
      ErrorToast(err.response.data.message);
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      <div className="global_sub_container">
        <div className="flex items-center justify-between">
          <h2 className="global_heading">Edit Quotation</h2>

          {/* Profit hover */}
          {quotationProducts.length > 0 && (
            <div className="relative group inline-block mr-10">
              <span className="text-sm text-gray-500 cursor-pointer">
                Profit
              </span>
              <div className="absolute left-0 mt-1 bg-gray-800 text-white text-sm px-3 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                {quotation.profit.toFixed(2)} ৳
              </div>
            </div>
          )}
        </div>

        {/* Bill To & Product Select */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <label className="block text-sm font-medium mb-1">Bill To</label>
            <input
              type="text"
              className="global_input"
              placeholder="Customer Name"
              value={quotation.BillTo}
              onChange={(e) =>
                setQuotation({ ...quotation, BillTo: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Product
            </label>
            <Select
              options={productsOptions}
              onChange={handleProductSelect}
              placeholder="Choose Product"
              classNamePrefix="react-select"
              onInputChange={(val) => setSearchKeyWord(val)}
              className="w-full"
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="global_sub_container mt-6">
        <div className="w-full overflow-auto">
          {/* ==================================  */}
          <div className="flex items-center  justify-end">
            <div className=" flex flex-col mb-1  text-center">
              <label className="text-sm font-medium">Purchase Price</label>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setViewTotalPurchasePrice(!viewTotalPurchasePrice)
                  }
                  className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-300 ${
                    viewTotalPurchasePrice ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform duration-300 ${
                      viewTotalPurchasePrice ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
          {/* ==================================  */}
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">#</th>
                <th className="global_th">Product</th>
                <th className="global_th">Warranty</th>
                <th className="global_th">Qty</th>
                {/* <th className="global_th">Warranty</th> */}
                <th className="global_th">Price</th>
                <th className="global_th">Total</th>

                {viewTotalPurchasePrice && (
                  <th className="global_th">Purchase</th>
                )}
                {viewTotalPurchasePrice && (
                  <th className="global_th">Purchase Total</th>
                )}

                <th className="global_th">Remove</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {quotationProducts.length > 0 ? (
                quotationProducts.map((item, index) => (
                  <tr className="global_tr" key={item.value}>
                    <td className="global_td">{index + 1}</td>
                    <td className="global_td">{item.label}</td>
                    <td className="global_td">
                      <input
                        type="number"
                        className="global_input"
                        value={item.warranty}
                        placeholder="Warranty"
                        onChange={(e) =>
                          handleProductChange(index, "warranty", e.target.value)
                        }
                      />
                    </td>
                    <td className="global_td">
                      <input
                        type="number"
                        min={1}
                        className="global_input"
                        value={item.qty}
                        onChange={(e) =>
                          handleProductChange(index, "qty", e.target.value)
                        }
                      />
                    </td>

                    <td className="global_td">
                      <input
                        type="number"
                        className="global_input"
                        value={item.price}
                        onChange={(e) =>
                          handleProductChange(index, "price", e.target.value)
                        }
                      />
                    </td>
                    <td className="global_td">{item.total.toFixed(2)}</td>

                    {viewTotalPurchasePrice && (
                      <td className="global_td">{item.purchase}</td>
                    )}
                    {viewTotalPurchasePrice && (
                      <td className="global_td">
                        {(item.purchase * item.qty).toFixed(2)}
                      </td>
                    )}

                    <td className="global_td text-center">
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 bg-red-600 rounded cursor-pointer hover:bg-red-700"
                        onClick={() => handleRemoveProduct(index)}
                      >
                        <MdDelete size={20} color="white" />
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center text-gray-500 py-4">
                    No products added
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note & Totals */}
      {quotationProducts.length > 0 && (
        <div className="global_sub_container mt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-3 flex flex-col">
              <label className="block text-sm font-medium mb-1">Note:</label>
              <textarea
                className="global_input w-full min-h-[200px] resize-none outline-0 border p-2"
                placeholder="Optional note"
                value={quotation.note}
                onChange={(e) =>
                  setQuotation({ ...quotation, note: e.target.value })
                }
              />
            </div>

            <div className="flex-2 flex-col mt-7 md:w-auto border border-gray-200 dark:border-gray-600 p-3 rounded-2xl">
              <div className="flex items-center mb-3 justify-between">
                <label className="font-medium">Total:</label>
                <input
                  type="number"
                  readOnly
                  className="global_input w-40 rounded-sm text-right"
                  value={quotation.total.toFixed(2)}
                />
              </div>
              <div className="flex items-center mb-3 justify-between">
                <label className="font-medium text-red-600">Discount:</label>
                <input
                  type="number"
                  min={0}
                  className="global_input w-40 rounded-sm text-right"
                  value={quotation.discount === 0 ? "" : quotation.discount}
                  onChange={(e) =>
                    handleDiscountChange(Number(e.target.value) || 0)
                  }
                />
              </div>
              <div className="flex items-center mb-3 justify-between">
                <label className="font-medium">Grand Total:</label>
                <input
                  type="number"
                  readOnly
                  className="global_input w-40 rounded-sm text-right"
                  value={quotation.grandTotal.toFixed(2)}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end">
            <button
              className="global_button w-full md:w-auto"
              onClick={handleSubmit}
            >
              Update Quotation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditQuotation;
