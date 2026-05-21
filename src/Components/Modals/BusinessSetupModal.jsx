import React, { useEffect, useState } from "react";
import openCloseStore from "../../Zustand/OpenCloseStore";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import {
  getBusinessDetails,
  setBusinessDetails,
} from "../../Helper/SessionHelper"; // make sure you have this
import { FaWallet } from "react-icons/fa"; // since you used <FaWallet />
import loadingStore from "../../Zustand/LoadingStore";
import Select from "react-select";
import ToggleSwitch from "../../Helper/UI/ToggleSwitch";
import ImageUploaderInput from "../../Helper/UI/ImageUploaderInput";
import { getReactSelectStyles } from "../../Helper/reactSelectStyles";
import api from "../../Helper/axios_resonse_interceptor";

const BusinessSetupModal = () => {
  const { businessSetupModal, setBusinessSetupModal } = openCloseStore();
  const { setGlobalLoader } = loadingStore();
  const [districts, setDistricts] = useState([]);
  const [thanas, setThanas] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedThana, setSelectedThana] = useState(null);
  // Input change handler
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    smsInvoice: 0,
    warranty: 0, // নতুন ফিল্ড
    logo: "",
  });
  const fetchDistricts = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/GetDistrict`);
      if (res.data.status === "Success") {
        const formatted = res.data.data.map((d) => ({
          label: d.name,
          value: d._id,
          ...d,
        }));
        setDistricts(formatted);
      } else {
        ErrorToast(res.data.error);
      }
    } catch (error) {
      console.log(error);
      ErrorToast(error.message);
    } finally {
      setGlobalLoader(false);
    }
  };

  const fetchThanaByDistrictID = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/GetThanaByDistrictID/${selectedDistrict.value}`
      );
      if (res.data.status === "Success") {
        const formatted = res.data.data.map((t) => ({
          label: t.name,
          value: t._id,
          ...t,
        }));
        setThanas(formatted);
      } else {
        ErrorToast(res.data.error);
      }
    } catch (error) {
      console.log(error);
      ErrorToast(error.message);
    } finally {
      setGlobalLoader(false);
    }
  };
  // Disable background scroll when modal is open
  useEffect(() => {
    if (businessSetupModal) {
      const businessDetails = getBusinessDetails();

      setFormData({
        name: businessDetails.businessName,
        address: businessDetails.address,
        mobile: businessDetails.contactNumber,
        smsInvoice: Number(businessDetails.smsInvoice),
        warranty: Number(businessDetails.warranty),
        logo: businessDetails.logo,
      });

      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [businessSetupModal]);

  useEffect(() => {
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      setSelectedThana(null);
      fetchThanaByDistrictID(selectedDistrict.value);
    }
  }, [selectedDistrict]);

  const handleChange = (eOrField, maybeValue) => {
    if (typeof eOrField === "string") {
      // ToggleSwitch বা custom call
      const field = eOrField;
      const value =
        typeof maybeValue === "string" && !isNaN(maybeValue)
          ? Number(maybeValue)
          : maybeValue;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      // Normal input (event-based)
      const { name, value } = eOrField.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      mobile: "",
      address: "",
      warranty: 0,
      smsInvoice: 0,
    });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalLoader(true);

    if (!selectedDistrict) {
      return ErrorToast("District Must be selected");
    }
    if (!selectedThana) {
      return ErrorToast("Thana Must be selected");
    }

    try {
      const payload = {
        ...formData,
        districtID: selectedDistrict.value,
        thanaID: selectedThana.value,
        businessName: formData.name,
        ...(formData.logo ? { logo: formData.logo } : {}),
      };
      const response = await api.post(`/UpdateBusiness`, payload);

      if (response.data.status === "Success") {
        SuccessToast("Business information updated successfully!");
        setBusinessDetails(response.data.data);
        setBusinessSetupModal(false);
      } else {
        ErrorToast("Failed to update business information.");
      }
    } catch (error) {
      console.error("Update error:", error);
      ErrorToast(
        error.response?.data?.message || "An error occurred while updating"
      );
    } finally {
      setGlobalLoader(false);
    }
  };

  if (!businessSetupModal) return null;

  return (
    <div
      onClick={() => setBusinessSetupModal(false)}
      className="fixed inset-0 z-50 bg-[#0000006c] flex items-center justify-center"
    >
      <div
        className="flex relative text-black dark:text-white flex-col bg-white dark:bg-[#1E2939] rounded-lg p-6 max-w-lg w-full mx-4 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <div className="flex justify-between">
          <h2 className="text-lg  font-bold mb-4"> Business Setup</h2>
          <button
            className="global_button_red"
            onClick={() => {
              setBusinessSetupModal(false);
            }}
          >
            close
          </button>
        </div>
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="global_sub_container flex flex-col gap-5"
        >
          <h2 className="text-2xl font-bold mb-6">Business Settings</h2>
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium  mb-1">
              Business Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>

          {/* Mobile Field */}
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium  mb-1">
              Contact Number
            </label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="global_input"
            />
          </div>

          {/* Address Field */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-1">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="global_input"
            />
          </div>

          <div className="col-span-8 lg:col-span-4">
            <label className="block text-sm font-medium mb-1">
              District <span className="text-red-500"> *</span>
            </label>
            <Select
              options={districts}
              value={selectedDistrict}
              onChange={setSelectedDistrict}
              placeholder="Select District"
              classNamePrefix="react-select"
              // onInputChange={(val) => setSearchCustomerKeyword(val)}
              menuPortalTarget={document.body}
              styles={getReactSelectStyles()}
              isClearable
            />
          </div>

          <div className="col-span-8 lg:col-span-4">
            <label className="block text-sm font-medium mb-1">
              Thana <span className="text-red-500"> *</span>
            </label>
            <Select
              options={thanas}
              value={selectedThana}
              onChange={setSelectedThana}
              placeholder="Select Thana"
              classNamePrefix="react-select"
              // onInputChange={(val) => setSearchCustomerKeyword(val)}
              menuPortalTarget={document.body}
              styles={getReactSelectStyles()}
              isClearable
            />
          </div>
          {/* Invoice SMS */}
          <div className="flex col-span-8 justify-between">
            {" "}
            <ToggleSwitch
              label="SMS Invoice"
              value={formData.smsInvoice}
              onChange={(newValue) =>
                handleChange("smsInvoice", Number(newValue))
              }
            />
            <ToggleSwitch
              label="Warranty"
              value={formData.warranty}
              onChange={(newValue) =>
                handleChange("warranty", Number(newValue))
              }
            />
          </div>

          <ImageUploaderInput
            formData={formData}
            setFormData={setFormData}
            title={"Upload Your Logo"}
          />
          {/* Submit Button */}
          <button
            type="submit"
            disabled={setGlobalLoader}
            className={`global_button`}
          >
            {setGlobalLoader === true ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BusinessSetupModal;
