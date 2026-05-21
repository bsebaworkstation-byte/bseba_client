import React, { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import openCloseStore from "../../Zustand/OpenCloseStore";
import {
  AiOutlineAppstore,
  AiOutlineShoppingCart,
  AiOutlineUser,
} from "react-icons/ai";
import { MdPointOfSale } from "react-icons/md";
import { GiExpense } from "react-icons/gi";
import { FaRegEdit } from "react-icons/fa";
import { FaUnity, FaListUl } from "react-icons/fa6";
import { SiBrandfolder } from "react-icons/si";
import { TbTransferIn } from "react-icons/tb";
import { RiFileDamageLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import { getBusinessDetails } from "../../Helper/SessionHelper";
import useLanguageStore from "../../Zustand/languageStore";
import { useTranslate } from "../../Helper/useTranslate";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";

const AddNewNavbar = () => {
  const t = useTranslate();
  const { lang } = useLanguageStore();
  const { modalOpen, modalType, closeModal } = openCloseStore();
  const business = getBusinessDetails();
    const btn = useTextTranslate(GlobalBtnTranslator)

  const items = useMemo(
    () => [
      {
        name: t("addProduct"),
        icon: <AiOutlineShoppingCart />,
        path: "/NewProduct",
      },
       {
        name: t("productList"),
        icon: <FaListUl />,
        path: "/ProductList",
      },
      {
        name: t("createPurchase"),
        icon: <AiOutlineShoppingCart />,
        path: "/CreatePurchase",
      },
      {
        name: t("newSale"),
        icon: <MdPointOfSale />,
        path: "/NewSale",
      },
      ...(business.warranty === "0"
        ? [
            {
              name: t("posSale"),
              icon: <MdPointOfSale />,
              path: "/PosSale",
            },
          ]
        : []),
      {
        name: t("expense"),
        icon: <GiExpense />,
        path: "/Expense",
      },
      {
        name: t("quotation"),
        icon: <FaRegEdit />,
        path: "/quotation",
      },
      {
        name: t("customer"),
        icon: <AiOutlineUser />,
        path: "/Customer",
      },
      {
        name: t("supplier"),
        icon: <AiOutlineUser />,
        path: "/supplier",
      },
      {
        name: t("unit"),
        icon: <FaUnity />,
        path: "/Unit",
      },
      {
        name: t("brand"),
        icon: <SiBrandfolder />,
        path: "/Brand",
      },
      {
        name: t("addCategory"),
        icon: <AiOutlineAppstore />,
        path: "/category",
      },
      {
        name: t("transfer"),
        icon: <TbTransferIn />,
        path: "/Transfer",
      },
      {
        name: t("addDamage"),
        icon: <RiFileDamageLine />,
        path: "/AddDamage",
      },
    ],
    [business.warranty, lang]
  );

  useEffect(() => {
    document.body.style.overflow =
      modalOpen && modalType === "addNew" ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [modalOpen, modalType]);

  if (!modalOpen || modalType !== "addNew") return null;

  return createPortal(
    <div
      onClick={closeModal}
      className="fixed inset-0 z-50 bg-black/40 flex justify-center items-start pt-24 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-[#1E2939] dark:text-white rounded-xl shadow-2xl p-6 w-full max-w-2xl 
          transform transition-all duration-300
          ${
            modalOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-10 opacity-0"
          }
        `}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {/* {addNewText.text[lang]} */}
          </h2>
          <button
            onClick={closeModal}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
          >
           {btn("close")}
          </button>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              onClick={closeModal}
              className="flex flex-col items-center justify-center p-3 border border-gray-200 dark:border-gray-700 
                rounded-lg hover:bg-green-50 dark:hover:bg-[#243447] transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="text-2xl text-green-600 mb-1">{item.icon}</div>
              <span className="text-xs sm:text-sm font-medium text-center text-gray-700 dark:text-gray-300 truncate w-full">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddNewNavbar;


