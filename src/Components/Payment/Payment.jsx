import React, { useState, useEffect } from "react";
import { getBusinessDetails, getToken } from "../../Helper/SessionHelper";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { ErrorToast } from "../../Helper/FormHelper";
import api from "../../Helper/axios_resonse_interceptor";
import { motion } from "framer-motion";
import { FaStar, FaHeadset } from "react-icons/fa";

const Payment = () => {
  const packages = getBusinessDetails();
  const navigate = useNavigate();
  const [expiryStatus, setExpiryStatus] = useState({
    isExpired: false,
    daysLeft: 0,
    message: ""
  });

  useEffect(() => {
    const businessDetails = getBusinessDetails();
    if (businessDetails?.endDate) {
      const expiryDate = new Date(businessDetails.endDate);
      const today = new Date();
      const diffTime = expiryDate - today;
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let message = "";
      if (daysLeft <= 0) {
        message = "আপনার সাবস্ক্রিপশনের মেয়াদ শেষ হয়েছে। সেবা চালু রাখতে অনুগ্রহ করে পেমেন্ট করে সাবস্ক্রিপশন নবায়ন করুন।";
      } else if (daysLeft <= 7) {
        message = `আপনার সাবস্ক্রিপশনের মেয়াদ শেষ হতে ${daysLeft} দিন বাকি। দয়া করে নবায়ন করুন।`;
      } else if (daysLeft <= 30) {
        message = `আপনার সাবস্ক্রিপশনের মেয়াদ শেষ হতে ${daysLeft} দিন বাকি।`;
      }

      setExpiryStatus({
        isExpired: daysLeft <= 0,
        daysLeft: daysLeft > 0 ? daysLeft : 0,
        message: message
      });
    }
  }, []);

  const packageList = [
    {
      name: "30 Days Subscription",
      price: packages["30"] || 1000,
      duration: 30,
      color: "from-emerald-500 to-green-500",
      borderColor: "border-emerald-200"
    },
    {
      name: "180 Days Subscription",
      price: packages["180"] || 5500,
      duration: 180,
      popular: true,
      color: "from-blue-500 to-indigo-500",
      borderColor: "border-blue-200"
    },
    {
      name: "360 Days Subscription",
      price: packages["360"] || 11000,
      duration: 360,
      color: "from-purple-500 to-pink-500",
      borderColor: "border-purple-200"
    },
  ];

  const AddSubscription = async (pkg) => {
    try {
      const url = `${BaseURL}/AddSubscription/${pkg.duration}`;

      const res = await axios.get(url, {
        headers: { token: getToken() },
      });

      if (res.data.status === "Success") {
        const invoiceId = res.data?.invoice?._id;

        if (invoiceId) {
          const bkashRes = await api.get(
            `${BaseURL}/bkash/payment/SubCreate/${invoiceId}`
          );

          const bkashURL = bkashRes.data?.bkashURL;

          if (bkashURL) {
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
      console.error(error);
      ErrorToast(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Choose Your Package
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <FaHeadset className="text-blue-500" />
            <p>Support: <span className="font-semibold text-blue-600">096 3838 0101</span></p>
          </div>
        </motion.div>

        {/* Expiry Warning - if needed */}
        {expiryStatus.message && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`mb-8 p-4 rounded-xl text-white text-center ${expiryStatus.isExpired
              ? 'bg-gradient-to-r from-red-500 to-pink-500'
              : expiryStatus.daysLeft <= 7
                ? 'bg-gradient-to-r from-orange-500 to-red-500'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500'
              }`}
          >
            <p className="font-medium">{expiryStatus.message}</p>
          </motion.div>
        )}

        {/* Package Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {packageList.map((pkg, index) => (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden border-2 ${pkg.popular ? 'border-blue-500 scale-105 z-10' : pkg.borderColor
                }`}
            >

              {/* Card Content */}
              <div className={`bg-gradient-to-r ${pkg.color} p-6 text-white`}>
                <h2 className="text-2xl font-bold text-center">{pkg.name}</h2>
                <p className="text-center text-white/90 mt-1">{pkg.days}</p>
              </div>

              <div className="p-6 text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-800">৳{pkg.price}</span>
                </div>
                <button
                  onClick={() => AddSubscription(pkg)}
                  className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-md hover:shadow-xl relative overflow-hidden group ${pkg.popular
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                      : `bg-gradient-to-r ${pkg.color} hover:brightness-110`
                    }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span>পেমেন্ট করুন</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Payment;