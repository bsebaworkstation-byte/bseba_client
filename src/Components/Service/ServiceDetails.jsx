import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { printElement } from "../../Helper/Printer";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import { numberToWords } from "../../Helper/UI/NumberToWord";
import { formatCurrency } from "../../Helper/formatCurrency";

const ServiceDetails = () => {
  const { setGlobalLoader } = loadingStore();
  const printRef = useRef();
  const { id } = useParams();
  const [serviceDetails, setServiceDetails] = useState(null);
  const [error, setError] = useState(null);
  const [showHead, setShowHead] = useState(true);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      setGlobalLoader(true);
      try {
        const response = await api.get(`/ServicDetails/${id}`);
        setServiceDetails(response.data.data);
      } catch (err) {
        setError("Failed to load service details. Please try again later.");
      } finally {
        setGlobalLoader(false);
      }
    };
    fetchServiceDetails();
  }, [id, setGlobalLoader]);

  if (error) {
    return <div className="p-6 text-red-600 dark:text-red-400">{error}</div>;
  }

  if (!serviceDetails) {
    return (
      <div className="p-6 text-gray-500 dark:text-gray-300">Loading...</div>
    );
  }

  const businessDetails =
    JSON.parse(localStorage.getItem("businessDetails")) || {};
  const { businessName, contactNumber, address, logo, invoiceFooter } =
    businessDetails;

  const handlePrint = () => {
    printElement(printRef);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Delivered': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      ref={printRef}
      className="px-5 min-w-3xl overflow-x-auto max-w-4xl mx-auto"
    >
      {/* Header Toggle */}
      <div className="mb-3 print:hidden">
        <label className="flex items-center gap-2 text-sm">
          <input
            className="accent-blue-500"
            type="checkbox"
            checked={showHead}
            onChange={() => setShowHead(!showHead)}
          />
          <span className="dark:text-gray-300">With Head</span>
        </label>
      </div>

      {/* Logo */}
      {showHead && logo && (
        <div className="flex justify-center items-center">
          <img className="w-16 h-16" src={logo} alt="Business Logo" />
        </div>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-end mb-6">
        <div>
          {showHead && (
            <div>
              <h2 className="font-bold text-xl">{businessName || "Beseba.com"}</h2>
              {contactNumber && <p className="text-sm">{contactNumber}</p>}
              {address && <p className="dark:text-gray-300">{address}</p>}
            </div>
          )}

          {/* Customer Information */}
          <div className="mt-4">
            <p className="font-semibold text-green-600 dark:text-green-400">
              Customer Details
            </p>
            <p className="font-medium dark:text-gray-300">
              {serviceDetails.Customer?.name || "N/A"}
            </p>
            {serviceDetails.Customer?.mobile && (
              <p className="text-sm dark:text-gray-400">
                Mobile: {serviceDetails.Customer.mobile}
              </p>
            )}
            {serviceDetails.Customer?.address && (
              <p className="text-sm dark:text-gray-400">
                Address: {serviceDetails.Customer.address}
              </p>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className={`${getStatusBadge(serviceDetails.Status)} rounded-tl-4xl px-6 py-2`}>
            <h2 className="text-xl font-semibold">
              Service {serviceDetails.Status}
            </h2>
          </div>
          <p className="text-sm mt-2">
            <span className="font-medium">Service No:</span> {serviceDetails.No || "N/A"}
          </p>
          <p className="text-sm">
            <span className="font-medium">Created:</span> {formatDate(serviceDetails.createdAt)}
          </p>
          {serviceDetails.DeliveryDate && (
            <p className="text-sm">
              <span className="font-medium">Delivery Date:</span> {formatDate(serviceDetails.DeliveryDate)}
            </p>
          )}
        </div>
      </div>

      {/* Service Details Card */}
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
        <div className="bg-green-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-300 dark:border-gray-700">
          <h3 className="font-semibold text-green-700 dark:text-green-300">
            Service Information
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {/* Left Column */}
          <div className="space-y-3">
            <div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Service Name:</span>
              <p className="dark:text-gray-300">{serviceDetails.Name}</p>
            </div>
            
            {serviceDetails.Serial && (
              <div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Serial/IMEI:</span>
                <p className="dark:text-gray-300">{serviceDetails.Serial}</p>
              </div>
            )}
            
            {serviceDetails.Problem && (
              <div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Problem:</span>
                <p className="dark:text-gray-300">{serviceDetails.Problem}</p>
              </div>
            )}
            
            {serviceDetails.Condition && (
              <div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Device Condition:</span>
                <p className="dark:text-gray-300">{serviceDetails.Condition}</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            {serviceDetails.Password && (
              <div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Device Password:</span>
                <p className="dark:text-gray-300">{serviceDetails.Password}</p>
              </div>
            )}
            
            {serviceDetails.TNote && (
              <div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Technician Note:</span>
                <p className="dark:text-gray-300">{serviceDetails.TNote}</p>
              </div>
            )}
            
            {serviceDetails.note && (
              <div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Additional Note:</span>
                <p className="dark:text-gray-300">{serviceDetails.note}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Summary Table */}
      <div className="flex justify-end mt-4">
        <div className="w-full md:w-1/2">
          <table className="w-full border border-gray-300 dark:border-gray-700 text-sm">
            <thead className="bg-green-50 dark:bg-gray-800">
              <tr>
                <th colSpan="2" className="border dark:border-gray-700 px-4 py-2 text-left text-green-700 dark:text-green-300">
                  Payment Summary
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="border dark:border-gray-700 px-4 py-2 text-left font-medium">
                  Total Cost:
                </th>
                <td className="border dark:border-gray-700 px-4 py-2 text-right">
                  {formatCurrency(serviceDetails.Cost)}
                </td>
              </tr>
              <tr>
                <th className="border dark:border-gray-700 px-4 py-2 text-left font-medium">
                  Paid Amount:
                </th>
                <td className="border dark:border-gray-700 px-4 py-2 text-right text-green-600 dark:text-green-400">
                  {formatCurrency(serviceDetails.Paid)}
                </td>
              </tr>
              <tr>
                <th className="border dark:border-gray-700 px-4 py-2 text-left font-medium">
                  Due Amount:
                </th>
                <td className={`border dark:border-gray-700 px-4 py-2 text-right font-semibold ${
                  serviceDetails.Due > 0 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {formatCurrency(serviceDetails.Due)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Amount in Words */}
      {serviceDetails.Cost > 0 && (
        <div className="mt-4">
          <p className="text-sm dark:text-gray-300">
            <span className="font-semibold">Total Amount in Words:</span>{" "}
            {numberToWords(serviceDetails.Cost)} Taka Only
          </p>
        </div>
      )}

      {/* Signatures */}
      <div className="mt-16 flex justify-between items-center">
        <div className="text-center">
          <p className="text-xs border-t-2 border-gray-300 dark:border-gray-600 pt-1 px-8">
            Customer Signature
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs border-t-2 border-gray-300 dark:border-gray-600 pt-1 px-8">
            Authorized Signature
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8">
        {invoiceFooter && (
          <p className="text-xs text-center text-gray-600 dark:text-gray-400 mb-2">
            {invoiceFooter}
          </p>
        )}
        <p className="text-xs text-center border-t border-gray-300 dark:border-gray-700 pt-2">
          <span className="text-gray-500">Software Developed by</span>{" "}
          <span className="font-semibold">Beseba.com</span>
        </p>
      </div>

      {/* Print Button */}
      <div className="text-center print:hidden mt-6">
        <button
          onClick={handlePrint}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-colors duration-200"
        >
          Print Service Details
        </button>
      </div>
    </div>
  );
};

export default ServiceDetails;