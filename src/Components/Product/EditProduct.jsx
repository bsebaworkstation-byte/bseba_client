import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SuccessToast, ErrorToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import ProductImageUploaderInput from "../../Helper/UI/ProductImageUploader";
import toast from "react-hot-toast";
import ToggleSwitch from "../../Helper/UI/ToggleSwitch";
import api from "../../Helper/axios_resonse_interceptor";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setGlobalLoader } = loadingStore();

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);

  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    details: "",
    barcode: "",
    mrp: "",
    alert: "",
    image: "",
    decimal: 0,
    dp: "",
  });

  // Fetch Brands
  const fetchBrands = async () => {
    try {
      const res = await api.get(`/GetBrands`);
      setBrands(
        (res.data?.data || []).map((b) => ({ value: b._id, label: b.name }))
      );
    } catch (error) {
      ErrorToast("Failed to load brands");
    }
  };

  // Fetch Brands
  const fetchUnits = async () => {
    try {
      const res = await api.get(`/GetUnit`);
      setUnits(
        (res.data?.data || []).map((b) => ({ value: b._id, label: b.name }))
      );
    } catch (error) {
      ErrorToast("Failed to load brands");
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await api.get(`/GetCategory`);
      setCategories(
        (res.data?.data || []).map((c) => ({ value: c._id, label: c.name }))
      );
    } catch (error) {
      console.error(error);
      ErrorToast("Failed to load categories");
    }
  };

  // Fetch Product
  const fetchProduct = async () => {
    try {
      setGlobalLoader(true);
      const res = await api.get(`/getProductById/${id}`);

      console.log(res);
      const p = res.data?.data;
      if (p) {
        setFormData({
          name: p.name || "",
          ...(p.image ? { image: p.image } : {}),
          details: p.details || "",
          barcode: p.barcode || "",
          mrp: p.mrp || "",
          alert: p.alert || "",
          decimal: p.decimal,
          dp: p?.dp || "",
        });

        setSelectedBrand(
          p.brandID ? { value: p.brandID, label: p.brandName } : null
        );
        setSelectedCategory(
          p.categoryID ? { value: p.categoryID, label: p.categoryName } : null
        );
        setSelectedUnit(
          p.unitID ? { value: p.unitID, label: p.unitName } : null
        );
      }
    } catch (error) {
      console.error(error);
      ErrorToast("Failed to load product data");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    Promise.all([
      fetchBrands(),
      fetchCategories(),
      fetchProduct(),
      fetchUnits(),
    ]);
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return toast.error("Product Name Required!");
    if (!selectedBrand) return toast.error("Please select Brand!");
    if (!selectedCategory) return toast.error("Please select Category!");
    if (!selectedUnit) return toast.error("Please select Unit!");
    return true;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...formData,
      brandID: selectedBrand.value,
      categoryID: selectedCategory.value,
      unitID: selectedUnit.value,
    };

    try {
      setGlobalLoader(true);
      const res = await api.post(`/EditProductById/${id}`, payload);

      if (res.data.status === "Success") {
        SuccessToast("Product updated successfully!");
        navigate("/ProductList");
      } else {
        ErrorToast(res.data.message || "Failed to update product");
      }
    } catch (error) {
      console.error(error);
      ErrorToast(error.response?.data?.message);
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      <div className="global_sub_container relative">
        <form onSubmit={handleUpdate}>
          <h1 className="text-xl font-semibold mb-3">Edit Product</h1>
          {/* toggleswitch */}
          <div className="absolute -top-2 right-2">
            <ToggleSwitch
              label={"Decimal"}
              value={formData.decimal}
              onChange={(val) => handleChange("decimal", val)}
            />
          </div>

          <div>
            <div className="flex flex-col md:flex-row gap-4 w-full">
              {/* Product Name */}
              <div className="w-full">
                <label className="block text-sm font-medium mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="global_input"
                />
              </div>

              {/* Barcode */}
              <div className="w-full">
                <label className="block text-sm font-medium mb-1">
                  Barcode
                </label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => {
                    handleChange("barcode", e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // ✅ form submit বন্ধ করবে
                    }
                  }}
                  className="global_input"
                />
              </div>
            </div>

            {/* Brand + Category + Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-8 gap-3">
              {/* brand */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Brand <span className="text-red-500">*</span>
                </label>
                <Select
                  options={brands}
                  value={selectedBrand}
                  onChange={(val) => {
                    setSelectedBrand(val);
                  }}
                  placeholder="Select Brand"
                  classNamePrefix="react-select"
                  isClearable
                />
              </div>

              {/* category */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select
                  options={categories}
                  value={selectedCategory}
                  onChange={(val) => {
                    setSelectedCategory(val);
                  }}
                  placeholder="Select Category"
                  classNamePrefix="react-select"
                  isClearable
                />
              </div>

              {/* unit */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Unit <span className="text-red-500">*</span>
                </label>
                <Select
                  options={units}
                  value={selectedUnit}
                  onChange={(val) => {
                    setSelectedUnit(val);
                  }}
                  placeholder="Select Unit"
                  classNamePrefix="react-select"
                  isClearable
                />
              </div>

              {/* dp */}
              <div>
                <label className="block text-sm font-medium mb-1">Dp</label>
                <input
                  type="number"
                  value={formData.dp}
                  onChange={(e) => handleChange("dp", e.target.value)}
                  className="global_input"
                />
              </div>

              {/* Sell Price (MRP) */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sell Price (MRP)
                </label>
                <input
                  type="number"
                  value={formData.mrp}
                  onChange={(e) => handleChange("mrp", e.target.value)}
                  className="global_input"
                />
              </div>

              {/* Alert Quantity */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Alert Quantity
                </label>
                <input
                  type="number"
                  value={formData.alert}
                  onChange={(e) => handleChange("alert", e.target.value)}
                  className="global_input"
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium mb-1">Details</label>
            <textarea
              // cols={}
              rows={4}
              value={formData.details}
              onChange={(e) => handleChange("details", e.target.value)}
              className="global_input"
            />
          </div>

          <ProductImageUploaderInput
            formData={formData}
            setFormData={setFormData}
            title={"Product Image"}
          />

          {/* Submit Button */}
          <div className="flex justify-end mt-4">
            <button type="submit" className="global_button w-full md:w-fit">
              Update Product
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EditProduct;
