import { useEffect, useState } from "react";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { BsInfinity } from "react-icons/bs";
import { HiSortAscending } from "react-icons/hi";
import { PiSortAscendingBold } from "react-icons/pi";
import ToggleSwitch from "../../Helper/UI/ToggleSwitch";
import api from "../../Helper/axios_resonse_interceptor";
import { can } from "../../Helper/permissionChecker";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { setGlobalLoader } = loadingStore();
  const [showPurchase, setShowPurchase] = useState(0);
  const [sortOrderName, setSortOrderName] = useState(null);
  const [sortOrderStock, setSortOrderStock] = useState(null);
  const [sortOrderBrand, setSortOrderBrand] = useState(null);
  const [sortOrderCategory, setSortOrderCategory] = useState(null);
  const [sortOrderSalePrice, setSortOrderSalePrice] = useState(null);
  const [sortOrderPurchasePrice, setSortOrderPurchasePrice] = useState(null);

  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);
  const formTrans = useTextTranslate(GlobalFormTranslator);

  // Fetch products
  const fetchProducts = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/ProductList/${page}/${limit}/${search || 0}`);
      if (res.data.status === "Success") {
        const reversedData = (res.data.data || []).slice().reverse();
        setProducts(reversedData);
        // setProducts(res.data.data || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      ErrorToast("Failed to load products");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, limit, search]);

  // Delete product Handle
  const HandleProductDelet = async (id) => {
    Swal.fire({
      title: '<span class="text-gray-900 dark:text-white">Are you sure?</span>',
      html: '<p class="text-gray-600 dark:text-gray-300">This action cannot be undone!</p>',
      icon: "warning",
      showCancelButton: true,
      background: "rgba(255, 255, 255, 0.2)",
      backdrop: `
          rgba(0,0,0,0.4)
          url("/images/nyan-cat.gif")
          left top
          no-repeat
        `,
      customClass: {
        popup:
          "rounded-lg border border-white/20 dark:border-gray-700/50 shadow-xl backdrop-blur-lg bg-white/80 dark:bg-gray-800/80",
        confirmButton:
          "px-4 py-2 bg-red-600/90 hover:bg-red-700/90 text-white rounded-md font-medium transition-colors backdrop-blur-sm ml-3",
        cancelButton:
          "px-4 py-2 bg-white/90 dark:bg-gray-700/90 hover:bg-gray-100/90 dark:hover:bg-gray-600/90 text-gray-800 dark:text-gray-200 border border-white/20 dark:border-gray-600/50 rounded-md font-medium transition-colors ml-2 backdrop-blur-sm",
        title: "text-lg font-semibold",
        htmlContainer: "mt-2",
      },
      buttonsStyling: false,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setGlobalLoader(true);
          const response = await api.get(`/DeleteProduct/${id}`);

          if (response.data.status === "Success") {
            SuccessToast(response.data.message);

            // Auto remove from list
            setProducts((prev) => prev.filter((p) => p._id !== id));
            setTotal((prevTotal) => prevTotal - 1);
          } else {
            ErrorToast(response.data.message);
          }
        } catch (error) {
          ErrorToast(
            error.response?.data?.message || "Failed to delete Product"
          );
        } finally {
          setGlobalLoader(false);
        }
      }
    });
  };

  const sortProductListByName = () => {
    const sorted = [...products].sort((a, b) =>
      sortOrderName === true
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

    setProducts(sorted);

    setSortOrderName(!sortOrderName);

    // reset others
    setSortOrderStock(null);
    setSortOrderBrand(null);
    setSortOrderCategory(null);
    setSortOrderSalePrice(null);
    setSortOrderPurchasePrice(null);
  };

  const sortProductListByStock = () => {
    const sorted = [...products].sort((a, b) =>
      sortOrderStock === true ? a.qty - b.qty : b.qty - a.qty
    );

    setProducts(sorted);

    setSortOrderStock(!sortOrderStock);

    // reset others
    setSortOrderName(null);
    setSortOrderBrand(null);
    setSortOrderCategory(null);
    setSortOrderSalePrice(null);
    setSortOrderPurchasePrice(null);
  };

  const sortProductListByBrand = () => {
    const sorted = [...products].sort((a, b) => {
      const A = a.Brands?.name || "";
      const B = b.Brands?.name || "";

      return sortOrderBrand === true ? A.localeCompare(B) : B.localeCompare(A);
    });

    setProducts(sorted);
    setSortOrderBrand(!sortOrderBrand);

    // reset others
    setSortOrderName(null);
    setSortOrderStock(null);
    setSortOrderCategory(null);
    setSortOrderSalePrice(null);
    setSortOrderPurchasePrice(null);
  };

  const sortProductListByCategory = () => {
    const sorted = [...products].sort((a, b) => {
      const A = a.Categories?.name || "";
      const B = b.Categories?.name || "";

      return sortOrderCategory === true
        ? A.localeCompare(B)
        : B.localeCompare(A);
    });

    setProducts(sorted);
    setSortOrderCategory(!sortOrderCategory);

    // reset others
    setSortOrderName(null);
    setSortOrderStock(null);
    setSortOrderBrand(null);
    setSortOrderSalePrice(null);
    setSortOrderPurchasePrice(null);
  };

  const sortProductListBySalePrice = () => {
    const sorted = [...products].sort((a, b) => {
      const A = parseFloat(a.mrp || 0);
      const B = parseFloat(b.mrp || 0);

      return sortOrderSalePrice === true ? A - B : B - A;
    });

    setProducts(sorted);
    setSortOrderSalePrice(!sortOrderSalePrice);

    // reset others
    setSortOrderName(null);
    setSortOrderStock(null);
    setSortOrderBrand(null);
    setSortOrderCategory(null);
    setSortOrderPurchasePrice(null);
  };

  const sortProductListByPurchasePrice = () => {
    const sorted = [...products].sort((a, b) => {
      const A = parseFloat(a.unitCost || 0);
      const B = parseFloat(b.unitCost || 0);

      return sortOrderPurchasePrice === true ? A - B : B - A;
    });

    setProducts(sorted);
    setSortOrderPurchasePrice(!sortOrderPurchasePrice);

    // reset others
    setSortOrderName(null);
    setSortOrderStock(null);
    setSortOrderBrand(null);
    setSortOrderCategory(null);
    setSortOrderSalePrice(null);
  };

  return (
    <div className="global_sub_container">
      {/* Header + Search + Limit */}
      <div className="py-2">
        <div className="flex flex-col gap-2 lg:flex-row justify-between lg:items-center">
          <h2 className="text-xl font-semibold flex flex-col">
            {heading("productsList")}
            <span className="text-sm">
              Showing {products.length} of {total} products
            </span>
          </h2>

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="global_input w-full lg:w-lg"
          />
          {can("isAdmin") && (
            <ToggleSwitch
              label={btn("showPurchase")}
              value={showPurchase}
              onChange={(val) => setShowPurchase(val)}
            />
          )}
          <select
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value));
              setPage(1);
            }}
            className="global_dropdown lg:w-fit"
          >
            {[20, 50, 100, 200].map((opt) => (
              <option key={opt} value={opt}>
                {opt} per page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {products.length > 0 ? (
        <div>
          <div className="overflow-x-auto">
            <table className="global_table">
              <thead className="global_thead">
                <tr>
                  <th className="global_th">{table("no")}</th>
                  <th className="global_th">
                    <button
                      className="w-full text-left flex items-center gap-2"
                      onClick={sortProductListByName}
                    >
                      <span>{table("name")}</span>{" "}
                      {sortOrderName !== null ? (
                        sortOrderName === true ? (
                          <PiSortAscendingBold size={17} />
                        ) : (
                          <HiSortAscending size={17} />
                        )
                      ) : null}
                    </button>
                  </th>
                  <th className="global_th">
                    <button
                      className="w-full text-left flex items-center gap-2"
                      onClick={sortProductListByBrand}
                    >
                      <span>{btn("brand")}</span>{" "}
                      {sortOrderBrand !== null ? (
                        sortOrderBrand === true ? (
                          <PiSortAscendingBold size={17} />
                        ) : (
                          <HiSortAscending size={17} />
                        )
                      ) : null}
                    </button>
                  </th>
                  <th className="global_th">
                    <button
                      className="w-full text-left flex items-center gap-2"
                      onClick={sortProductListByCategory}
                    >
                      <span>{formTrans("category")}</span>{" "}
                      {sortOrderCategory !== null ? (
                        sortOrderCategory === true ? (
                          <PiSortAscendingBold size={17} />
                        ) : (
                          <HiSortAscending size={17} />
                        )
                      ) : null}
                    </button>
                  </th>
                  <th className="global_th">
                    {" "}
                    <button
                      className="w-full text-left flex items-center gap-2"
                      onClick={sortProductListByStock}
                    >
                      <span>{table("stock")}</span>{" "}
                      {sortOrderStock === null ? null : sortOrderStock ===
                        true ? (
                        <PiSortAscendingBold size={17} />
                      ) : (
                        <HiSortAscending size={17} />
                      )}
                    </button>
                  </th>
                  {showPurchase === 1 && (
                    <th className="global_th">
                      <button
                        className="w-full text-left flex items-center gap-2"
                        onClick={sortProductListByPurchasePrice}
                      >
                        <span>{table("purchaseUnitCost")}</span>{" "}
                        {sortOrderPurchasePrice !== null ? (
                          sortOrderPurchasePrice === true ? (
                            <PiSortAscendingBold size={17} />
                          ) : (
                            <HiSortAscending size={17} />
                          )
                        ) : null}
                      </button>
                    </th>
                  )}
                  <th className="global_th">
                    <button
                      className="w-full text-left flex items-center gap-2"
                      onClick={sortProductListBySalePrice}
                    >
                      <span>{table("sellPrice")}</span>{" "}
                      {sortOrderSalePrice !== null ? (
                        sortOrderSalePrice === true ? (
                          <PiSortAscendingBold size={17} />
                        ) : (
                          <HiSortAscending size={17} />
                        )
                      ) : null}
                    </button>
                  </th>
                  <th className="global_th"> {formTrans("dealerPrice")}</th>
                  {/* <th className="global_th">Manage Stock</th> */}
                  <th className="global_th"> {formTrans("barcode")}</th>
                  {/* <th className="global_th">Created</th> */}
                  {can("EditProduct") && <th className="global_th">{table("action")}</th>}
                </tr>
              </thead>
              <tbody className="global_tbody">
                {products.map((product, index) => (
                  <tr className="global_tr" key={product._id}>
                    <td className="global_td">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="global_td">
                      <div className="flex items-center gap-2">
                        <h1>{product.name}</h1>

                        {product.image && (
                          <div className="relative h-10 w-12 flex-shrink-0">
                            <img
                              src={product.image}
                              alt={`${product.name}-${index}`}
                              className="h-full w-full object-cover transition-all
                               duration-200 hover:scale-300
                                hover:absolute hover:z-50 hover:top-0  hover:left-0 "
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="global_td">
                      {product.Brands?.name || "N/A"}
                    </td>
                    <td className="global_td">
                      {product.Categories?.name || "N/A"}
                    </td>

                    <td className="global_td">
                      {product.manageStock === 0 ? (
                        <BsInfinity size={18} />
                      ) : (
                        <h1>
                          {parseInt(product.qty || 0)}{" "}
                          {product?.Units?.name || ""}
                        </h1>
                      )}
                      {/* {parseInt(product.stock || product.qty || 0)} */}
                    </td>
                    {showPurchase === 1 && (
                      <td className="global_td">
                        {parseFloat(product.unitCost || 0).toFixed(2)}
                      </td>
                    )}
                    <td className="global_td">
                      {parseFloat(product.mrp || 0).toFixed(2)}
                    </td>
                    <td className="global_td">
                      {parseFloat(product.dp || 0).toFixed(2)}
                    </td>

                    {/* <td className="global_td">
                      {product.manageStock || <BsInfinity size={18} />}
                    </td> */}
                    <td className="global_td">{product.barcode || "N/A"}</td>
                    {/* <td className="global_td">
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td> */}
                    {can("EditProduct") && (
                      <td className="global_td  ">
                        <div className="flex gap-2">
                          <button
                            className="global_edit"
                            onClick={() =>
                              navigate(`/EditProduct/${product._id}`, {
                                state: { product },
                              })
                            }
                          >
                            {btn("edit")}
                          </button>

                          {can("isAdmin") && (
                            <button
                              onClick={() => HandleProductDelet(product._id)}
                              className="global_button_red"
                            >
                              {btn("delete")}
                            </button>
                          )}

                          <Link
                            to={`/Analyze/${product._id}`}
                            className="global_button"
                          >
                            {btn("analyze")}
                          </Link>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              // className={`px-4 dark:text-gray-800 py-2 rounded-r-md rounded-l-full ${
              //   page === 1 ? "bg-gray-200 cursor-not-allowed" : "global_button"
              // }`}
              className={`px-4 py-2 rounded-r-md rounded-l-full ${
                page === 1
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "global_button"
              }`}
            >
              {table("previous")}
            </button>
            <span className="text-sm">
              {table("page")} {page} {table("of")} {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / limit)}
              // className={`px-4 dark:text-gray-800 py-2 rounded-l-md rounded-r-full ${
              //   page >= Math.ceil(total / limit)
              //     ? "bg-gray-200  cursor-not-allowed"
              //     : "global_button"
              // }`}
              className={`px-4 py-2 rounded-l-md rounded-r-full ${
                page >= Math.ceil(total / limit)
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "global_button"
              }`}
            >
              {table("next")}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found.</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
