import {
  FaStore,
  FaShoppingCart,
  FaBoxOpen,
  FaAddressBook,
  FaMoneyBillWave,
  FaChartLine,
  FaSyncAlt,
  FaUsers,
  FaShieldAlt,
  FaLock,
  FaUserPlus,
  FaKey,
  FaPhone,
} from "react-icons/fa";
import logo from "../../assets/logo.png";
import React, { useEffect, useRef, useState } from "react";
import {
  ErrorToast,
  SuccessToast,
  IsEmpty,
  IsMobile,
} from "../../Helper/FormHelper";
import { fetchOwnBusiness } from "../../BusinessApi/businessService";
import { BaseURL } from "../../Helper/Config";
import { Link, useNavigate } from "react-router-dom";
import {
  setBusinessDetails,
  setMobile,
  setName,
  setToken,
  setAdmin,
  setRole,
  setPermissionDetails,
  setUserDetails,
} from "../../Helper/SessionHelper";
import axios from "axios";

const whyChooseUs = [
  {
    title: "এডভান্সড অ্যানালিটিক্স",
    icon: <FaChartLine className="text-cyan-400" size={24} />,
    desc: "বিস্তারিত ব্যবসায়িক বিশ্লেষণ",
  },
  {
    title: "রিয়েল-টাইম সিঙ্ক",
    icon: <FaSyncAlt className="text-green-400" size={24} />,
    desc: "সব ডিভাইসে তাত্ক্ষণিক আপডেট",
  },
  {
    title: "মাল্টি-ইউজার এক্সেস",
    icon: <FaUsers className="text-purple-400" size={24} />,
    desc: "একাধিক ব্যবহারকারী পরিচালনা",
  },
  {
    title: "হাই সিকিউরিটি",
    icon: <FaShieldAlt className="text-red-400" size={24} />,
    desc: "ডেটা সুরক্ষা গ্যারান্টি",
  },
];

const totalCards = [
  {
    key: "totalBusinesses",
    title: "Business",
    icon: <FaStore className="text-cyan-400" size={24} />,
    gradient: "from-cyan-500/20 to-blue-500/20",
    color: "text-cyan-300",
  },
  {
    key: "totalSales",
    title: "Total Invoice",
    icon: <FaShoppingCart className="text-green-400" size={24} />,
    gradient: "from-green-500/20 to-emerald-500/20",
    color: "text-green-300",
  },
  {
    key: "totalProducts",
    title: "Total Product",
    icon: <FaBoxOpen className="text-purple-400" size={24} />,
    gradient: "from-purple-500/20 to-pink-500/20",
    color: "text-purple-300",
  },
  {
    key: "totalContacts",
    title: "Customer",
    icon: <FaAddressBook className="text-orange-400" size={24} />,
    gradient: "from-orange-500/20 to-yellow-500/20",
    color: "text-orange-300",
  },
  {
    key: "totalTransactions",
    title: "Transactions",
    icon: <FaMoneyBillWave className="text-red-400" size={24} />,
    gradient: "from-red-500/20 to-rose-500/20",
    color: "text-red-300",
  },
];

const UserLogin = () => {
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({
    totalBusinesses: "",
    totalSales: "",
    totalProducts: "",
    totalContacts: "",
    totalTransactions: "",
  });

  const fetchTotalData = async () => {
    try {
      const res = await axios.get(`${BaseURL}/Total`);
      if (res.data.success === true) {
        setTotals(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTotalData();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await axios.post(`${BaseURL}/login`, {
        mobile: mobile.trim(),
        password: password.trim(),
      });

      const { data } = res;
      if (data.status === "Success") {
        setToken(data.token);
        setMobile(mobile);
        setName(data.data.fullName);
        setUserDetails(data.data);
        SuccessToast(data.message || "লগইন সফল");

        const businessID = await fetchOwnBusiness();

        window.location.href = "/";
      } else {
        ErrorToast(data.message || "লগইন ব্যর্থ");
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে";
      ErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#2b7ccc] via-[#309A9F] to-[#185A9D] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-20 left-10 w-20 h-20 bg-cyan-400/10 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-purple-400/10 rounded-full animate-bounce delay-300"></div>
      </div>

      {/* Main Container */}
      <div className="flex flex-col lg:flex-row gap-2 sm:gap-4 md:gap-10 lg:gap-20">
        {/* Left Side -   Login Form */}
        <div className="w-full ">
          <div className=" flex flex-col h-full backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden transition-all duration-300 hover:shadow-cyan-500/20">
            {/* Form Header */}
            <div className="bg-white/5 text-center backdrop-blur-lg border border-white/10">
              <div className="text-center space-y-3 text-white p-3">
                <h1 className="text-3xl font-bold ">
                  আপনার অ্যাকাউন্টে লগইন করুন
                </h1>
                <p className="text-white/60 text-sm">
                  অ্যাকাউন্টে প্রবেশ করতে আপনার তথ্য দিন
                </p>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-8">
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Mobile Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-white">
                    মোবাইল নম্বর
                  </label>
                  <div className="relative group">
                    <input
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      type="text"
                      disabled={loading}
                      className={`w-full px-4 py-4 bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white placeholder-white/40 transition-all duration-300
            ${
              mobile && !IsMobile(mobile.trim())
                ? "border-red-500"
                : "border-white/10"
            }`}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-white">
                    পাসওয়ার্ড
                  </label>
                  <div className="relative group">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      type="password"
                      disabled={loading}
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white placeholder-white/40 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={
                    loading || !IsMobile(mobile.trim()) || !password.trim()
                  }
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform shadow-lg relative overflow-hidden
          ${
            loading || !IsMobile(mobile.trim()) || !password.trim()
              ? "bg-[#f8f8f83a] backdrop-blur-3xl cursor-not-allowed"
              : "bg-green-700 hover:scale-[1.02] hover:shadow-cyan-500/25"
          }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                  <div className="relative flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Logging in...</span>
                      </>
                    ) : (
                      <span className="text-lg">Login</span>
                    )}
                  </div>
                </button>
                <Link
                  to="/SignUp"
                  className="flex items-center justify-center gap-3 py-3 px-4 bg-green-500/50 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 rounded-xl font-bold text-white  transition-all duration-300 group"
                >
                  <span>Registration</span>
                </Link>
              </form>

              {/* Additional Options */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="grid grid-cols-1 gap-3">
                  <Link
                    to="/VerifyMobile"
                    className="flex items-center justify-center gap-3 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-xl font-bold text-red-300 hover:text-red-200 transition-all duration-300 group"
                  >
                    <span>Forget Password</span>
                  </Link>
                </div>
              </div>
              {/* Support Info */}
              <div className="mt-2 text-center flex flex-col sm:flex-row gap-3 justify-center items-center">
                <p className="text-white/50 text-sm">সাপোর্ট প্রয়োজন?</p>
                <a
                  href="tel:09638380101"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-500 font-bold  px-4 py-2 rounded-lg transition-all "
                >
                  <FaPhone size={14} className="text-white" />
                  096 3838 0101
                </a>
              </div>
              {/* Footer */}
              {/* <div className="mt-6 text-center">
                <p className="text-white/50 text-sm">
                  লগইন করার মাধ্যমে আপনি আমাদের{" "}
                  <Link
                    to="/terms"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                  >
                    শর্তাবলী
                  </Link>{" "}
                  এবং{" "}
                  <Link
                    to="/privacy"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                  >
                    গোপনীয়তা নীতি
                  </Link>{" "}
                  মেনে চলতে সম্মত হন
                </p>
              </div> */}
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-[#185A9D] to-transparent hidden lg:block w-fit"></div>
        {/* Right Side -Stats & Features */}

        <div className="w-full">
          <div className="flex flex-col h-full w-full space-y-6">
            <div className="bg-white/5 text-center backdrop-blur-lg border border-white/10 rounded-2xl p-2">
              {" "}
              <h1 className="text-4xl font-bold text-white mb-1">
                Bseba Software
              </h1>
              <h2 className="text-xl font-semibold text-white mb-2">
                আপনার ব্যবসার ডিজিটাল পার্টনার
              </h2>
              {/* <p className="text-white/60">
              সম্পূর্ণ ব্যবসায়িক ব্যবস্থাপনা এক প্ল্যাটফর্মে
            </p> */}
              <p className="text-sm text-white/60 leading-relaxed max-w-xl">
                সম্পূর্ণ ব্যবসায়িক ব্যবস্থাপনা এখন এক প্ল্যাটফর্মে, সহজ এবং
                সুরক্ষিতভাবে।
              </p>
            </div>
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {totalCards.map((item) => (
                <div
                  key={item.key}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] group"
                >
                  <div className="flex items-center justify-between">
                    {/* Icon */}
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${
                        item.gradient || "from-gray-700 to-gray-800"
                      } text-white shadow-lg`}
                    >
                      {item.icon}
                    </div>

                    {/* Text */}
                    <div className="text-right">
                      <p className={`text-sm font-medium ${item.color}`}>
                        {item.title}
                      </p>
                      <h3 className="text-2xl font-bold text-white">
                        {totals[item.key] || "0"}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Why Choose Us */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {whyChooseUs.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="p-3 rounded-lg bg-white/10">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-white/60">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
