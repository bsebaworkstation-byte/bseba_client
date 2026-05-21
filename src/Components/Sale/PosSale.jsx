import { useEffect, useMemo, useState, Fragment } from "react";
import { FaInfinity } from "react-icons/fa6";
import LiveTime from "../../Helper/UI/LiveTime";

import { IoHomeOutline } from "react-icons/io5";
import { IoMdCloseCircle } from "react-icons/io";
import Select from "react-select";
import { getBusinessDetails } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";

import { ErrorToast } from "../../Helper/FormHelper";
import { Link } from "react-router-dom";

import "react-datepicker/dist/react-datepicker.css";
import ProductAddModal from "../Modals/ProductAddModal";
import CreateCustomerModalImmediate from "../Modals/CreateCustomerModalImmediate";
import toast from "react-hot-toast";
import { playWarningSound } from "../../Helper/utils";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";

import PosInvoice80Modal from "../Modals/PosInvoice80Modal";
import api from "../../Helper/axios_resonse_interceptor";
import { can } from "../../Helper/permissionChecker";

const CreateSale = () => {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark"),
  );

  const [customerModal, setCustomerModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [posProducts, setPosProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchProductKeyword, setSearchProductKeyword] = useState("");
  const [searchCustomerKeyword, setSearchCustomerKeyword] = useState("");
  const { setGlobalLoader } = loadingStore();
  const [otherCostName, setOtherCostName] = useState("");
  const [cost, setCost] = useState(0);
  const [barcode, setBarcode] = useState("");

  const [sendSMS, setSendSMS] = useState(false);
  // Summary
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discount, setDiscount] = useState(0);
  // const [paidAmount, setPaidAmount] = useState(0);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [posInvoiceModal, setPosInvoiceModal] = useState(false);
  const [posInvoiceID, setPosInvoiceID] = useState(null);
  const [isReturning, setIsReturning] = useState(false);

  const fetchProductWithPosMachine = async (code) => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/ProductList/1/1/${code}`);

      if (res.data.status === "Success" && res.data.data.length > 0) {
        const productData = res.data.data[0];
        const product = {
          ...productData,
          value: productData._id,
          label: `${productData.name} (${productData.Brands.name}) (${
            productData.Categories.name
          }) (stock - ${
            productData.manageStock === 0 ? "∞" : productData.qty
          })`,
          isDisabled: productData.manageStock !== 0 && productData.qty === 0,
        };
        handleAddProduct(product);
      } else {
        playWarningSound();
        toast.error("No Product Found with This Pos");
      }
    } catch (error) {
      ErrorToast("Failed to load products");
      console.error(error);
    } finally {
      setGlobalLoader(false);
      setBarcode(""); // clear input after API call
    }
  };
  // Fetch c
  const fetchCustomers = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/CustomersList/1/20/${searchCustomerKeyword || 0}`,
      );
      if (res.data.status === "Success") {
        setCustomers(
          res.data.data.map((s) => ({
            value: s._id,
            label: `${s.name} (${s.address}) (${s.mobile}) (${
              s.balance?.toFixed(2) || 0
            }) `,
            ...s,
          })),
        );
      } else {
        ErrorToast("Failed to fetch customers");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };
  //  Fetch Brands
  const fetchBrands = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/GetBrands`);
      const formatted = res.data.data.map((b) => ({
        value: b._id,
        label: b.name,
      }));
      // Basic fallback
      setBrands(formatted || []);
    } catch (error) {
      ErrorToast("Failed to load brands");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const fetchCategories = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/GetCategory`);
      const formatted = res.data.data.map((c) => ({
        value: c._id,
        label: c.name,
      }));
      setCategories(formatted || []);
    } catch (error) {
      ErrorToast("Failed to load Categories");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };
  // Fetch products
  const fetchProducts = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/ProductList/1/20/${searchProductKeyword || 0}`,
      );
      if (res.data.status === "Success") {
        const raowProducts = res.data.data;
        // const availableProducts = raowProducts.filter((p) => p.qty > 0);
        setProducts(
          raowProducts.map((p) => ({
            value: p._id,
            label: `${p.name} (${p.Brands.name}) (${
              p.Categories.name
            }) (stock - ${p.manageStock === 0 ? "∞" : p.qty})(Barcode ${
              p.barcode
            })`,
            ...p,
            isDisabled: p.manageStock !== 0 && p.qty === 0,
          })),
        );
      }
    } catch (error) {
      ErrorToast("Failed to load products");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };
  const fetchPosProducts = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/PosProductList/${selectedBrand?.value || 0}/${
          selectedCategory?.value || 0
        }/${0}`,
      );
      if (res.data.status === "Success") {
        const raowProducts = res.data.data;
        // const availableProducts = raowProducts.filter((p) => p.qty > 0);
        setPosProducts(
          raowProducts.map((p) => ({
            value: p._id,
            label: `${p.name} (${p.brandName}) (${p.categoryName}) (Barcode ${
              p.barcode
            }) (stock - ${p.manageStock === 0 ? "∞" : p.qty})`,
            ...p,
            isDisabled: p.manageStock !== 0 && p.qty === 0,
          })),
        );
      }
    } catch (error) {
      ErrorToast("Failed to load products");
      console.error(error);
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
          amount: 0,
          ...b,
        }));
        const defaultAccount = formatted.find((a) => a.default === 1);
        if (defaultAccount) {
          // selectedAccounts এ সেট করা
          setSelectedAccounts([defaultAccount]);

          // accounts থেকে default বাদ দেওয়া
          const filtered = formatted.filter(
            (a) => a.value !== defaultAccount.value,
          );
          setAccounts(filtered);
        } else {
          // যদি default না থাকে, সব accounts সেট করো
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

  useEffect(() => {
    const businessDetails = getBusinessDetails();
    if (businessDetails.smsInvoice == 1) {
      setSendSMS(true);
    }

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    Promise.all([fetchAllAccounts(), fetchBrands(), fetchCategories()]);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [searchCustomerKeyword]);

  useEffect(() => {
    fetchProducts();
  }, [searchProductKeyword]);
  useEffect(() => {
    fetchPosProducts();
  }, [selectedCategory, selectedBrand]);

  // Add product
  const handleAddProduct = (product) => {
    if (!product) return;
    if (product.manageStock !== 0 && product.qty === 0) {
      // ErrorToast("Product quantity is zero");
      return;
    }

    const exist = selectedProducts.find((p) => p._id === product._id);

    if (exist && product.qty > exist.qtySold) {
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p._id === product._id
            ? {
                ...p,
                qtySold: p.qtySold + 1,
                total: (p.qtySold + 1) * p.price,
                // অথবা আপনার calculation অনুযায়ী
              }
            : p,
        ),
      );
    }

    if (exist && product.manageStock === 0) {
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p._id === product._id
            ? {
                ...p,
                qtySold: p.qtySold + 1,
                total: (p.qtySold + 1) * p.price,
                // অথবা আপনার calculation অনুযায়ী
              }
            : p,
        ),
      );
    }

    if (exist && product.qty === exist.qtySold) {
      return toast.error("No more Stock");
    }

    if (!selectedProducts.find((p) => p._id === product._id)) {
      setSelectedProducts((prev) => [
        ...prev,
        {
          ...product,
          price: product.mrp || 0,
          total: product.mrp || 0,
          qtySold: 1,
          manageStock: product.manageStock,
          decimal: product.decimal,
        },
      ]);
    }
  };
  const handleReset = () => {
    setSelectedBrand(null);
    setSelectedCategory(null);
    setSelectedCustomer(null);
    setSelectedProducts([]);
    fetchAllAccounts();
  };
  // Update product field
  const handleProductChange = (index, field, value) => {
    const updated = [...selectedProducts];
    const product = updated[index];
    const numValue = Number(value) || 0;

    if (field === "qtySold") {
      // qtySold update
      if (product.manageStock === 0) {
        updated[index].qtySold = numValue;
      } else {
        updated[index].qtySold = Math.min(numValue, product.qty); // stock limit
      }
    }

    if (field === "price") {
      updated[index].price = numValue; // sale price update
    }

    // ✅ total সবসময় আপডেট হবে
    updated[index].total =
      (updated[index].qtySold || 0) * (updated[index].price || 0);

    setSelectedProducts(updated);
  };

  const totalPrice = useMemo(
    () => selectedProducts?.reduce((acc, p) => acc + (p.total || 0), 0),
    [selectedProducts],
  );

  const paidAmount = useMemo(
    () => selectedAccounts.reduce((acc, a) => acc + a.amount, 0),
    [selectedAccounts],
  );
  const grandTotal = useMemo(
    () => totalPrice + (cost || 0) - (discount || 0),
    [cost, discount, totalPrice],
  );

  const dueAmount = useMemo(
    () => grandTotal - (paidAmount || 0) - (selectedCustomer?.balance || 0),
    [grandTotal, paidAmount, selectedCustomer],
  );

  const currentDue = useMemo(
    () =>
      grandTotal -
      (selectedCustomer?.balance < 0 ? selectedCustomer.balance : 0 || 0),
    [grandTotal, selectedCustomer],
  );

  const selectAccounts = (account) => {
    setSelectedAccounts((prev) => [...prev, account]);
    const updated = [...accounts];
    const filteredAccounts = updated.filter((a) => a.value !== account.value);
    setAccounts(filteredAccounts);
  };

  const unselectAccount = (account) => {
    const updated = [...selectedAccounts];
    const filtered = updated.filter((a) => a.value !== account.value);
    setSelectedAccounts(filtered);
    setAccounts((prev) => [...prev, account]);
  };
  const handleAccountAmountChange = (accountId, value) => {
    let newVal = value === "" ? 0 : Number(value);

    // if (newVal > grandTotal) newVal = grandTotal; // grandTotal limit ধরে রাখো

    setSelectedAccounts((prev) =>
      prev.map((acc) =>
        acc.value === accountId ? { ...acc, amount: newVal } : acc,
      ),
    );
  };

  const handleProductQtyIncrease = (idx) => {
    setSelectedProducts((prev) =>
      prev.map((p, i) => {
        if (i !== idx) return p;

        // 🛑 Stock এর বেশি qtySold হতে দেবে না
        if (p.manageStock !== 0 && p.qtySold >= p.qty) return p;

        const newQty = p.qtySold + 1;

        return {
          ...p,
          qtySold: newQty,
          total: newQty * p.price,
        };
      }),
    );
  };
  const handleProductQtyDecrease = (idx) => {
    setSelectedProducts((prev) =>
      prev.map((p, i) => {
        if (i !== idx) return p;

        const newQty = Math.max(p.qtySold - 1, 0); // 0-এর কম নয়

        return {
          ...p,
          qtySold: newQty,
          total: newQty * p.price,
        };
      }),
    );
  };

  useEffect(() => {
    if (selectedCustomer) {
      // Customer select -> সব amount = 0
      setSelectedAccounts((prev) => prev.map((a) => ({ ...a, amount: 0 })));
      return;
    }

    if (!selectedCustomer && grandTotal > 0) {
      let mainAccount =
        accounts.find((a) => a.default === 1) ||
        selectedAccounts.find((a) => a.default === 1);

      if (mainAccount) {
        // ⭐ amount = grandTotal বসিয়ে আপডেট করা
        setSelectedAccounts((prev) =>
          prev.map((acc) =>
            acc.value === mainAccount.value
              ? { ...acc, amount: grandTotal }
              : acc,
          ),
        );
      }
    }
  }, [grandTotal, selectedCustomer]);

  useEffect(() => {
    if (!selectedCustomer && dueAmount < 0) {
      setIsReturning(true);
    }
  }, [selectedCustomer, dueAmount]);
  // Submit purchase
  const handleSubmit = async () => {
    if (!selectedProducts || selectedProducts.length === 0)
      return ErrorToast("Select at least one product");

    // ⭐ CUSTOMER VALIDATION + CONFIRMATION

    if (!selectedCustomer && dueAmount > 0) {
      return ErrorToast("Please Pay full amount");
    }

    let correctedAccounts;
    if (dueAmount < 0) {
      const accounts = [...selectedAccounts];
      correctedAccounts = accounts.map((a) => {
        return {
          ...a,
          amount: a.amount - (isReturning ? Math.abs(dueAmount) : 0), // FIXED: dueAmount negative হলে ঠিকঠাক কমবে
        };
      });
    }

    const payload = {
      Sale: {
        ...(selectedCustomer
          ? {
              contactID: selectedCustomer.value,
              dueAmount: dueAmount,
              PreviousBalance: selectedCustomer.balance || 0,
              CurrentBalance: -dueAmount,
            }
          : {}),
        total: totalPrice,
        discount: discount || 0,
        grandTotal: grandTotal,
        paid:
          !selectedCustomer && dueAmount < 0
            ? paidAmount + dueAmount
            : selectedCustomer && dueAmount < 0 && isReturning
            ? paidAmount + dueAmount
            : paidAmount,
        sms: sendSMS ? 1 : 0,
        CreatedDate: new Date(),
        // date: purchaseDate.toISOString(),
        ...(otherCostName ? { outher: otherCostName, outherAmount: cost } : {}),
        // ...(sendSMS ? { sms: 1 } : {}),
      },

      payment: (correctedAccounts && Array.isArray(correctedAccounts)
        ? correctedAccounts
        : selectedAccounts
      ).map((a) => ({
        accountID: a.value,
        accountName: a.name,
        amount: a.amount,
      })),
      SaleProduct: selectedProducts.map((p) => ({
        productID: p._id,
        qtySold: p.qtySold,
        price: p.price,
        total: p.total || 0,
      })),
    };

    try {
      setGlobalLoader(true);
      const res = await api.post(`/FifoSales`, payload);

      if (res.data.status === "Success") {
        setSelectedProducts([]);
        setSelectedCustomer(null);

        if (res.data.SaleID) {
          setPosInvoiceID(res.data.SaleID);
          setPosInvoiceModal(true);
          Promise.all([
            fetchPosProducts(),
            fetchProducts(),
            fetchCustomers(),
            fetchAllAccounts(),
          ]);
        }
      } else {
        ErrorToast(res.data.message || "Failed to create purchase");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const customStyles = {
    option: (provided, state) => ({
      ...provided,

      // TEXT COLOR
      color:
        state.data.manageStock !== 0 && state.data.qty === 0
          ? isDark
            ? "#5e5e5e" // text-gray-400 (not white!)
            : "#999"
          : isDark
          ? "#f9fafb"
          : "#000",

      // BACKGROUND COLOR
      backgroundColor:
        state.data.manageStock !== 0 && state.data.qty === 0
          ? isDark
            ? "#272727"
            : "#f5f5f5"
          : state.isSelected
          ? isDark
            ? "#374151"
            : "#e2e8f0"
          : state.isFocused
          ? isDark
            ? "#4b5563"
            : "#edf2f7"
          : isDark
          ? "#111827"
          : "white",

      cursor:
        state.data.manageStock !== 0 && state.data.qty === 0
          ? "not-allowed"
          : "pointer",
    }),

    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),

    input: (base) => ({
      ...base,
      color: isDark ? "#ffffff" : "#111827",
    }),

    placeholder: (base) => ({
      ...base,
      color: isDark ? "#9ca3af" : "#6b7280",
    }),
  };

  return (
    <Fragment>
      {/* top fixed header section */}
      <div className="h-screen bg-white dark:bg-[#1E2939] flex flex-col dark:text-white">
        <div className="nav  flex justify-between items-center py-1 px-4 border-b dark:border-b-gray-500 border-b-gray-200">
          <div className="flex justify-between w-1/3">
            {" "}
            <LiveTime />
          </div>

          <div className="flex gap-5 w-2/3 justify-end">
            {/* Customer Search */}
            <div className="flex items-center gap-2 w-4/6">
              <div className="w-full">
                <Select
                  options={customers}
                  value={selectedCustomer}
                  onChange={setSelectedCustomer}
                  placeholder="Select Customer"
                  classNamePrefix="react-select"
                  onInputChange={(val) => setSearchCustomerKeyword(val)}
                  menuPortalTarget={document.body}
                  styles={getReactSelectStyles()}
                  isClearable
                />
              </div>
              {can("CreateContact") && (
                <button
                  onClick={() => setCustomerModal(true)}
                  className="global_button"
                >
                  + Customer
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 w-2/6 justify-end">
              <button
                onClick={handleReset}
                className="flex items-center bg-violet-400 text-white px-5 py-1 rounded-md gap-2"
              >
                Reset Form
              </button>
              <Link
                className="flex items-center bg-red-500 text-white px-5 py-1 rounded-md gap-2"
                to={"/Dashboard"}
              >
                <IoHomeOutline /> Home
              </Link>
            </div>
          </div>
        </div>

        <div className="flex overflow-hidden">
          {/* Pos Products Showing */}
          <div className="w-1/3 overflow-x-hidden h-full flex flex-col">
            {/* category and brand */}
            <div className="flex gap-4 px-4 py-1 bg-white dark:bg-[#1E2939] border-b border-gray-200 dark:border-gray-600">
              {/* Brand */}

              <div className="w-full">
                {" "}
                <Select
                  options={brands}
                  value={selectedBrand}
                  onChange={(brand) => setSelectedBrand(brand)}
                  placeholder="Select Brand"
                  classNamePrefix="react-select"
                  menuPortalTarget={document.body}
                  styles={getReactSelectStyles()}
                  isClearable
                />
              </div>

              {/* Category */}
              <div className="w-full">
                <Select
                  options={categories}
                  value={selectedCategory}
                  onChange={(category) => setSelectedCategory(category)}
                  placeholder="Select Category"
                  classNamePrefix="react-select"
                  menuPortalTarget={document.body}
                  styles={getReactSelectStyles()}
                  isClearable
                />
              </div>
            </div>
            {/* pos products */}
            <div className="grid grid-cols-4 gap-1 p-1 overflow-y-auto">
              {posProducts.length > 0 ? (
                posProducts.map((p) => {
                  return (
                    <div
                      onClick={() => handleAddProduct(p)}
                      className={`flex flex-col items-center justify-between border border-gray-200 dark:border-gray-600 cursor-pointer p-1 rounded-md h-[120px] shadow-sm transition-all duration-200  "hover:shadow-lg hover:scale-[1.01]`}
                    >
                      {/* Image */}
                      <div className="w-full flex justify-center items-center h-[50px]">
                        {p.image ? (
                          <img
                            src={p?.image}
                            alt={p.productName}
                            className="h-10 object-contain"
                          />
                        ) : (
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"
                            alt={p.productName}
                            className="h-10 w-10 object-contain opacity-70"
                          />
                        )}
                      </div>

                      {/* Product Name And Stock*/}
                      <div className="w-full text-center mt-1">
                        <h1 className="text-[12px] font-[400] dark:text-gray-300 leading-tight line-clamp-2">
                          {p.productName} {p.name}
                        </h1>
                        <p className="text-[10px] dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
                          <span>Stock: </span>{" "}
                          {p.manageStock === 0 ? (
                            <FaInfinity size={15} />
                          ) : (
                            p.qty
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <h1>No Pos Product Found</h1>
              )}
            </div>
          </div>
          {/*Product Selection + Barcode */}
          <div className="flex w-2/3">
            {/* Product selection */}
            <div className="flex flex-col w-4/6">
              <div className="flex gap-2 py-1">
                {/* Product Select*/}
                <div className="w-full">
                  <Select
                    options={products}
                    value={null}
                    onChange={handleAddProduct}
                    placeholder="Select Product"
                    classNamePrefix="react-select"
                    onInputChange={(val) => setSearchProductKeyword(val)}
                    menuPortalTarget={document.body}
                    styles={customStyles}
                  />
                </div>
                {/* Product with barcode */}

                <div className="flex gap-3 w-full">
                  <input
                    value={barcode}
                    onChange={(e) => {
                      setBarcode(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault(); // form submit block
                        fetchProductWithPosMachine(e.target.value); // call API
                      }
                    }}
                    className="global_input text-black dark:text-white h-fit"
                    placeholder="Search Product With Barcode"
                  />
                </div>
              </div>
              {/* Selected Products Table */}
              {/* thead */} {/* tbody */}
              <div className="max-h-[85vh] overflow-x-auto overflow-auto px-1">
                <table className="global_table">
                  <thead className="global_thead sticky top-0">
                    <tr className="global_tr">
                      <th className="global_th">No</th>
                      <th className="global_th">Product Name</th>
                      <th className="global_th">Qty</th>

                      <th className="global_th">Sale Price</th>

                      <th className="global_th">Total</th>
                      <th className="global_th">Action</th>
                      {can("ViewPurchasePrice") && (
                        <>
                          <th className="global_th">Purchase Price</th>
                          <th className="global_th">Total Puchase</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="global_tbody">
                    {selectedProducts.map((p, idx) => (
                      <tr key={p._id + "-" + idx} className="global_tr">
                        <td className="global_td w-2 text-center">{idx + 1}</td>
                        {/* Name*/}
                        <td className="global_td ">
                          <h1 className="min-w-[200px]">{p.label}</h1>
                        </td>

                        {/* QTy*/}
                        <td className="global_td w-24">
                          <div className="flex items-center">
                            <button
                              disabled={p.qtySold === 1}
                              onClick={() => {
                                handleProductQtyDecrease(idx);
                              }}
                              className="border border-gray-300 dark:border-gray-600 rounded-none px-3 py-1 outline-none"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={p.qtySold === 0 ? "" : p.qtySold}
                              onChange={(e) => {
                                let val = 0;
                                if (p.decimal === 0) {
                                  val = Math.floor(Number(e.target.value || 0));
                                } else {
                                  val = e.target.value;
                                }
                                handleProductChange(idx, "qtySold", val); // শুধুমাত্র সংখ্যা allow
                              }}
                              className={`global_input w-15 px-1 text-center rounded-none ${
                                p.serials?.length > 0
                                  ? "cursor-not-allowed"
                                  : ""
                              }`}
                            />
                            <button
                              onClick={async () => {
                                handleProductQtyIncrease(idx);
                              }}
                              className="border border-gray-300 dark:border-gray-600 rounded-none px-3 py-1 outline-none"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Sale Price o Unit cost hoye backend a jabe*/}
                        <td className="global_td w-24">
                          <input
                            type="number"
                            value={p.price === 0 ? "" : p.price}
                            onChange={(e) =>
                              handleProductChange(idx, "price", e.target.value)
                            }
                            className="global_input w-24"
                          />
                        </td>

                        {/*Total */}
                        <td className="global_td">
                          {(p.total || 0).toFixed(2)}
                        </td>
                        {/* Remove*/}
                        <td className="global_td">
                          <button
                            onClick={() =>
                              setSelectedProducts(
                                selectedProducts.filter((_, i) => i !== idx),
                              )
                            }
                            className="text-red-500"
                          >
                            Remove
                          </button>
                        </td>
                        {can("ViewPurchasePrice") && (
                          <>
                            {" "}
                            <td className="global_td">{p.unitCost}</td>
                            <td className="global_td">
                              {(p.unitCost * p.qtySold).toFixed(2)}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Summary + Note */}
            <div className="mt-2 w-2/6 text-sm h-full px-1 border-l dark:border-gray-600 border-gray-300">
              <div className="flex gap-2 items-center w-full pb-2 justify-end px-3">
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
              {/* Summary*/}
              <div className="flex-1 space-y-3">
                {/* Total*/}
                <div className="flex justify-between">
                  <label>Total:</label>
                  <input
                    type="number"
                    value={totalPrice.toFixed(2)}
                    disabled
                    className="global_input w-30 rounded-sm cursor-not-allowed text-right"
                  />
                </div>
                {/* Discount %*/}
              { can("DiscountOnSale") &&  <div className="flex justify-between">
                  <label>Discount %:</label>
                  <input
                    type="number"
                    value={discountPercent === 0 ? "" : discountPercent}
                    onChange={(e) => {
                      const percentValue =
                        e.target.value === "" ? 0 : Number(e.target.value);
                      const newDiscountAmount =
                        (percentValue / 100) * totalPrice;
                      setDiscount(newDiscountAmount);
                      setDiscountPercent(percentValue);
                    }}
                    className="global_input w-30 rounded-sm text-right"
                    min="0"
                    max="100"
                  />
                </div>}
                {/* Discount*/}
              { can("DiscountOnSale") &&  <div className="flex justify-between">
                  <label>Discount Amount:</label>
                  <input
                    type="number"
                    value={discount === 0 ? "" : discount}
                    onChange={(e) => {
                      const discountValue =
                        e.target.value === "" ? 0 : Number(e.target.value);
                      const newDiscountPercent =
                        totalPrice > 0 ? (discountValue / totalPrice) * 100 : 0;

                      setDiscount(discountValue);
                      setDiscountPercent(
                        parseFloat(newDiscountPercent.toFixed(2)),
                      );
                    }}
                    className="global_input w-30 rounded-sm text-right"
                    min="0"
                    max={totalPrice}
                  />
                </div> }
                {/* Cost*/}
                <div className="flex justify-between">
                  <input
                    type="text"
                    value={otherCostName}
                    onChange={(e) => {
                      const value = e.target.value;
                      setOtherCostName(value);
                    }}
                    placeholder="Other Cost Name"
                    className="global_input w-35 rounded-sm text-start"
                  />
                  <input
                    type="number"
                    value={cost}
                    disabled={otherCostName === ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCost(value === "" ? "" : parseInt(value, 10));
                    }}
                    className={`global_input w-30 rounded-sm text-right ${
                      otherCostName === ""
                        ? "bg-gray-200 dark:bg-gray-600 cursor-not-allowed"
                        : ""
                    }`}
                  />
                </div>
                {/* Grand Total*/}
                <div className="flex justify-between">
                  <label>Grand Total:</label>
                  <input
                    type="number"
                    value={grandTotal.toFixed(2)}
                    disabled
                    className="global_input w-30 rounded-sm cursor-not-allowed text-right"
                  />
                </div>
                {/* Previous Due*/}
                {selectedCustomer && selectedCustomer.balance < 0 && (
                  <div className="flex justify-between">
                    <label className="text-red-500 font-medium">
                      Previous Due:
                    </label>
                    <input
                      type="number"
                      value={Math.abs(selectedCustomer.balance.toFixed(2))}
                      disabled
                      className="global_input w-30 rounded-sm cursor-not-allowed text-right text-red-500 font-medium"
                    />
                  </div>
                )}{" "}
                {/*Current Due Amount*/}
                <div className="flex justify-between">
                  <label className="text-red-500">Current Due:</label>
                  <input
                    type="number"
                    value={(
                      grandTotal - (selectedCustomer?.balance || 0)
                    ).toFixed(2)}
                    disabled
                    className="global_input w-30 text-red-500 rounded-sm cursor-not-allowed text-right"
                  />
                </div>
                {/* Due Amount*/}
                {dueAmount > 0 && (
                  <div className="flex justify-between">
                    <label className="text-red-500">Due Amount:</label>
                    <input
                      type="number"
                      value={dueAmount.toFixed(2)}
                      disabled
                      className="global_input w-30 text-red-500 rounded-sm cursor-not-allowed text-right"
                    />
                  </div>
                )}
                {/* current balance after over paid */}
                {!isReturning && selectedCustomer && dueAmount < 0 && (
                  <div className="flex justify-between">
                    <label className="text-green-500">Current Balance:</label>
                    <input
                      type="number"
                      value={-dueAmount.toFixed(2)}
                      disabled
                      className="global_input w-30 text-green-500 rounded-sm cursor-not-allowed text-right"
                    />
                  </div>
                )}
                {/* Current Balance */}
                {currentDue < 0 && (
                  <div className="flex justify-between">
                    <label className=" font-medium">Current Balance :</label>
                    <input
                      type="number"
                      value={Math.abs(currentDue).toFixed(2)}
                      disabled
                      className="global_input w-40 rounded-sm cursor-not-allowed text-right font-medium"
                    />
                  </div>
                )}
                {/* If Customer balance exist */}
                {selectedCustomer && selectedCustomer.balance > 0 && (
                  <div className="flex justify-between">
                    <label className="text-green-500 font-medium">
                      Advanced Paid:
                    </label>
                    <input
                      type="number"
                      value={selectedCustomer.balance.toFixed(2)}
                      disabled
                      className="global_input w-30 rounded-sm cursor-not-allowed text-right text-green-500 font-medium"
                    />
                  </div>
                )}
                {/* Paid Amount With Multiple Bank Account*/}
                <div className="flex flex-col gap-2">
                  {selectedAccounts.map((account, index) => {
                    return (
                      <div className="flex justify-between" key={index}>
                        <div className="flex items-center w-full justify-between">
                          <h1 className="text-wrap w-30">
                            Received By - {account.label}
                          </h1>
                          {selectedAccounts.length === 1 ? null : (
                            <button
                              className="pr-10"
                              onClick={() => unselectAccount(account)}
                            >
                              {" "}
                              <IoMdCloseCircle size={20} color="red" />
                            </button>
                          )}
                        </div>
                        <input
                          type="number"
                          name="amount"
                          value={account.amount === 0 ? "" : account.amount}
                          onChange={(e) =>
                            handleAccountAmountChange(
                              account.value,
                              e.target.value,
                            )
                          }
                          placeholder="Received"
                          className="global_input w-30 rounded-sm text-right"
                        />
                      </div>
                    );
                  })}
                </div>
                {accounts?.length > 0 && (
                  <div className="">
                    {/* <h1> Paid Amount: </h1> */}
                    <Select
                      options={accounts}
                      value={null}
                      onChange={(account) => {
                        selectAccounts(account);
                      }}
                      placeholder="Select More Account"
                      menuPlacement="auto"
                      menuPosition="fixed"
                      menuPortalTarget={document.body}
                      styles={{
                        ...getReactSelectStyles(),
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                  </div>
                )}
                {/* add balance return balance button */}
                {selectedCustomer && dueAmount < 0 && (
                  <div className="flex justify-between">
                    {isReturning ? (
                      <button
                        onClick={() => setIsReturning(false)}
                        className="global_button"
                      >
                        Add Balance
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsReturning(true)}
                        className="global_button_red"
                      >
                        Return
                      </button>
                    )}
                  </div>
                )}
                {/* Return if Customer is selected */}
                {isReturning && selectedCustomer && dueAmount < 0 ? (
                  <div className="flex justify-between">
                    <label className="text-red-600 font-bold">
                      Returning :
                    </label>
                    <input
                      type="number"
                      value={Math.abs(dueAmount)}
                      disabled
                      className="global_input text-red-600 w-30 font-bold rounded-sm cursor-not-allowed text-right"
                    />
                  </div>
                ) : !isReturning && selectedCustomer && dueAmount < 0 ? (
                  <div className="flex justify-between">
                    <label className="text-green-500 font-bold">
                      Adding Balance :
                    </label>
                    <input
                      type="number"
                      value={Math.abs(dueAmount)}
                      disabled
                      className="global_input text-green-500 w-30 font-bold rounded-sm cursor-not-allowed text-right"
                    />
                  </div>
                ) : (
                  ""
                )}
                {/* Return */}
                {!selectedCustomer && dueAmount < 0 && (
                  <div className="flex justify-between">
                    <label className="text-red-600 font-bold">Return :</label>
                    <input
                      type="number"
                      value={Math.abs(dueAmount)}
                      disabled
                      className="global_input text-red-600 w-30 font-bold rounded-sm cursor-not-allowed text-right"
                    />
                  </div>
                )}
              </div>
              {/* Create Sale */}
              <div className="mt-4 mb-2 flex justify-center lg:justify-end">
                {selectedAccounts.length > 1 &&
                dueAmount < 0 &&
                paidAmount > -dueAmount ? (
                  ""
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="global_button w-full"
                  >
                    Create Sale
                  </button>
                )}
              </div>
            </div>
          </div>

          <ProductAddModal
            handleAddProduct={handleAddProduct}
            onSuccess={fetchProducts}
          />

          <CreateCustomerModalImmediate
            open={customerModal}
            setOpen={setCustomerModal}
            setSelectedCustomer={setSelectedCustomer}
          />
        </div>
      </div>
      <PosInvoice80Modal
        open={posInvoiceModal}
        setOpen={setPosInvoiceModal}
        posInvoiceID={posInvoiceID}
      />
    </Fragment>
  );
};

export default CreateSale;
