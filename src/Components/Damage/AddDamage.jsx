import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { BsTrash } from "react-icons/bs";
import { FaCalendarAlt } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import { formatCurrency } from "../../Helper/formatCurrency";
import { useTextTranslate } from "../../TranslationText/useTextTranslate";
import { GlobalFormTranslator } from "../../TranslationText/GlobalFormTranslator";
import { HeadingTranslate } from "../../TranslationText/GlobalHeadingTranslator";
import { GlobalTableTranslator } from "../../TranslationText/GlobalTableTranslator";

const AddDamage = () => {
  const { setGlobalLoader } = loadingStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [damageProducts, setDamageProducts] = useState([]);
  const [note, setNote] = useState("");
  const [total, setTotal] = useState(0);

  const formTrans = useTextTranslate(GlobalFormTranslator);
  const heading = useTextTranslate(HeadingTranslate);
  const table = useTextTranslate(GlobalTableTranslator);

  const updateTotal = (list) => {
    setTotal(list.reduce((sum, item) => sum + Number(item.total || 0), 0));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setGlobalLoader(true);
      try {
        const res = await api.get("/AllProductList/0");
        const options = (res.data.data || []).map((item) => {
          const totalQty = (item.Productlines || []).reduce(
            (sum, line) => sum + (line.stock || 0),
            0,
          );

          return {
            value: item._id,
            label: `${item.name} - ${item.barcode} (Stock: ${totalQty}) ${item.brandName || ""}`,
            productName: item.name,
            Productlines: item.Productlines || [],
          };
        });
        setProductOptions(options);
      } catch (error) {
        ErrorToast("Failed to load products");
      } finally {
        setGlobalLoader(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductChange = (selectedOption) => {
    if (!selectedOption) return;

    if (damageProducts.some((item) => item.productID === selectedOption.value)) {
      ErrorToast("Product already added");
      setSelectedProduct(null);
      return;
    }

    const lines = selectedOption.Productlines.map((line) => ({
      value: line._id,
      label: `(Stock: ${line.stock}) ${new Date(line.CreatedDate).toLocaleDateString()}`,
      stock: line.stock,
      unitCost: line.unitCost,
    }));

    const defaultLine = lines[0];

    const newItem = {
      productID: selectedOption.value,
      name: selectedOption.productName,
      qtyDamage: 0,
      price: defaultLine?.unitCost || 0,
      total: 0,
      productLineID: defaultLine?.value || null,
      productLineOptions: lines,
    };

    const updated = [...damageProducts, newItem];
    setDamageProducts(updated);
    updateTotal(updated);
    setSelectedProduct(null);
  };

  const handleProductLineChange = (index, selectedLine) => {
    const updated = [...damageProducts];
    updated[index].productLineID = selectedLine.value;
    updated[index].price = selectedLine.unitCost || 0;
    updated[index].total = updated[index].qtyDamage * updated[index].price;
    setDamageProducts(updated);
    updateTotal(updated);
  };

  const handleQtyChange = (index, qty) => {
    const updated = [...damageProducts];
    const line = updated[index].productLineOptions.find(
      (opt) => opt.value === updated[index].productLineID,
    );

    const available = line?.stock || 0;
    let nextQty = Number(qty) || 0;

    if (nextQty > available) {
      ErrorToast(`Stock available: ${available}`);
      nextQty = available;
    }

    updated[index].qtyDamage = nextQty;
    updated[index].total = nextQty * updated[index].price;
    setDamageProducts(updated);
    updateTotal(updated);
  };

  const removeItem = (index) => {
    const updated = damageProducts.filter((_, i) => i !== index);
    setDamageProducts(updated);
    updateTotal(updated);
  };

  const handleSubmit = async () => {
    if (damageProducts.length === 0) {
      return ErrorToast("Please add at least one product");
    }

    const invalidItem = damageProducts.find(
      (item) => !item.productLineID || item.qtyDamage <= 0,
    );

    if (invalidItem) {
      return ErrorToast("Please set quantity for all products");
    }

    const payload = {
      Damage: {
        total,
        note,
      },
      DamageProduct: damageProducts.map((item) => ({
        productID: item.productID,
        productLineID: item.productLineID,
        name: item.name,
        qtyDamage: item.qtyDamage,
        price: item.price,
        total: item.total,
      })),
    };

    setGlobalLoader(true);
    try {
      const res = await api.post("/AdDamage", payload);
      if (
        String(res.data?.status).toLowerCase() === "success" ||
        res.status === 200
      ) {
        SuccessToast(res.data?.message || "Damage added successfully");
        setDamageProducts([]);
        setNote("");
        setTotal(0);
        setSelectedProduct(null);
        setSelectedDate(new Date());
      } else {
        ErrorToast(res.data?.message || "Failed to add damage");
      }
    } catch (error) {
      ErrorToast(
        error.response?.data?.message || "Failed to add damage",
      );
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      <h4 className="global_heading">{heading("addDamage")}</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm mb-1">{table("date")}</label>
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-3" />
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd-MM-yyyy"
              className="global_input pl-10 w-full"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">{formTrans("note")}</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="global_input w-full"
            placeholder="Enter note"
          />
        </div>
      </div>

      <div className="global_sub_container overflow-auto rounded-lg mb-6">
        <table className="global_table w-full">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th">#</th>
              <th className="global_th">{formTrans("product")}</th>
              <th className="global_th">In Date</th>
              <th className="global_th">{table("qty")}</th>
              <th className="global_th">{formTrans("price")}</th>
              <th className="global_th">{table("total")}</th>
              <th className="global_th">{table("Action")}</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {damageProducts.length === 0 ? (
              <tr className="global_tr">
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No products added
                </td>
              </tr>
            ) : (
              damageProducts.map((item, index) => (
                <tr className="global_tr" key={`${item.productID}-${index}`}>
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">{item.name}</td>
                  <td className="global_td min-w-[180px]">
                    <Select
                      options={item.productLineOptions}
                      value={item.productLineOptions.find(
                        (opt) => opt.value === item.productLineID,
                      )}
                      onChange={(selected) =>
                        handleProductLineChange(index, selected)
                      }
                      styles={getReactSelectStyles()}
                      menuPortalTarget={document.body}
                    />
                  </td>
                  <td className="global_td">
                    <input
                      type="number"
                      min="0"
                      className="global_input w-24"
                      value={item.qtyDamage}
                      onChange={(e) =>
                        handleQtyChange(index, parseFloat(e.target.value) || 0)
                      }
                    />
                  </td>
                  <td className="global_td">{formatCurrency(item.price)}</td>
                  <td className="global_td">
                    {formatCurrency(item.total)}
                  </td>
                  <td className="global_td">
                    <button
                      type="button"
                      className="global_button_red"
                      onClick={() => removeItem(index)}
                    >
                      <BsTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
        <div className="lg:col-span-2">
          <label className="block text-sm mb-1">{formTrans("product")}</label>
          <Select
            options={productOptions}
            value={selectedProduct}
            onChange={handleProductChange}
            styles={getReactSelectStyles()}
            menuPortalTarget={document.body}
            placeholder="Select product"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">{table("total")}</label>
          <input
            disabled
            value={formatCurrency(total)}
            className="global_input w-full mb-3"
          />
          <button
            type="button"
            onClick={handleSubmit}
            className="global_button w-full"
          >
            {heading("addDamage")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDamage;
