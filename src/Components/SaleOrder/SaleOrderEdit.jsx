import React, { useEffect, useMemo, useState } from "react";
import { data, useNavigate, useParams } from "react-router-dom";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import Select from "react-select";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import loadingStore from "../../Zustand/LoadingStore";
import { IoIosInfinite } from "react-icons/io";
import { IoMdCloseCircle } from "react-icons/io"; // এই আইকনটি যোগ করা হয়েছে
import api from "../../Helper/axios_resonse_interceptor";

export default function SaleOrderEdit() {
  const { id } = useParams();
  const { setGlobalLoader } = loadingStore();
  const navigate = useNavigate();
  // states

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [productList, setProductList] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [note, setNote] = useState("");
  const [total, setTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [productKeyword, setProductKeyword] = useState("");
  const [sendSMS, setSendSMS] = useState(false);
  const [viewPurchasePrice, setviewPurchasePrice] = useState(false);
  const [allAccount, setAllAccount] = useState([]);
  const [otherCostName, setOtherCostName] = useState("");
  const [otherCost, setOherCost] = useState(0);

  // Account state
  const [accounts, setAccounts] = useState([]); // Available accounts to select
  const [selectedAccounts, setSelectedAccounts] = useState([]); // Accounts selected for payment


  //FETCH STOCK
  const fetchStock = async (productID) => {
    try {
      const res = await api.get(`/Stock/${productID}`);

      if (res.data.status === "Success") {
        return res.data.data;
      }
    } catch (error) {
      console.error("Error fetching stock:", error);
      return [];
    }
  };

  // sale order details
  // Changed updateTotals to be a direct function, not an arrow function,
  // so it can be safely used inside fetchSaleOrderDetails's dependency array (if needed) or directly.
  const updateTotals = (products, initialDiscount = discount) => {
    const t = products.reduce((acc, p) => acc + (p.total || 0), 0);
    setTotal(t);

    const currentDiscount = Number(initialDiscount) || 0;
    const otherCostInNumber = Number(otherCost) || 0;
    const newGrandTotal = t + otherCostInNumber - currentDiscount;
    setGrandTotal(newGrandTotal);
  };

  const fetchSaleOrderDetails = async (initialProductList) => {
    setGlobalLoader(true);
    try {
      const { data } = await api.get(
        `/SaleOrderDetailsByID/${id}`
      );

      if (data.status === "Success") {
        const d = data.data;
        setSelectedCustomer(d);
        setNote(d.note || "");
        setDiscount(Number(d.discount) || 0);
        setOtherCostName(d.outher || "");
        setOherCost(Number(d.outherAmount) || 0);

        const productDataMap = initialProductList.reduce((map, item) => {
          map[item.value] = item.product;
          return map;
        }, {});

        const productsWithStock = await Promise.all(
          d.Products.map(async (p) => {
            const fullProductData = productDataMap[p.id];
            const manageStock = fullProductData
              ? fullProductData.manageStock
              : 0;
            const unitCost = fullProductData ? fullProductData.unitCost : 0;

            // fetch stock (may return [] if no stock rows)
            let stockRows = [];
            if (manageStock === 1) {
              stockRows = await fetchStock(p.id); // fetchStock already returns [] on error
            }

            // Determine availableStock:
            // - if manageStock !== 1 -> consider unlimited (Infinity)
            // - if manageStock === 1 and stockRows is empty -> treat as NO STOCK (null)
            // - if stockRows present -> sum stocks
            let availableStock = Infinity;
            if (manageStock === 1) {
              if (!Array.isArray(stockRows) || stockRows.length === 0) {
                // No rows returned -> treat as "no stock info" / zero stock
                availableStock = null; // we'll use null to mean "no stock"
              } else {
                const summed = stockRows.reduce(
                  (acc, s) => acc + (Number(s.stock) || 0),
                  0
                );
                // If you want to include orderQtyFromDB (previous behavior), do so here.
                availableStock = Math.max(0, summed);
              }
            }

            const orderQtyFromDB = Number(p.quantity) || 0;

            // Final qty logic:
            // - if availableStock is null (no stock rows) OR availableStock === 0 -> empty qty and disabled
            // - else qty = Math.min(orderQtyFromDB, availableStock)
            let finalSaleQty;
            if (
              manageStock === 1 &&
              (availableStock === null || availableStock === 0)
            ) {
              finalSaleQty = 0; // empty string for UI
            } else if (manageStock === 1) {
              finalSaleQty = Math.min(orderQtyFromDB, availableStock);
            } else {
              // not managed stock -> allow order quantity (or orderQtyFromDB)
              finalSaleQty = orderQtyFromDB || 0;
            }

            return {
              productID: p.id,
              name: p.name,
              orderQty: orderQtyFromDB,
              saleQty: finalSaleQty,
              qty: finalSaleQty,
              price: Number(p.price),
              total: finalSaleQty ? finalSaleQty * Number(p.price) : 0,
              availableStock:
                manageStock === 1
                  ? availableStock === null
                    ? 0
                    : availableStock
                  : Infinity,
              manageStock: manageStock,
              unitCost: unitCost,
              disabled:
                manageStock === 1 &&
                (availableStock === null || availableStock === 0),
            };
          })
        );

        setSelectedProducts(productsWithStock);
        updateTotals(productsWithStock, Number(d.discount));
      }
    } catch (error) {
      ErrorToast(error.message);
    } finally {
      setGlobalLoader(false);
    }
  };

  // fetch product list (unchanged)
  const fetchProductList = async (keyword = "") => {
    setGlobalLoader(true);
    const key = keyword.trim() || "0";
    try {
      const { data } = await api.get(`/ProductList/1/50/${key}`);

      if (data.status === "Success") {
        const mappedData = data.data.map((p) => {
          const isOutOfStock = p.manageStock === 1 && p.qty <= 0;

          return {
            value: p._id,
            label: `${p.name} - ${p.Brands.name} - ${p.Categories.name}`,
            product: p, //full product object
            isDisabled: isOutOfStock,
          };
        });
        setProductList(mappedData);
        return mappedData;
      }
      return [];
    } catch (error) {
      console.log(error);
      return [];
    } finally {
      setGlobalLoader(false);
    }
  };

  // Fetch Accounts
  const fetchAllAccounts = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/AllAccount`);
      if (res.data.status === "Success") {
        const formatted = res.data.data.map((b) => ({
          value: b._id,
          label: b.name,
          amount: 0, // Default amount for new selection
          default: b.default, // Use 'default' property from API
          ...b,
        }));

        const defaultAccount = formatted.find((a) => a.default === 1);

        if (defaultAccount) {
          // Default account-এ initial grandTotal amount সেট করা উচিত
          setSelectedAccounts([{ ...defaultAccount, amount: 0 }]);

          // accounts থেকে default বাদ দেওয়া
          const filtered = formatted.filter(
            (a) => a.value !== defaultAccount.value
          );
          setAccounts(filtered);
        } else {
          setAccounts(formatted);
          setSelectedAccounts([]);
        }
      }
    } catch (error) {
      ErrorToast("Failed to load accounts");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  //   all acount useeffect
  useEffect(() => {
    fetchAllAccounts();
  }, []);

  //  DEBOUNCE SEARCH
  useEffect(() => {
    const d = setTimeout(() => fetchProductList(productKeyword), 300);
    return () => clearTimeout(d);
  }, [productKeyword]);

  // Initial Data Load
  useEffect(() => {
    const loadData = async () => {
      const loadedProducts = await fetchProductList();
      await fetchSaleOrderDetails(loadedProducts);
    };
    loadData();
  }, []); // Initial load for products and order details

  // Account Handlers (select/unselect/change amount)
  const unselectAccount = (account) => {
    const updated = selectedAccounts.filter((a) => a.value !== account.value);
    setSelectedAccounts(updated);
    setAccounts((prev) => [...prev, { ...account, amount: 0 }]);
  };

  const selectAccounts = (account) => {
    const updatedAccount = { ...account, amount: 0 };
    setSelectedAccounts((prev) => [...prev, updatedAccount]);
    setAccounts((prev) => prev.filter((a) => a.value !== account.value));
  };

  const handleAccountAmountChange = (accountId, value) => {
    let newVal = value === "" ? 0 : Number(value);

    setSelectedAccounts((prev) =>
      prev.map((acc) =>
        acc.value === accountId ? { ...acc, amount: newVal } : acc
      )
    );
  };

  // Grand Total useEffect
  useEffect(() => {
    const currentDiscount = Number(discount) || 0;
    const otherCostInNumber = Number(otherCost) || 0;
    const newGrandTotal =
      (Number(total) || 0) + otherCostInNumber - currentDiscount;
    setGrandTotal(parseFloat(newGrandTotal.toFixed(2)));
  }, [discount, total, otherCost]);

  // discount parsecent
  useEffect(() => {
    const currentDiscount = Number(discount) || 0;
    if (total > 0 && currentDiscount >= 0) {
      const newDiscountPercent = (currentDiscount / total) * 100;
      if (
        Math.abs(newDiscountPercent - (Number(discountPercent) || 0)) > 0.01
      ) {
        setDiscountPercent(parseFloat(newDiscountPercent.toFixed(2)));
      }
    } else if (total === 0) {
      setDiscountPercent(0);
    }
  }, [discount, total]);

  // Discount Handlers (unchanged)
  const handleDiscountPercentChange = (newPercent) => {
    if (newPercent < 0) {
      return;
    }
    const percentValue = newPercent === "" ? "" : Number(newPercent);
    setDiscountPercent(percentValue);

    if (total > 0 && percentValue > 0) {
      const newDiscountAmount = (total * percentValue) / 100;
      setDiscount(parseFloat(newDiscountAmount.toFixed(2)));
    } else if (percentValue === "") {
      setDiscount("");
    } else {
      setDiscount(0);
    }
  };

  const handleDiscountChange = (newAmount) => {
    if (newAmount < 0) {
      return;
    }
    setDiscount(newAmount === "" ? "" : Number(newAmount));
  };

  // Total Paid Amount Calculation
  const totalPaidAmount = useMemo(() => {
    return selectedAccounts.reduce(
      (sum, acc) => sum + (Number(acc.amount) || 0),
      0
    );
  }, [selectedAccounts]);

  //  Customer Balance
  const CustomerBlance = Number(selectedCustomer?.Contact?.balance || 0);

  // Current due
  const currentDue = useMemo(() => {
    const finalGrandTotal = Number(grandTotal) || 0;
    const previousBalance = CustomerBlance; // Customer's previous balance/due/advance
    const paidAmount = totalPaidAmount;

    // 1. Total Receivable/Payable: Grand Total + Previous Due/Advance
    //    - If PreviousBalance > 0 (Previous DUE/ADVANCE): Grand Total + PreviousBalance
    //    - If PreviousBalance < 0 (Previous CREDIT/ADVANCE): Grand Total - Math.abs(PreviousBalance)
    //    The simple addition (grandTotal + previousBalance) handles both cases:
    const totalReceivable = finalGrandTotal - previousBalance;

    // 2. Current Due: Total Receivable - Total Paid Amount
    const due = totalReceivable - paidAmount;

    return parseFloat(due.toFixed(2));
  }, [grandTotal, CustomerBlance, totalPaidAmount]);

  //
  const formatProductLabel = (option) => {
    if (!option.product) {
      return option.label;
    }

    const p = option.product;
    const isOutOfStock = p.manageStock === 1 && p.qty <= 0;

    const stockDisplay =
      p.manageStock === 1 ? (
        `Stock: ${p.qty}`
      ) : (
        <span
          className={`inline-flex items-center gap-1 ${
            isOutOfStock ? "text-red-500" : "text-gray-600"
          }`}
        >
          Stock: <IoIosInfinite size={14} className="inline-block" />
        </span>
      );

    return (
      <div
        className={`flex gap-2 items-center w-full ${
          isOutOfStock ? "text-red-600" : ""
        }`}
      >
        <span>{`${p.name} - ${p.Brands.name} - ${p.Categories.name}`}</span>
        {stockDisplay}
      </div>
    );
  };


  // handle add product
  const handleAddProduct = async (item) => {
    if (!item) return;

    const exists = selectedProducts.find((p) => p.productID === item.value);
    if (exists) return ErrorToast("Product already added");

    const prod = item.product;

    let totalAvailableStock = Infinity;

    // manage stock check
    if (prod.manageStock === 1) {
      setGlobalLoader(true);
      const stockData = await fetchStock(prod._id);
      totalAvailableStock = stockData.reduce((acc, s) => acc + s.stock, 0);
      setGlobalLoader(false);

      if (totalAvailableStock <= 0) {
        return ErrorToast("Product is out of stock.");
      }
    }

    const initialQty = 1;
    const finalSaleQty = Math.min(initialQty, totalAvailableStock);

    const newProduct = {
      productID: prod._id,
      name: prod.name,
      orderQty: 0,
      saleQty: finalSaleQty,
      qty: finalSaleQty,
      price: prod.mrp,
      total: finalSaleQty * prod.mrp,
      availableStock: totalAvailableStock,
      manageStock: prod.manageStock,
      unitCost: prod.unitCost,
    };

    const updated = [...selectedProducts, newProduct];
    setSelectedProducts(updated);
    updateTotals(updated);
  };

  // qty change
  const handleQtyChange = (idx, newQty) => {
    const updated = [...selectedProducts];
    const product = updated[idx];
    const quantity = Math.max(0, Number(newQty) || 0);

    let maxLimit = Infinity;
    if (product.manageStock === 1) {
      maxLimit = product.availableStock;
    }
    const finalSaleQty = Math.min(quantity, maxLimit);
    product.saleQty = finalSaleQty;
    product.qty = finalSaleQty;
    product.total = finalSaleQty * product.price;

    setSelectedProducts(updated);
    updateTotals(updated);
  };

  // price change
  const handleQtyPriceChange = (idx, newQty, newPrice) => {
    const updated = [...selectedProducts];
    const product = updated[idx];

    const quantity = Math.max(0, Number(newQty) || 0);

    let maxLimit = Infinity;
    if (product.manageStock === 1) {
      maxLimit = product.availableStock;
    }
    const finalSaleQty = Math.min(quantity, maxLimit);
    product.saleQty = finalSaleQty;
    product.qty = finalSaleQty;
    product.price = Number(newPrice);
    product.total = finalSaleQty * product.price;

    setSelectedProducts(updated);
    updateTotals(updated);
  };

  // post order
  const handleUpdateOrder = async () => {
    if (!selectedCustomer) return ErrorToast("Please select a customer");
    if (selectedProducts.length === 0)
      return ErrorToast("Please add at least one product");

    for (const item of selectedProducts) {
      if (!item.qty || item.qty <= 0) {
        return ErrorToast(`Quantity for ${item.name} must be greater than 0.`);
      }
    }

    // if (currentDue !== 0) {
    //   const requiredPayment = grandTotal + CustomerBlance;
    //   if (totalPaidAmount < requiredPayment && totalPaidAmount !== 0) {
    //   }
    // }

    if (selectedAccounts.length > 0 && currentDue > 0) {
      for (const acc of selectedAccounts) {
        if (Number(acc.amount) <= 0) {
          return ErrorToast(
            `Payment amount for ${acc.label} must be greater than 0.`
          );
        }
      }
    }
    // const newCustomerBalance = CustomerBlance - currentDue;

    const due = currentDue < 0 ? 0 : currentDue;
    // const abs = Math.abs(currentDue);
    const currentbal = currentDue < 0 ? Math.abs(currentDue) : -currentDue;

    const payload = {
      Sale: {
        contactID: selectedCustomer.Contact.ContactID,
        SaleorderID: id,
        total: Number(total),
        discount: Number(discount),
        grandTotal: Number(grandTotal),
        paid: totalPaidAmount,
        dueAmount: Number(due),
        PreviousBalance: CustomerBlance,
        CurrentBalance: Number(currentbal),
        ...(otherCostName
          ? { outher: otherCostName, outherAmount: otherCost }
          : {}),
        CreatedDate: new Date(),
        ...(sendSMS ? { sms: 1 } : {}),
        note,
      },

      payment: selectedAccounts.map((a) => ({
        accountID: a.value,
        accountName: a.label,
        amount: Number(a.amount) || 0,
      })),

      SaleProduct: selectedProducts.map((p) => ({
        productID: p.productID,
        qtySold: Number(p.saleQty) || 0,
        price: p.price,
        total: p.total,
      })),
    };

    setGlobalLoader(true);
    try {
      const { data } = await api.post(`/FifoSales2`, payload);

      if (data.status === "Success") {
        SuccessToast("Create Sale Successfully!");
        console.log(data);
        navigate(`/Invoice1/${data.SaleID}`);
      } else {
        ErrorToast(data.message || "Failed to update order");
      }
    } catch (err) {
      ErrorToast(err.message);
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      <h4 className="global_heading">Create Sale</h4>

      {/* Customer & Product */}
      <div className="global_sub_container grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {/* Customer */}
        <div className="flex justify-between sm:justify-start sm:gap-10">
          <div>
            <p className="font-semibold text-lg">Customer Summary</p>
            <p className="text-gray-500">{selectedCustomer?.Contact?.name}</p>
            <p className="text-gray-500">{selectedCustomer?.Contact?.mobile}</p>
            <address className="text-gray-500">
              {selectedCustomer?.Contact?.address}
            </address>
            <p className="font-semibold">Amount: {total}</p>
          </div>
          <div>
            <p className="font-semibold text-lg">Order By</p>
            <p className="text-gray-500">{selectedCustomer?.User?.name}</p>
            <p className="text-gray-500">{selectedCustomer?.User?.mobile}</p>
          </div>
        </div>

        {/* Product */}
        <div>
          <label>Select Product</label>
          <Select
            options={productList}
            classNamePrefix="react-select"
            placeholder="Select Product"
            onChange={handleAddProduct}
            isClearable
            menuPortalTarget={document.body}
            formatOptionLabel={formatProductLabel}
            styles={{
              ...getReactSelectStyles(),
              option: (provided, state) => {
                const baseOptionStyle = getReactSelectStyles().option
                  ? getReactSelectStyles().option(provided, state)
                  : provided;

                let backgroundColor = baseOptionStyle.backgroundColor;
                let color = baseOptionStyle.color;
                let cursor = baseOptionStyle.cursor;

                if (state.isDisabled) {
                  backgroundColor = "#f8d7da";
                  color = "#721c24";
                  cursor = "not-allowed";
                } else if (state.isFocused) {
                  backgroundColor = "#e9ecef";
                  color = "#000";
                }

                return {
                  ...baseOptionStyle,
                  backgroundColor,
                  color,
                  cursor,
                };
              },
            }}
          />
        </div>

        <div className="flex items-center gap-6 absolute bottom-16 md:bottom-2 right-3">
          <div className="flex flex-col text-center">
            <label className="text-sm font-medium">Purchase Price</label>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setviewPurchasePrice(!viewPurchasePrice)}
                className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-300 ${
                  viewPurchasePrice ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform duration-300 ${
                    viewPurchasePrice ? "translate-x-4" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="flex flex-col text-center">
            <label className="text-sm font-medium">Send SMS</label>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setSendSMS(!sendSMS)}
                className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-300 ${
                  sendSMS ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform duration-300 ${
                    sendSMS ? "translate-x-4" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="global_sub_container mt-4">
        <div className="w-full overflow-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">Name</th>
                <th className="global_th">Order qty</th>
                <th className="global_th">Available Stock</th>
                <th className="global_th">Sale quantity</th>
                <th className="global_th">Price</th>
                {viewPurchasePrice && (
                  <th className="global_th">Purchase Price</th>
                )}
                <th className="global_th">Total</th>
                <th className="global_th">action</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {selectedProducts.map((p, i) => (
                <tr className="global_tr" key={i}>
                  <td className="global_td">{p.name}</td>
                  {/* order qty */}
                  <td className="global_td">
                    <input
                      type="number"
                      value={p.orderQty}
                      disabled
                      className="global_input w-20 cursor-not-allowed"
                    />
                  </td>
                  {/* stock */}
                  <td className="global_td">
                    {p.manageStock === 1 ? (
                      p.availableStock
                    ) : (
                      <IoIosInfinite size={20} />
                    )}
                  </td>
                  {/* sale qty */}               
                  <td className="global_td">
                                   
                    <input
                      type="number"
                      value={p.qty || ""}
                      min={0}
                      disabled={p.manageStock === 1 && p.availableStock === 0}
                      max={p.manageStock === 1 ? p.availableStock : undefined}
                      className={`global_input w-20 ${
                        p.disabled ? "bg-gray-200 cursor-not-allowed" : ""
                      }`}
                      onChange={(e) => handleQtyChange(i, e.target.value)}
                    />
                  </td>
                  {/* price */}
                  <td className="global_td">
                    <input
                      type="number"
                      value={p.price}
                      className="global_input w-24"
                      onChange={(e) =>
                        handleQtyPriceChange(i, p.qty, Number(e.target.value))
                      }
                    />
                  </td>
                  {/* purchase price */}
                  {viewPurchasePrice && (
                    <td className="global_td">
                      <input
                        type="number"
                        value={p.unitCost}
                        className="global_input w-24"
                        disabled
                      />
                    </td>
                  )}
                  <td className="global_td">{(p.total || 0).toFixed(2)}</td>
                  <td className="global_td text-red-600 font-semibold cursor-pointer">
                    <p
                      onClick={() =>
                        setSelectedProducts((prev) => {
                          const updated = prev.filter(
                            (_, index) => index !== i
                          );
                          updateTotals(updated);
                          return updated;
                        })
                      }
                      className="text-red-700 font-semibold cursor-pointer"
                    >
                      remove
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary & Note */}
      <div className="flex global_sub_container mt-5 flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <label className="block mb-2 font-medium">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="global_input min-h-[150px] w-full"
          />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex justify-between">
            <label>Total:</label>
            <input
              value={total}
              disabled
              type="number"
              className="global_input w-40 text-right cursor-not-allowed"
            />
          </div>

          <div className="flex justify-between">
            <label>Discount: %</label>
            <input
              value={discountPercent <= 0 ? "" : discountPercent}
              type="number"
              onChange={(e) => handleDiscountPercentChange(e.target.value)}
              className="global_input w-40 text-right"
            />
          </div>

          {/* discount amount */}
          <div className="flex justify-between">
            <label>Discount:</label>
            <input
              value={discount === 0 ? "" : discount}
              type="number"
              onChange={(e) => handleDiscountChange(e.target.value)}
              className="global_input w-40 text-right"
            />
          </div>

          {/* other cost name and value */}
          <div className="flex justify-between">
            <input
              type="text"
              value={otherCostName}
              placeholder="Other cost name"
              onChange={(e) => setOtherCostName(e.target.value)}
              className="global_input w-40"
            />
            <input
              value={otherCost === 0 ? "" : otherCost}
              onChange={(e) => setOherCost(e.target.value)}
              type="number"
              className={`global_input w-40 text-right ${
                otherCostName === ""
                  ? "disabled:bg-gray-300 disabled:cursor-not-allowed"
                  : ""
              }`}
              disabled={otherCostName === ""}
            />
          </div>

          {/* grand total */}
          <div className="flex justify-between">
            <label>Grand Total:</label>
            <input
              value={grandTotal}
              disabled
              type="number"
              className="global_input w-40 text-right cursor-not-allowed font-bold"
            />
          </div>

          {/* previes due/advance */}
          <div className="flex justify-between">
            <label
              className={
                CustomerBlance >= 0 ? "text-green-600" : "text-red-600"
              }
            >
              {CustomerBlance >= 0 ? " Advance" : "Previes Due"}
            </label>
            <input
              value={Math.abs(CustomerBlance)}
              disabled
              type="number"
              className="global_input w-40 text-right cursor-not-allowed"
            />
          </div>

          {/* use balance  */}

          {/* {CustomerBlance > 0 && (
            <div className="flex justify-between">
              <label className="text-green-600">Use Balance</label>
              <input
                // এখানে value prop টি অবশ্যই ব্যবহার করতে হবে,
                // যেমন: value={useBalance}
                onChange={(e) => handleUseBalanceChange(e.target.value)}
                max={CustomerBlance} // max অ্যাট্রিবিউটটি ঐচ্ছিক, তবে তীর নিয়ন্ত্রণের জন্য রেখে দিতে পারেন।
                type="number"
                className="global_input w-40 text-right"
              />
            </div>
          )} */}

          {/* Accounts for Payment */}
          <div className="flex flex-col gap-2">
            <h1 className="font-semibold text-md mb-1">Payment:</h1>
            {selectedAccounts.map((account, index) => {
              return (
                <div className="flex justify-between" key={index}>
                  <div className="flex items-center w-full justify-between">
                    <h1 className="text-nowrap">Payment By {account.label}</h1>
                    {selectedAccounts.length === 1 &&
                    account.default === 1 ? null : ( // Do not allow removing the only default account
                      <button
                        className={`${
                          selectedAccounts.length === 1 ? "hidden" : ""
                        }`}
                        onClick={() => unselectAccount(account)}
                        // disabled ={selectedAccounts.length === 1}
                      >
                        <IoMdCloseCircle size={20} color="red" />
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={account.amount === 0 ? "" : account.amount}
                    onChange={(e) =>
                      handleAccountAmountChange(account.value, e.target.value)
                    }
                    className="global_input w-30 sm:w-40 text-right"
                  />
                </div>
              );
            })}
          </div>

          {/* Total Paid */}
          <div className="flex justify-between font-semibold ">
            <label>Total Paid:</label>
            <input
              value={totalPaidAmount}
              disabled
              type="number"
              className="global_input w-40 text-right cursor-not-allowed"
            />
          </div>

          {/* Select More Accounts */}
          {accounts?.length > 0 && (
            <div className="">
              <Select
                options={accounts}
                value={null}
                onChange={selectAccounts}
                placeholder="Select More Account"
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                styles={getReactSelectStyles()}
              />
            </div>
          )}

          {/* current due (Final Result) */}
          <div className="flex justify-between">
            <label
              className={currentDue > 0 ? "text-red-700" : "text-green-700"}
            >
              {currentDue > 0 ? "Current Due:" : "Advance:"}
            </label>
            <input
              value={Math.abs(currentDue).toFixed(2)}
              disabled
              type="number"
              className={`global_input w-40 text-right cursor-not-allowed  ${
                currentDue > 0 ? "text-red-700" : "text-green-700"
              }`}
            />
          </div>

          <div className="flex justify-end items-end pt-4">
            <button
              onClick={handleUpdateOrder}
              className="global_button cursor-pointer"
            >
              Create Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
