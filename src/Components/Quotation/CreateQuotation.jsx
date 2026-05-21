import React, { useEffect, useState } from "react";
import Select from "react-select";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { MdDelete } from "react-icons/md";
import loadingStore from "../../Zustand/LoadingStore";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import { useNavigate } from "react-router-dom";
import api from "../../Helper/axios_resonse_interceptor";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";

const CreateQuotation = () => {
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
  const [quotationProducts, setQuotationProducts] = useState([]);
  const [productsOptions, setProductsOptions] = useState([]);
  const [searchKeyWord, setSearchKeyWord] = useState("");

  // language translator
  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);
  const formTrans = useTextTranslate(GlobalFormTranslator);

  // Fetch products

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

  // Add product
  const handleProductSelect = (product) => {
    if (!product) return;

    const exists = quotationProducts.find((p) => p.value === product.value);
    if (exists) {
      const updated = quotationProducts.map((p) =>
        p.value === product.value
          ? {
              ...p,
              qty: (p.qty || 1) + 1,
              total: ((p.qty || 1) + 1) * p.price,
            }
          : p,
      );
      setQuotationProducts(updated);
      calculateTotals(updated);
      return;
    }

    // New product: don't set warranty
    const newProduct = { ...product, qty: 1, total: product.price };
    setQuotationProducts([...quotationProducts, newProduct]);
    calculateTotals([...quotationProducts, newProduct]);
  };

  // Remove product
  const handleRemoveProduct = (indexToRemove) => {
    const updated = quotationProducts.filter((_, i) => i !== indexToRemove);
    setQuotationProducts(updated);
    calculateTotals(updated, quotation.discount);
  };

  const handleProductChange = (index, field, value) => {
    const updated = [...quotationProducts];

    // Allow empty string (so user can delete digits)
    updated[index][field] = value;

    // Convert to number safely for calculations
    const qty = Number(updated[index].qty) || 0;
    const price = Number(updated[index].price) || 0;
    const warranty = Number(updated[index].warranty) || 0; // default warranty = 0
    updated[index].warranty = warranty; // store 0 when empty

    // Update total when qty or price changes
    updated[index].total = qty * price;

    setQuotationProducts(updated);
    calculateTotals(updated);
  };

  // Calculate totals

  const calculateTotals = (products, discount = quotation.discount) => {
    const total = products.reduce((sum, p) => sum + (p.total || 0), 0);
    const totalPurchase = products.reduce(
      (sum, p) => sum + (p.purchase || 0) * (p.qty || 0),
      0,
    );

    const grandTotal = total - discount;

    //  UPDATED PROFIT FORMULA (discount affects profit)
    const profit = total - totalPurchase - discount;

    setQuotation((prev) => ({
      ...prev,
      total,
      profit,
      grandTotal,
    }));
  };

  // Discount
  const handleDiscountChange = (value) => {
    const discount = value < 0 ? 0 : value;
    setQuotation((prev) => ({ ...prev, discount }));
    calculateTotals(quotationProducts, discount);
  };

  // Submit
  const handleSubmit = async () => {
    if (quotationProducts.length === 0)
      return ErrorToast("Add at least one product!");
    if (quotation.total <= 0) return ErrorToast("Invalid total amount!");

    const payload = {
      Quotation: quotation,
      QuotationProduct: quotationProducts.map((p) => ({
        productID: p.value,
        qty: p.qty,
        price: p.price,
        total: p.total,
        warranty: Number(p.warranty) || 0, // <-- send warranty
        unitCost: p.purchase,
      })),
    };

    setGlobalLoader(true);
    try {
      const res = await api.post(`/CreateQuotation`, payload);

      if (res.data.status === "Success") {
        SuccessToast("Quotation created successfully!");
        // Reset
        setQuotation({
          total: 0,
          profit: 0,
          discount: 0,
          grandTotal: 0,
          BillTo: "",
          note: "",
        });

        setQuotationProducts([]);
        navigate(`/QuotationDetails/${res?.data?.quotationID}/quotation`);
      } else {
        ErrorToast("Failed to create quotation");
      }
    } catch (err) {
      console.error(err);
      ErrorToast(err.response.data.message);
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      <div className="global_sub_container">
        <div className="flex items-center justify-between">
          <h2 className="global_heading">{heading("createNewQuotation")}</h2>
          {/* =====================  */}
          {/* Hover Profit Box */}
          {quotationProducts.length > 0 && (
            <div className="mb-3">
              <div className="relative group inline-block mr-10">
                <span className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
                  {formTrans("profit")}
                </span>

                {/* Hidden box — hover করলে দেখাবে */}
                <div className=" absolute left-0 mt-1 bg-gray-800 text-white text-sm px-3 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                  {quotation.profit.toFixed(2)} ৳
                </div>
              </div>
            </div>
          )}

          {/* =====================  */}
        </div>

        {/* Bill To & Product Select */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{formTrans("billTo")}</label>
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
           {formTrans("selectProduct")}
            </label>
            <Select
              options={productsOptions}
              onChange={handleProductSelect}
              onInputChange={(val) => setSearchKeyWord(val)}
              placeholder="Choose Product"
              classNamePrefix="react-select"
              className="w-full"
              menuPortalTarget={document.body}
              styles={getReactSelectStyles()}
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="global_sub_container">
        <div className="w-full overflow-auto ">
          {/* ==================================  */}
          <div className="flex items-center  justify-end">
            <div className=" flex flex-col mb-1  text-center">
              <label className="text-sm font-medium">{btn("purchasePrice")}</label>

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
                <th className="global_th">{formTrans("product")}</th>
                <th className="global_th">{table("warranty")}</th>
                <th className="global_th">{table("qty")}</th>
                <th className="global_th">{formTrans("price")}</th>
                <th className="global_th">{table("total")}</th>

                {viewTotalPurchasePrice && (
                  <th className="global_th">{formTrans("purchase")}</th>
                )}

                {viewTotalPurchasePrice && (
                  <th className="global_th">{formTrans("purchase")} {table("total")}</th>
                )}

                <th className="global_th">{table("action")}</th>
              </tr>
            </thead>

            {quotationProducts.length > 0 ? (
              <tbody className="global_tbody">
                {quotationProducts.map((item, index) => (
                  <tr className="global_tr" key={item.value}>
                    <td className="global_td">{index + 1}</td>
                    <td className="global_td">{item.label}</td>
                    <td className="global_td">
                      <input
                        type="number"
                        value={item.warranty || ""} // show empty if undefined
                        className="global_input"
                        placeholder="Enter warranty"
                        onChange={(e) =>
                          handleProductChange(index, "warranty", e.target.value)
                        }
                      />
                    </td>
                    <td className="global_td">
                      <input
                        type="number"
                        value={item.qty}
                        // defaultValue={1}
                        min={1}
                        className="global_input"
                        onChange={(e) =>
                          handleProductChange(index, "qty", e.target.value)
                        }
                      />
                    </td>

                    <td className="global_td">
                      <input
                        type="number"
                        value={item.price}
                        className={`border-[2px] p-1 rounded-2xl outline-0 ${
                          item.price > 0 ? "border-green-600" : "border-red-600"
                        }`}
                        onChange={(e) =>
                          handleProductChange(index, "price", e.target.value)
                        }
                      />
                    </td>
                    <td className="global_td">{item?.total?.toFixed(2)}</td>
                    {viewTotalPurchasePrice && (
                      <td className="global_td">{item?.purchase}</td>
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
                ))}
              </tbody>
            ) : (
              <tr>
                <td colSpan={9} className="text-center text-gray-500 py-4">
                  No products found
                </td>
              </tr>
            )} 
          </table>
        </div>
      </div>

      {/* Note and Totals */}
      {quotationProducts.length > 0 && (
        <div className="global_sub_container">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-3 flex flex-col">
              <label className="block text-sm font-medium mb-1">{formTrans("note")}:</label>
              <textarea
                className="global_input w-full min-h-[257px] resize-none outline-0 border p-2"
                placeholder="Optional note"
                value={quotation.note}
                onChange={(e) =>
                  setQuotation({ ...quotation, note: e.target.value })
                }
              />
            </div>

            <div className="flex-2 flex-col mt-7 md:w-auto border dark:border-gray-700 border-gray-200 p-3 rounded-2xl ">
              <div className="flex items-center mb-3 justify-between ">
                <label className="font-medium ">{table("total")}:</label>
                <input
                  type="number"
                  readOnly
                  className="global_input w-40 rounded-sm text-right"
                  value={quotation.total.toFixed(2)}
                />
              </div>
              <div className="flex items-center mb-3 justify-between">
                <label className="font-medium text-red-600">{formTrans("discount")}:</label>
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
              {/* <div className="flex items-center mb-3 justify-between">
                <label className="font-medium">Profit:</label>
                <input
                  type="number"
                  readOnly
                  className="global_input w-40 rounded-sm text-right"
                  value={quotation.profit.toFixed(2)}
                />
              </div> */}
              <div className="flex items-center mb-3 justify-between">
                <label className="font-medium">{formTrans("grandTotal")}:</label>
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
              className="global_button  w-full md:w-auto"
              onClick={handleSubmit}
            >
              {btn("create")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateQuotation;
