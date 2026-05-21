import React, { useEffect, useState } from "react";
import Select from "react-select";
import loadingStore from "../../Zustand/LoadingStore";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { useNavigate } from "react-router-dom";
import api from "../../Helper/axios_resonse_interceptor";

export default function CreateSaleOrder() {
  const { setGlobalLoader } = loadingStore();
  const navigate = useNavigate();

  // Product  State
  const [productList, setProductList] = useState([]);
  const [searchProductKeyword, setSearchProductKeyword] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [note, setNote] = useState("");
  const [discount, setDiscount] = useState(0);
  // suplier
  const [customer, setCustomer] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerKeyWord, setSearchCustomerKeyword] = useState("");

  // Fetch Product List
  const fetchProductList = async (keyword = "") => {
    setGlobalLoader(true);
    const searchKey = keyword.trim() || "0";
    try {
      const { data } = await api.get(
        `/ProductList/1/50/${searchKey}`
      );

      if (data.status === "Success") {
        setProductList(
          data.data.map((p) => ({
            value: p._id,
            label: `${p.name} - ${p.Brands.name} - ${p.Categories.name}`,
            product: p,
          }))
        );
      } else {
        setProductList([]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setGlobalLoader(false);
    }
  };

  // fetch customer
  const fetchCustomer = async (keyword = "") => {
    const searchKey = keyword.trim() || "0";
    try {
      const { data } = await api.get(
        `/CustomersList/1/20/${searchKey}`
      );
      if (data.status === "Success") {
        setCustomer(
          data.data.map((s) => ({
            value: s._id,
            label: `${s.name} - ${s.mobile} - ${s.address}`,
            customer: s,
          }))
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Debounce product
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchProductList(searchProductKeyword.trim());
    }, 300);

    return () => clearTimeout(delay);
  }, [searchProductKeyword]);

  // debounch customer
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchCustomer(customerKeyWord);
    }, 300);
    return () => clearTimeout(delay);
  }, [customerKeyWord]);

  useEffect(() => {
    fetchProductList();
    fetchCustomer();
  }, []);

  // Add selected product to table
  const handleAddProduct = (selectedOption) => {
    if (!selectedOption) return;
    const exists = selectedProducts.find(
      (p) => p.productID === selectedOption.value
    );
    if (!exists) {
      setSelectedProducts((prev) => [
        ...prev,
        {
          productID: selectedOption.value,
          name: selectedOption.product.name,
          qty: 1,
          unitcost: selectedOption.product.unitCost,
          price: selectedOption.product.mrp || 0,
          total: selectedOption.product.mrp || 0,
        },
      ]);
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);

    if (!customer) {
      setSelectedProducts([]);
      setSearchProductKeyword("");
      setProductList([]);
    } else {
      fetchProductList(searchProductKeyword.trim() || "0");
    }
  };

  // Update Qty or Price
  const handleProductChange = (index, key, value) => {
    setSelectedProducts((prev) => {
      const newProducts = [...prev];
      newProducts[index][key] = Number(value) || 0;
      newProducts[index].total =
        newProducts[index].qty * newProducts[index].price;
      return newProducts;
    });
  };

  // Calculate totals
  const total = selectedProducts.reduce((acc, p) => acc + p.total, 0);

  // Discount is direct input
  const discountAmount = Number(discount) || 0;
  // Grand total
  const grandTotal = total - discountAmount;

  // Submit Order
  const handleCreateSaleOrder = async () => {
    const invalidProduct = selectedProducts.find((p) => !p.qty || p.qty < 1);

    if (invalidProduct) {
      ErrorToast(`Please enter a valid quantity for ${invalidProduct.name}`);
      return;
    }

    const payload = {
      Order: {
        contactID: selectedCustomer.value,
        total,
        discount: discountAmount,
        grandTotal,
        note,
        CreatedDate: new Date(),
      },
      OrderProduct: selectedProducts.map((p) => ({
        productID: p.productID,
        qty: p.qty,
        price: p.price,
        total: p.total,
        // purchasePrice: p.unitcost,
      })),
    };

    try {
      setGlobalLoader(true);
      const { data } = await api.post(`/CreateSaleOrder`, payload);

      if (data.status === "Success") {
        // Clear form
        SuccessToast("Sale Order created successfully!");
        setSelectedProducts([]);
        setNote("");
      } else {
        ErrorToast("Created sale order faild");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setGlobalLoader(false);
      navigate("/saleOrderList");
    }
  };

  return (
    <div className="global_container">
      <h4 className="global_heading">Sale Order</h4>

      {/* customer & Product */}
      <div className="global_sub_container grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* customer */}
        <div>
          <label>Select Customer</label>
          <Select
            options={customer}
            placeholder="Select Product"
            classNamePrefix="react-select"
            onInputChange={(inputValue, { action }) => {
              if (action === "input-change")
                setSearchCustomerKeyword(inputValue);
            }}
            onChange={handleSelectCustomer}
            isDisabled={
              (customer.length === 0 && !customerKeyWord) ||
              selectedProducts.length > 0
            }
            isClearable
            menuPortalTarget={document.body}
            styles={getReactSelectStyles()}
          />
        </div>
        {/* select product */}
        <div>
          <label>Select Product</label>
          <Select
            options={productList}
            placeholder="Select Product"
            classNamePrefix="react-select"
            onInputChange={(inputValue, { action }) => {
              if (action === "input-change")
                setSearchProductKeyword(inputValue);
            }}
            onChange={handleAddProduct}
            isDisabled={
              (productList.length === 0 && !searchProductKeyword) ||
              !selectedCustomer
            }
            isClearable
            menuPortalTarget={document.body}
            styles={getReactSelectStyles()}
          />
        </div>
      </div>

      {/* Product Table */}
    
        <div className="global_sub_container mt-5 overflow-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">Product</th>
                <th className="global_th">Qty</th>
                <th className="global_th">Price</th>
                <th className="global_th">Total</th>
                <th className="global_th">Action</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {selectedProducts.map((p, i) => (
                <tr className="global_tr" key={i}>
                  <td className="global_td">{p.name}</td>
                  <td className="global_td">
                    <input
                      type="number"
                      min={1}
                      defaultValue={1}
                      onChange={(e) =>
                        handleProductChange(i, "qty", e.target.value)
                      }
                      className="global_input min-w-20"
                    />
                  </td>
                  <td className="global_td">
                    <input
                      type="number"
                      min={0}
                      defaultValue={p.price}
                      onChange={(e) =>
                        handleProductChange(i, "price", e.target.value)
                      }
                      className="global_input min-w-20"
                    />
                  </td>

                  <td className="global_td">
                    {p.qty === "" || 0 ? "" : p.total}
                  </td>
                  <td className="global_td">
                    <p
                      onClick={() =>
                        setSelectedProducts((prev) =>
                          prev.filter((_, index) => index !== i)
                        )
                      }
                      className="text-red-700 font-semibold cursor-pointer"
                    >
                      remove
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      {/* summary */}

      <div className="flex global_sub_container mt-5 flex-col lg:flex-row gap-6">
        {/* Note*/}
        <div className="flex-1">
          <label className="block mb-2 font-medium">Note</label>
          <textarea
            value={selectedProducts.length > 0 ? note : ""}
            onChange={(e) => setNote(e.target.value)}
            className="global_input min-h-[150px] w-full"
          />
        </div>
        <div className="flex-1 space-y-3">
          {/* Total*/}
          <div className="flex justify-between">
            <label>Total:</label>
            <input
              type="number"
              value={selectedProducts.length > 0 ? total : ""}
              disabled
              className="global_input w-40 rounded-sm cursor-not-allowed text-right"
            />
          </div>
          {/* Discount */}
          <div className="flex justify-between">
            <label>Discount :</label>
            <input
              onChange={(e) => setDiscount(Number(e.target.value))}
              type="number"
              disabled={selectedProducts.length === 0}
              className={`global_input w-40 rounded-sm text-right ${
                selectedProducts.length === 0
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            />
          </div>

          {/*Grand Total*/}
          <div className="flex justify-between">
            <label>Grand Total:</label>
            <input
              type="number"
              value={grandTotal}
              disabled
              className="global_input w-40 rounded-sm cursor-not-allowed text-right"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleCreateSaleOrder}
              disabled={selectedProducts.length === 0}
              className={`global_button ${
                selectedProducts.length === 0
                  ? "disabled cursor-not-allowed"
                  : ""
              }`}
            >
              Create Sale Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
