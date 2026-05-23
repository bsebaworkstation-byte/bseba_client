import { Fragment, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { getToken } from "./Helper/SessionHelper";
import Login from "./Components/Login/Login";
import DashboardPage from "./Pages/Dashboard/DashboardPage";
import BusinessSettingPage from "./Pages/BusinessSetting/BusinessSettingPage";
import ProductListPage from "./Pages/Product/ProductListPage";
import CreateCategoryPage from "./Pages/Product/CategoryPage";
import AccountPage from "./Pages/Accounts/AccountPage";
import AccountReportPage from "./Pages/Accounts/AccountReportPage";
import SupplierPage from "./Pages/Contact/SupplierPage";
import CoustomerSalesReportPage from "./Pages/Contact/CoustomerSalesReportPage";
import NewSalePage from "./Pages/Sale/NewSalePage";
import SaleListPage from "./Pages/Sale/SaleListPage";
import SaleReturnListPage from "./Pages/Sale/SaleReturnListPage";
import PurchaseListPage from "./Pages/Purchase/PurchaseListPage";
import CreatePurchasePage from "./Pages/Purchase/CreatePurchasePage";
import ExpensePage from "./Pages/Expense/ExpensePage";
import ExpenseTypePage from "./Pages/Expense/ExpenseTypePage";
import PurchaseDetailsPage from "./Pages/Purchase/PurchaseDetailsPage";
import SaleDetailsPage from "./Pages/Sale/SaleDetailsPage";
import VerifyMobile from "./Components/Login/VerifyMobile";
import SignUp from "./Components/Login/SignUp";
import CreateBusiness from "./Components/BusinessSetting/CreateBusiness";
import UserDashboardPage from "./Pages/Dashboard/UserDashboardPage";
import NewProductPage from "./Pages/Product/NewProductPage";
import UnitPage from "./Pages/Product/UnitPage";
import BrandPage from "./Pages/Product/BrandPage";
import EditProductPage from "./Pages/Product/EditProductPage";
import EditContactPage from "./Pages/Contact/EditContactPage";
import CustomerPage from "./Pages/Contact/CustomerPage";
import PurchaseReturnPage from "./Pages/Purchase/PurchaseReturnPage";
import ExpenseByIDPage from "./Pages/Expense/ExpenseByIDPage";
import ExpenseDetailsPage from "./Pages/Expense/ExpenseDetailsPage";
import PurchaseReturnListPage from "./Pages/Purchase/PurchaseReturnListPage";
import AddDamagePage from "./Pages/Damage/AddDamagePage";
import SalsReportPage from "./Pages/Report/SalsReportPage";
import BusinessReportPage from "./Pages/Report/BusinessReportPage";
import TopCustomerPage from "./Pages/Report/TopCustomerPage";

import ReceivableReportPage from "./Pages/Report/ReceivableReportPage";
import TransactionPage from "./Pages/Transaction/TransactionPage";
import TransactionDetailsPage from "./Pages/Transaction/TransactionDetailsPage";
import PayableReportPage from "./Pages/Report/PayableReportPage";
import PosSalePage from "./Pages/Sale/PosSalePage";
import SaleReturnPage from "./Pages/Sale/SaleReturnPage";
import SaleReturnDetailsPage from "./Pages/Sale/SaleReturnDetailsPage";
import Print80Page from "./Pages/Sale/Print80Page";
import ChallanPage from "./Pages/Sale/ChallanPage";
import ChallanA5Page from "./Pages/Sale/ChallanA5Page";
import Print58Page from "./Pages/Sale/Print58Page";
import ExpenseReportPage from "./Pages/Report/ExpenseReportPage";
import TransactionReportPage from "./Pages/Report/TransactionReportPage";
import DalyReportPage from "./Pages/Report/DalyReportPage";
import StockReportPage from "./Pages/Report/StockReportPage";
import PurchaseReturnDetailsPage from "./Pages/Purchase/PurchaseReturnDetailsPage";
import CreateQuotationPage from "./Pages/Quotation/CreateQuotationPage";
import QuotationListPage from "./Pages/Quotation/QuotationListPage";
import QuotationDetailsPage from "./Pages/Quotation/QuotationDetailsPage";
import StockProductPage from "./Pages/Product/StockProductPage";
import DemoDashboardPage from "./Pages/Dashboard/DemoDashboardPage";
import Invoice2Page from "./Pages/Sale/Invoice2Page";
import Invoice1Page from "./Pages/Sale/Invoice1Page";
import Invoice3Page from "./Pages/Sale/Invoice3Page";
import Invoice4Page from "./Pages/Sale/Invoice4Page";
import Invoice5Page from "./Pages/Sale/Invoice5Page";
import Profile from "./Components/Profile/Profile";
import Payment from "./Components/Payment/Payment";
import CreateSaleOrderPage from "./Pages/SaleOrderPage/CreateSaleOrder";
import Invoice6Page from "./Pages/Sale/Invoice6Page";
import QuatationEditPage from "./Pages/Quotation/QuatationEditPage";
import SaleOrderListPage from "./Pages/SaleOrderPage/SaleOrderListPage";
import SaleOrderDetailsPage from "./Pages/SaleOrderPage/SaleOrderDetailsPage";
import SaleOrderEditPage from "./Pages/SaleOrderPage/SaleOrderEditPage";
import NewMemberPage from "./Pages/Team/NewMemberPage";
import AnalyzePage from "./Pages/Product/AnalyzePage";
import MemberReportPage from "./Pages/Team/MemberReportPage";
import HrListPage from "./Pages/Team/SrListPage";
import SrSaleReportPage from "./Pages/Team/SrSaleReportPage";
import RolePage from "./Pages/Team/RolePage";
import SerialListPage from "./Pages/Warranty/SerialListPage";
import BalanceTransferPage from "./Pages/Accounts/BalanceTransferPage";
import BalanceReportPage from "./Pages/Accounts/BalanceTransferReportPage";
import RecievedWarrantyPage from "./Pages/Warranty/RecievedWarrantyPage";
import BuySMSPage from "./Pages/Subscription/BuySMSPage";
import AlertProductListPage from "./Pages/Report/AlertProductListPage";
import LowStockProductListPage from "./Pages/Report/LowStockProductListPage";
import SaleProductReportPage from "./Pages/Report/SaleProductReportPage";
import AccountPaymentReportPage from "./Pages/Report/AccountPaymentReportPage";
import PaymentSuccessPage from "./Pages/Subscription/PaymentSuccess";
import RMAPage from "./Pages/Warranty/RMAPage";
import StockListPage from "./Pages/Report/StockListPage";
import PasswordReset from "./Components/Login/PasswordReset";
import BarcodePage from "./Pages/Barcode/BarcodePage";
import Barcode2Page from "./Pages/Barcode/Barcode2Page";
import OneBPage from "./Pages/Sale/OneBPage";
import ChallanBanglaPage from "./Pages/Sale/ChallanBanglaPage";
import Invoice8Page from "./Pages/Sale/Invoice8Page";
import Invoice9Page from "./Pages/Sale/Invoice9Page";
import Invoice11Page from "./Pages/Sale/Invoice11";
import Quotation2Page from "./Pages/Quotation/Quotation2Page";
import CustomerReportPage from "./Pages/Report/CustomerReportPage";
import AddChequePage from "./Pages/Cheque/AddChequePage";
import ChequePage from "./Pages/Cheque/ChequePage";
import TransactionsPage from "./Pages/Accounts/TransactionsPage";
import CreateServicePage from "./Pages/Service/CreateServicePage";
import ServiceListPage from "./Pages/Service/ServiceListPage";
import ServiceDetailsPage from "./Pages/Service/ServiceDetailsPage";
import EditServicePage from "./Pages/Service/EditServicePage";
import ServiceReportPage from "./Pages/Service/ServiceReportPage";
import ServiceListByStatusPage from "./Pages/Service/ServiceListByStatusPage";
import SaleWithVatPage from "./Pages/Sale/SaleWithVatPage";
import InvocieWithVatPage from "./Pages/Sale/InvocieWithVatPage";
import SalesReturnDetailsPageV2 from "./Pages/Sale/SalesReturnDetailsPageV2";
import EditSalePage from "./Pages/Sale/EditSalePage";
import InvestorListPage from "./Pages/Investment/InvestorListPage";
import InvestmentReportPage from "./Pages/Investment/InvestmentReportPage";

function App() {
  const isLoggedIn = getToken();

  useEffect(() => {
    const handleWheel = (e) => {
      if (document.activeElement.type === "number") {
        document.activeElement.blur();
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <Fragment>
      <BrowserRouter>
        {isLoggedIn ? (
          <Routes>
            <Route path="/" element={<UserDashboardPage />} />
            <Route path="/Dashboard" element={<DashboardPage />} />
            <Route path="/Dashboard1" element={<DemoDashboardPage />} />
            <Route path="/BusinessSetting" element={<BusinessSettingPage />} />

            <Route path="/CreateBusiness" element={<CreateBusiness />} />
            <Route path="/NewProduct" element={<NewProductPage />} />
            <Route path="/ProductList" element={<ProductListPage />} />
            <Route path="/EditProduct/:id" element={<EditProductPage />} />
            <Route path="/Analyze/:id" element={<AnalyzePage />} />
            <Route path="/Category" element={<CreateCategoryPage />} />
            <Route path="/Unit" element={<UnitPage />} />
            <Route path="/Brand" element={<BrandPage />} />

            <Route path="/StockProduct" element={<StockProductPage />} />
            {/* Quotation */}

            <Route path="/Cheque" element={<ChequePage />} />
            <Route path="/AddCheque" element={<AddChequePage />} />

            {/* Quotation */}
            <Route path="/CreateQuotation" element={<CreateQuotationPage />} />
            <Route path="/QuotationList" element={<QuotationListPage />} />
            <Route
              path="/QuotationDetails/:id/:type"
              element={<QuotationDetailsPage />}
            />
            <Route
              path="/QuotationDetails/3/:id"
              element={<Quotation2Page />}
            />
            <Route path="/EditQuotation/:id" element={<QuatationEditPage />} />

            {/* Service */}
            <Route path="/CreateService" element={<CreateServicePage />} />

            <Route path="/ServiceList" element={<ServiceListPage />} />
            <Route path="/ServiceReport" element={<ServiceReportPage />} />
            <Route
              path="/ServiceListByStatus/:status"
              element={<ServiceListByStatusPage />}
            />
            <Route
              path="/ServiceDetails/:id"
              element={<ServiceDetailsPage />}
            />
            <Route path="/EditService/:id" element={<EditServicePage />} />

            <Route path="/Customer" element={<CustomerPage />} />
            <Route path="/Supplier" element={<SupplierPage />} />
            <Route path="/EditContact/:id" element={<EditContactPage />} />
            <Route
              path="/CoustomerSalesReport/:id"
              element={<CoustomerSalesReportPage />}
            />

            <Route path="/Expense" element={<ExpensePage />} />
            <Route path="/ExpenseType" element={<ExpenseTypePage />} />
            <Route path="/ExpenseByType" element={<ExpenseByIDPage />} />
            <Route path="/AddDamage" element={<AddDamagePage />}></Route>

            {/* Report Routes  */}
            <Route path="/BusinessReport" element={<BusinessReportPage />} />
            <Route path="/SalsReport" element={<SalsReportPage />} />
            <Route path="/TopCoustomer" element={<TopCustomerPage />} />
            <Route path="/CustomerReport" element={<CustomerReportPage />} />
            <Route
              path="/ReceivableReport"
              element={<ReceivableReportPage />}
            />
            <Route path="Transaction/:id" element={<TransactionPage />} />
            <Route
              path="TransactionDetails/:id"
              element={<TransactionDetailsPage />}
            />
            <Route path="/PayableReport" element={<PayableReportPage />} />

            {/* <Route path="/LowProductList" element={<LowProductListPage />} /> */}
            <Route
              path="/AlertProductList"
              element={<AlertProductListPage />}
            />
            <Route
              path="/LowStockProductList"
              element={<LowStockProductListPage />}
            />
            <Route
              path="/SaleProductReport"
              element={<SaleProductReportPage />}
            />
            <Route
              path="/AccountPaymentReport"
              element={<AccountPaymentReportPage />}
            />
            <Route path="/ExpenseReport" element={<ExpenseReportPage />} />
            <Route
              path="/ExpenseDetails/:id"
              element={<ExpenseDetailsPage />}
            />

            <Route
              path="/TransactionReport"
              element={<TransactionReportPage />}
            />
            <Route path="/DalyReport" element={<DalyReportPage />} />
            <Route path="/StockReport" element={<StockReportPage />} />
            <Route path="/StockList" element={<StockListPage />} />
            <Route path="/CustomerReport" element={<CustomerReportPage />} />
            {/* Sale  */}
            <Route path="/NewSale" element={<NewSalePage />} />
            <Route path="/EditSale/:id" element={<EditSalePage />} />
            <Route path="/SaleWithVat" element={<SaleWithVatPage />} />
            <Route path="/SaleList" element={<SaleListPage />} />
            <Route path="/SaleDetails/:id" element={<SaleDetailsPage />} />
            <Route path="/SaleReturnList" element={<SaleReturnListPage />} />
            <Route path="SaleReturn/:id" element={<SaleReturnPage />} />
            <Route
              path="/SaleReturnDetails/:id"
              element={<SaleReturnDetailsPage />}
            />
            <Route
              path="/SaleReturnDetailsV2/:id"
              element={<SalesReturnDetailsPageV2 />}
            />
            <Route path="/SerialList" element={<SerialListPage />} />
            <Route path="/RMA" element={<RMAPage />} />
            <Route path="/Print/:id" element={<Print80Page />} />
            <Route path="/Challan/:id" element={<ChallanPage />} />
            <Route path="/ChallanA5/:id" element={<ChallanA5Page />} />
            <Route path="/Print58/:id" element={<Print58Page />} />

            {/* invoice */}
            <Route path="/Invoice/1/:id" element={<Invoice1Page />} />
            <Route path="/Invoice/2/:id" element={<Invoice2Page />} />
            <Route path="/Invoice/3/:id" element={<Invoice3Page />} />
            <Route path="/Invoice/4/:id" element={<Invoice4Page />} />
            <Route path="/Invoice/5/:id" element={<Invoice5Page />} />
            <Route path="/Invoice/6/:id" element={<Invoice6Page />} />
            <Route path="/Invoice/7/:id" element={<OneBPage />} />
            <Route path="/Invoice/8/:id" element={<Invoice8Page />} />
            <Route path="/Invoice/9/:id" element={<Invoice9Page />} />
            <Route path="/Invoice/10/:id" element={<InvocieWithVatPage />} />
            <Route path="/Invoice/11/:id" element={<Invoice11Page />} />
            <Route path="/ChallanBangla/:id" element={<ChallanBanglaPage />} />
            {/* warranty */}
            <Route
              path="/receivedWarranty/:id"
              element={<RecievedWarrantyPage />}
            />

            {/* team */}
            <Route path="/srList" element={<HrListPage />} />
            <Route path="/srSaleReport/:id" element={<SrSaleReportPage />} />

            {/* Sale Order route */}
            <Route path="/createSaleOrder" element={<CreateSaleOrderPage />} />
            <Route path="/saleOrderList" element={<SaleOrderListPage />} />
            <Route
              path="/saleOrderDetails/:id"
              element={<SaleOrderDetailsPage />}
            />
            <Route path="/saleOrderEdit/:id" element={<SaleOrderEditPage />} />

            {/* banck and account */}
            <Route path="/BankAccount" element={<AccountPage />} />
            <Route path="/Transactions" element={<TransactionsPage />} />
            <Route path="/InvestorList" element={<InvestorListPage />} />
            <Route
              path="/InvestmentReport/:id"
              element={<InvestmentReportPage />}
            />

            <Route path="/BalanceTransfer" element={<BalanceTransferPage />} />
            <Route
              path="/BalanceTransferReport/:id"
              element={<BalanceReportPage />}
            />
            <Route path="/AccountReport/:id" element={<AccountReportPage />} />

            {/* Purchases Routes */}
            <Route path="/PurchaseList" element={<PurchaseListPage />} />
            <Route
              path="/PurchaseDetails/:id"
              element={<PurchaseDetailsPage />}
            />
            <Route
              path="/PurchaseReturnList"
              element={<PurchaseReturnListPage />}
            />
            <Route path="/CreatePurchase" element={<CreatePurchasePage />} />
            <Route
              path="/PurchaseReturn/:id"
              element={<PurchaseReturnPage />}
            />
            <Route
              path="/PurchaseReturnDetails/:id"
              element={<PurchaseReturnDetailsPage />}
            />

            <Route path="/PosSale" element={<PosSalePage />} />

            <Route path="/Profile" element={<Profile />} />
            <Route path="/Payment" element={<Payment />} />
            <Route path="/BuySMS" element={<BuySMSPage />} />
            <Route path="/success" element={<PaymentSuccessPage />} />
            <Route path="/NewMember" element={<NewMemberPage />} />

            <Route path="/MemberReport/:id" element={<MemberReportPage />} />
            <Route path="/Role" element={<RolePage />} />
            <Route path="/Barcode" element={<BarcodePage />} />
            <Route path="/Barcode2" element={<Barcode2Page />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/VerifyMobile" element={<VerifyMobile />} />
            <Route path="/PasswordReset" element={<PasswordReset />} />
            <Route path="/SignUp" element={<SignUp />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </BrowserRouter>
    </Fragment>
  );
}

export default App;
