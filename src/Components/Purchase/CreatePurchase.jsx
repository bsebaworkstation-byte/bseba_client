import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import Select from "react-select";
import { getBusinessDetails } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { useNavigate } from "react-router-dom";
import { createPortal, flushSync } from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ProductAddModal from "../Modals/ProductAddModal";
import CreateSupplierModalImmediate from "../Modals/CreateSupplierModalImmediate";
import toast from "react-hot-toast";
import { playWarningSound } from "../../Helper/utils";
import openCloseStore from "../../Zustand/OpenCloseStore";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import Swal from "sweetalert2";
import ToggleSwitch from "../../Helper/UI/ToggleSwitch";
import api from "../../Helper/axios_resonse_interceptor";
import { can } from "../../Helper/permissionChecker";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";

const CreatePurchase = () => {
  const [supplierModal, setSupplierModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchProductKeyword, setSearchProductKeyword] = useState("");
  const [searchSupplierKeyword, setSearchSupplierKeyword] = useState("");
  const { setGlobalLoader } = loadingStore();
  const [note, setNote] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date());

  const [cost, setCost] = useState(0);
  const [barcode, setBarcode] = useState("");

  const { openModal } = openCloseStore();
  // Serial Modal
  const [serialModalOpen, setSerialModalOpen] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(null);
  const [serialInputs, setSerialInputs] = useState([]); // dynamic array
  const [pendingFocusIndex, setPendingFocusIndex] = useState(null);
  // Serials that the API confirmed already exist in the database.
  const [apiDuplicateSet, setApiDuplicateSet] = useState(new Set());
  const [checkingSerials, setCheckingSerials] = useState(false);
  const inputRefs = useRef([]);

  // Summary
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discount, setDiscount] = useState(0);
  // const [paidAmount, setPaidAmount] = useState(0);
  const navigate = useNavigate();
  // language translator
  // const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const formtrans = useTextTranslate(GlobalFormTranslator);
  const table = useTextTranslate(GlobalTableTranslator);

  const fetchProductWithPosMachine = async (code) => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/ProductList/1/1/${code}`);

      if (res.data.status === "Success" && res.data.data.length > 0) {
        const productData = res.data.data[0];
        const product = {
          ...productData,
          value: productData._id,
          label: `${productData.name} (${productData.Brands.name}) (${productData.Categories.name})`,
        };
        if (product.manageStock === 0) {
          return ErrorToast(
            `${product.name} - is no need to purchase, it's manage stock is disabled`
          );
        }
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
  // Fetch suppliers
  const fetchSuppliers = async (keyword = 0) => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/SuppliersList/1/20/${keyword}`);
      if (res.data.status === "Success") {
        setSuppliers(
          res.data.data.map((s) => ({
            value: s._id,
            label: `${s.name} (${s.address}) (${s.mobile}) (${
              s.balance < 0 ? "Recievable" : "Payable "
            } ${Math.abs(s.balance).toFixed(2)}) `,
            ...s,
          }))
        );
      } else {
        ErrorToast("Failed to fetch suppliers");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  // Fetch products
  const fetchProducts = async (keyword = 0) => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/ProductList/1/20/${keyword}`);
      if (res.data.status === "Success") {
        const formatted = res.data.data.map((p) => ({
          value: p._id,
          label: `${p.name} (${p.Brands.name}) (${p.Categories.name}) (${p.qty})`,
          ...p,
        }));

        const filtered = formatted.filter((p) => p.manageStock !== 0);
        setProducts(filtered);
      }
    } catch (error) {
      ErrorToast("Failed to load products");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };
  // Fetch products
  const fetchSerial = async (keyword, { silent = false } = {}) => {
    if (!silent) setGlobalLoader(true);
    try {
      const res = await api.get(`/Serial/${keyword}`);
      if (res.data.status === "Success") {
        if (!silent) {
          toast.error(`Serial - ${keyword} Already exist, try another`);
        }
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      if (!silent) setGlobalLoader(false);
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
            (a) => a.value !== defaultAccount.value
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
    fetchAllAccounts();
  }, []);

  // প্রতিবার input সংখ্যা বাড়লে, refs array adjust করো
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, serialInputs.length);
  }, [serialInputs]);

  // Focus the requested input AFTER React finishes rendering it.
  // Prevents race conditions when serials are entered rapidly (e.g. barcode scanner).
  useEffect(() => {
    if (pendingFocusIndex === null) return;
    const el = inputRefs.current[pendingFocusIndex];
    if (el) {
      el.focus();
      setPendingFocusIndex(null);
    }
  }, [pendingFocusIndex, serialInputs.length, serialModalOpen]);

  // 🔄 Auto-check all serials against the database when the user stops typing.
  // Debounced so we don't fire one request per keystroke.
  useEffect(() => {
    if (!serialModalOpen) {
      setApiDuplicateSet(new Set());
      setCheckingSerials(false);
      return;
    }

    const trimmed = Array.from(
      new Set(
        serialInputs
          .map((s) => (s || "").trim())
          .filter((s) => s !== "")
      )
    );

    if (trimmed.length === 0) {
      setApiDuplicateSet(new Set());
      setCheckingSerials(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setCheckingSerials(true);
      try {
        const results = await Promise.all(
          trimmed.map((s) =>
            fetchSerial(s, { silent: true }).catch(() => false)
          )
        );
        if (cancelled) return;
        const duplicates = new Set(
          trimmed.filter((_, idx) => results[idx])
        );
        setApiDuplicateSet(duplicates);
      } catch (err) {
        console.error("Serial check failed", err);
      } finally {
        if (!cancelled) setCheckingSerials(false);
      }
    }, 700);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [serialInputs, serialModalOpen]);

  // 🧹 Tidy up: once the user has paused, drop any empty rows and keep
  // exactly ONE trailing empty input (so they still have a slot to type into).
  useEffect(() => {
    if (!serialModalOpen) return;

    const timer = setTimeout(() => {
      setSerialInputs((prev) => {
        const filled = prev.filter((s) => (s || "").trim() !== "");
        const desired = [...filled, ""];

        // Skip if already normalized (no-op to avoid render loops).
        if (
          desired.length === prev.length &&
          desired.every((v, i) => v === prev[i])
        ) {
          return prev;
        }

        // If the user was focused on an empty row that's being removed,
        // move their focus to the new trailing empty input.
        const activeEl =
          typeof document !== "undefined" ? document.activeElement : null;
        const wasOnEmpty = inputRefs.current.some(
          (el, i) => el === activeEl && (prev[i] || "").trim() === ""
        );
        if (wasOnEmpty) {
          setPendingFocusIndex(filled.length);
        }

        return desired;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [serialInputs, serialModalOpen]);

  useEffect(() => {
    const keyword =
      searchSupplierKeyword.trim() === "" ? 0 : searchSupplierKeyword;
    fetchSuppliers(keyword);
  }, [searchSupplierKeyword]);

  useEffect(() => {
    const keyword =
      searchProductKeyword.trim() === "" ? 0 : searchProductKeyword;
    fetchProducts(keyword);
  }, [searchProductKeyword]);

  const handleAddProduct = (product) => {
    if (!product) return;

    const already = selectedProducts.find((p) => p._id === product._id);

    if (already) {
      Swal.fire({
        title: "এই পণ্যটি ইতিমধ্যেই Add করা আছে!",
        text: "আপনি কি আবারও এই একই পণ্যটি Add করতে চান?",
        // icon: "warning",
        showCancelButton: true,
        confirmButtonText: "হ্যাঁ, Add করুন",
        cancelButtonText: "না",

        width: "350px",
        padding: "0.6rem",

        customClass: {
          popup: "backdrop-blur-sm bg-white/90 rounded-lg",
          title: "text-sm font-semibold",
          htmlContainer: "text-xs",

          confirmButton:
            "bg-green-500 text-white px-3 py-1.5 mr-3 rounded-md hover:bg-green-600 text-xs",
          cancelButton:
            "bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-300 text-xs",
        },

        buttonsStyling: false,
      }).then((result) => {
        if (result.isConfirmed) {
          // new row te prodcut add hocche
          setSelectedProducts((prev) => [
            ...prev,
            {
              _id: product._id,
              label: product.label,
              name: product.name,
              qty: 1,
              unitCost: product.unitCost || 0,
              dp: product.dp || 0,
              mrp: product.mrp || product.price || 0,
              warranty: product.warranty || 0,
              ProductCode: product.ProductCode || "0", // saiful
              total: product.unitCost || 0,
              serialNos: product.serialNos || [],
              qtyDisable: false,
              salePrice: product.unitCost || 0,
            },
          ]);
        }
      });

      return;
    }

    // prothom bar add hoy
    setSelectedProducts((prev) => [
      ...prev,
      {
        _id: product._id,
        label: product.label,
        name: product.name,
        qty: 1,
        unitCost: product.unitCost || 0,
        dp: product.dp || 0,
        mrp: product.mrp || 0,
        warranty: product.warranty || 0,
        ProductCode: product.ProductCode || "0", // saiful
        total: product.unitCost || 0,
        serialNos: product.serialNos || [],
        qtyDisable: false,
        salePrice: product.mrp || 0,
      },
    ]);
  };

  // Update product field
  // Update product field
  const handleProductChange = (index, field, value) => {
    const updated = [...selectedProducts];

    if (field === "ProductCode") {
      // 🔹 ProductCode সবসময় string
      updated[index][field] = value;
    } else {
      // 🔹 অন্য সব numeric field
      updated[index][field] = value === "" ? 0 : Number(value);
    }

    // 🔹 total হিসাব শুধু numeric field দিয়ে
    updated[index].total =
      (updated[index].qty || 0) * (updated[index].unitCost || 0);

    setSelectedProducts(updated);
  };

  const totalAmount = useMemo(
    () => selectedProducts.reduce((acc, p) => acc + (p.total || 0), 0),
    [selectedProducts]
  );
  const paidAmount = useMemo(
    () => selectedAccounts.reduce((acc, a) => acc + a.amount, 0),
    [selectedAccounts]
  );
  const grandTotal = useMemo(
    () => totalAmount + (cost || 0) - (discount || 0),
    [totalAmount, cost, discount]
  );
  const dueAmount = useMemo(
    () => grandTotal - (paidAmount || 0) + (selectedSupplier?.balance || 0),
    [grandTotal, paidAmount, selectedSupplier]
  );
  const invoiceDue = useMemo(
    () => grandTotal - (paidAmount || 0),
    [grandTotal, paidAmount]
  );

  // Live duplicate detection inside the serial modal.
  // Returns a Set of values that appear in 2+ input fields (ignoring empties).
  const duplicateSerialSet = useMemo(() => {
    const counts = {};
    serialInputs.forEach((s) => {
      const v = (s || "").trim();
      if (!v) return;
      counts[v] = (counts[v] || 0) + 1;
    });
    
    return new Set(
      Object.keys(counts).filter((k) => counts[k] > 1)
    );
  }, [serialInputs]);

  // Serial modal handlers
  const openSerialModal = (index) => {
    setCurrentProductIndex(index);
    const existing = selectedProducts[index].serialNos || [];
    const initial = existing.length > 0 ? [...existing] : [""];
    setSerialInputs(initial);
    setSerialModalOpen(true);
    setPendingFocusIndex(initial.length - 1);
  };

  const addSerialInput = () => {
    if (duplicateSerialSet.size > 0) {
      ErrorToast(
        `Fix duplicate serials first: ${Array.from(duplicateSerialSet).join(
          ", "
        )}`
      );
      playWarningSound();
      return;
    }
    const nextIndex = serialInputs.length;
    // flushSync forces React to render the new input BEFORE returning,
    // so the scanner's next characters land in the new field, not the old one.
    flushSync(() => {
      setSerialInputs((prev) => [...prev, ""]);
    });
    inputRefs.current[nextIndex]?.focus();
  };

  const removeSerialInput = (i) => {
    setSerialInputs((prev) => prev.filter((_, idx) => idx !== i));
  };

  const clearAllSerials = () => {
    const hasAnyValue = serialInputs.some((s) => (s || "").trim() !== "");
    if (!hasAnyValue) {
      setSerialInputs([""]);
      setApiDuplicateSet(new Set());
      setPendingFocusIndex(0);
      return;
    }

    Swal.fire({
      title: "Clear all serials?",
      text: "This will remove all entered serial numbers.",
      showCancelButton: true,
      confirmButtonText: "Yes, clear all",
      cancelButtonText: "No",
      width: "350px",
      padding: "0.6rem",
      customClass: {
        popup: "backdrop-blur-sm bg-white/90 rounded-lg",
        title: "text-sm font-semibold",
        htmlContainer: "text-xs",
        confirmButton:
          "bg-red-500 text-white px-3 py-1.5 mr-3 rounded-md hover:bg-red-600 text-xs",
        cancelButton:
          "bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-300 text-xs",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        setSerialInputs([""]);
        setApiDuplicateSet(new Set());
        setPendingFocusIndex(0);
        toast.success("All serials cleared");
      }
    });
  };


  const handleSerialChange = (index, value) => {
    const updated = [...serialInputs];
    updated[index] = value;
    setSerialInputs(updated);
  };
  const handleSerialKeyDown = (e, index) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const currentValue = (serialInputs[index] || "").trim();

    // 1️⃣ If the CURRENT field's value is a duplicate, clear it synchronously
    //    and refocus the same field. This way the scanner's next scan lands
    //    in a clean empty field instead of concatenating onto the duplicate.
    if (currentValue && duplicateSerialSet.has(currentValue)) {
      ErrorToast(`Duplicate serial: ${currentValue}`);
      playWarningSound();
      flushSync(() => {
        setSerialInputs((prev) => {
          const updated = [...prev];
          updated[index] = "";
          return updated;
        });
      });
      inputRefs.current[index]?.focus();
      return;
    }

    // 2️⃣ If some OTHER field has a duplicate, jump focus to it so the
    //    user can fix it before continuing.
    if (duplicateSerialSet.size > 0) {
      const firstDupIdx = serialInputs.findIndex((v) =>
        duplicateSerialSet.has((v || "").trim())
      );
      ErrorToast(
        `Fix duplicate serials first: ${Array.from(duplicateSerialSet).join(
          ", "
        )}`
      );
      playWarningSound();
      if (firstDupIdx !== -1) {
        inputRefs.current[firstDupIdx]?.focus();
      }
      return;
    }

    const nextIndex = index + 1;

    // 3️⃣ Existing input — focus it synchronously.
    if (nextIndex < serialInputs.length) {
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // 4️⃣ Last row, all clean — append a new empty input and focus it
    //    SYNCHRONOUSLY. flushSync is critical: a barcode scanner sends the
    //    next character immediately after Enter, and without flushSync the
    //    new input wouldn't exist yet, causing the next character to be
    //    appended to the previous field.
    flushSync(() => {
      setSerialInputs((prev) => [...prev, ""]);
    });
    inputRefs.current[nextIndex]?.focus();
  };


  const saveSerialNos = () => {
    const serials = serialInputs
      .map((s) => (s || "").trim())
      .filter((s) => s !== "");

    if (serials.length === 0) {
      ErrorToast("Please enter at least one serial");
      playWarningSound();
      return;
    }

    if (duplicateSerialSet.size > 0) {
      ErrorToast(
        `Duplicate serials: ${Array.from(duplicateSerialSet).join(", ")}`
      );
      playWarningSound();
      return;
    }

    if (checkingSerials) {
      ErrorToast("Please wait, checking serials with the database...");
      return;
    }

    if (apiDuplicateSet.size > 0) {
      ErrorToast(
        `Already in database: ${Array.from(apiDuplicateSet).join(", ")}`
      );
      playWarningSound();
      return;
    }

    setSelectedProducts((prev) =>
      prev.map((p, idx) => {
        if (idx !== currentProductIndex) return p;
        return {
          ...p,
          serialNos: serials,
          qty: serials.length,
          total: serials.length * (p.unitCost || 0),
          qtyDisable: true,
        };
      })
    );

    toast.success(`${serials.length} serial number(s) saved`);
    setSerialModalOpen(false);
  };

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
        acc.value === accountId ? { ...acc, amount: newVal } : acc
      )
    );
  };

  // Submit purchase
  const handleSubmit = async () => {
    if (!selectedSupplier) return ErrorToast("Select a supplier");
    if (!selectedProducts || selectedProducts.length === 0)
      return ErrorToast("Select at least one product");

    const payload = {
      Purchase: {
        contactID: selectedSupplier.value,
        CurrentBalance: dueAmount,
        PreviousBalance: selectedSupplier.balance,
        total: totalAmount,
        discount: discount || 0,
        grandTotal: grandTotal,
        paid: paidAmount,
        ...(invoiceDue > 0 ? { dueAmount: invoiceDue } : {}),
        note: note,
        CreatedDate: purchaseDate.toISOString(),
        cost: cost || 0,
      },
      payment: selectedAccounts.map((a) => ({
        accountID: a.value,
        accountName: a.name,
        amount: a.amount,
      })),

      PurchasesProduct: selectedProducts.map((p) => ({
        productID: p._id,
        qty: p.qty || 0,
        unitCost: p.unitCost || 0,
        dp: p.dp || 0,
        mrp: p.salePrice || 0,
        warranty: p.warranty || 0,
        productCode: p.ProductCode || "0", // saiful
        total: p.total || 0,
        serialNos: p.serialNos || [],
      })),
    };

    try {
      setGlobalLoader(true);
      const res = await api.post(`/CreatePurchases`, payload);

      if (res.data.status === "Success") {
        navigate(`/PurchaseDetails/${res.data.purchaseID}`);
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

  console.log("serialInputs",serialInputs);

  return (
    <div className="global_container">
      {/* Supplier & Product Selection */}
      <div className="global_sub_container grid grid-cols-1 md:grid-cols-2 gap-2 sticky -top-3 z-40 bg-white dark:bg-gray-900">
        <div className="flex items-end gap-2">
          {/* Supplier*/}
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">
              {formtrans("supplierName")} <span className="text-red-500"> *</span>
            </label>
            <Select
              options={suppliers}
              value={selectedSupplier}
              onChange={setSelectedSupplier}
              placeholder="Select Supplier"
              classNamePrefix="react-select"
              onInputChange={(val) => setSearchSupplierKeyword(val)}
              menuPortalTarget={document.body}
              styles={getReactSelectStyles()}
              isClearable
            />
          </div>

          {/* Add Supplier Button*/}
          {can("CreateContact") && (
            <div>
              <button
                onClick={() => setSupplierModal(true)}
                className="global_button text-sm py-1 px-2 w-full"
              >
               {btn("newSupplier")}
              </button>
            </div>
          )}
        </div>

        {/*Purchase Date*/}
        {can("isAdmin") && (
          <div>
            <label className="block text-sm font-medium mt-1 mb-1">
              {formtrans("selectDate")}
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt />
              </div>
              <DatePicker
                selected={purchaseDate}
                onChange={(date) => setPurchaseDate(date)}
                dateFormat="dd-MM-yyyy"
                className="global_input pl-10 w-full"
                popperPlacement="bottom-start"
                popperClassName="!z-[999999999999999]"
                calendarClassName="react-datepicker-custom"
                popperContainer={(props) =>
                  createPortal(<div {...props} />, document.body)
                }
              />
            </div>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Product*/}
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">
              {formtrans("product")} <span className="text-red-500"> *</span>
            </label>

            <Select
              options={products}
              onChange={handleAddProduct}
              placeholder="Select Product"
              classNamePrefix="react-select"
              onInputChange={(val) => setSearchProductKeyword(val)}
              menuPortalTarget={document.body}
              styles={getReactSelectStyles()}
            />
          </div>

          {/* Add Product*/}
          {can("CreateProduct") && (
            <div>
              <button
                className="global_button text-sm py-1 px-2  w-full"
                onClick={() => openModal("product")}
              >
                {formtrans("newProduct")}
              </button>
            </div>
          )}
        </div>

        {/* Barcode*/}
        <div>
          <label className="block text-sm font-medium mb-1">
           {formtrans("barcode")} {formtrans("search")}
          </label>
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
            className="w-full global_input text-black dark:text-white h-fit"
            placeholder="Search Product With Barcode"
          />
        </div>
      </div>

      {/* Selected Products Table */}
      <div className="global_sub_container mt-4 overflow-auto">
        <table className="global_table">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th">{table("no")}</th>
              <th className="global_th">{table("productName")}</th>
              {getBusinessDetails()?.warranty == 1 && (
                <>
                  {" "}
                  <th className="global_th">{table("serial")}</th>
                  <th className="global_th">{table("warranty")}</th>
                </>
              )}
              {getBusinessDetails()?.ProductCode == "1" && (
                <>
                  <th className="global_th">{table("productCode")}</th>
                </>
              )}
              <th className="global_th">{table("qty")}</th>

              <th className="global_th">{table("purchasePrice")}</th>
              <th className="global_th">{table("salePrice")}</th>
              <th className="global_th">{table("margin")}</th>
              <th className="global_th">{table("dpRp")}</th>
              <th className="global_th">{table("dpMargin")}</th>
              <th className="global_th">{table("total")}</th>
              <th className="global_th">{table("action")}</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {selectedProducts.map((p, idx) => (
              <tr key={idx} className="global_tr">
                <td className="global_td w-2 text-center">{idx + 1}</td>
                {/* Name*/}
                <td className="global_td">
                  <h1 className="min-w-[150px]">{p.label}</h1>
                </td>
                {getBusinessDetails()?.warranty == 1 && (
                  <>
                    {" "}
                    {/* Serial*/}
                    <td className="global_td w-4 text-center">
                      <button
                        className="bg-green-100 dark:bg-green-500 dark:text-white text-green-700 px-3 py-1 rounded-md font-medium hover:bg-green-200 transition"
                        onClick={() => openSerialModal(idx)}
                      >
                       {btn("add")}
                      </button>
                    </td>
                    {/* Warranty*/}
                    <td className="global_td w-24">
                      <input
                        type="number"
                        value={p.warranty === 0 ? "" : p.warranty}
                        onChange={(e) =>
                          handleProductChange(idx, "warranty", e.target.value)
                        }
                        placeholder="Days"
                        className="global_input w-24"
                      />
                    </td>
                  </>
                )}
                {/* ============Product code===========  */}
                {getBusinessDetails()?.ProductCode == "1" && (
                  <>
                    <td className="global_td">
                      <input
                        className="global_input w-24"
                        value={p.ProductCode === "0" ? "" : p.ProductCode}
                        onChange={(e) =>
                          handleProductChange(
                            idx,
                            "ProductCode",
                            e.target.value
                          )
                        }
                        type="text"
                      />
                    </td>
                  </>
                )}
                {/* =======================  */}

                {/* QTy*/}
                <td className="global_td w-24">
                  <input
                    type="number"
                    disabled={p.qtyDisable}
                    value={p.qty === 0 ? "" : p.qty}
                    onChange={(e) =>
                      handleProductChange(idx, "qty", e.target.value)
                    }
                    className="global_input w-24"
                  />
                </td>
                {/* Unit Cost কেনা দাম*/}
                <td className="global_td w-24">
                  <input
                    type="number"
                    value={p.unitCost === 0 ? "" : p.unitCost}
                    onChange={(e) =>
                      handleProductChange(idx, "unitCost", e.target.value)
                    }
                    className={`global_input w-24 ${
                      p.unitCost < 1
                        ? "ring-red-500 border-2 border-red-500"
                        : ""
                    }`}
                  />
                </td>
                {/* Sale Price o Unit cost hoye backend a jabe*/}
                <td className="global_td w-24">
                  <input
                    type="number"
                    value={p.salePrice === 0 ? "" : p.salePrice}
                    onChange={(e) =>
                      handleProductChange(idx, "salePrice", e.target.value)
                    }
                    className="global_input w-24"
                  />
                </td>
                {/* Margin*/}
                <td className="global_td w-24">
                  {(
                    ((p.salePrice - p.unitCost) / (p.unitCost || 1)) * 100 || 0
                  ).toFixed(2)}
                  %
                </td>
                {/* dP*/}
                <td className="global_td w-24">
                  <input
                    type="number"
                    value={p.dp === 0 ? "" : p.dp}
                    onChange={(e) =>
                      handleProductChange(idx, "dp", e.target.value)
                    }
                    className="global_input w-24"
                  />
                </td>
                {/*DP Margin*/}
                <td className="global_td w-24">
                  {p.dp
                    ? (((p.dp - p.unitCost) / (p.unitCost || 1)) * 100).toFixed(
                        2
                      )
                    : 0}
                  %
                </td>
                {/*Total */}
                <td className="global_td">{(p.total || 0).toFixed(2)}</td>
                {/* Remove*/}
                <td className="global_td">
                  <button
                    onClick={() =>
                      setSelectedProducts(
                        selectedProducts.filter((_, i) => i !== idx)
                      )
                    }
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Purchase Summary + Note */}
      <div className="global_sub_container mt-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Note*/}
          <div className="flex-1">
            <label className="block mb-2 font-medium dark:text-gray-300 text-gray-700">
              {formtrans("note")}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="global_input min-h-[150px] w-full"
            />
          </div>
          {/* Summary*/}
          <div className="flex-1 space-y-3">
            {/* Total*/}
            <div className="flex justify-between">
              <label>{table("total")}:</label>
              <input
                type="number"
                value={totalAmount?.toFixed(2)}
                disabled
                className="global_input w-40 rounded-sm cursor-not-allowed text-right"
              />
            </div>

            {/* Discount %*/}
            <div className="flex justify-between">
              <label>Discount % :</label>
              <input
                type="number"
                value={discountPercent === 0 ? "" : discountPercent}
                onChange={(e) => {
                  const percentValue =
                    e.target.value === "" ? 0 : Number(e.target.value);
                  const newDiscountAmount = (percentValue / 100) * totalAmount;
                  setDiscount(newDiscountAmount);
                  setDiscountPercent(percentValue);
                }}
                className="global_input w-40 rounded-sm text-right"
                min="0"
                max="100"
              />
            </div>
            {/* Discount*/}
            <div className="flex justify-between">
              <label>{formtrans("discountAmount")}:</label>
              <input
                type="number"
                value={discount === 0 ? "" : discount}
                onChange={(e) => {
                  const discountValue =
                    e.target.value === "" ? 0 : Number(e.target.value);
                  const newDiscountPercent =
                    totalAmount > 0 ? (discountValue / totalAmount) * 100 : 0;

                  setDiscount(discountValue);
                  setDiscountPercent(parseFloat(newDiscountPercent.toFixed(2)));
                }}
                className="global_input w-40 rounded-sm text-right"
                min="0"
                max={totalAmount}
              />
            </div>
            {/* Cost*/}
            <div className="flex justify-between">
              <label>{formtrans("cost")}:</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => {
                  const value = e.target.value;
                  setCost(value === "" ? "" : parseInt(value, 10));
                }}
                className="global_input w-40 rounded-sm text-right"
              />
            </div>
            {/* Grand Total*/}
            <div className="flex justify-between">
              <label>{formtrans("grandTotal")}:</label>
              <input
                type="number"
                value={grandTotal.toFixed(2)}
                disabled
                className="global_input w-40 rounded-sm cursor-not-allowed text-right"
              />
            </div>

            {/* Prev supplier due */}
            {selectedSupplier?.balance > 0 && (
              <div className="flex justify-between">
                <label>{formtrans("previousDue")}:</label>
                <input
                  type="number"
                  value={Math.abs(selectedSupplier?.balance).toFixed(2)}
                  disabled
                  className="global_input w-40 rounded-sm cursor-not-allowed text-right"
                />
              </div>
            )}
            {/* Advance Paid */}
            {selectedSupplier?.balance < 0 && (
              <div className="flex justify-between">
                <label>{formtrans("advancePaid")}:</label>
                <input
                  type="number"
                  value={Math.abs(selectedSupplier?.balance).toFixed(2)}
                  disabled
                  className="global_input w-40 rounded-sm cursor-not-allowed text-right"
                />
              </div>
            )}
            {/* Paid Amount With Multiple Bank Account*/}
            <h4>{formtrans("paymentBy")}</h4>

            <div className="flex flex-col gap-2">
              {selectedAccounts.map((account, index) => {
                return (
                  <div className="flex justify-between" key={index}>
                    <div className="flex items-center w-full justify-between">
                      <h1 className="text-nowrap">{account.label}</h1>
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
                        handleAccountAmountChange(account.value, e.target.value)
                      }
                      placeholder="Payment Amount"
                      className={` w-40 rounded-sm outline-0 p-1.5 text-right ${
                        account.amount > 0
                          ? "border-2 border-green-500"
                          : " border-red-500 border"
                      }`}
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
                  classNamePrefix="react-select"
                  // onInputChange={(val) => setSearchSupplierKeyword(val)}
                  menuPortalTarget={document.body}
                  styles={getReactSelectStyles()}
                  // isClearable
                />
              </div>
            )}

            {/* Due Amount*/}
            {invoiceDue > 0 && (
              <div className="flex justify-between">
                <label>{formtrans("invoiceDue")}:</label>
                <input
                  type="number"
                  value={invoiceDue?.toFixed(2)}
                  disabled
                  className="global_input w-40 rounded-sm cursor-not-allowed text-right"
                />
              </div>
            )}

            {/* Due Amount*/}
            {dueAmount > 0 && (
              <div className="flex justify-between">
                <label>{formtrans("totalAmount")}:</label>
                <input
                  type="number"
                  value={dueAmount.toFixed(2)}
                  disabled
                  className="global_input w-40 rounded-sm cursor-not-allowed text-right"
                />
              </div>
            )}

            {/* Advance*/}
            {dueAmount < 0 && (
              <div className="flex justify-between">
                <label>{formtrans("advanced")}:</label>
                <input
                  type="number"
                  value={Math.abs(dueAmount).toFixed(2)}
                  disabled
                  className="global_input w-40 rounded-sm cursor-not-allowed text-right"
                />
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-center lg:justify-end">
          <button
            onClick={handleSubmit}
            className="global_button w-full lg:w-fit"
          >
             {formtrans("Cpurchase")}
          </button>
        </div>
      </div>

      {/* Serial Modal */}
      {serialModalOpen &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/20">
            <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Add Serial Numbers</h2>
                {checkingSerials ? (
                  <span className="text-xs text-blue-600 flex items-center gap-1">
                    <span className="inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Checking...
                  </span>
                ) : apiDuplicateSet.size > 0 ? (
                  <span className="text-xs text-red-600 font-medium">
                    {apiDuplicateSet.size} already in Barcode
                  </span>
                ) : serialInputs.some((s) => (s || "").trim() !== "") ? (
                  <span onClick={clearAllSerials} className="text-xs text-green-600 font-medium cursor-pointer">
                    All clear
                  </span>
                ) : null}
              </div>

              {/* Serial Inputs */}
              {serialInputs.map((s, i) => {
                const trimmed = (s || "").trim();
                const isLocalDup =
                  trimmed !== "" && duplicateSerialSet.has(trimmed);
                const isApiDup =
                  trimmed !== "" && apiDuplicateSet.has(trimmed);
                const hasIssue = isLocalDup || isApiDup;
                return (
                  <div key={i} className="mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        ref={(el) => (inputRefs.current[i] = el)}
                        type="text"
                        value={s}
                        onChange={(e) =>
                          handleSerialChange(i, e.target.value)
                        }
                        onKeyDown={(e) => handleSerialKeyDown(e, i)}
                        className={`global_input flex-1 ${
                          hasIssue
                            ? "border-2 border-red-500 ring-1 ring-red-500"
                            : ""
                        }`}
                        placeholder={`Serial ${i + 1}`}
                      />
                      {serialInputs.length > 1 && (
                        <button
                          onClick={() => removeSerialInput(i)}
                          className="global_button_red"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {isLocalDup && (
                      <p className="text-xs text-red-500 mt-1 ml-1">
                        Duplicate value (entered more than once)
                      </p>
                    )}
                    {!isLocalDup && isApiDup && (
                      <p className="text-xs text-red-500 mt-1 ml-1">
                        Already exists 
                      </p>
                    )}
                  </div>
                );
              })}

             
           

              {/* Add More Button */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={addSerialInput}
                  disabled={duplicateSerialSet.size > 0}
                  className={`global_button ${
                    duplicateSerialSet.size > 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  Add More
                </button>
              </div>
              {/* Cancel / Save Buttons */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSerialModalOpen(false);
                  }}
                  className="global_button_red"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSerialNos}
                  disabled={
                    checkingSerials ||
                    duplicateSerialSet.size > 0 ||
                    apiDuplicateSet.size > 0
                  }
                  className={`global_button ${
                    checkingSerials ||
                    duplicateSerialSet.size > 0 ||
                    apiDuplicateSet.size > 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {checkingSerials ? "Checking..." : "Save"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      <ProductAddModal
        handleAddProduct={handleAddProduct}
        onSuccess={fetchProducts}
      />
      <CreateSupplierModalImmediate
        open={supplierModal}
        setOpen={setSupplierModal}
        setSelectedSupplier={setSelectedSupplier}
      />
    </div>
  );
};

export default CreatePurchase;
