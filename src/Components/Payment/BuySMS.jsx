import React, { useEffect, useState } from "react";
import { getBusinessDetails, getToken } from "../../Helper/SessionHelper";
import { useNavigate } from "react-router-dom";
import { BaseURL } from "../../Helper/Config";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import api from "../../Helper/axios_resonse_interceptor";
import loadingStore from "../../Zustand/LoadingStore";

const BuySMS = () => {
  const navigate = useNavigate();
  const [smsPackages, setSmsPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setGlobalLoader } = loadingStore();

  // Fetch SMS Packages from API
  useEffect(() => {
    const fetchSMSPackages = async () => {
      setGlobalLoader(true);
      try {
        const res = await api.get(`${BaseURL}/SMSPackage`);

        if (res.data.status === "Success") {
          setSmsPackages(res.data.data);
        } else {
          ErrorToast("Failed to load SMS packages");
        }
      } catch (error) {
        console.error("Error fetching SMS packages:", error);
        ErrorToast("Failed to load SMS packages");
      } finally {
        setGlobalLoader(false);
      }
    };

    fetchSMSPackages();
  }, []);

  // Buy SMS Package
  const buySMSPackage = async (pkg) => {
    if (loading) return;

    try {
      setLoading(true);
      setGlobalLoader(true);

      // Step 1: Create SMS invoice
      const url = `${BaseURL}/BySMS/${pkg._id}`;
      console.log("Requesting:", url);

      const res = await api.get(url);

      if (res.data.status === "Success") {
        const invoiceId = res.data?.invoice?._id;

        if (invoiceId) {
          // Step 2: Create bKash payment request
          const bkashRes = await api.get(
            `${BaseURL}/bkash/payment/sms/${invoiceId}`
          );

          const bkashURL = bkashRes.data?.bkashURL;

          if (bkashURL) {
            // Step 3: Redirect user to bKash payment page
            window.location.href = bkashURL;
          } else {
            ErrorToast("Failed to get bKash payment URL.");
          }
        } else {
          ErrorToast("Invoice ID missing in response.");
        }
      } else {
        ErrorToast(res.data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error buying SMS package:", error);
      ErrorToast(
        error.response?.data?.error ||
          error.message ||
          "Failed to process request"
      );
    } finally {
      setLoading(false);
      setGlobalLoader(false);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-zinc-900 min-h-screen p-6 transition-colors">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
          Buy SMS Packages
        </h1>

        {smsPackages.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Loading SMS packages...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {smsPackages.map((pkg) => (
              <div
                key={pkg._id}
                className="
              border border-gray-200 dark:border-zinc-700
              rounded-2xl shadow-md p-6
              hover:shadow-xl hover:-translate-y-1
              transition-all duration-300
              bg-gradient-to-br
              from-blue-50 to-indigo-100
              dark:from-zinc-800 dark:to-zinc-900
              relative flex flex-col justify-between
            "
              >
                {/* Package Header */}
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">
                    {pkg.name}
                  </h2>

                  {/* <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-zinc-700">
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {pkg.sms}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      SMS
                    </p>
                  </div> */}
                </div>

                {/* Price Info */}
                <div className="text-center mb-4">
                  {pkg.price !== pkg.amount && (
                    <p className="text-sm text-red-500 line-through">
                      Regular: ৳{pkg.price}
                    </p>
                  )}

                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ৳{pkg.amount}
                  </p>

                  {pkg.price !== pkg.amount && (
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                      Save ৳{pkg.price - pkg.amount}
                    </p>
                  )}
                </div>

                {/* Buy Button */}
                <button
                  onClick={() => buySMSPackage(pkg)}
                  disabled={loading}
                  className={`
                w-full text-white font-semibold py-3 rounded-xl
                bg-gradient-to-r from-blue-600 to-indigo-700
                dark:from-blue-500 dark:to-indigo-600
                hover:from-blue-700 hover:to-indigo-800
                dark:hover:from-blue-600 dark:hover:to-indigo-700
                transition-all duration-200
                shadow-md hover:shadow-lg
                ${loading ? "opacity-50 cursor-not-allowed" : ""}
              `}
                >
                  {loading ? "Processing..." : "Buy Now"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuySMS;
