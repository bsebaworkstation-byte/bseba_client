import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getBusinessDetails } from "../../Helper/SessionHelper";
import { printElement } from "../../Helper/Printer";
import api from "../../Helper/axios_resonse_interceptor";

const SaleReturnDetailsV2 = () => {
  const businessDetails = getBusinessDetails();
  const { id } = useParams();

  const [saleReturnDetails, setSaleReturnDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const componentRef = useRef();

  useEffect(() => {
    const fetchSaleReturnDetails = async () => {
      setLoading(true);

      try {
        const response = await api.get(`/SaleReturnDetails/${id}`);
        setSaleReturnDetails(response.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load sale return details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSaleReturnDetails();
  }, [id]);

  const formatNum = (num) => Number(num || 0).toLocaleString();

  // Merge same product IDs into one row
  const groupedProducts = useMemo(() => {
    if (!saleReturnDetails) return [];

    const grouped = {};

    // Group Sale Products
    saleReturnDetails?.saleProducts?.forEach((product) => {
      const id = product?.productID;

      if (!grouped[id]) {
        grouped[id] = {
          productID: id,
          name: product?.name,
          qtySold: 0,
          returnQty: 0,
          price: product?.price || 0,
          saleTotal: 0,
        };
      }

      grouped[id].qtySold += Number(product?.qtySold || 0);
      grouped[id].saleTotal += Number(product?.total || 0);
    });

    // Add Return Quantities
    saleReturnDetails?.saleReturnProducts?.forEach((returnProduct) => {
      const id = returnProduct?.productID;

      if (!grouped[id]) {
        grouped[id] = {
          productID: id,
          name: returnProduct?.name,
          qtySold: 0,
          returnQty: 0,
          price: returnProduct?.amount || 0,
          saleTotal: 0,
        };
      }

      grouped[id].returnQty += Number(returnProduct?.qty || 0);
    });

    // Final Calculations
    return Object.values(grouped).map((product) => {
      const netSale = product.qtySold - product.returnQty;

      return {
        ...product,
        netSale,
        finalTotal: netSale * product.price,
      };
    });
  }, [saleReturnDetails]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  if (!saleReturnDetails) return null;

  return (
    <div className="global_container">
      {/* Print Style */}
      <style>
        {`
          @media print {
            .print-grid-3 {
              grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            }

            .no-print {
              display: none !important;
            }

            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>

      <div ref={componentRef} className="text-center">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {businessDetails?.businessName}
          </h1>

          <p className="text-sm text-gray-600 dark:text-gray-100">
            {businessDetails?.contactNumber}
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-100">
            {businessDetails?.address}
          </p>

          <h2 className="text-lg font-bold text-green-600 mt-3">
            Sale Return Details
          </h2>
        </div>

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-5 print-grid-3">
          {/* Customer Details */}
          <div className="text-left">
            <h4 className="font-semibold mb-1 border-b border-gray-300 text-gray-800 text-lg">
              Customer Details
            </h4>

            <p>
              <strong>Name:</strong>{" "}
              {saleReturnDetails?.contact?.name}
            </p>

            <p>
              <strong>Mobile:</strong>{" "}
              {saleReturnDetails?.contact?.mobile}
            </p>

            <p>
              <strong>Address:</strong>{" "}
              {saleReturnDetails?.contact?.address}
            </p>
          </div>

          {/* Sale Information */}
          <div className="text-left">
            <h4 className="font-semibold mb-1 border-b border-gray-300 text-gray-800 text-lg">
              Sale Information
            </h4>

            <p>
              <strong>Date:</strong>{" "}
              {new Date(
                saleReturnDetails?.saleDetails?.CreatedDate
              ).toLocaleDateString()}
            </p>

            <p>
              <strong>Reference:</strong>{" "}
              {saleReturnDetails?.saleDetails?.referenceNo}
            </p>

            <p>
              <strong>Total:</strong>{" "}
              {formatNum(saleReturnDetails?.saleDetails?.total)}
            </p>
          </div>

          {/* Return Summary */}
          <div className="text-left">
            <h4 className="font-semibold text-lg mb-1 border-b border-gray-300 text-gray-800">
              Sale Return Summary
            </h4>

            <p>
              <strong>Date:</strong>{" "}
              {new Date(
                saleReturnDetails?.CreatedDate
              ).toLocaleDateString()}
            </p>

            <p>
              <strong>Reference:</strong>{" "}
              {saleReturnDetails?.referenceNo}
            </p>

            <p>
              <strong>Created By:</strong>{" "}
              {saleReturnDetails?.userDetails?.fullName}
            </p>
          </div>
        </div>

        {/* Products Table */}
        <div className="text-left mb-6">
          <h4 className="font-semibold text-gray-800 mb-1">
            Sale Products
          </h4>

          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr className="text-center">
                <th className="border px-2 py-1 w-8">#</th>
                <th className="border px-2 py-1">Product</th>
                <th className="border px-2 py-1">Sale Quantity</th>
                <th className="border px-2 py-1">Return Quantity</th>
                <th className="border px-2 py-1">Net Sale</th>
                <th className="border px-2 py-1">Price</th>
                <th className="border px-2 py-1">Total</th>
              </tr>
            </thead>

            <tbody>
              {groupedProducts?.length > 0 ? (
                groupedProducts.map((product, i) => (
                  <tr key={i} className="text-center">
                    <td className="border px-2 py-1">
                      {i + 1}
                    </td>

                    <td className="border px-2 py-1">
                      {product?.name}
                    </td>

                    <td className="border px-2 py-1">
                      {product?.qtySold}
                    </td>

                    <td className="border px-2 py-1">
                      {product?.returnQty}
                    </td>

                    <td className="border px-2 py-1">
                      {product?.netSale}
                    </td>

                    <td className="border px-2 py-1">
                      {formatNum(product?.price)}
                    </td>

                    <td className="border px-2 py-1">
                      {formatNum(product?.finalTotal)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center border py-2 text-gray-500"
                  >
                    No Sale Products Found
                  </td>
                </tr>
              )}

              {/* Footer Total */}
              <tr>
                <td></td>
                <td></td>

                <td
                  colSpan="4"
                  className="text-right border font-semibold px-2"
                >
                  Sale Total
                </td>

                <td className="border px-2 text-center font-semibold">
                  {formatNum(
                    groupedProducts.reduce(
                      (sum, product) =>
                        sum + Number(product?.finalTotal || 0),
                      0
                    )
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Button */}
      <div className="text-center mt-5 no-print">
        <button
          onClick={() =>
            printElement(componentRef, "Sale Return Details")
          }
          className="global_button"
        >
          Print
        </button>
      </div>
    </div>
  );
};

export default SaleReturnDetailsV2;