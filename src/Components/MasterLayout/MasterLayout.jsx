import { useState, useEffect, useRef, useMemo } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  MdReportGmailerrorred,
  MdOutlineAddShoppingCart,
  MdAutoGraph,
  MdMergeType,
  MdCreateNewFolder,
  MdEditDocument,
  MdOutlineEditCalendar,
  MdOutlineAccessibilityNew,
  MdCrisisAlert,
  MdProductionQuantityLimits,
  MdOutlineElectricalServices,
  MdPayments,
  MdAssessment,
} from "react-icons/md";
import {
  FaChevronDown,
  FaChevronRight,
  FaList,
  FaSortAmountUp,
  FaRegEdit,
  FaUsers,
  FaUnity,
} from "react-icons/fa";
import {
  CiBank,
  CiViewList,
  CiMoneyCheck1,
  CiSettings,
  CiBarcode,
} from "react-icons/ci";
import { IoListCircleOutline, IoCreateOutline } from "react-icons/io5";
import { FaMoneyBillTransfer, FaMoneyBillTrendUp } from "react-icons/fa6";
import { IoMdAddCircleOutline } from "react-icons/io";
import { LuLayoutDashboard } from "react-icons/lu";
import {
  RiRedPacketLine,
  RiContactsBook3Line,
  RiTeamLine,
} from "react-icons/ri";
import { FcSalesPerformance } from "react-icons/fc";
import { GrContactInfo, GrCertificate, GrServices } from "react-icons/gr";
import {
  GiBuyCard,
  GiTakeMyMoney,
  GiStockpiles,
  GiMoneyStack,
} from "react-icons/gi";
import {
  TbBusinessplan,
  TbTransactionBitcoin,
  TbPackageImport,
} from "react-icons/tb";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import { AiOutlineProduct, AiOutlineStock } from "react-icons/ai";
import { LiaSortAmountUpSolid } from "react-icons/lia";
import { PiBankBold, PiListStarFill } from "react-icons/pi";
import { BsSun, BsMoon } from "react-icons/bs";
import { BiCategoryAlt } from "react-icons/bi";
import { SiExpensify, SiBrandfolder } from "react-icons/si";
import { PiPlantDuotone } from "react-icons/pi";
import {
  getAdmin,
  getBusinessDetails,
  getName,
  getPermissionDetails,
  getUserDetails,
  removeSessions,
  setBusinessDetails,
} from "../../Helper/SessionHelper";
import openCloseStore from "../../Zustand/OpenCloseStore";
import AddNewNavbar from "../Modals/AddNewNavbar";
import SubscriptionCountdown from "../../Helper/UI/SubscriptionCountdown";
import LanguageSelector from "../../Helper/LanguageSelector";
import { useTranslate } from "../../Helper/useTranslate";
import useLanguageStore from "../../Zustand/languageStore";
import {
  supportNumber,
  // supportNumber,
} from "../../TranslationText/TranslateMasterLayout";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";

const MasterLayout = ({ children }) => {
  const location = useLocation();
  const tooltipRef = useRef(null);
  const isAdmin = getAdmin() == 1;
  const businessDetails = getBusinessDetails();
  const permissions = getPermissionDetails();
  const [activeParent, setActiveParent] = useState(null);
  const [activeChild, setActiveChild] = useState(null);
  const { openSidePanel, setOpenSidePanel, openModal, setBusinessSetupModal } =
    openCloseStore();
  const [expandedItems, setExpandedItems] = useState({});
  const [showProfileToolTip, setShowProfileToolTip] = useState(false);
  const [darkMode, setDarkMode] = useState(() =>
    JSON.parse(sessionStorage.getItem("darkMode") || "false"),
  );
  const t = useTranslate();
  const { lang } = useLanguageStore();

  const btn = useTextTranslate(GlobalBtnTranslator);

  // const fetchBusinessDetailsByBusinessID = async (id) => {
  //   setGlobalLoader(true);
  //   try {
  //     const res = await api.get(`/getBusinessDetails/${id}`);
  //     if (res.data.status === "Success") {
  //       setToken(res.data.token);
  //       setPermissionDetails(res.data.data.permissions);
  //       setBusinessDetails(res.data.data.businessDetails);
  //       window.location.href = "/Dashboard";
  //     } else {
  //       ErrorToast(res.data.error);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     ErrorToast(error.message);
  //   } finally {
  //     setGlobalLoader(false);
  //   }
  // };

  const userPermissions = useMemo(() => {
    return new Set(permissions?.map((p) => p.name));
  }, [permissions]);

  const can = (perm) => isAdmin || userPermissions.has(perm);

  // Navigation data memoized
  const navigationData = useMemo(
    () => [
      {
        id: "dashboard",
        title: t("dashboard"),
        icon: <LuLayoutDashboard />,
        path: "/Dashboard",
      },
      // Contact
      ...(can("CustomersList") || can("SuppliersList") || can("CreateContact")
        ? [
            {
              id: "contact",
              title: t("contact"),
              icon: <RiContactsBook3Line />,
              children: [
                ...(can("CustomersList") || can("CreateContact")
                  ? [
                      {
                        id: "customer",
                        title: t("customer"),
                        path: "/Customer",
                        icon: <GrContactInfo />,
                      },
                    ]
                  : []),
                ...(can("SuppliersList") || can("CreateContact")
                  ? [
                      {
                        id: "supplier",
                        title: t("supplier"),
                        icon: <TbPackageImport />,
                        path: "/Supplier",
                      },
                    ]
                  : []),
              ],
            },
          ]
        : []),

      // Product
      ...(can("CreateProduct") ||
      can("CreateUnit") ||
      can("CreateBrand") ||
      can("CreateCategory")
        ? [
            {
              id: "product",
              title: t("product"),
              icon: <AiOutlineProduct />,
              children: [
                ...(can("CreateProduct")
                  ? [
                      {
                        id: "New product",
                        title: t("newProduct"),
                        path: "/NewProduct",
                        icon: <RiRedPacketLine />,
                      },
                    ]
                  : []),
                {
                  id: "product list",
                  title: t("productList"),
                  path: "/ProductList",
                  icon: <CiViewList />,
                },
                ...(can("CreateBrand")
                  ? [
                      {
                        id: "brand",
                        title: t("brand"),
                        icon: <SiBrandfolder />,
                        path: "/Brand",
                      },
                    ]
                  : []),
                ...(can("CreateCategory") || can("UpdateCategory")
                  ? [
                      {
                        id: "category",
                        title: t("category"),
                        icon: <BiCategoryAlt />,
                        path: "/Category",
                      },
                    ]
                  : []),
                ...(can("CreateUnit") || can("UpdateUnit")
                  ? [
                      {
                        id: "unit",
                        title: t("unit"),
                        icon: <FaUnity />,
                        path: "/Unit",
                      },
                    ]
                  : []),
              ],
            },
          ]
        : []),
      // Purchase
      ...(can("CreatePurchases") || can("ViewPurchases")
        ? [
            {
              id: "purchase",
              title: t("purchase"),
              icon: <GiBuyCard />,
              children: [
                ...(can("CreatePurchases")
                  ? [
                      {
                        id: "createpurchase",
                        title: t("createPurchase"),
                        icon: <IoCreateOutline />,
                        path: "/CreatePurchase",
                      },
                    ]
                  : []),
                ...(can("ViewPurchases")
                  ? [
                      {
                        id: "purchaselist",
                        title: t("purchaseList"),
                        icon: <FaList />,
                        path: "/PurchaseList",
                      },
                    ]
                  : []),
                ...(can("ViewPurchaseReturn")
                  ? [
                      {
                        id: "purchasereturnlist",
                        title: t("purchaseReturnList"),
                        icon: <FaList />,
                        path: "/PurchaseReturnList",
                      },
                    ]
                  : []),
              ],
            },
          ]
        : []),
      //Sale
      ...(can("CreateSales") || can("ViewSales") || can("ViewReturn")
        ? [
            {
              id: "sale",
              title: t("sale"),
              icon: <FcSalesPerformance />,
              children: [
                ...(can("CreateSales")
                  ? [
                      {
                        id: "createsale",
                        title: t("createSale"),
                        icon: <MdCreateNewFolder />,
                        path: "/NewSale",
                      },

                      {
                        id: "SaleWithVat",
                        title: (
                          <div className="flex items-center gap-2">
                            {t("Sale With Vat")}
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                              NEW
                            </span>
                          </div>
                        ),
                        icon: <CiMoneyCheck1 />,
                        path: "/SaleWithVat",
                      },
                      ...(businessDetails.warranty !== "1"
                        ? [
                            {
                              id: "possale",
                              title: t("posSale"),
                              icon: <MdCreateNewFolder />,
                              path: "/PosSale",
                            },
                          ]
                        : []),
                    ]
                  : []),

                ...(can("ViewSales")
                  ? [
                      {
                        id: "salelist",
                        title: t("saleList"),
                        icon: <PiListStarFill />,
                        path: "/SaleList",
                      },
                    ]
                  : []),
                ...(can("ViewReturn")
                  ? [
                      {
                        id: "salereturnlist",
                        title: t("saleReturnList"),
                        icon: <IoListCircleOutline />,
                        path: "/SaleReturnList",
                      },
                    ]
                  : []),
              ],
            },
          ]
        : []),
      //Warranty & quotation
      ...(businessDetails.warranty === "1"
        ? [
            {
              id: "warranty",
              title: t("warranty"),
              icon: <GrCertificate />,
              children: [
                {
                  id: "seriallist",
                  title: t("serialList"),
                  icon: <MdCreateNewFolder />,
                  path: "/SerialList",
                },

                {
                  id: "rma",
                  title: t("RMA"),
                  icon: <MdCreateNewFolder />,
                  path: "/RMA",
                },
              ],
            },

            ...(can("AddService") || can("ServiceList")
              ? [
                  {
                    id: "service",
                    title: (
                      <div className="flex items-center gap-2">
                        {t("Service")}
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                          NEW
                        </span>
                      </div>
                    ),
                    icon: <GrServices />,
                    children: [
                      ...(can("AddService")
                        ? [
                            {
                              id: "createService",
                              title: t("Create Service"),
                              path: "/CreateService",
                              icon: <MdOutlineElectricalServices />,
                            },
                          ]
                        : []),
                      ...(can("ServiceList")
                        ? [
                            {
                              id: "serviceList",
                              title: t("ServiceList"),
                              path: "/ServiceList",
                              icon: <MdOutlineEditCalendar />,
                            },
                            {
                              id: "serviceReport",
                              title: t("Service report"),
                              path: "/ServiceReport",
                              icon: <MdAssessment />,
                            },
                          ]
                        : []),
                    ],
                  },
                ]
              : []),
            {
              id: "quotation",
              title: t("quotation"),
              icon: <MdEditDocument />,
              children: [
                {
                  id: "createquotation",
                  title: t("createQuotation"),
                  path: "/CreateQuotation",
                  icon: <FaRegEdit />,
                },

                {
                  id: "quotationlist",
                  title: t("quotationList"),
                  path: "/QuotationList",
                  icon: <MdOutlineEditCalendar />,
                },
              ],
            },
          ]
        : []),

      // Sale Order
      ...(businessDetails.saleOrder === 1
        ? [
            {
              id: "saleOrder",
              title: "Sale Order",
              icon: <FcSalesPerformance />,
              children: [
                {
                  id: "createSaleOrder",
                  title: "Create Order",
                  icon: <MdCreateNewFolder />,
                  path: "/createSaleOrder",
                },
                {
                  id: "creatSaleOrderList",
                  title: "Order List",
                  icon: <CiViewList />,
                  path: "/saleOrderList",
                },
              ],
            },
          ]
        : []),
      // Expense
      ...(can("CreateExpense") ||
      can("CreateExpenseTypes") ||
      can("ExpenseReport")
        ? [
            {
              id: "expense",
              title: t("expense"),
              icon: <FaSortAmountUp />,
              children: [
                ...(can("CreateExpense")
                  ? [
                      {
                        id: "expense",
                        title: t("expense"),
                        icon: <MdAutoGraph />,
                        path: "/Expense",
                      },
                    ]
                  : []),
                ...(can("CreateExpenseTypes")
                  ? [
                      {
                        id: "expensetype",
                        title: t("expenseType"),
                        icon: <SiExpensify />,
                        path: "/ExpenseType",
                      },
                    ]
                  : []),
                ,
                ...(can("ExpenseReport")
                  ? [
                      {
                        id: "ExpenseByType",
                        title: t("expenseByType"),
                        icon: <MdMergeType />,
                        path: "/ExpenseByType",
                      },
                    ]
                  : []),
              ],
            },
          ]
        : []),

      {
        id: "barcode",
        title: "Barcode",
        icon: <CiBarcode />,
        children: [
          {
            id: "barcode",
            title: "Multi Barcode",
            icon: <CiBarcode />,
            path: "/Barcode",
          },
          {
            id: "singleBarcode",
            title: "Single Barcode",
            icon: <CiBarcode />,
            path: "/Barcode2",
          },
        ],
      },

      ...(isAdmin
        ? [
            // Damage
            ...(businessDetails.damage === 1
              ? [
                  {
                    id: "Damage",
                    title: t("damage"),
                    icon: <FaSortAmountUp />,
                    children: [
                      {
                        id: "AddDamage",
                        title: t("addDamage"),
                        icon: <LiaSortAmountUpSolid />,
                        path: "/AddDamage",
                      },
                      {
                        id: "DamageList",
                        title: t("damageList"),
                        icon: <LiaSortAmountUpSolid />,
                        path: "/DamageList",
                      },
                    ],
                  },
                ]
              : []),
            // BankAccounts
            {
              id: "bankaccounts",
              title: t("bankAccounts"),
              icon: <CiBank />,
              children: [
                {
                  id: "bankaccountspage",
                  title: t("bankAccounts"),
                  icon: <PiBankBold />,
                  path: "/BankAccount",
                },
                {
                  id: "balanceTransfer",
                  title: t("balanceTransfer"),
                  icon: <FaMoneyBillTrendUp />,
                  path: "/BalanceTransfer",
                },
                {
                  id: "Cheque",
                  title: (
                    <div className="flex items-center gap-2">
                      {t("Cheque")}
                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                        NEW
                      </span>
                    </div>
                  ),
                  icon: <CiMoneyCheck1 />,
                  path: "/Cheque",
                },
                {
                  id: "Transactions",
                  title: t("Transactions"),
                  icon: <FaMoneyBillTransfer />,
                  path: "/Transactions",
                },
              ],
            },
            {
              id: "investment",
              title: (
                <div className="flex items-center gap-2">
                  {t("investment")}
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                    NEW
                  </span>
                </div>
              ),
              icon: <FaMoneyBillTrendUp />,
              children: [
                {
                  id: "investorList",
                  title: t("investorList"),
                  icon: <GiTakeMyMoney />,
                  path: "/InvestorList",
                },
              ],
            },

            // Team
            {
              id: "hr",
              title: t("hr"),
              icon: <RiTeamLine />,
              children: [
                {
                  id: "AddTeamMember",
                  title: t("team"),
                  icon: <MdOutlineAccessibilityNew />,
                  path: "/NewMember",
                },
                {
                  id: "Srlist",
                  title: t("srList"),
                  icon: <MdOutlineAccessibilityNew />,
                  path: "/srList",
                },

                {
                  id: "role",
                  title: t("role"),
                  icon: <PiPlantDuotone />,
                  path: "/Role",
                },
              ],
            },
            // Report
            {
              id: "report",
              title: t("report"),
              icon: <MdReportGmailerrorred />,
              children: [
                {
                  id: "BusinessReport",
                  title: t("businessReport"),
                  icon: <TbBusinessplan />,
                  path: "/BusinessReport",
                },
                {
                  id: "SaleReport",
                  title: t("saleReport"),
                  icon: <MdOutlineAddShoppingCart />,
                  path: "/SalsReport",
                },
                {
                  id: "TopCoustomer",
                  title: t("topCustomer"),
                  icon: <FaUsers />,
                  path: "/TopCoustomer",
                },
                {
                  id: "customerreport",
                  title: t("Customer Report"),
                  icon: <GiStockpiles />,
                  path: "/CustomerReport",
                },
                {
                  id: "ReceivableReport",
                  title: t("receivableReport"),
                  icon: <GiTakeMyMoney />,
                  path: "/ReceivableReport",
                },
                {
                  id: "PayableReport",
                  title: t("payableReport"),
                  icon: <GiMoneyStack />,
                  path: "/PayableReport",
                },
                // {
                //   id: "LowProductList",
                //   title: t("lowStock"),
                //   icon: <AiOutlineStock />,
                //   path: "/LowProductList",
                // },
                {
                  id: "LowStockProductList",
                  title: t("lowStockProductList"),
                  icon: <AiOutlineStock />,
                  path: "/LowStockProductList",
                },
                {
                  id: "AlertProductList",
                  title: t("alertProductList"),
                  icon: <MdCrisisAlert />,
                  path: "/AlertProductList",
                },
                {
                  id: "SaleProductReport",
                  title: t("saleProductReport"),
                  icon: <MdProductionQuantityLimits />,
                  path: "/SaleProductReport",
                },
                {
                  id: "AccountPaymentReport",
                  title: t("accountPaymentReport"),
                  icon: <MdPayments />,
                  path: "/AccountPaymentReport",
                },
                {
                  id: "ExpenseReport",
                  title: t("expenseReport"),
                  icon: <AiOutlineStock />,
                  path: "/ExpenseReport",
                },
                {
                  id: "transactionreport",
                  title: t("transactionReport"),
                  icon: <TbTransactionBitcoin />,
                  path: "/TransactionReport",
                },
                {
                  id: "dalyreport",
                  title: t("dailyReport"),
                  icon: <AiOutlineStock />,
                  path: "/DalyReport",
                },
                {
                  id: "stockreport",
                  title: t("stockReport"),
                  icon: <GiStockpiles />,
                  path: "/StockReport",
                },
                {
                  id: "stocklist",
                  title: t("StockList"),
                  icon: <GiStockpiles />,
                  path: "/StockList",
                },
              ],
            },

            {
              id: "businesssetup",
              title: t("businessSetting"),
              icon: <CiSettings />,
              path: "/BusinessSetting",
            },
          ]
        : []),
    ],
    [isAdmin, businessDetails?.warranty, lang],
  );

  // Auto-expand parent items when child is active
  useEffect(() => {
    const newExpanded = {};
    navigationData.forEach((item) => {
      if (item.children?.some((child) => child.path === location.pathname)) {
        newExpanded[item.id] = true;
      }
    });
    setExpandedItems((prev) => ({ ...prev, ...newExpanded }));
  }, [location.pathname, navigationData]);

  // Dark mode effect
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    sessionStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Responsive sidebar + business setup check
  useEffect(() => {
    if (!businessDetails.districtID) setBusinessSetupModal(true);

    const handleResize = () => {
      if (location.pathname !== "/NewSale") {
        setOpenSidePanel(window.innerWidth > 1024);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [
    location.pathname,
    businessDetails.districtID,
    setBusinessSetupModal,
    setOpenSidePanel,
  ]);

  // Click outside profile tooltip
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setShowProfileToolTip(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasActiveChild = (item) =>
    item.children?.some((child) => child.path === location.pathname);

  const handleNavClick = () => {
    if (window.innerWidth <= 1024) {
      setTimeout(() => setOpenSidePanel(false), 50);
    }
  };

  const renderNavItem = (data) => (
    <div key={data.id} className="">
      {data.path && !data.children ? (
        <NavLink
          to={data.path}
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-3xl hover:bg-green-400 dark:hover:bg-green-600 hover:text-white cursor-pointer transition-colors ${
              isActive
                ? "bg-green-500 dark:bg-green-600 text-white"
                : "text-gray-700 dark:text-gray-300"
            }`
          }
        >
          <span className="text-lg">{data.icon}</span>
          <span className="whitespace-nowrap">{data.title}</span>
        </NavLink>
      ) : (
        <>
          <div
            onClick={() =>
              data.children &&
              setExpandedItems((prev) => ({
                ...prev,
                [data.id]: !prev[data.id],
              }))
            }
            className={` flex items-center justify-between p-3 rounded-3xl hover:bg-green-400 dark:hover:bg-green-600 hover:text-white cursor-pointer transition-colors ${
              hasActiveChild(data)
                ? "bg-green-500 dark:bg-green-600 text-white"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            <div className="flex gap-3 items-center">
              <span className="text-lg">{data.icon}</span>
              <span className="whitespace-nowrap">{data.title}</span>
            </div>
            {data.children && (
              <span className="text-xs">
                {expandedItems[data.id] ? (
                  <FaChevronDown />
                ) : (
                  <FaChevronRight />
                )}
              </span>
            )}
          </div>
          {data.children && (
            <div
              className={`overflow-hidden transition-all ${
                expandedItems[data.id] ? "max-h-96" : "max-h-0"
              }`}
            >
              <div className="pl-5 py-1 space-y-0 overflow-y-auto max-h-[40vh] pb-4">
                {data.children.map((child) => (
                  <NavLink
                    key={child.id}
                    to={child.path}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `p-2 flex items-center gap-2 rounded-3xl hover:bg-green-400 dark:hover:bg-green-600 hover:text-white text-sm transition-colors ${
                        isActive
                          ? "bg-green-500 dark:bg-green-600 text-white font-medium"
                          : "text-gray-600 dark:text-gray-400"
                      }`
                    }
                  >
                    {child.icon} {child.title}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="flex w-full h-screen dark:bg-gray-900 transition-colors">
      {/* Sidebar */}
      <aside
        className={`overflow-y-auto flex flex-col gap-1 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen transition-all duration-300 ${
          openSidePanel ? "w-64 p-2" : "lg:w-16 w-0"
        }`}
        id="no-print"
      >
        <div className="flex flex-col gap-1">
          <div className="p-2 flex justify-between items-center">
            {openSidePanel && (
              <h1 className="text-gray-800 w-full dark:text-gray-200 font-semibold truncate flex items-center justify-center gap-1">
                {businessDetails?.logo ? (
                  <img
                    className="rounded-full w-10 h-10 object-contain"
                    src={businessDetails.logo}
                    alt=""
                  />
                ) : null}
                {businessDetails.businessName}
              </h1>
            )}
            <button
              onClick={() => setOpenSidePanel(!openSidePanel)}
              className="hidden lg:block text-green-600 dark:text-green-300 hover:bg-green-600 dark:hover:bg-green-700 hover:text-white rounded p-1 transition-colors"
            >
              {openSidePanel ? <GoSidebarExpand /> : <GoSidebarCollapse />}
            </button>
          </div>
          {/* <div className="flex items-center justify-between">
            <SubscriptionCountdown />
       
          </div> */}
        </div>

        {openSidePanel ? (
          <div className="  rounded-3xl">
            {navigationData.map(renderNavItem)}
          </div>
        ) : (
          <div className="hidden lg:flex flex-col items-center gap-2 py-2">
            {navigationData.map((data, index) => (
              <div
                onClick={() => {
                  setOpenSidePanel(true);
                  setActiveParent(index);
                }}
                key={data.id}
                className="relative group"
              >
                <NavLink
                  to={data.path ?? ""}
                  onClick={() => handleNavClick(data.path)}
                  className={`flex items-center justify-center w-10 h-10 rounded hover:bg-green-400 dark:hover:bg-green-600 hover:text-white cursor-pointer transition-colors ${
                    hasActiveChild(data) || location.pathname === data.path
                      ? "bg-green-500 dark:bg-green-600 text-white"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="text-lg">{data.icon}</span>
                </NavLink>
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {data.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar */}
        <nav
          id="no-print"
          className="w-full border-b border-gray-200 dark:border-gray-700 h-14 flex items-center justify-between px-4 bg-white dark:bg-gray-800 transition-colors"
        >
          <button
            onClick={() => setOpenSidePanel(!openSidePanel)}
            className="lg:hidden text-green-600 dark:text-green-300 hover:bg-green-600 dark:hover:bg-green-700 hover:text-white rounded p-1 transition-colors"
          >
            {openSidePanel ? <GoSidebarExpand /> : <GoSidebarCollapse />}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors flex items-center gap-2"
            >
              {darkMode ? (
                <BsSun className="text-lg" />
              ) : (
                <BsMoon className="text-lg" />
              )}
              <span className="text-sm font-medium">
                {darkMode ? `${btn("dark")}` : `${btn("light")}`}
              </span>
            </button>
            <LanguageSelector />
            <span className="text-nowrap text-green-600 font-semibold hidden sm:flex">
              {supportNumber.text[lang]} 096 3838 0101
            </span>
          </div>

          <div className="flex items-center gap-5">
            <Link to={"/NewSale"} className="global_button hidden sm:flex">
              {btn("sale")}
            </Link>
            {businessDetails?.warranty === "0" && (
              <Link to={"/PosSale"} className="global_button hidden sm:flex">
                {btn("Pos Sale")}
              </Link>
            )}
            <button
              onClick={() => openModal("addNew")}
              className="global_button hidden sm:flex items-center gap-1"
            >
              <IoMdAddCircleOutline /> {btn("addNew")}
            </button>

            {/* profile pic */}
            <div className="relative z-[9000]" ref={tooltipRef}>
              <button
                onClick={() => setShowProfileToolTip(!showProfileToolTip)}
                className="relative w-9 h-9 rounded-full border border-gray-200 overflow-hidden"
              >
                {/* background layer */}
                <img
                  src={getUserDetails()?.photo}
                  className="absolute inset-0 w-full h-full object-cover blur-md scale-110"
                  alt=""
                />

                {/* main image (no crop) */}
                <img
                  src={getUserDetails()?.photo}
                  className="relative w-full h-full object-contain rounded-full"
                  alt="profile"
                />
              </button>

              <div
                className={`fixed top-15 right-5 ${
                  showProfileToolTip
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 pointer-events-none"
                } bg-white dark:bg-gray-700 text-black dark:text-white rounded-xl shadow-lg px-4 py-3 z-30 transition-all`}
              >
                <div className="w-[250px] flex flex-col gap-2 items-center text-sm">
                  <div className="flex flex-col items-center w-full">
                    <div className="w-12 h-12 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-semibold text-lg">
                      {getUserDetails()?.photo ? (
                        <img
                          className="rounded-full object-contain"
                          src={getUserDetails().photo}
                          alt=""
                        />
                      ) : (
                        <span>{getName()[0]}</span>
                      )}
                    </div>
                    <h1 className="font-semibold mt-2 text-gray-800 dark:text-white text-xl">
                      {getName()}
                    </h1>
                  </div>
                  <Link
                    to="/"
                    className="w-full text-center py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    to="/Profile"
                    className="w-full text-center py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={removeSessions}
                    className="w-full text-center py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-auto lg:p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
          {children}
        </div>
      </div>
      <AddNewNavbar />
    </div>
  );
};

export default MasterLayout;
