import React, { useState } from "react";
import { ErrorToast, SuccessToast, IsEmpty } from "../../Helper/FormHelper";
import { BaseURL } from "../../Helper/Config";
import { useNavigate } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { setMobile, setName, setToken } from "../../Helper/SessionHelper";
import axios from "axios";

const SignUp = () => {
  const navigate = useNavigate();
  const { setGlobalLoader } = loadingStore();

  // 🧠 Form States
  const [mobile, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOTPsended, setIsOTPsended] = useState(false);

  // 🔹 Send OTP
  const sendOTP = async (e) => {
    e.preventDefault();
    if (IsEmpty(mobile)) return ErrorToast("Mobile number is required");

    setLoading(true);
    setGlobalLoader(true);

    try {
      const res = await axios.post(`${BaseURL}/registration`, { mobile });
      const { data } = res;

      if (data.status === "Success") {
        if (data.userStatus === "Active") {
          ErrorToast("Mobile number is already registered. Please login.");
          navigate("/Login");
          return;
        }

        setIsOTPsended(true);
        SuccessToast(data.message || "OTP sent successfully.");
      } else {
        ErrorToast(data.message);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "An unexpected error occurred.";
      ErrorToast(errorMessage);
    } finally {
      setLoading(false);
      setGlobalLoader(false);
    }
  };

  // 🔹 Handle Registration
  const handleRegistration = async (e) => {
    e.preventDefault();

    if (IsEmpty(mobile)) return ErrorToast("Mobile number is required");
    if (IsEmpty(fullName)) return ErrorToast("Name is required");
    if (IsEmpty(password)) return ErrorToast("Password is required");
    if (IsEmpty(otp)) return ErrorToast("OTP is required");

    setLoading(true);
    setGlobalLoader(true);

    try {
      const res = await axios.post(`${BaseURL}/passwordReset`, {
        mobile,
        password,
        fullName,
        otp,
      });

      const { data } = res;

      if (data.status === "Success") {
        setToken(data.token);
        setMobile(mobile);
        setName(data.data.fullName);
        window.location.href = "/CreateBusiness";
      } else {
        ErrorToast(data.message);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "An unexpected error occurred.";
      ErrorToast(errorMessage);
    } finally {
      setLoading(false);
      setGlobalLoader(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-teal-900 p-4">
      <div className="w-full max-w-md p-8 bg-blue-900/40 backdrop-blur-xl rounded-xl shadow-lg text-center border border-teal-500/30 relative overflow-hidden">
        {/* Background blur circles */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-800/30 rounded-full filter blur-[100px]"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-800/30 rounded-full filter blur-[100px]"></div>

        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-gray-100">Sign Up</h3>
          <p className="text-white/80 mt-2">Create a new account easily.</p>

          {/* Step 1: Send OTP */}
          {!isOTPsended && (
            <form onSubmit={sendOTP} className="mt-6">
              <div className="mb-4 text-left">
                <label className="block font-semibold mb-2 text-white">
                  Your Mobile
                </label>
                <input
                  value={mobile}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Enter Mobile"
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/70 
                             disabled:bg-white/10"
                  type="text"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg font-bold text-white 
                           bg-gradient-to-r from-white/30 to-white/20 
                           hover:from-white/40 hover:to-white/30 shadow-lg hover:shadow-white/10 transition-all"
              >
                {loading ? "Sending..." : "Next"}
              </button>
            </form>
          )}

          {/* Step 2: Complete Registration */}
          {isOTPsended && (
            <form onSubmit={handleRegistration} className="mt-6">
              <div className="mb-4 text-left">
                <label className="block font-semibold mb-2 text-white">
                  Your Mobile
                </label>
                <input
                  value={mobile}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Enter Mobile"
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
                             text-white placeholder-white/70 disabled:bg-white/10"
                  type="text"
                  disabled
                />
              </div>

              <div className="mb-4 text-left">
                <label className="block font-semibold mb-2 text-white">
                  Name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter Your Name"
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
                             text-white placeholder-white/70 disabled:bg-white/10"
                  type="text"
                />
              </div>

              <div className="mb-4 text-left">
                <label className="block font-semibold mb-2 text-white">
                  Password
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
                             text-white placeholder-white/70 disabled:bg-white/10"
                  type="password"
                />
              </div>

              <div className="mb-4 text-left">
                <label className="block font-semibold mb-2 text-white">
                  OTP
                </label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter Your OTP"
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg 
                             text-white placeholder-white/70 disabled:bg-white/10"
                  type="text"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg font-bold text-white 
                           bg-gradient-to-r from-white/30 to-white/20 
                           hover:from-white/40 hover:to-white/30 shadow-lg hover:shadow-white/10 transition-all"
              >
                {loading ? "Registering..." : "Submit"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
