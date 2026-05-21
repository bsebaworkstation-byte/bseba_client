import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { BsTrash } from "react-icons/bs";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../Helper/axios_resonse_interceptor";

const AddDamage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saleProducts, setSaleProducts] = useState([]);
  const [note, setNote] = useState("");
  const [total, setTotal] = useState(0);

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get(`/AllProductList/0`);
        const options = res.data.data.map((item) => {
          const totalQty = item.Productlines.reduce(
            (sum, line) => sum + (line.stock || 0),
            0
          );
          return {
            value: item._id,
            label: `${item.name} - ${item.barcode} (Stock: ${totalQty}) ${item.brandName}`,
            Productlines: item.Productlines,
          };
        });
        setProductOptions(options);
      } catch (error) {
        ErrorToast("Failed to load products");
      }
    };
    fetchProducts();
  }, []);

  // When user selects a product
  const handleProductChange = (selectedOption) => {
    setSelectedProduct(selectedOption);

    const lines = selectedOption.Productlines.map((line) => ({
      value: line._id,
      label: `(Stock: ${line.stock}) ${new Date(
        line.CreatedDate
      ).toLocaleDateString()}`,
      stock: line.stock,
      mrp: line.mrp,
      dp: line.dp,
      unitCost: line.unitCost,
    }));

    const newItem = {
      productID: selectedOption.value,
      name: selectedOption.label,
      qtyDamage: 0,
      price: selectedOption.Productlines[0]?.unitCost || 0,
      total: 0,
      productLineID: selectedOption.Productlines[0]?._id || null,
      productLineOptions: lines,
    };

    setSaleProducts((prev) => [...prev, newItem]);
  };

  // When user selects product line (In Date)
  const handleProductLineChange = (index, selectedLine) => {
    const updated = [...saleProducts];
    updated[index].productLineID = selectedLine.value;
    updated[index].price = selectedLine.unitCost || 0;
    updated[index].stock = selectedLine.stock || 0;
    updated[index].total = updated[index].qtyDamage * updated[index].price;
    setSaleProducts(updated);
    updateTotal(updated);
  };

  // When user changes quantity
  const handleQtyChange = (index, qty) => {
    const updated = [...saleProducts];
    const line = updated[index].productLineOptions.find(
      (opt) => opt.value === updated[index].productLineID
    );

    const available = line?.stock || 0;
    if (qty > available) {
      toast.error(`Stock available: ${available}`);
      qty = available;
    }

    updated[index].qtyDamage = qty;
    updated[index].total = qty * updated[index].price;
    setSaleProducts(updated);
    updateTotal(updated);
  };

  const removeItem = (index) => {
    const updated = saleProducts.filter((_, i) => i !== index);
    setSaleProducts(updated);
    updateTotal(updated);
  };

  const updateTotal = (list) => {
    const totalValue = list.reduce((sum, item) => sum + item.total, 0);
    setTotal(totalValue);
  };

  const handleSubmit = async () => {
    if (saleProducts.length === 0) {
      return ErrorToast("Please add at least one product");
    }

    const payload = {
      Damage: {
        total,
        note,
      },
      DamageProduct: saleProducts.map((item) => ({
        productID: item.productID,
        productLineID: item.productLineID,
        name: item.name,
        qtyDamage: item.qtyDamage,
        price: item.price,
        total: item.total,
      })),
    };

    try {
      const res = await api.post(`/AdDamage`, payload);
      if (res.data.status === "success" || res.status === 200) {
        SuccessToast("Damage added successfully");
        setSaleProducts([]);
        setNote("");
        setTotal(0);
        setSelectedProduct(null);
      } else {
        ErrorToast("Failed to add damage");
      }
    } catch (error) {
      ErrorToast("Failed to add damage");
    }
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      fontSize: "14px",
      minHeight: "31px",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  return (
    <div className="global-margin-main-content">
      <div className="global-bg-glass global-content-gap-top global-content-gap-bottom">
        <div className="form-wrapper">
          <div className="row">
            <div className="col-12 col-sm-6 mt-3">
              <label className="form-label">Date</label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="dd-MM-yyyy"
                className="form-control form-control-sm"
              />
            </div>
            <div className="col-12 col-sm-6 mt-3">
              <label className="form-label">Note</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="form-control form-control-sm"
                placeholder="Enter note"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper mt-4">
          <table className="table table-sm table-bordered">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>In Date</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {saleProducts.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>
                    <Select
                      options={item.productLineOptions}
                      value={item.productLineOptions.find(
                        (opt) => opt.value === item.productLineID
                      )}
                      onChange={(selected) =>
                        handleProductLineChange(index, selected)
                      }
                      styles={customStyles}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="form-control form-control-sm"
                      value={item.qtyDamage}
                      onChange={(e) =>
                        handleQtyChange(index, parseFloat(e.target.value) || 0)
                      }
                    />
                  </td>
                  <td>{item.price}</td>
                  <td>{item.total.toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => removeItem(index)}
                    >
                      <BsTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Section */}
        <div className="row mt-3">
          <div className="col-lg-8 col-12">
            <label className="form-label">Select Product</label>
            <Select
              options={productOptions}
              value={selectedProduct}
              onChange={handleProductChange}
              styles={customStyles}
              placeholder="Select Product"
            />
          </div>
          <div className="col-lg-4 col-12 mt-3 mt-lg-0">
            <div className="d-flex align-items-center justify-content-between">
              <label className="form-label">Total:</label>
              <input
                disabled
                value={total.toFixed(2)}
                className="form-control form-control-sm w-50"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="btn btn-sm w-100 btn-primary mt-3"
            >
              Add Damage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDamage;
