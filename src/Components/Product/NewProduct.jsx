import { useEffect, useState, useRef } from "react";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import Select from "react-select";
import ToggleSwitch from "../../Helper/UI/ToggleSwitch";

import ProductModal from "../Modals/ProductModal";
import openCloseStore from "../../Zustand/OpenCloseStore";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { BsInfinity } from "react-icons/bs";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import ProductImageUploaderInput from "../../Helper/UI/ProductImageUploader";
import { removeImage } from "../../Helper/uploadImage";
import api from "../../Helper/axios_resonse_interceptor";
import { getAdmin, getPermissionDetails } from "../../Helper/SessionHelper";
import { can } from "../../Helper/permissionChecker";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { GlobalBtnTranslator } from "../../TranslationText/GlobalBtnTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";

const NewProduct = () => {
  const suggetionRef = useRef();
  const navigate = useNavigate();
  const { setGlobalLoader } = loadingStore();
  const { openModal } = openCloseStore();

  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const [unitCostError, setUnitCostError] = useState(false);
  const [newProducts, setNewProducts] = useState([]);

  const [suggetionKey, setSuggetionKey] = useState("");
  const [suggetionProducts, setSuggetionProducts] = useState([]);
  const [disibleSuggetion, setDisibleSuggetion] = useState(false);
  const [hiddenSuggetion, setHiddenSuggetion] = useState(false);

  // translate language
  const formTrans = useTextTranslate(GlobalFormTranslator);
  const heading = useTextTranslate(HeadingTranslate);
  const btn = useTextTranslate(GlobalBtnTranslator);
  const table = useTextTranslate(GlobalTableTranslator);

  const [formData, setFormData] = useState({
    details: "",
    qty: "",
    decimal: 0,
    manageStock: 1,
    unitCost: "",
    mrp: "",
    dp: "",
    name: "",
    ecom: 0,
    barcode: "",
    AltQty: "",
    image: "",
  });

  const handleProductChange = (field, value, isNumber = false) => {
    let val = value;
    if (isNumber) val = value === "" ? "" : Number(value);

    setFormData((prev) => ({
      ...prev,

      [field]: val,
    }));

    if (field === "name") {
      setSuggetionKey(val);
      setHiddenSuggetion(true);
      if (!val) setSuggetionProducts([]);
    }

    if (field === "qty") {
      if (val && (!formData.unitCost || formData.unitCost <= 0)) {
        setUnitCostError(true);
      } else {
        setUnitCostError(false);
      }
    }

    if (field === "unitCost") {
      if (formData.qty && (!val || val <= 0)) {
        setUnitCostError(true);
      } else {
        setUnitCostError(false);
      }
    }
  };

  const fetchBrands = async (callbackData = null) => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/GetBrands`);
      const brandData = (res.data?.data || []).reverse();
      const mapped = brandData.map((u) => ({
        value: u._id,
        label: u.name,
        ...u,
      }));
      setBrands(mapped);
      if (callbackData) {
        setSelectedBrand({
          value: callbackData._id,
          label: callbackData.name,
          ...callbackData,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const fetchCategories = async (callbackData = null) => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/GetCategory`);
      const mapped = (res.data.data || [])
        .reverse()
        .map((c) => ({ value: c._id, label: c.name, ...c }));
      setCategories(mapped);
      if (callbackData) {
        setSelectedCategory({
          value: callbackData._id,
          label: callbackData.name,
          ...callbackData,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const fetchUnits = async (callbackData = null) => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/GetUnit`);
      const mapped = (res.data.data || [])
        .reverse()
        .map((u) => ({ value: u._id, label: u.name, ...u }));
      setUnits(mapped);
      if (callbackData) {
        setSelectedUnit({
          value: callbackData._id,
          label: callbackData.name,
          ...callbackData,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const fetchSuggetion = async () => {
    if (!suggetionKey) return;
    setGlobalLoader(true);
    try {
      const res = await api.get(`/AllProductList/${suggetionKey}`);
      setSuggetionProducts(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    if (disibleSuggetion) return;
    fetchSuggetion();
  }, [suggetionKey]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        await Promise.all([
          fetchCategories(),
          fetchUnits(),
          fetchBrands(),
          fetchNewProducts(),
        ]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchAll();
  }, []);

  const validateForm = () => {
    const p = formData;
    if (!p.name.trim()) {
      toast.error("Product name is required");
      return false;
    }
    if (!selectedCategory) {
      toast.error("Please select a category");
      return false;
    }
    if (!selectedUnit) {
      toast.error("Please select a unit");
      return false;
    }
    if (!selectedBrand) {
      toast.error("Please select a brand");
      return false;
    }
    if (p.qty && (!p.unitCost || p.unitCost <= 0)) {
      setUnitCostError(true);
      toast.error("Unit Cost is required when Stock QTY is entered");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setFormData({
      details: "",
      qty: "",
      decimal: 0,
      manageStock: 1,
      unitCost: "",
      mrp: "",
      dp: "",
      name: "",
      ecom: 0,
      barcode: 0,
      AltQty: 0,
      image: "",
    });
    setSelectedCategory(null);
    setSelectedUnit(null);
    setSelectedBrand(null);
    setUnitCostError(false);
    setSuggetionProducts([]);
    setSuggetionKey("");
  };

  const fetchNewProducts = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/NewProductList`);
      if (res.data.status === "Success") setNewProducts(res.data.data || []);
    } catch (error) {
      ErrorToast("Failed to load products");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...formData,
      qty: Number(formData.qty) || 0,
      decimal: Number(formData.decimal) || 0,
      manageStock: Number(formData.manageStock),
      unitCost: Number(formData.unitCost) || 0,
      mrp: Number(formData.mrp) || 0,
      dp: Number(formData.dp) || 0,
      alert: Number(formData.AltQty) || 0,
      barcode: formData.barcode || 0,
      unitID: selectedUnit.value,
      categoryID: selectedCategory.value,
      brandID: selectedBrand.value,
      ...(formData.image ? { image: formData.image } : {}),
    };

    try {
      setGlobalLoader(true);
      const res = await api.post(`/CreateProduct`, payload);
      if (res.data.status === "Success") {
        SuccessToast("Product created successfully!");
        fetchNewProducts();
        resetForm();
      } else {
        ErrorToast(res.data.message || "Failed to create product");
      }
    } catch (error) {
      console.error(error);
      ErrorToast(error.response?.data?.message || "Failed to create product");
    } finally {
      setGlobalLoader(false);
    }
  };

  const HandleProductDelet = async (product) => {
    Swal.fire({
      title: '<span class="text-gray-900 dark:text-white">Are you sure?</span>',
      html: '<p class="text-gray-600 dark:text-gray-300">This action cannot be undone!</p>',
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: "rounded-lg shadow-xl backdrop-blur-lg",
        confirmButton: "px-4 py-2 bg-red-600 text-white rounded-md ml-3",
        cancelButton: "px-4 py-2 bg-gray-300 text-gray-800 rounded-md ml-2",
      },
      buttonsStyling: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setGlobalLoader(true);

          // CASE 1: product has image
          if (product.image) {
            const imageDeleted = await removeImage(product.image);

            // ❗ image delete fail হলে product delete হবে না
            if (!imageDeleted) {
              ErrorToast("Image delete failed! Product not deleted.");
              return; // STOP everything
            }
          }

          // CASE 2: product has no image OR image delete success
          const response = await api.get(`/DeleteProduct/${product._id}`);

          if (response.data.status === "Success") {
            SuccessToast(response.data.message);
            fetchNewProducts();
          } else {
            ErrorToast(response.data.message);
          }
        } catch (error) {
          ErrorToast(error.response?.data?.message || "Something went wrong");
        } finally {
          setGlobalLoader(false);
        }
      }
    });
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (suggetionRef.current && !suggetionRef.current.contains(e.target)) {
        setHiddenSuggetion(false); // suggestion বন্ধ হবে
        setSuggetionProducts([]); // suggestion list clear
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="global_container">
      {can("CreateProduct") && (
        <div className="global_sub_container">
          <h1 className="text-xl font-semibold mb-3">
            {heading("newProduct")}
          </h1>
          <form onSubmit={handleCreateProduct}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="relative">
                <div className="flex items-center justify-between ">
                  <label className="block text-sm font-medium mb-1">
                    {formTrans("product")} {formTrans("name")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium">
                      {formTrans("suggestion")}{" "}
                      {disibleSuggetion
                        ? formTrans("disabled")
                        : formTrans("enabled")}
                    </label>
                    <button
                      type="button"
                      onClick={() => setDisibleSuggetion(!disibleSuggetion)}
                      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                        disibleSuggetion ? "bg-gray-300" : "bg-green-500"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          disibleSuggetion ? "translate-x-1" : "translate-x-4"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleProductChange("name", e.target.value)}
                  className="global_input"
                  placeholder="Enter product name"
                  autoComplete="off"
                />
                {suggetionProducts.length > 0 && (
                  <ul
                    ref={suggetionRef}
                    className={`${
                      hiddenSuggetion ? "" : "hidden"
                    } absolute z-50 w-full border border-gray-300 rounded mt-1 max-h-40 overflow-auto shadow-lg`}
                  >
                    {suggetionProducts.map((prod) => (
                      <li
                        key={prod._id}
                        className="px-2 py-1 bg-white dark:bg-gray-800 cursor-pointer"
                        onClick={() => {
                          handleProductChange("name", prod.name);
                          setSuggetionProducts([]);
                          setHiddenSuggetion(false);
                        }}
                      >
                        {prod.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Brand */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    {formTrans("product")} {btn("brand")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={brands}
                    value={selectedBrand}
                    onChange={(brand) => {
                      setSelectedBrand(brand);
                    }}
                    placeholder="Select Brand"
                    classNamePrefix="react-select"
                    isClearable
                    menuPortalTarget={document.body}
                    styles={getReactSelectStyles()}
                  />
                </div>
                {can("CreateBrand") && (
                  <button
                    type="button"
                    onClick={() => openModal("brand", fetchBrands)}
                    className="global_button"
                  >
                    + {btn("brand")}
                  </button>
                )}
              </div>

              {/* Category */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    {formTrans("product")} {formTrans("category")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={categories}
                    value={selectedCategory}
                    onChange={(cat) => {
                      setSelectedCategory(cat);
                    }}
                    placeholder="Select Category"
                    classNamePrefix="react-select"
                    isClearable
                    menuPortalTarget={document.body}
                    styles={getReactSelectStyles()}
                  />
                </div>
                {can("CreateCategory") && (
                  <button
                    type="button"
                    onClick={() => openModal("category", fetchCategories)}
                    className="global_button"
                  >
                    + {formTrans("category")}
                  </button>
                )}
              </div>

              {/* Unit, Decimal, Manage Stock */}
              <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-end">
                <div className="md:col-span-4 w-full flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1 whitespace-nowrap">
                      {formTrans("product")} {btn("unit")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={units}
                      value={selectedUnit}
                      onChange={(unit) => {
                        setSelectedUnit(unit);
                      }}
                      placeholder="Select Unit"
                      classNamePrefix="react-select"
                      isClearable
                      menuPortalTarget={document.body}
                      styles={getReactSelectStyles()}
                    />
                  </div>
                  {can("CreateUnit") && (
                    <div className="flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => openModal("unit", fetchUnits)}
                        className="global_button"
                      >
                        + {btn("unit")}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ">
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium mb-1 whitespace-nowrap">
                      {btn("decimal")}
                    </label>
                    <ToggleSwitch
                      value={formData.decimal}
                      onChange={(val) =>
                        handleProductChange("decimal", val, true)
                      }
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium mb-1 whitespace-nowrap">
                     {btn("manageStock")}
                    </label>
                    <ToggleSwitch
                      value={formData.manageStock}
                      onChange={(val) =>
                        handleProductChange("manageStock", val, true)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Numeric Fields including Barcode and AltQty */}
            <div
              className={`grid grid-cols-1 ${
                formData.manageStock ? " md:grid-cols-6" : "md:grid-cols-3"
              } gap-4 mt-4`}
            >
              {formData.manageStock ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                     {formTrans("stockQty")}
                    </label>
                    <input
                      type="number"
                      value={formData.qty}
                      onChange={(e) =>
                        handleProductChange("qty", e.target.value, true)
                      }
                      placeholder="Enter stock quantity"
                      className="global_input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                    {formTrans("unitCost")}
                      {unitCostError && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="number"
                      value={formData.unitCost}
                      onChange={(e) =>
                        handleProductChange("unitCost", e.target.value, true)
                      }
                      placeholder="Enter unit cost"
                      className="global_input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {formTrans("alertQty")}
                    </label>
                    <input
                      type="number"
                      value={formData.AltQty}
                      onChange={(e) =>
                        handleProductChange("AltQty", e.target.value, true)
                      }
                      placeholder="Enter alert quantity (default 0)"
                      className="global_input"
                    />
                  </div>
                </>
              ) : (
                ""
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  {formTrans("sellPrice")}
                </label>
                <input
                  type="number"
                  value={formData.mrp}
                  onChange={(e) =>
                    handleProductChange("mrp", e.target.value, true)
                  }
                  placeholder="Enter sell price"
                  className="global_input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {formTrans("dealerPrice")}
                </label>
                <input
                  type="number"
                  value={formData.dp}
                  onChange={(e) =>
                    handleProductChange("dp", e.target.value, true)
                  }
                  placeholder="Enter dealer price"
                  className="global_input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {formTrans("barcode")}
                </label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) =>
                    handleProductChange("barcode", e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // ✅ Stop form submit
                    }
                  }}
                  placeholder="Enter barcode (default 0)"
                  className="global_input"
                />
              </div>
            </div>
            <ProductImageUploaderInput
              formData={formData}
              setFormData={setFormData}
              title={`${formTrans("product")} ${formTrans("image")}`}
            />

            {/* Submit Button */}
            <div className="flex justify-end mt-4">
              <button type="submit" className="global_button w-full md:w-fit">
              {btn("create")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="global_sub_container">
        <h2 className="text-xl mb-3 font-semibold">{heading("productsList")}</h2>
        {newProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="global_table">
              <thead className="global_thead">
                <tr>
                  <th className="global_th">{table("no")}</th>
                  <th className="global_th">{table("name")}</th>
                  <th className="global_th">{formTrans("barcode")}</th>
                  <th className="global_th">{btn("brand")}</th>
                  <th className="global_th">{formTrans("category")}</th>
                  <th className="global_th">{table("stock")}</th>
                  <th className="global_th">{btn("unit")}</th>
                  <th className="global_th">{table("purchaseUnitCost")}</th>
                  <th className="global_th">{table("sellPrice")}</th>
                  {/* <th className="global_th">Manage Stock</th> */}
                  <th className="global_th">{table("date")}</th>
                  {can("EditProduct") && <th className="global_th">{table("action")}</th>}
                </tr>
              </thead>
              <tbody className="global_tbody">
                {newProducts.map((product, index) => (
                  <tr className="global_tr" key={product._id}>
                    <td className="global_td">{index + 1}</td>
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

                    <td className="global_td">{product.barcode}</td>
                    <td className="global_td">{product.brandName || "N/A"}</td>
                    <td className="global_td">
                      {product.categoryName || "N/A"}
                    </td>
                    <td className="global_td text-center">
                      {product.manageStock === 0 ? (
                        <h1 className="flex justify-center">
                          {" "}
                          <BsInfinity size={18} />
                        </h1>
                      ) : (
                        parseInt(product.stock || product.qty || 0)
                      )}
                    </td>
                    <td className="global_td text-center">{product.unit}</td>
                    <td className="global_td">
                      {parseFloat(product.unitCost || 0).toFixed(2)}
                    </td>
                    <td className="global_td">
                      {parseFloat(product.mrp || 0).toFixed(2)}
                    </td>
                    {/* <td className="global_td ">
                      {" "}
                      {product.manageStock || <BsInfinity size={18} />}
                    </td> */}
                    <td className="global_td">
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString(
                            "en-GB"
                          )
                        : "N/A"}
                    </td>
                    {can("EditProduct") && (
                      <td className="global_td">
                        <div className="flex gap-2">
                          {" "}
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
                              onClick={() => HandleProductDelet(product)}
                              className="global_button_red"
                            >
                              {btn("delete")}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found.</p>
          </div>
        )}
      </div>

      <ProductModal />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default NewProduct;
