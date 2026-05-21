import React, { useRef, useState } from "react";
import { ErrorToast, SuccessToast, IsEmpty } from "../../Helper/FormHelper";
import { BaseURL } from "../../Helper/Config";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import loadingStore from "../../Zustand/LoadingStore";
import { setMobile } from "../../Helper/SessionHelper";

const VerifyMobile = () => {
  const mobileRef = useRef();
  const passwordRef = useRef();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { setGlobalLoader } = loadingStore();
  const handleVerifyMobile = async (e) => {
    e.preventDefault();
    const mobile = mobileRef.current.value.trim();
    if (IsEmpty(mobile)) {
      ErrorToast("Mobile number is required");
      return;
    }

    setGlobalLoader(true);

    try {
      const res = await axios.get(`${BaseURL}/verifyMobile/${mobile}`);

      const { data } = res;
      if (data.status === "Success") {
        setMobile(mobile);
        navigate("/PasswordReset");
      } else {
        ErrorToast(data.message || "Login Failed.");
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "An unexpected error occurred.";
      ErrorToast(errorMessage);
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-teal-900 p-4">
      <div className="w-full max-w-md p-8 bg-blue-900/40 backdrop-blur-xl rounded-xl shadow-lg text-center border border-teal-500/30 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-800/30 rounded-full filter blur-[100px]"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-800/30 rounded-full filter blur-[100px]"></div>

        <div className="relative z-10">
          <p className="text-white/80 mt-2">
            আনুগ্রহ করে আপনার মোবাইল নাম্বার দিন
          </p>
          <form onSubmit={handleVerifyMobile} className="mt-6">
            <div className="mb-4 text-left">
              <label className="block font-semibold mb-2 text-white">
                Your Mobile
              </label>
              <input
                ref={mobileRef}
                placeholder="Enter Mobile"
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/70 disabled:bg-white/10"
                type="text"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all ${
                loading
                  ? "bg-gray-500/50"
                  : "bg-gradient-to-r from-[#ffffff]/30 to-[#ffffff]/20 hover:from-[#ffffff]/40 hover:to-[#ffffff]/30 shadow-lg hover:shadow-white/10"
              }`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Next"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyMobile;
