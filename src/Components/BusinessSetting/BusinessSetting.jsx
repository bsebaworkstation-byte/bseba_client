import React, { useEffect, useState, useCallback, useMemo } from "react";
import Select from "react-select";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import {
  getBusinessDetails,
  setBusinessDetails,
} from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import ToggleSwitch from "../../Helper/UI/ToggleSwitch";
import ImageUploaderInput from "../../Helper/UI/ImageUploaderInput";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import api from "../../Helper/axios_resonse_interceptor";
import { AlertCircle, Download, Loader, Save } from "lucide-react";

const BusinessSetting = () => {
  const { setGlobalLoader } = loadingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPosPrinter, setSelectedPosPrinter] = useState(null);
  const [selectedDefaultInvoiceNo, setSelectedDefaultInvoiceNo] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    smsInvoice: 0,
    warranty: 0,
    vat: 0,
    ProductCode: "0",
    logo: "",
    invoiceFooter: "",
    tin: "",
    tagline: "",
    email: "",
    website: "",
    currency: "Taka",
    vatPercentage: 0,
  });

  const printerOptions = useMemo(() => [
    { label: "58mm", value: 58 },
    { label: "80mm", value: 80 },
  ], []);

  const invoiceOptions = useMemo(() => [
    { label: "Invoice 1", value: 1 },
    { label: "Invoice 2", value: 2 },
    { label: "Invoice 3", value: 3 },
    { label: "Invoice 4", value: 4 },
    { label: "Invoice 5", value: 5 },
    { label: "Invoice 6", value: 6 },
    { label: "Invoice 9", value: 9 },
    { label: "Bangla Invoice", value: 7 },
    { label: "Invocie With Vat", value: 10 },
    { label: "Invoice 11", value: 11 },
  ], []);

  // Initial load
  useEffect(() => {
    const loadBusinessDetails = () => {
      const businessDetails = getBusinessDetails();
      setFormData({
        name: businessDetails.businessName || "",
        address: businessDetails.address || "",
        mobile: businessDetails.contactNumber || "",
        smsInvoice: Number(businessDetails.smsInvoice) || 0,
        ProductCode: businessDetails.ProductCode || "0",
        warranty: Number(businessDetails.warranty) || 0,
        vat: Number(businessDetails.vat) || 0,
        logo: businessDetails.logo || "",
        invoiceFooter: businessDetails.invoiceFooter || "",
        tin: businessDetails.tin || "",
        tagline: businessDetails.tagline || "",
        email: businessDetails.email || "",
        website: businessDetails.website || "",
        currency: businessDetails.currency || "৳",
        vatPercentage: businessDetails.vatPercentage || 0,
      });

      if (businessDetails.posInvoice) {
        setSelectedPosPrinter({
          value: businessDetails.posInvoice,
          label: `${businessDetails.posInvoice}mm`,
        });
      }

      setSelectedDefaultInvoiceNo({
        value: businessDetails.invoice || 1,
        label: `Invoice ${businessDetails.invoice || 1}`,
      });
    };

    loadBusinessDetails();
  }, []);

  const handleChange = useCallback((eOrField, maybeValue) => {
    if (typeof eOrField === "string") {
      setFormData((prev) => ({
        ...prev,
        [eOrField]: maybeValue,
      }));
    } else {
      const { name, value } = eOrField.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        businessName: formData.name,
        contactNumber: formData.mobile,
        ...(formData.logo ? { logo: formData.logo } : {}),
        ...(selectedPosPrinter ? { posInvoice: selectedPosPrinter.value } : {}),
        ...(selectedDefaultInvoiceNo
          ? { invoice: selectedDefaultInvoiceNo.value }
          : {}),
      };

      const response = await api.post(`/UpdateBusiness`, payload);

      if (response.data.status === "Success") {
        SuccessToast("Business information updated successfully!");
        setBusinessDetails(response.data.data);
      } else {
        ErrorToast("Failed to update business information.");
      }
    } catch (error) {
      console.error("Update error:", error);
      ErrorToast(
        error.response?.data?.message || "An error occurred while updating",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const businessDetails = getBusinessDetails();
  const isPackageActive = businessDetails?.packageName === "Active";

  const downloadBackup = async () => {
    try {
      setGlobalLoader(true);

      const response = await api.get("/BusinessBackup", {
        responseType: "blob",
        validateStatus: () => true
      });

      if (response.status !== 200) {
        const text = await response.data.text();
        const json = JSON.parse(text);
        ErrorToast(json.message);
        return;
      }

      const blob = new Blob([response.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "business_backup.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();

      SuccessToast("Backup downloaded successfully");

    } catch (error) {
      console.error(error);
      ErrorToast("Backup failed");
    } finally {
      setGlobalLoader(false);
    }
  };

  const selectStyles = useMemo(() => getReactSelectStyles(), []);

  return (
    <div className="global_container">
      <form onSubmit={handleSubmit} className="global_sub_container">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Business Settings</h2>

          <span className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${isPackageActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
            }
          `}>
            {isPackageActive ? "Active Package" : "Inactive Package"}
          </span>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Business Name */}
          <div className="space-y-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="global_input"
              required
              placeholder="Enter business name"
            />
          </div>

          {/* Contact Number */}
          <div className="space-y-1">
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
              Contact Number
            </label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="global_input"
              placeholder="Enter contact number"
            />
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="global_input"
              placeholder="Enter address"
            />
          </div>

          {/* Currency Input */}
          <div className="space-y-1">
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
              Currency
            </label>
            <input
              type="text"
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="global_input"
              placeholder="Enter currency"
            />
          </div>

          {/* VAT Percentage Input */}
          <div className="space-y-1">
            <label htmlFor="vatPercentage" className="block text-sm font-medium text-gray-700">
              VAT Percentage
            </label>
            <input
              type="number"
              id="vatPercentage"
              name="vatPercentage"
              value={formData.vatPercentage}
              onChange={handleChange}
              className="global_input"
              placeholder="Enter VAT percentage"
            />
          </div>

          {/* Tin */}
          <div className="space-y-1">
            <label htmlFor="tin" className="block text-sm font-medium text-gray-700">
              TIN Number
            </label>
            <input
              type="text"
              id="tin"
              name="tin"
              value={formData.tin}
              onChange={handleChange}
              className="global_input"
              placeholder="Enter TIN"
            />
          </div>

          {/* Tagline */}
          <div className="space-y-1">
            <label htmlFor="tagline" className="block text-sm font-medium text-gray-700">
              Tag Line
            </label>
            <input
              type="text"
              id="tagline"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              className="global_input"
              placeholder="Enter tagline"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="string"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="global_input"
              placeholder="Enter email"
            />
          </div>

          {/* Website */}
          <div className="space-y-1">
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <input
              type="string"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="global_input"
              placeholder="Enter website URL"
            />
          </div>

          {/* Invoice Footer */}
          <div className="space-y-1 md:col-span-2 lg:col-span-3">
            <label htmlFor="invoiceFooter" className="block text-sm font-medium text-gray-700">
              Invoice Footer
            </label>
            <textarea
              id="invoiceFooter"
              name="invoiceFooter"
              value={formData.invoiceFooter}
              onChange={handleChange}
              className="global_input min-h-[80px]"
              placeholder="Enter invoice footer text"
              rows={3}
            />
          </div>
        </div>

        {/* Logo and Toggle Section */}
        <div className="flex w-full flex-col justify-center items-start gap-4 md:flex-row mb-6">
          {/* Logo Upload */}
          <div className="border flex w-full justify-center rounded-md border-gray-200 shadow-sm p-4">
            <ImageUploaderInput
              formData={formData}
              setFormData={setFormData}
              title="Upload Your Logo"
            />
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-1 w-full sm:grid-cols-2 xl:grid-cols-3 gap-3">
            <div className="border p-3 rounded-md border-gray-200 shadow-sm">
              <ToggleSwitch
                label="SMS Invoice"
                value={formData.smsInvoice}
                onChange={(newValue) =>
                  handleChange("smsInvoice", Number(newValue))
                }
              />
            </div>

            <div className="border p-3 rounded-md border-gray-200 shadow-sm">
              <ToggleSwitch
                label="Product Code"
                value={Number(formData.ProductCode)}
                onChange={(newValue) =>
                  handleChange("ProductCode", String(newValue))
                }
              />
            </div>

            <div className="border p-3 rounded-md border-gray-200 shadow-sm">
              <ToggleSwitch
                label="Warranty"
                value={formData.warranty}
                onChange={(newValue) =>
                  handleChange("warranty", Number(newValue))
                }
              />
            </div>

            <div className="border p-3 rounded-md border-gray-200 shadow-sm">
              <ToggleSwitch
                label="Vat On Product"
                value={formData.vat}
                onChange={(newValue) =>
                  handleChange("vat", Number(newValue))
                }
              />
            </div>


            {/* Pos Printer Size */}
            <div className="border p-3 rounded-md border-gray-200 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pos Printer Size
              </label>
              <Select
                options={printerOptions}
                value={selectedPosPrinter}
                onChange={setSelectedPosPrinter}
                classNamePrefix="react-select"
                placeholder="Select printer size"
                styles={selectStyles}
                isDisabled={!isPackageActive}
              />
            </div>

            {/* Default Invoice */}
            <div className="border p-3 rounded-md border-gray-200 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Invoice No
              </label>
              <Select
                options={invoiceOptions}
                value={selectedDefaultInvoiceNo}
                onChange={setSelectedDefaultInvoiceNo}
                classNamePrefix="react-select"
                placeholder="Select invoice"
                styles={selectStyles}
                isDisabled={!isPackageActive}
              />
            </div>

            {/* Empty div for balance */}

          </div>
        </div>

        {/* Inactive Package Warning */}
        {!isPackageActive && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-amber-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Your package is inactive. Please renew to access all features.</span>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Backup Download Button */}
          <button
            type="button"
            onClick={downloadBackup}
            disabled={!isPackageActive}
            className={`
              global_button 
              flex items-center gap-2
              ${!isPackageActive
                ? "opacity-50 cursor-not-allowed bg-gray-300"
                : "bg-blue-600 hover:bg-blue-700 text-white"
              }
            `}
          >
            <Download className="w-4 h-4" />
            Backup Download
          </button>

          {/* Update Button */}
          <button
            type="submit"
            disabled={isLoading || !isPackageActive}
            className={`
              global_button 
              min-w-[140px]
              flex items-center justify-center gap-2
              ${!isPackageActive ? "opacity-50 cursor-not-allowed bg-gray-300" : ""}
              ${isLoading ? "cursor-wait" : ""}
            `}
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Update Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessSetting;