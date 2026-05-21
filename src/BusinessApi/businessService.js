// src/Services/businessService.js
import { ErrorToast } from "../Helper/FormHelper";
import api from "../Helper/axios_resonse_interceptor";

// 1 Get Own Business ID after login
export const fetchOwnBusiness = async () => {
  try {
    const res = await api.get(`/getOwnBusiness`);

    if (res.data.status !== "Success" || !res.data.data.length) {
      ErrorToast("Failed to get business ID");
      return null;
    }

    const businessID = res.data.data[0]._id; 

    // Save in localStorage
    localStorage.setItem("businessID", businessID);

    return businessID;
  } catch (error) {
    ErrorToast(error.message || "Something went wrong");
    return null;
  }
};

export const fetchBusinessDetails = async (businessID) => {
  if (!businessID) return null;

  try {
    const res = await api.get(`/getBusinessById/${businessID}`);

    if (res.data.status !== "Success") {
      ErrorToast("Failed to fetch business details");
      return null;
    }

    localStorage.setItem("businessDetails", JSON.stringify(res.data.data));
    return res.data.data;
  } catch (error) {
    ErrorToast(error.message || "Something went wrong");
    return null;
  }
};

export const getLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return null;
  }
};
