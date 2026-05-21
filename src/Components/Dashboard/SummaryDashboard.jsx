import React from "react";
import {
  FaFileInvoiceDollar,
  FaShoppingCart,
  FaCashRegister,
  FaMoneyBillWave,
} from "react-icons/fa";

import { Link } from "react-router-dom";
import useLanguageStore from "../../Zustand/languageStore";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { TranslateDashBoard } from "../../TranslationText/TranslateDashboard";

export default function SummaryDashboard({ data, translate }) {
  const { lang } = useLanguageStore();
  const t = useTextTranslate(TranslateDashBoard);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5  gap-5">
      <Link to={"/SaleList"} className="group">
        <div
          className="
            flex items-center gap-4 shadow-sm
            p-4 rounded-xl
            bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-900/20 dark:to-blue-900/10
            border border-blue-100 dark:border-blue-800/30
            hover:shadow-lg hover:scale-[1.02]
            transition-all duration-300
            cursor-pointer
          "
        >
          <div
            className="
            flex items-center justify-center
            h-12 w-12 rounded-lg 
            bg-blue-100 dark:bg-blue-900/40
            text-blue-600 dark:text-blue-400
            group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60
            transition-colors duration-300
          "
          >
            <FaFileInvoiceDollar className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {translate.saleInvoice[lang]} ( {data?.sales?.salesCount || 0} )
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {data?.sales?.totalSales || 0}
            </p>
          </div>
        </div>
      </Link>

      <Link to={"/PurchaseList"} className="group">
        <div
          className="
          flex items-center gap-4 shadow-sm
          p-4 rounded-xl
          bg-gradient-to-r from-green-50 to-green-50/50 dark:from-green-900/20 dark:to-green-900/10
          border border-green-100 dark:border-green-800/30
          hover:shadow-lg hover:scale-[1.02]
          transition-all duration-300
          cursor-pointer
        "
        >
          <div
            className="
            flex items-center justify-center
            h-12 w-12 rounded-lg
            bg-green-100 dark:bg-green-900/40
            text-green-600 dark:text-green-400
            group-hover:bg-green-200 dark:group-hover:bg-green-800/60
            transition-colors duration-300
          "
          >
            <FaShoppingCart className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {translate?.purchaseInvoice[lang]} ( {data?.purchases?.purchasesCount || 0} )
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {data?.purchases?.totalPurchases || 0}
            </p>
          </div>
        </div>
      </Link>

      <Link to={"/AccountPaymentReport"} className="group">
        <div
          className="
            flex items-center gap-4 shadow-sm
            p-4 rounded-xl
            bg-gradient-to-r from-purple-50 to-purple-50/50 dark:from-purple-900/20 dark:to-purple-900/10
            border border-purple-100 dark:border-purple-800/30
            hover:shadow-lg hover:scale-[1.02]
            transition-all duration-300
            cursor-pointer
          "
        >
          <div
            className="
              flex items-center justify-center
              h-12 w-12 rounded-lg
              bg-purple-100 dark:bg-purple-900/40
              text-purple-600 dark:text-purple-400
              group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60
              transition-colors duration-300
            "
          >
            <FaCashRegister className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300"> {t("cash")}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {(data?.transactions?.totalCredit || 0) -
                (data?.transactions?.totalDebit || 0)}
            </p>
          </div>
        </div>
      </Link>

      <Link to={"/Expense"} className="group">
        <div
          className="
      flex items-center gap-4 shadow-sm
      p-4 rounded-xl
      bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-900/20 dark:to-red-900/10
      border border-red-100 dark:border-red-800/30
      hover:shadow-lg hover:scale-[1.02]
      transition-all duration-300
      cursor-pointer
    "
        >
          <div
            className="
        flex items-center justify-center
        h-12 w-12 rounded-lg
        bg-red-100 dark:bg-red-900/40
        text-red-600 dark:text-red-400
        group-hover:bg-red-200 dark:group-hover:bg-red-800/60
        transition-colors duration-300
      "
          >
            <FaMoneyBillWave className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t("expense")}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {data?.expenses?.totalExpenses || 0}
            </p>
          </div>
        </div>
      </Link>
      <Link to={"/ServiceReport"} className="group"><div
        className="
              flex items-center gap-4 shadow-sm
              p-4 rounded-xl
              bg-gradient-to-r from-yellow-50 to-yellow-50/50 dark:from-yellow-900/20 dark:to-yellow-900/10
              border border-yellow-100 dark:border-yellow-800/30
              hover:shadow-lg hover:scale-[1.02]
              transition-all duration-300
              cursor-pointer"
      >
        <div
          className="
              flex items-center justify-center
              h-12 w-12 rounded-lg
              bg-yellow-100 dark:bg-yellow-900/40
              text-yellow-600 dark:text-yellow-400
              group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800/60
              transition-colors duration-300
            "
        >
          <FaMoneyBillWave className="text-xl" />
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300">{t("Service Paid")}</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {data?.servicePayment?.ServicePaid || 0}
          </p>
        </div>
      </div>
      </Link>
    </div>
  );
}

