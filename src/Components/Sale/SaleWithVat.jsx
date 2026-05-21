import Swal from "sweetalert2";
import { useEffect, useMemo, useState } from "react";
import { FaInfinity } from "react-icons/fa6";
import { IoMdCloseCircle } from "react-icons/io";
import Select from "react-select";
import { getBusinessDetails } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { ErrorToast } from "../../Helper/FormHelper";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ProductAddModal from "../Modals/ProductAddModal";
import CreateCustomerModalImmediate from "../Modals/CreateCustomerModalImmediate";
import toast from "react-hot-toast";
import { formatDate, playWarningSound } from "../../Helper/utils";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import api from "../../Helper/axios_resonse_interceptor";
import openCloseStore from "../../Zustand/OpenCloseStore";
import { can } from "../../Helper/permissionChecker";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";

const SaleWithVat = () => {
  const navigate = useNavigate();
  const { setOpenSidePanel } = openCloseStore();
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark"),
  );
  const [customerModal, setCustomerModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [SR, setSR] = useState([]);
  const [selectedSR, setSelectedSR] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchProductKeyword, setSearchProductKeyword] = useState("");
  const [searchCustomerKeyword, setSearchCustomerKeyword] = useState("");
  const { setGlobalLoader } = loadingStore();
  const [billTo, setBillTo] = useState("");
  const [note, setNote] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [otherCostName, setOtherCostName] = useState("");
  const [cost, setCost] = useState(0);
  const [barcode, setBarcode] = useState("");
  const [viewTotalPurchasePrice, setViewTotalPurchasePrice] = useState(false);
  const [vat, setVat] = useState(false);
  const [vatPercentage, setVatPercentage] = useState(0);
  const [sendSMS, setSendSMS] = useState(false);
  // Summary
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [serialBarcode, setSerialBarcode] = useState("");
  const [serialProducts, setSerialProducts] = useState([]);
  const [serialSearchKeyword, setSerialSearchKeyword] = useState("");
  // language translator
  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);
  const formTrans = useTextTranslate(GlobalFormTranslator);

  // const [paidAmount, setPaidAmount] = useState(0);

  const fetchProductWithPosMachine = async (code) => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/ProductList/1/1/${code}`);

      if (res.data.status === "Success" && res.data.data.length > 0) {
        const productData = res.data.data[0];
        const product = {
          ...productData,
          value: productData._id,
          label: `${productData.name} (${productData.Brands.name}) (${productData.Categories.name} ${productData.qty})`,
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
  // Fetch
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
            label: `${s.name} (${s.address}) (${s.mobile}) (${s.balance}) `,
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

  const fetchSR = async () => {
    try {
      const res = await api.get(`/GetAllSRs`);
      if (res.data.status === "Success") {
        setSR(
          res.data.data.map((s) => ({
            value: s._id,
            label: `${s.name} (${s.mobile}) `,
            ...s,
          })),
        );
      } else {
      }
    } catch (error) {
      console.error(error);
    } finally {
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
            label: `${p.name} (${p.Brands.name}) (${p.Categories.name
              }) (stock - ${p.manageStock === 0 ? "∞" : p.qty})(Barcode ${p.barcode
              })`,
            ...p,
            isDisabled: p.manageStock === 1 && p.qty === 0,
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

  const fetchProductStocksByProductID = async (id) => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/Stock/${id}`);
      if (res.data.status === "Success") {
        return res.data.data.map((s) => ({
          label: ` ${s.productCode === "0" || !s.productCode
            ? ""
            : `Code ${s.productCode}`
            }  ${s.stock} (${formatDate(s.CreatedDate)})`,
          value: s._id,
          ...s,
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };
  // Fetch products
  const fetchSerialProducts = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/ProductBySerial/${serialSearchKeyword || 0}`);
      if (res.data.status === "Success") {
        const filter = res.data.data.filter((p) => p.product !== null);

        const formatted = filter.map((p) => ({
          value: p.productID,
          label: `${p.name} ${p.serialNo} (${formatDate(p.CreatedDate)})`,
          ...p,
        }));

        setSerialProducts(formatted);
      }
    } catch (error) {
      // ErrorToast("Failed to load serial products");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  // Fetch serials with barcode
  const fetchProductsBySerialBarcode = async (barcode) => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/ProductBySerial/${barcode}`);
      if (res.data.status === "Success") {
        const rawProduct = res.data.data[0];
        handleAddProductWithSerialProduct({
          value: rawProduct.productID,
          label: `${rawProduct.name} ${rawProduct.serialNo} (${formatDate(
            rawProduct.CreatedDate,
          )})`,
          ...rawProduct,
        });
      }
    } catch (error) {
      ErrorToast("Failed to load products");
      console.error(error);
    } finally {
      setGlobalLoader(false);
      setSerialBarcode("");
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

  const fetchSerialsWithProductID = async (id) => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/ProductSerial/${id}`);
      if (res.data.status === "Success") {
        const formatted = res.data.data.map((s) => ({
          label: `${s.serialNo}  (${formatDate(s.CreatedDate)})`,
          value: s.serialNo,
          ...s,
        }));
        return formatted;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    setOpenSidePanel(false);
    const businessDetails = getBusinessDetails();
    if (businessDetails.smsInvoice == 1) {
      setSendSMS(true);
    }
    if (businessDetails.vatPercentage !== undefined) {
      setVatPercentage(Number(businessDetails.vatPercentage));
    }
    if (businessDetails.vat == 1) {
      setVat(true);
    }


    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    (() => {
      Promise.all([fetchAllAccounts(), fetchSR()]);
    })();

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [searchCustomerKeyword]);

  useEffect(() => {
    fetchProducts();
  }, [searchProductKeyword]);
  useEffect(() => {
    fetchSerialProducts();
  }, [serialSearchKeyword]);

  // Add product
  const handleAddProduct = async (product) => {
    const exist = selectedProducts.find((p) => p._id === product._id);

    if (exist && product.manageStock === 0) {
      // manageStock বন্ধ → শুধু qtySold +1 করতে হবে
      setSelectedProducts((prev) =>
        prev.map((p) => {
          if (p._id !== product._id) return p;

          const newQty = p.qtySold + 1;

          return {
            ...p,
            qtySold: newQty,
            total: newQty * p.price,
          };
        }),
      );

      return;
    }

    if (!exist && product.manageStock === 0) {
      const stocks = await fetchProductStocksByProductID(product.value);
      setSelectedProducts((prev) => [
        ...prev,
        {
          _id: product._id,
          label: product.label,
          name: product.name,
          qty: product.qty,
          price: product.mrp || 0,
          dp: product.db,
          total: product.mrp || 0,
          qtySold: 1,
          manageStock: product.manageStock,
          unitCost: product.unitCost || 0,
          decimal: product.decimal,
          warranty: 0,
          // productLineID: stocks[0]._id,
        },
      ]);
      return;
    }

    const serials = await fetchSerialsWithProductID(product.value);
    // je product er serial nai tader architecture e onno rokom hobe
    if (!serials) {
      const stocks = await fetchProductStocksByProductID(product.value);

      if (stocks.length === 0) {
        return toast.error("No stock found for this product");
      }

      const productAlreadyAdded = selectedProducts.find(
        (p) => p._id === product._id,
      );

      const multipleProductAddedList = selectedProducts.filter(
        (p) => p._id === product._id,
      );

      const availableStockList = stocks.filter(
        (s) => !multipleProductAddedList.some((p) => p.productLineID === s._id),
      );

      if (productAlreadyAdded && stocks.length === 1) {
        return toast.error("Product Already exist");
      }

      if (productAlreadyAdded && availableStockList.length > 0) {
        Swal.fire({
          title:
            "<span class='text-base font-normal'>এই পণ্যটি ইতিমধ্যেই Add করা আছে!</span>",
          html: "<span class='text-base font-normal'>আপনি কি Another Stock Add করতে চান?</span>",
          showCancelButton: true,
          confirmButtonText: "হ্যাঁ, Add করুন",
          cancelButtonText: "না",

          width: "350px",
          padding: "0.6rem",

          customClass: {
            popup: "backdrop-blur-sm bg-white/90 rounded-lg",
            title: "text-base font-normal text-gray-800",
            htmlContainer: "text-base text-gray-600",

            confirmButton:
              "bg-green-500 text-white px-3 py-1.5 mr-3 rounded-md hover:bg-green-600 text-base",
            cancelButton:
              "bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-300 text-base",
          },

          buttonsStyling: false,
        }).then((result) => {
          if (!result.isConfirmed) return;
          if (result.isConfirmed) {
            setSelectedProducts((prev) => {
              const oldRows = prev.filter((p) => p._id === product._id);
              const cleanedOldRows = oldRows.map((row) => ({
                ...row,
                stocks: row.selectedStock, // keeping only selected stock
              }));
              // আগের সব products বাদ দিয়ে বাকি রাখো
              const remaining = prev.filter((p) => p._id !== product._id);

              const newProduct = {
                _id: product._id,
                label: product.label,
                name: product.name,
                qty: availableStockList[0].qty,
                stocks: availableStockList,
                selectedStock: [availableStockList[0]],
                price: availableStockList[0].mrp,
                dp: availableStockList[0].dp,
                total: availableStockList[0].mrp,
                qtySold: 1,
                manageStock: product.manageStock,
                unitCost: availableStockList[0].unitCost,
                decimal: product.decimal,
                warranty: 0,
                productLineID: availableStockList[0]._id,
              };
              return [...remaining, ...cleanedOldRows, newProduct];
            });
            return;
          }
        });
      }

      if (multipleProductAddedList && availableStockList.length === 0) {
        return toast.error("Product With All Stocks Has been Added Already");
      }

      if (!productAlreadyAdded) {
        setSelectedProducts((prev) => [
          ...prev,
          {
            _id: product._id,
            label: product.label,
            name: product.name,
            qty: stocks[0].qty,
            stocks: stocks,
            selectedStock: [stocks[0]],
            price: stocks[0].mrp,
            dp: stocks[0].dp,
            total: stocks[0].mrp,
            qtySold: 1,
            manageStock: product.manageStock,
            unitCost: stocks[0].unitCost,
            decimal: product.decimal,
            warranty: 0,
            productLineID: stocks[0]._id,
          },
        ]);
      }

      return;
    }

    if (exist && exist.serials.length > 0) {
      return toast.error("Product is already Added, Please Select Serial Now");
    }

    if (!exist && serials.length > 0) {
      setSelectedProducts((prev) => [
        ...prev,
        {
          _id: product._id,
          label: product.label,
          name: product.name,
          qty: product.qty,
          price: 0,
          dp: product.dp || 0,
          total: 0,
          qtySold: serials?.length > 0 ? 0 : 1,
          manageStock: product.manageStock,
          unitCost: 0,
          decimal: product.decimal,
          serials: serials,
          selectedSerials: [],
          warranty: 0,
        },
      ]);
    }
  };

  const handleAddProductWithSerialProduct = async (product) => {
    const existSerial = selectedProducts.find(
      (p) =>
        p.productLineID === product.productLineID &&
        p.selectedSerials?.some((s) => s.serialNo === product.serialNo),
    );

    const productExist = selectedProducts.find(
      (p) => p._id === product.productID,
    );

    if (existSerial) {
      return toast.error("সিরিয়ালটি ইতিমধ্যেই বিদ্যমান");
    }

    const productLineExist = selectedProducts.find(
      (p) => p.productLineID === product.productLineID,
    );
    //  serial is addeble
    if (productLineExist && !existSerial) {
      setSelectedProducts((prev) => {
        return prev.map((p) => {
          // যেটার productLineID মিলে শুধু সেটাই আপডেট হবে
          if (p.productLineID !== product.productLineID) return p;

          // নতুন serial object বের করা
          const newSerial = p.serials.find(
            (s) => s.serialNo === product.serialNo,
          );
          toast.success("সিরিয়াল Select হয়েছে");

          return {
            ...p,
            selectedSerials: [...p.selectedSerials, newSerial],
            qtySold: p.selectedSerials.length + 1,
            total: p.price * (p.selectedSerials.length + 1),
          };
        });
      });

      return;
    }

    const serials = await fetchSerialsWithProductID(product.value);

    if (productExist && !productLineExist) {
      const allSerials = serials;

      const productRows = selectedProducts.filter(
        (p) => p._id === product.productID,
      );
      const lastProduct = productRows[productRows.length - 1];

      // -----------------------------------
      // 🔥 CASE A: Product আছে but no selected serials → no new row
      // -----------------------------------
      if (
        !lastProduct.selectedSerials ||
        lastProduct.selectedSerials.length === 0
      ) {
        const newSerial = serials.find((s) => s.serialNo === product.serialNo);

        setSelectedProducts((prev) =>
          prev.map((p) => {
            if (p === lastProduct) {
              return {
                ...p,

                selectedSerials: [newSerial],
                qtySold: 1,
                price: product.mrp,
                dp: newSerial.dp,
                unitCost: product.unitCost,
                total: product.mrp,
                productLineID: product.productLineID, // update line id
              };
            }
            return p;
          }),
        );
        toast.success("সিরিয়াল Select হয়েছে");
        return; // 🚀 stop: new row add হবে না
      }
      // -----------------------------------
      // 🔥 CASE B: selectedSerials already exists → create new row
      // -----------------------------------

      const oldSelected = lastProduct.selectedSerials ?? [];
      const oldLineID = lastProduct.productLineID;

      const oldLineSerials = allSerials.filter(
        (s) => s.productLineID === oldLineID,
      );

      const oldSelectedClean = oldSelected.filter(
        (s) => s.productLineID === oldLineID,
      );

      const remainingSerials = allSerials.filter(
        (s) => !oldSelectedClean.some((sel) => sel.value === s.value),
      );

      setSelectedProducts((prev) => {
        const updated = prev.map((p, idx) => {
          const lastIdx = prev.lastIndexOf(lastProduct);

          if (idx !== lastIdx) return p;

          return {
            ...p,
            serials: oldLineSerials,
            selectedSerials: oldSelectedClean,
            qtySold: oldSelectedClean.length,
            total: p.price * oldSelectedClean.length,
          };
        });

        const newSerial = remainingSerials.find(
          (s) => s.value === product.serialNo,
        );
        toast.success("সিরিয়াল Select হয়েছে");
        return [
          ...updated,
          {
            ...lastProduct,
            productLineID: product.productLineID,
            serials: serials.filter(
              (s) => s.productLineID !== lastProduct.productLineID,
            ),
            selectedSerials: [newSerial],
            qtySold: 1,
            price: product.mrp,
            dp: newSerial.dp,
            unitCost: product.unitCost,
            total: product.mrp,
            warranty: product.warranty,
          },
        ];
      });
    }

    if (!productExist) {
      const newSerial = serials.find((s) => s.serialNo === product.serialNo);

      const newProduct = {
        _id: product.productID,
        label: product.label,
        price: product.mrp,
        dp: newSerial.dp,
        unitCost: product.unitCost,
        qtySold: 1,
        productLineID: product.productLineID,
        serials: serials,
        selectedSerials: [newSerial],
        total: product.mrp,
        warranty: product.warranty,
      };

      setSelectedProducts((prev) => [...prev, newProduct]);
      toast.success("সিরিয়াল Select হয়েছে");
      return;
    }
  };

  // Update product field
  const handleProductChange = (index, field, value) => {
    const updated = [...selectedProducts];
    const product = updated[index];
    const numValue = Number(value) || 0;

    // =============================
    // 🔹 QTY SOLD UPDATE
    // =============================
    if (field === "qtySold") {
      if (product.manageStock === 0) {
        updated[index].qtySold = numValue;
      } else if (product.selectedStock.length > 0) {
        updated[index].qtySold =
          numValue > product.selectedStock[0].stock
            ? product.selectedStock[0].stock
            : numValue;
      } else {
        updated[index].qtySold =
          numValue > product.qty ? product.qty : numValue;
      }

      updated[index].total =
        (updated[index].qtySold || 0) * (updated[index].price || 0);

      return setSelectedProducts(updated);
    }

    // =============================
    // 🔹 WARRANTY UPDATE
    // =============================
    if (field === "warranty") {
      updated[index].warranty = value === "" ? 0 : numValue;
      return setSelectedProducts(updated);
    }

    // =============================
    // 🔹 PRICE UPDATE (NEW)
    // =============================
    if (field === "price") {
      updated[index].price = value === "" ? 0 : numValue;

      updated[index].total =
        (product.qtySold || 0) * (updated[index].price || 0);

      return setSelectedProducts(updated);
    }
  };

  const totalPrice = useMemo(
    () =>
      selectedProducts.reduce((acc, p) => {
        const subtotal = (p.price || 0) * (p.qtySold || 0);
        const vatAmount = vat
          ? (subtotal * vatPercentage) / 100
          : 0;

        return acc + subtotal + vatAmount;
      }, 0),
    [selectedProducts, vat, vatPercentage],
  );


  const totalWithOutVat = useMemo(
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

  const invoiceDue = useMemo(
    () => grandTotal - (paidAmount || 0),
    [grandTotal, paidAmount],
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

  const customStyles = {
    option: (provided, state) => {
      const isDisabled = state.data.manageStock !== 0 && state.data.qty === 0;

      return {
        ...provided,
        color: isDisabled
          ? "#ef4444"
          : isDark
            ? "#f9fafb"
            : "#000",
        backgroundColor: isDisabled
          ? isDark
            ? "#7f1d1d"
            : "#fee2e2"
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
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.7 : 1,
      };
    },

    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),

    input: (base) => ({
      ...base,
      color: isDark ? "#ffffff" : "#111827",
    }),

    singleValue: (base) => ({
      ...base,
      color: isDark ? "#ffffff" : "#111827",
    }),

    placeholder: (base) => ({
      ...base,
      color: isDark ? "#9ca3af" : "#6b7280",
    }),
  };


  const selectSerial = (selectedSerials, idx) => {
    const latest = selectedSerials[selectedSerials.length - 1];
    const newLineID = latest.productLineID;
    const allSameLine = selectedSerials.every(
      (s) => s.productLineID === selectedSerials[0].productLineID,
    );

    setSelectedProducts((prev) => {
      const updated = [...prev];

      const oldProduct = { ...updated[idx] };
      const oldLineID = oldProduct.productLineID;

      // CASE 1 — Same productLine + new selection from empty
      if (allSameLine) {
        updated[idx] = {
          ...oldProduct,
          productLineID: latest.productLineID,
          selectedSerials,
          qtySold: selectedSerials.length,
          unitCost: latest.unitCost,
          price: latest.mrp,
          dp: latest.dp,
          total: latest.mrp * selectedSerials.length,
          warranty: latest.warranty,
        };
        return updated;
      }

      // ─────────────────────────────
      // CASE 2 — Mixed → SPLIT
      // ─────────────────────────────

      // 1️⃣ PREPARE GLOBAL LIST OF ALL AVAILABLE SERIALS (without selected ones)
      const allSerials = [...oldProduct.serials];
      const alreadySelected = [...oldProduct.selectedSerials];

      // Keep only previous line in old row
      const oldProductClean = {
        ...oldProduct,
        serials: allSerials.filter((s) => s.productLineID === oldLineID),
        selectedSerials: alreadySelected.filter(
          (s) => s.productLineID === oldLineID,
        ),
      };

      oldProductClean.qtySold = oldProductClean.selectedSerials.length;
      oldProductClean.total = oldProductClean.qtySold * oldProduct.price;

      updated[idx] = oldProductClean;

      // 2️⃣ NEW ROW SHOULD GET:
      // ALL SERIALS — oldProductClean.selectedSerials
      const remainingSerials = allSerials.filter(
        (s) => s.productLineID !== oldProductClean.productLineID,
      );

      const newProduct = {
        ...oldProduct,
        productLineID: newLineID,
        serials: remainingSerials,
        selectedSerials: [latest],
        qtySold: 1,
        unitCost: latest.unitCost,
        price: latest.mrp,
        dp: latest.dp,
        total: latest.mrp,
        warranty: latest.warranty,
      };

      return [...updated, newProduct];
    });
  };

  const selectStock = (stock, idx) => {
    setSelectedProducts((prev) => {
      return prev.map((p, i) => {
        if (i !== idx) return p;

        // 🛑 STOP: যদি qtySold > 0 অথবা warranty > 0 → change allowed না
        if (p.qtySold > 1 || p.warranty > 0) {
          toast.error("Stock পরিবর্তন করা যাবে না!");
          return p;
        }

        // ✅ Change allowed — update stock row
        return {
          ...p,
          qty: stock.qty,
          selectedStock: [stock],
          price: stock.mrp,
          dp: stock.dp,
          unitCost: stock.unitCost,
          productLineID: stock._id,
          total: (p.qtySold || 1) * stock.mrp,
        };
      });
    });
  };

  const handleProductQtyIncrease = async (idx) => {
    const allProducts = selectedProducts;
    const product = allProducts[idx];

    if (!product) return prev;
    if (product.manageStock === 0) {
      const currentQtySold = product.qtySold;
      let newQtySold = currentQtySold + 1;
      setSelectedProducts((prev) => {
        const all = [...prev];
        all[idx] = {
          ...all[idx],
          qtySold: newQtySold,
          total: newQtySold * product.price,
        };
        return all;
      });
      return;
    }

    const stock = product.selectedStock[0].stock;
    const currentQtySold = product.qtySold;
    let newQtySold = currentQtySold + 1;

    const willExceedStock = newQtySold > stock;

    if (!willExceedStock) {
      setSelectedProducts((prev) => {
        const all = [...prev];
        all[idx] = {
          ...all[idx],
          qtySold: newQtySold,
          total: newQtySold * product.price,
        };
        return all;
      });
      return;
    }
    // Exceed stock হলে:
    newQtySold = stock;

    const stocks = await fetchProductStocksByProductID(product._id);

    if (stocks.length === 1) {
      toast.error("No more stock available");
      return;
    }

    const multipleProductAddedList = selectedProducts.filter(
      (p) => p._id === product._id,
    );

    const availableStockList = stocks.filter(
      (s) => !multipleProductAddedList.some((p) => p.productLineID === s._id),
    );

    if (availableStockList.length === 0) {
      return toast.error("No more stock");
    }

    if (availableStockList.length > 0) {
      setSelectedProducts((prev) => {
        const oldRows = prev.filter((p) => p._id === product._id);

        const cleanedOldRows = oldRows.map((row) => ({
          ...row,
          stocks: row.selectedStock,
        }));

        const remaining = prev.filter((p) => p._id !== product._id);

        const newProduct = {
          _id: product._id,
          label: product.label,
          name: product.name,
          qty: availableStockList[0].qty,
          stocks: availableStockList,
          selectedStock: [availableStockList[0]],
          price: availableStockList[0].mrp,
          total: availableStockList[0].mrp,
          qtySold: 1,
          manageStock: product.manageStock,
          unitCost: availableStockList[0].unitCost,
          decimal: product.decimal,
          warranty: 0,
          productLineID: availableStockList[0]._id,
        };

        return [...remaining, ...cleanedOldRows, newProduct];
      });
    }
  };

  const vatAmount = selectedProducts.reduce((acc, p) => {
    const subtotal = (p.price || 0) * (p.qtySold || 0);
    return acc + (subtotal * vatPercentage) / 100;
  }, 0);

  const handleProductQtyDecrease = (idx) => {
    return setSelectedProducts((prev) => {
      const allProducts = [...prev];
      const product = allProducts[idx];
      // যদি product না থাকে
      if (!product) return prev;

      const currentQtySold = product.qtySold;
      const newQtySold = currentQtySold - 1;
      // qtySold 0-এর নিচে নামতে দেবে না
      allProducts[idx] = {
        ...product,
        qtySold: newQtySold,
        total: newQtySold * product.price,
      };

      return allProducts;
    });
  };
  useEffect(() => {
    if (selectedCustomer) {
      // Customer select করলে সব amount = 0
      setSelectedAccounts((prev) => prev.map((a) => ({ ...a, amount: 0 })));
    }
  }, [selectedCustomer]);

  useEffect(() => {
    if (selectedCustomer) return; // customer থাকলে কিছু করবে না

    if (grandTotal > 0) {
      let mainAccount =
        accounts.find((a) => a.default === 1) ||
        selectedAccounts.find((a) => a.default === 1);

      if (!mainAccount) return;

      setSelectedAccounts((prev) =>
        prev.map((acc) =>
          acc.value === mainAccount.value
            ? { ...acc, amount: grandTotal }
            : acc,
        ),
      );
    }
  }, [grandTotal, selectedCustomer]);

  // Submit purchase
  const handleSubmit = async () => {
    if (!selectedProducts || selectedProducts.length === 0)
      return ErrorToast("Select at least one product");

    // SERIAL VALIDATION
    const missingSerialProduct = selectedProducts.find(
      (p) => p.serials?.length > 0 && p.selectedSerials?.length === 0,
    );

    if (missingSerialProduct) {
      return ErrorToast(
        `${missingSerialProduct.label} → এই পণ্যের Serial নির্বাচন করুন!`,
      );
    }

    // CUSTOMER VALIDATION + CONFIRMATION
    if (!selectedCustomer) {
      const result = await Swal.fire({
        title:
          "<span class='text-base font-normal text-red-500'>কাস্টমার ছাড়া সেল হওয়ায় পুরো পেমেন্ট ক্যাশে গ্রহণ করা হয়েছে?</span>",
        showCancelButton: true,
        confirmButtonText: "হ্যাঁ, Sell করুন",
        cancelButtonText: "না",

        width: "350px",
        padding: "0.6rem",

        customClass: {
          popup: "backdrop-blur-sm bg-white/90 rounded-lg",
          title: "text-sm font-semibold",
          htmlContainer: "text-xs",

          confirmButton:
            "bg-green-500 text-white px-3 py-1.5 mr-3 rounded-md hover:bg-green-600 text-lg",
          cancelButton:
            "bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-300 text-lg",
        },

        buttonsStyling: false,
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    if (!selectedCustomer && paidAmount < dueAmount) {
      return ErrorToast("Please Pay full amount or select a customer");
    }
    const payload = {
      Sale: {
        ...(selectedCustomer
          ? {
            contactID: selectedCustomer.value,
            ...(invoiceDue > 0 ? { dueAmount: invoiceDue } : {}),
            PreviousBalance: selectedCustomer.balance || 0,
            CurrentBalance: -dueAmount,
          }
          : { BillTo: "No Customer" }),

        paid: !selectedCustomer ? grandTotal : paidAmount,
        ...(!selectedCustomer ? { BillTo: billTo } : {}),
        total: totalWithOutVat,          // VAT Sara total
        vat: vatAmount,
        vatPercentage: vatPercentage,

        discount: discount || 0,
        grandTotal: grandTotal,
        CreatedDate: purchaseDate,
        note: note,

        ...(otherCostName
          ? { outher: otherCostName, outherAmount: cost }
          : {}),

        ...(sendSMS ? { sms: 1 } : {}),
        ...(selectedSR ? { srID: selectedSR.value } : {}),
      },

      payment: selectedAccounts.map((a) => ({
        accountID: a.value,
        accountName: a.name,
        amount: a.amount,
      })),


      SaleProduct: selectedProducts.map((p) => {
        const subtotal = (p.price || 0) * (p.qtySold || 0);
        const vatAmountProduct = (subtotal * vatPercentage) / 100;

        return {
          productID: p._id,
          qtySold: p.qtySold,
          price: p.price,

          total: subtotal,

          vat: vatAmountProduct,              // 😂 per product VAT
          vatPercentage: vatPercentage,

          ...(p.productLineID ? { productLineID: p.productLineID } : {}),
          name: p.name,

          ...(p.selectedSerials?.length > 0
            ? { serialNos: p.selectedSerials.map((s) => s._id) }
            : {}),

          warranty: p.warranty,
        };
      }),
    };

    try {
      setGlobalLoader(true);
      const res = await api.post(`/CreateSales`, payload);

      if (res.data.status === "Success") {
        setSelectedProducts([]);
        setSelectedCustomer(null);
        navigate(
          `/Invoice/${getBusinessDetails()?.invoice || 1}/${res.data.SaleID}`,
        );
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

  return (
    <div className="global_container ">
      {/* Contact & Product Selection */}
      <div className="global_sub_container sticky -top-3 z-40 bg-white dark:bg-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-2 items-end gap-2 lg:grid-cols-3">
          {/* Contact*/}
          <div>
            <label className="block text-sm font-medium mb-1">
              {table("customer")}
            </label>
            <Select
              options={customers}
              value={selectedCustomer}
              onChange={setSelectedCustomer}
              placeholder="Select Customer"
              classNamePrefix="react-select"
              onInputChange={(val) => setSearchCustomerKeyword(val)}
              styles={getReactSelectStyles()}
              isClearable
            />
          </div>

          <div className="flex items-end gap-2">
            {/* Add Contact*/}
            {can("CreateContact") && (
              <div>
                <button
                  onClick={() => setCustomerModal(true)}
                  className="global_button w-full  py-1 px-1"
                >
                  + {table("customer")}
                </button>
              </div>
            )}
            {/* Bill to */}
            {!selectedCustomer && <div>
              <label className="block text-sm font-medium mt-1 mb-1">
                {formTrans("Bill To")}
              </label>
              <div className="relative w-full">
                {/* Bill to input field */}
                <input className="global_input w-full" type="text" value={billTo} onChange={(e) => setBillTo(e.target.value)} placeholder="Bill To" />
              </div>
            </div>}
            {can("isAdmin") && (
              <div>
                <label className="block text-sm font-medium mt-1 mb-1">
                  {formTrans("selectDate")}
                </label>
                <div className="relative w-full">
                  <DatePicker
                    selected={purchaseDate}
                    onChange={(date) => setPurchaseDate(date)}
                    dateFormat="dd-MM-yyyy"
                    className="global_input w-full"
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
          </div>
          {/* ==============================  */}
          <div className="flex items-center gap-2">
            {can("ViewPurchasePrice") && (
              <div className="w-1/2 flex flex-col text-center">
                <label className="text-sm font-medium">
                  {btn("purchasePrice")}
                </label>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setViewTotalPurchasePrice(!viewTotalPurchasePrice)
                    }
                    className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-300 ${viewTotalPurchasePrice ? "bg-green-500" : "bg-gray-300"
                      }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform duration-300 ${viewTotalPurchasePrice
                        ? "translate-x-4"
                        : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>
              </div>
            )}


            <div className="w-1/2 flex flex-col text-center">
              <label className="text-sm font-medium">{btn("sendSms")}</label>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setSendSMS(!sendSMS)}
                  className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-300 ${sendSMS ? "bg-green-500" : "bg-gray-300"
                    }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform duration-300 ${sendSMS ? "translate-x-4" : "translate-x-1"
                      }`}
                  />
                </button>
              </div>
            </div>
            {can("ProfitOnSale") && (
              <div className="w-1/2 flex flex-col text-center group">
                <label className="text-sm font-medium">
                  {formTrans("profit")}
                </label>

              <h1
                className="
                  opacity-0 
                    group-hover:opacity-100 
                      transition-opacity 
                    duration-200
                        "
              >
                {selectedProducts.reduce(
                  (acc, p) => acc + (p.total - p.unitCost * p.qtySold),
                  0,
                ) - (discount || 0)}
              </h1>
            </div>)}
          </div>
        </div>

        {/* barcodes+serials */}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4 items-end mt-2">
          {/* product barcode */}
          {/* Product*/}
          <div>
            <label className="block text-sm font-medium mb-1">
              {formTrans("product")} <span className="text-red-500"> *</span>
            </label>

            <Select
              options={products}
              value={null}
              onChange={handleAddProduct}

              placeholder="Select Product"
              classNamePrefix="react-select"
              onInputChange={(val) => setSearchProductKeyword(val)}
              styles={customStyles}
            />
          </div>

          {/* search barcode  */}
          <div className="hidden md:flex">
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
              placeholder="Product With Barcode"
            />
          </div>

          {/*  */}
          {getBusinessDetails()?.warranty === "1" && (
            <>
              <div className="w-full">
                <label className="block text-sm font-medium mb-1">
                  {formTrans("searchSerial")}
                </label>

                <Select
                  options={serialProducts}
                  value={null}
                  onChange={(p) => handleAddProductWithSerialProduct(p)}
                  placeholder="Search Serial"
                  classNamePrefix="react-select"
                  onInputChange={(val, action) => {
                    if (action.action === "input-change") {
                      setSerialSearchKeyword(val);
                    }
                  }}
                  menuPortalTarget={document.body}
                  styles={getReactSelectStyles()}
                />
              </div>

              {/* serial barcode */}
              <div className="hidden md:flex">
                <input
                  value={serialBarcode}
                  onChange={(e) => {
                    setSerialBarcode(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // form submit block
                      fetchProductsBySerialBarcode(e.target.value); // call API
                    }
                  }}
                  className="global_input text-black dark:text-white h-fit"
                  placeholder="Search Serial By Barcode"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Selected Products Table */}
      <div className="global_sub_container p-2 mt-4">
        {/* ==============================  */}
        <div className="overflow-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">{table("no")}</th>
                <th className="global_th">
                  {formTrans("product")} {formTrans("name")}
                </th>
                <th className="global_th">{table("stocks")}</th>
                {getBusinessDetails().warranty === "1" && (
                  <>
                    {" "}
                    <th className="global_th">{table("serials")}</th>
                    <th className="global_th">{table("warranty")}</th>
                  </>
                )}
                <th className="global_th">{table("qty")}</th>

                <th className="global_th">{table("salePrice")}</th>
                {vat && (
                  <>
                    <th className="global_th">{btn("Vat%")}</th>
                    <th className="global_th">
                      {" "}
                      {formTrans("vat")}
                    </th>
                  </>
                )}
                <th className="global_th">{table("dp")}</th>
                <th className="global_th">{table("total")}</th>
                <th className="global_th">{table("action")}</th>
                {viewTotalPurchasePrice && (
                  <>
                    <th className="global_th">{btn("purchasePrice")}</th>
                    <th className="global_th">
                      {" "}
                      {table("total")} {formTrans("purchase")}
                    </th>
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
                    <h1 className="min-w-[150px]">{p.label}</h1>
                  </td>
                  {/* Stocks and Serials */}
                  <td className="global_td w-[250px]">
                    {p.manageStock === 0 && (
                      <h1 className="flex justify-center">
                        <FaInfinity size={20} />
                      </h1>
                    )}
                    {/* Stock */}
                    {p.stocks?.length > 0 && p.manageStock !== 0 && (
                      <Select
                        value={p.selectedStock}
                        options={p.stocks}
                        onChange={(stock) => selectStock(stock, idx)}
                        placeholder="Select Stock"
                        menuPortalTarget={document.body}
                        styles={{
                          control: (base) => ({
                            ...base,
                            backgroundColor:
                              document.documentElement.classList.contains(
                                "dark",
                              )
                                ? "#111827"
                                : "#ffffff",
                            color: document.documentElement.classList.contains(
                              "dark",
                            )
                              ? "#ffffff"
                              : "#111827",
                          }),
                          menu: (base) => ({
                            ...base,
                            backgroundColor:
                              document.documentElement.classList.contains(
                                "dark",
                              )
                                ? "#374151"
                                : "#ffffff",
                            zIndex: 9999,
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused
                              ? document.documentElement.classList.contains(
                                "dark",
                              )
                                ? "#4b5563"
                                : "#f3f4f6"
                              : document.documentElement.classList.contains(
                                "dark",
                              )
                                ? "#374151"
                                : "#ffffff",
                            color: document.documentElement.classList.contains(
                              "dark",
                            )
                              ? "#ffffff"
                              : "#111827",
                          }),
                          input: (base) => ({
                            ...base,
                            color: document.documentElement.classList.contains(
                              "dark",
                            )
                              ? "#ffffff"
                              : "#111827",
                          }),
                          singleValue: (base) => ({
                            ...base,
                            color: document.documentElement.classList.contains(
                              "dark",
                            )
                              ? "#ffffff"
                              : "#111827",
                          }),
                          placeholder: (base) => ({
                            ...base,
                            color: document.documentElement.classList.contains(
                              "dark",
                            )
                              ? "#9ca3af"
                              : "#6b7280",
                          }),
                          multiValue: (base, { data }) => ({
                            ...base,
                            backgroundColor:
                              document.documentElement.classList.contains(
                                "dark",
                              )
                                ? "#4b5563"
                                : "#e5e7eb",
                          }),
                          multiValueLabel: (base, { data }) => ({
                            ...base,
                            color: document.documentElement.classList.contains(
                              "dark",
                            )
                              ? "#ffffff"
                              : "#111827",
                          }),
                          multiValueRemove: (base) => ({
                            ...base,
                            display: "none", // Hide the cross (remove) icon
                          }),
                          dropdownIndicator: (base) => ({
                            ...base,
                            display: "none", // Hide the dropdown arrow
                          }),
                          indicatorSeparator: (base) => ({
                            ...base,
                            display: "none", // Hide the separator between input and arrow
                          }),
                          clearIndicator: (base) => ({
                            ...base,
                            display: "none", // Hide the clear all indicator
                          }),
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                      />
                    )}
                  </td>
                  {/* Select Serials */}
                  {getBusinessDetails().warranty === "1" && (
                    <>
                      {" "}
                      <td className="global_td w-[250px]">
                        {p.serials?.length > 0 && (
                          <Select
                            value={p.selectedSerials}
                            options={p.serials}
                            onChange={(serial) => selectSerial(serial, idx)}
                            isMulti
                            menuPlacement="auto"
                            menuPosition="absolute"
                            placeholder="Select Serial"
                            menuPortalTarget={document.body}
                            isClearable
                            styles={{
                              control: (base) => ({
                                ...base,
                                backgroundColor:
                                  document.documentElement.classList.contains(
                                    "dark",
                                  )
                                    ? "#111827"
                                    : "#ffffff",
                                color:
                                  document.documentElement.classList.contains(
                                    "dark",
                                  )
                                    ? "#ffffff"
                                    : "#111827",
                              }),
                              menu: (base) => ({
                                ...base,
                                backgroundColor:
                                  document.documentElement.classList.contains(
                                    "dark",
                                  )
                                    ? "#374151"
                                    : "#ffffff",
                                zIndex: 9999,
                              }),
                              option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isFocused
                                  ? document.documentElement.classList.contains(
                                    "dark",
                                  )
                                    ? "#4b5563"
                                    : "#f3f4f6"
                                  : document.documentElement.classList.contains(
                                    "dark",
                                  )
                                    ? "#374151"
                                    : "#ffffff",
                                color:
                                  document.documentElement.classList.contains(
                                    "dark",
                                  )
                                    ? "#ffffff"
                                    : "#111827",
                              }),
                              input: (base) => ({
                                ...base,
                                color:
                                  document.documentElement.classList.contains(
                                    "dark",
                                  )
                                    ? "#ffffff"
                                    : "#111827",
                              }),
                              singleValue: (base) => ({
                                ...base,
                                color:
                                  document.documentElement.classList.contains(
                                    "dark",
                                  )
                                    ? "#ffffff"
                                    : "#111827",
                              }),
                              placeholder: (base) => ({
                                ...base,
                                color:
                                  document.documentElement.classList.contains(
                                    "dark",
                                  )
                                    ? "#9ca3af"
                                    : "#6b7280",
                              }),
                              multiValue: (base, { data }) => ({
                                ...base,
                                backgroundColor:
                                  document.documentElement.classList.contains(
                                    "dark",
                                  )
                                    ? "#4b5563"
                                    : "#e5e7eb",
                              }),
                              multiValueLabel: (base, { data }) => ({
                                ...base,
                                color:
                                  document.documentElement.classList.contains(
                                    "dark",
                                  )
                                    ? "#ffffff"
                                    : "#111827",
                              }),
                              multiValueRemove: (base) => ({
                                ...base,
                                display: "flex", // Hide the cross (remove) icon
                              }),
                              dropdownIndicator: (base) => ({
                                ...base,
                                display: "none", // Hide the dropdown arrow
                              }),
                              indicatorSeparator: (base) => ({
                                ...base,
                                display: "none", // Hide the separator between input and arrow
                              }),
                              clearIndicator: (base) => ({
                                ...base,
                                opacity: 0, // icon will be invisible
                                width: 0, // take no space
                                padding: 0, // remove click area
                              }),
                              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            }}
                          />
                        )}
                      </td>
                      {/* Warranty */}
                      <td className="global_td w-24">
                        <input
                          type="number"
                          value={p.warranty === 0 ? "" : p.warranty}
                          onChange={(e) => {
                            handleProductChange(
                              idx,
                              "warranty",
                              e.target.value,
                            ); // শুধুমাত্র সংখ্যা allow
                          }}
                          className={`global_input w-24 text-center`}
                        />
                      </td>{" "}
                    </>
                  )}
                  {/* QTy*/}
                  <td className="global_td w-24">
                    {/* only stocks */}
                    {p.stocks?.length > 0 && (
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
                          disabled={p.serials?.length > 0}
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
                          className={`global_input w-15 px-1 text-center rounded-none ${p.serials?.length > 0 ? "cursor-not-allowed" : ""
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
                    )}
                    {/* only serials */}
                    {p.serials?.length > 0 && (
                      <div className="flex justify-center">
                        <input
                          type="number"
                          disabled={p.serials?.length > 0}
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
                          className={`global_input w-24 text-center ${p.serials?.length > 0 ? "cursor-not-allowed" : ""
                            }`}
                        />
                      </div>
                    )}
                    {/* unlimited quantity */}
                    {p.manageStock === 0 && (
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
                          className={`global_input w-15 px-1 text-center rounded-none ${p.serials?.length > 0 ? "cursor-not-allowed" : ""
                            }`}
                        />
                        <button
                          onClick={() => {
                            handleProductQtyIncrease(idx);
                          }}
                          className="border border-gray-300 dark:border-gray-600 rounded-none px-3 py-1 outline-none"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Sale Price o Unit cost hoye backend a jabe*/}
                  <td className="global_td w-24">
                    <input
                      type="number"
                      value={p.price === 0 ? "" : p.price}
                      onChange={(e) =>
                        handleProductChange(idx, "price", e.target.value)
                      }
                      className={`global_input w-24 ${p.price < 1
                        ? "ring-red-500 border-2 border-red-500"
                        : ""
                        }`}
                    />
                  </td>
                  {/*Vat*/}
                  {vat && (
                    <>
                      {" "}
                      <td className="global_td"> {vatPercentage} %</td>
                      <td className="global_td">
                        {(p.price * p.qtySold * (vatPercentage / 100)).toFixed(2)}
                      </td>
                    </>
                  )}
                  {/* DP*/}
                  <td className="global_td w-24">{p?.dp?.toFixed(2)}</td>

                  {/*Total */}
                  <td className="global_td">
                    {(
                      (p.price * p.qtySold) +
                      (p.price * p.qtySold * vatPercentage) / 100
                    ).toFixed(2)}
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
                      {btn("delete")}
                    </button>
                  </td>
                  {viewTotalPurchasePrice && (
                    <>
                      {" "}
                      <td className="global_td">{p?.unitCost?.toFixed(2)}</td>
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

      <div className="global_sub_container p-2 mt-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Note*/}
          <div className="flex-1">
            <label className="block mb-2 font-medium">
              {formTrans("note")}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="global_input min-h-[150px] w-full"
            />
            <div className="col-span-8 lg:col-span-3">
              <label className="block text-sm font-medium mb-1">SR</label>
              <Select
                options={SR}
                value={selectedSR}
                onChange={setSelectedSR}
                placeholder="Select SR"
                classNamePrefix="react-select"
                styles={getReactSelectStyles()}
                isClearable
              />
            </div>
          </div>

          {/* Summary*/}
          <div className="flex-1 space-y-3">
            {/* Total*/}
            <div className="flex justify-between">
              <label>{table("GrossTotal")}:</label>
              <input
                type="number"
                value={(
                  selectedProducts.reduce((acc, p) => {
                    const subtotal = p.price * p.qtySold;
                    return acc + (subtotal);
                  }, 0)
                ).toFixed(2)}
                disabled
                className="global_input w-40 rounded-sm cursor-not-allowed text-right"
              />
            </div>

            {/* Discount %*/}
            {can("DiscountOnSale") && (
              <div className="flex justify-between">
                <label>Discount % :</label>
                <input
                  type="number"
                  value={discountPercent === 0 ? "" : discountPercent}
                onChange={(e) => {
                  const percentValue =
                    e.target.value === "" ? 0 : Number(e.target.value);
                  const newDiscountAmount = (percentValue / 100) * totalPrice;
                  setDiscount(newDiscountAmount);
                  setDiscountPercent(percentValue);
                }}
                className="global_input w-40 rounded-sm text-right"
                min="0"
                max="100"
              />
            </div>)}

            {/* Discount*/}
        {can("DiscountOnSale") && (
          <div className="flex justify-between">
            <label>{formTrans("discountAmount")}:</label>
            <input
              type="number"
              value={discount === 0 ? "" : discount}
              onChange={(e) => {
                  const discountValue =
                    e.target.value === "" ? 0 : Number(e.target.value);
                  const newDiscountPercent =
                    totalPrice > 0 ? (discountValue / totalPrice) * 100 : 0;

                  setDiscount(discountValue);
                  setDiscountPercent(parseFloat(newDiscountPercent.toFixed(2)));
                }}
                className="global_input w-40 rounded-sm text-right"
                min="0"
                max={totalPrice}
              />
            </div>)}

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
                className="global_input w-40 rounded-sm text-start"
              />
              <input
                type="number"
                value={cost}
                disabled={otherCostName === ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setCost(value === "" ? "" : parseInt(value, 10));
                }}
                className={`global_input w-40 rounded-sm text-right ${otherCostName === ""
                  ? "bg-gray-200 dark:bg-gray-600 cursor-not-allowed"
                  : ""
                  }`}
              />
            </div>


            {vat && (
              <div className="flex justify-between">
                <label>{formTrans(`Vat ${vatPercentage} %`)}</label>
                <input
                  type="number"
                  value={(
                    selectedProducts.reduce((acc, p) => {
                      const subtotal = p.price * p.qtySold;
                      return acc + (subtotal * vatPercentage) / 100;
                    }, 0)
                  ).toFixed(2)}
                  disabled
                  className="global_input w-40 text-right"
                />
              </div>
            )}

            {/* Grand Total*/}
            <div className="flex justify-between">
              <label>{formTrans("grandTotal")}:</label>
              <input
                type="number"
                value={grandTotal.toFixed(2)}
                disabled
                className="global_input w-40 rounded-sm cursor-not-allowed text-right"
              />
            </div>

            {/* Previous Due*/}
            {selectedCustomer && selectedCustomer.balance < 0 && (
              <div className="flex justify-between">
                <label className="text-red-500 font-medium">
                  {formTrans("previousDue")}:
                </label>
                <input
                  type="number"
                  value={Math.abs(selectedCustomer.balance.toFixed(2))}
                  disabled
                  className="global_input w-40 rounded-sm cursor-not-allowed text-right text-red-500 font-medium"
                />
              </div>
            )}
            {/* If Customer balance exist */}
            {selectedCustomer && selectedCustomer.balance > 0 && (
              <div className="flex justify-between">
                <label className="text-green-500 font-medium">
                  {formTrans("advancePaid")}:
                </label>
                <input
                  type="number"
                  value={selectedCustomer.balance.toFixed(2)}
                  disabled
                  className="global_input w-40 rounded-sm cursor-not-allowed text-right text-green-500 font-medium"
                />
              </div>
            )}

            {/* Paid Amount With Multiple Bank Account*/}
            <h4>{formTrans("paymentBy")}</h4>
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
                      placeholder="Recieve Amount"
                      className={` w-40 rounded-sm outline-0 p-1.5 text-right ${account.amount > 0
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
                  styles={getReactSelectStyles()}
                // isClearable
                />
              </div>
            )}
            {/* Invoice Due Amount*/}
            {invoiceDue > 0 && (
              <div className="flex justify-between">
                <label className="text-red-500">
                  {formTrans("invoiceDue")}:
                </label>
                <input
                  type="number"
                  value={invoiceDue.toFixed(2)}
                  disabled
                  className="global_input w-40 text-red-500 rounded-sm cursor-not-allowed text-right"
                />
              </div>
            )}

            {selectedCustomer && dueAmount < 0 && (
              <div className="flex justify-between">
                <label className="text-green-500 font-medium">
                  {formTrans("currentBalance")}:
                </label>
                <input
                  type="number"
                  value={-dueAmount.toFixed(2)}
                  disabled
                  className="global_input w-40 rounded-sm cursor-not-allowed text-right text-green-500 font-medium"
                />
              </div>
            )}

            {/* Current Due Amount*/}
            {dueAmount > 0 && (
              <div className="flex justify-between">
                <label className="text-red-500">
                  {formTrans("currentDue")}:
                </label>
                <input
                  type="number"
                  value={dueAmount.toFixed(2)}
                  disabled
                  className="global_input w-40 text-red-500 rounded-sm cursor-not-allowed text-right"
                />
              </div>
            )}

            {/* Return */}
            {!selectedCustomer && dueAmount < 0 && (
              <div className="flex justify-between">
                <label className="text-red-600 font-bold">
                  {table("return")} :
                </label>
                <input
                  type="number"
                  value={Math.abs(dueAmount).toFixed(2)}
                  disabled
                  className="global_input text-red-600 w-40 font-bold rounded-sm cursor-not-allowed text-right"
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
            { }
            {btn("create")}
          </button>
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
  );
};

export default SaleWithVat;