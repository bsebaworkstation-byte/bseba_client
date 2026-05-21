import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BaseURL } from "../../Helper/Config";
import { toast } from "react-hot-toast";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import Select from "react-select";
import { IoMdCloseCircle } from "react-icons/io";

const SaleReturn = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [SaleDetails, setSaleDetails] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const { setGlobalLoader } = loadingStore();
  const [returnData, setReturnData] = useState({
    total: 0,
    note: "",
  });

  // Fetch Sale Details
  useEffect(() => {
    const fetchSaleDetails = async () => {
      setGlobalLoader(true);
      try {
        const response = await api.get(`/SalesDetailsByID/${id}`);
        setSaleDetails(response.data.data);

        if (response.data.data.Payments) {
          await fetchAllAccounts();
        }
      } catch (err) {
        toast.error("Failed to load Sale details. Please try again later.");
      } finally {
        setGlobalLoader(false);
      }
    };
    fetchSaleDetails();
  }, [id]);

  // Fetch Accounts
  const fetchAllAccounts = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/AllAccount`);
      if (res.data.status === "Success") {
        const formatted = res.data.data.map((b) => ({
          value: b._id,
          label: b.name,
          amount: 0,
          ...b,
        }));
        const defaultAccount = formatted.find((a) => a.default === 1);
        if (defaultAccount) {
          setSelectedAccounts([defaultAccount]);
          const filtered = formatted.filter(
            (a) => a.value !== defaultAccount.value
          );
          setAccounts(filtered);
          return res.data.data;
        } else {
          setAccounts(formatted);
          setSelectedAccounts([]);
        }
      }
    } catch (error) {
      toast.error("Failed to load accounts");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Product selection
  const handleProductSelection = (product, isSelected) => {
    if (isSelected) {
      setSelectedProducts([
        ...selectedProducts,
        { ...product, returnQty: 0, selectedSerialNos: [] },
      ]);
    } else {
      setSelectedProducts(
        selectedProducts.filter((p) => {
          // If product has productLineID, match both id and productLineID
          if (product.productLineID) {
            return !(
              p.id === product.id && p.productLineID === product.productLineID
            );
          }
          // If no productLineID, match only by id
          return p.id !== product.id;
        })
      );
    }
  };

  // Serial number selection
  const handleSerialNoSelection = (
    productId,
    productLineID = null,
    serialNo,
    isSelected
  ) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) => {
        // Match logic based on whether productLineID exists
        const isMatch = productLineID
          ? product.id === productId && product.productLineID === productLineID
          : product.id === productId && !product.productLineID;

        if (isMatch) {
          const updatedSerialNos = isSelected
            ? [...product.selectedSerialNos, serialNo]
            : product.selectedSerialNos.filter((s) => s !== serialNo);

          return {
            ...product,
            selectedSerialNos: updatedSerialNos,
            returnQty: updatedSerialNos.length,
          };
        }
        return product;
      })
    );
  };

  // Quantity change
  const handleQtyChange = (productId, productLineID, qty) => {
    const numQty = Number(qty) || 0;

    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) => {
        // Match logic based on whether productLineID exists
        const isMatch = productLineID
          ? product.id === productId && product.productLineID === productLineID
          : product.id === productId && !product.productLineID;

        if (isMatch) {
          const saleProduct = SaleDetails?.Products.find((p) => {
            if (productLineID) {
              return p.id === productId && p.productLineID === productLineID;
            }
            return p.id === productId && !p.productLineID;
          });

          const maxReturnable = getReturnableProductQty(saleProduct);

          if (numQty > maxReturnable) {
            toast.error(`Return quantity cannot exceed ${maxReturnable}`);
            return { ...product, returnQty: maxReturnable };
          }

          return { ...product, returnQty: numQty };
        }
        return product;
      })
    );
  };

  // Amount change
  const handleAmountChange = (productId, productLineID, amount) => {
    const numAmount = Number(amount) || 0;

    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) => {
        // Match logic based on whether productLineID exists
        const isMatch = productLineID
          ? product.id === productId && product.productLineID === productLineID
          : product.id === productId && !product.productLineID;

        if (isMatch) {
          const returnQty = product.returnQty || 1;
          return { ...product, price: numAmount / returnQty };
        }
        return product;
      })
    );
  };

  // Calculate total return amount
  const calculateReturnTotal = () =>
    selectedProducts.reduce(
      (sum, product) => sum + (product.price * product.returnQty || 0),
      0
    );

  const selectAccounts = (account) => {
    setSelectedAccounts((prev) => [...prev, account]);
    const updated = [...accounts];
    const filteredAccounts = updated.filter((a) => a.value !== account.value);
    setAccounts(filteredAccounts);
  };

  const unselectAccount = (account) => {
    const updated = [...selectedAccounts];
    const filtered = updated.filter((a) => a.value !== account.value);
    setSelectedAccounts(filtered);
    setAccounts((prev) => [...prev, account]);
  };

  const handleAccountAmountChange = (accountId, value) => {
    let newVal = value === "" ? 0 : Number(value);

    setSelectedAccounts((prev) =>
      prev.map((acc) =>
        acc.value === accountId ? { ...acc, amount: newVal } : acc
      )
    );
  };

  const totalPaid = useMemo(
    () => selectedAccounts.reduce((acc, a) => acc + (a.amount || 0), 0),
    [selectedAccounts]
  );

  // Submit return
  const handleReturnSubmit = async (e, isRefund = false) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product to return");
      return;
    }

    // Validate products with serial numbers
    for (const product of selectedProducts) {
      const originalProduct = SaleDetails?.Products.find((p) => {
        // If product has productLineID, match both
        if (product.productLineID) {
          return (
            p.id === product.id && p.productLineID === product.productLineID
          );
        }
        // If no productLineID, match only by id
        return p.id === product.id && !p.productLineID;
      });

      if (originalProduct?.serialNos?.length > 0) {
        if (product.selectedSerialNos.length === 0) {
          toast.error(`Please select serial numbers for ${product.name}`);
          return;
        }
      } else {
        if (!product.returnQty || product.returnQty <= 0) {
          toast.error(`Please enter valid return quantity for ${product.name}`);
          return;
        }
      }
    }

    const returnTotal = calculateReturnTotal();
    setReturnData({ ...returnData, total: returnTotal });

    const returnPayload = {
      SaleReturn: {
        contactID: SaleDetails?.Customer?._id || null,
        saleID: id,
        total: returnTotal,
        paid: isRefund ? totalPaid : 0,
        note: returnData.note,
      },
      ReturnProduct: selectedProducts.map((product) => ({
        productID: product.id,
        productLineID: product.productLineID,
        qty: product.returnQty,
        amount: product.price,
        total: product.price * product.returnQty,
        serialNos: product.selectedSerialNos,
      })),
      ...(isRefund
        ? {
            payment: selectedAccounts.map((a) => ({
              accountID: a.value,
              accountName: a.label,
              amount: a.amount,
            })),
          }
        : {}),
    };

    try {
      setLoading(true);
      const response = await api.post(`${BaseURL}/SaleReturn`, returnPayload);

      if (response.data.status === "Success") {
        toast.success(
          isRefund
            ? "Return and refund processed successfully!"
            : "Sale return processed successfully!"
        );
        navigate(`/SaleReturnDetails/${response.data.salereturnID}`);
      } else {
        toast.error(response.data.message || "Failed to process sale return.");
      }
    } catch (err) {
      toast.error("Error submitting sale return. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getReturnableProductQty = (product) => {
    const soldQty = product.quantity || 0;

    const returnedQty =
      SaleDetails?.SaleReturns?.products
        ?.filter((p) => {
          // If product has productLineID, match both
          if (product.productLineID) {
            return (
              p.productID === product.id &&
              p.productLineID === product.productLineID
            );
          }
          // If no productLineID, match only by productID
          return p.productID === product.id && !p.productLineID;
        })
        ?.reduce((sum, p) => sum + (p.qty || 0), 0) || 0;

    return Math.max(0, soldQty - returnedQty);
  };

  const getReturnableProductSerials = (product) => {
    const soldSerials = product.serialNos || [];

    const returnedSerials =
      SaleDetails?.SaleReturns?.products
        ?.filter((p) => {
          // If product has productLineID, match both
          if (product.productLineID) {
            return (
              p.productID === product.id &&
              p.productLineID === product.productLineID
            );
          }
          // If no productLineID, match only by productID
          return p.productID === product.id && !p.productLineID;
        })
        ?.flatMap((p) => p.serialNos || []) || [];

    const returnableSerials = soldSerials.filter(
      (sn) => !returnedSerials.includes(sn)
    );

    return returnableSerials;
  };

  const isProductSelected = (product) => {
    return selectedProducts.some((p) => {
      // If product has productLineID, match both
      if (product.productLineID) {
        return p.id === product.id && p.productLineID === product.productLineID;
      }
      // If no productLineID, match only by id
      return p.id === product.id && !p.productLineID;
    });
  };

  if (!SaleDetails) return <div className="container mt-5">No data found.</div>;

  const hasCustomer =
    SaleDetails?.Customer && Object.keys(SaleDetails.Customer).length > 0;

  return (
    <div className="global_container">
      <div className="global_sub_container ">
        <h1 className="text-xl font-semibold mb-3">Sale Return</h1>

        {/* Customer & Sale Info */}
        <div className=" flex md:flex-row gap-3 flex-col justify-between ">
          {/* customer details  */}
          <div className="">
            <h1 className="text-xl mb-3">Customer Details</h1>
            {hasCustomer ? (
              <div className="flex flex-col gap-3">
                <p>
                  <strong>Name:</strong> {SaleDetails?.Customer.name}
                </p>
                <p>
                  <strong>Mobile:</strong> {SaleDetails?.Customer.mobile}
                </p>
                <p>
                  <strong>Address:</strong> {SaleDetails?.Customer.address}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No Customer (Walk-in Sale)</p>
            )}
          </div>
          {/* ref note  */}
          <div className="flex flex-col gap-3">
            <p>
              <strong>Date:</strong> {formatDate(SaleDetails?.SaleSummary.Date)}
            </p>
            <p>
              <strong>Reference:</strong> {SaleDetails?.SaleSummary.Reference}
            </p>
            {SaleDetails.SaleSummary?.note && (
              <p>
                <strong>Note:</strong> {SaleDetails?.SaleSummary.note}
              </p>
            )}
          </div>
          <div className="border border-gray-300 rounded-lg p-4 w-full md:w-64 shadow-sm">
            <h5 className="font-semibold mb-3 text-center">Sale Summary</h5>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-gray-700">Total:</label>
                <input
                  type="text"
                  value={SaleDetails?.SaleSummary.total.toLocaleString()}
                  disabled
                  className="md:w-24 w:50  text-right bg-gray-100 border border-gray-300 rounded px-2 py-1 text-gray-600"
                />
              </div>

              {SaleDetails?.SaleSummary.discount > 0 && (
                <div className="flex justify-between items-center">
                  <label className="text-gray-700">Discount:</label>
                  <input
                    type="text"
                    value={SaleDetails?.SaleSummary.discount}
                    disabled
                    className="md:w-24 w:50  text-right bg-gray-100 border border-gray-300 rounded px-2 py-1 text-gray-600"
                  />
                </div>
              )}

              <div className="flex justify-between items-center">
                <label className="text-gray-700">Grand Total:</label>
                <input
                  type="text"
                  value={SaleDetails?.SaleSummary.grandTotal.toLocaleString()}
                  disabled
                  className="md:w-24 w:50  text-right bg-gray-100 border border-gray-300 rounded px-2 py-1 text-gray-600"
                />
              </div>

              <div className="flex justify-between items-center">
                <label className="text-gray-700">Paid Amount:</label>
                <input
                  type="text"
                  value={SaleDetails?.SaleSummary?.paid.toLocaleString()}
                  disabled
                  className="md:w-24 w:50  text-right bg-gray-100 border border-gray-300 rounded px-2 py-1 text-gray-600"
                />
              </div>

              {SaleDetails.SaleSummary?.dueAmount && (
                <div className="flex justify-between items-center">
                  <label className="text-gray-700">Due Amount:</label>
                  <input
                    type="text"
                    value={SaleDetails?.SaleSummary?.dueAmount.toLocaleString()}
                    disabled
                    className="md:w-24 w:50  text-right bg-gray-100 border border-gray-300 rounded px-2 py-1 text-gray-600"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Table */}
        <h5 className="text-xl font-semibold mb-3 mt-5">Products for Return</h5>
        <div className=" overflow-x-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr>
                <th className="global_th">#</th>
                <th className="global_th">Name</th>
                <th className="global_th">Sale Qty</th>
                <th className="global_th">Returnable Qty</th>
                <th className="global_th">Price</th>
                <th className="global_th">Total</th>
                <th className="global_th">Select</th>
                <th className="global_th">Return Qty</th>
                <th className="global_th">Return Amount</th>
                <th className="global_th">Serial Nos</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {SaleDetails?.Products.map((product, index) => {
                const selectedProduct = selectedProducts.find((p) => {
                  // If product has productLineID, match both
                  if (product.productLineID) {
                    return (
                      p.id === product.id &&
                      p.productLineID === product.productLineID
                    );
                  }
                  // If no productLineID, match only by id
                  return p.id === product.id && !p.productLineID;
                });
                const returnableQty = getReturnableProductQty(product);
                const returnableSerials = getReturnableProductSerials(product);
                const hasSerialNos = product.serialNos?.length > 0;

                return (
                  <tr
                    key={`${product.id}-${
                      product.productLineID || "null"
                    }-${index}`}
                  >
                    <td className="global_td text-center">{index + 1}</td>
                    <td className="global_td">{product.name}</td>
                    <td className="global_td text-center">
                      {product.quantity}
                    </td>
                    <td className="global_td text-center">{returnableQty}</td>
                    <td className="global_td">
                      {product.price.toLocaleString()}
                    </td>
                    <td className="global_td">
                      {product.total.toLocaleString()}
                    </td>
                    <td className="global_td text-center">
                      {returnableQty > 0 && (
                        <input
                          type="checkbox"
                          checked={isProductSelected(product)}
                          onChange={(e) =>
                            handleProductSelection(product, e.target.checked)
                          }
                        />
                      )}
                    </td>
                    <td className="global_td">
                      <input
                        type="number"
                        value={selectedProduct?.returnQty || ""}
                        onChange={(e) =>
                          handleQtyChange(
                            product.id,
                            product.productLineID,
                            e.target.value
                          )
                        }
                        className="global_input w-25"
                        disabled={
                          hasSerialNos ||
                          returnableQty === 0 ||
                          !isProductSelected(product)
                        }
                        min="0"
                        max={returnableQty}
                      />
                    </td>
                    <td className="global_td">
                      <input
                        type="number"
                        value={
                          selectedProduct
                            ? (
                                selectedProduct.price *
                                  selectedProduct.returnQty || 0
                              ).toFixed(2)
                            : ""
                        }
                        onChange={(e) =>
                          handleAmountChange(
                            product.id,
                            product.productLineID,
                            e.target.value
                          )
                        }
                        className="global_input w-25"
                        disabled={!isProductSelected(product)}
                      />
                    </td>
                    <td className="global_td">
                      {hasSerialNos &&
                        returnableSerials.map((serial, idx) => (
                          <div
                            className="flex items-center justify-between gap-2"
                            key={idx}
                          >
                            <label>{serial}</label>
                            {isProductSelected(product) && (
                              <input
                                type="checkbox"
                                checked={
                                  selectedProduct?.selectedSerialNos?.includes(
                                    serial
                                  ) || false
                                }
                                onChange={(e) =>
                                  handleSerialNoSelection(
                                    product.id,
                                    product.productLineID,
                                    serial,
                                    e.target.checked
                                  )
                                }
                              />
                            )}
                          </div>
                        ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="text-end text-danger mb-3">
          <h5 className="text-xl font-semibold text-green-600 pt-3">
            Total Return Amount: {calculateReturnTotal().toFixed(2)}
          </h5>
        </div>

        {/* Return Form */}
        <form onSubmit={(e) => handleReturnSubmit(e)}>
          <div className="mb-3">
            <h1 className="text-xl font-semibold mb-3">Return Details</h1>
            <label>Return Note:</label>
            <textarea
              value={returnData.note}
              onChange={(e) =>
                setReturnData({ ...returnData, note: e.target.value })
              }
              className="form-control global_input"
              rows="2"
            />
          </div>
          {/* Paid Amount With Multiple Bank Account*/}
          <div className="flex flex-col gap-2">
            {selectedAccounts.map((account, index) => {
              return (
                <div className="flex justify-between" key={index}>
                  <div className="flex items-center w-full justify-between">
                    <h1 className="text-nowrap">
                      Payment By - {account.label}
                    </h1>
                    {selectedAccounts.length === 1 ? null : (
                      <button
                        type="button"
                        className="pr-10"
                        onClick={() => unselectAccount(account)}
                      >
                        <IoMdCloseCircle size={20} color="red" />
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={account.amount === 0 ? "" : account.amount}
                    onChange={(e) =>
                      handleAccountAmountChange(account.value, e.target.value)
                    }
                    className="global_input w-40 rounded-sm text-right"
                  />
                </div>
              );
            })}
          </div>

          {accounts?.length > 0 && (
            <div className="my-2">
              <Select
                options={accounts}
                value={null}
                onChange={(account) => {
                  selectAccounts(account);
                }}
                placeholder="Select More Account"
                classNamePrefix="react-select"
                styles={getReactSelectStyles()}
              />
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:justify-start gap-2 w-full my-2">
            {!!SaleDetails?.Customer._id && (
              <button
                type="submit"
                className="global_button w-full sm:w-auto"
                disabled={loading || selectedProducts.length === 0}
              >
                {loading ? "Processing..." : "Submit Return"}
              </button>
            )}

            <button
              type="button"
              disabled={
                loading ||
                calculateReturnTotal() > totalPaid ||
                selectedProducts.length === 0
              }
              onClick={(e) => handleReturnSubmit(e, true)}
              className={`global_button w-full sm:w-auto ${
                calculateReturnTotal() > totalPaid ||
                selectedProducts.length === 0
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              {loading ? "Processing..." : "Return & Refund"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleReturn;
