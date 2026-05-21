import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../Helper/axios_resonse_interceptor";
import loadingStore from "../../Zustand/LoadingStore";
import { format } from "date-fns";
import { getBusinessDetails } from "../../Helper/SessionHelper";
import { FaPrint, FaUser, FaCalendarAlt, FaTag, FaDollarSign, FaStickyNote, FaStore, FaMapMarkerAlt } from "react-icons/fa";
import { MdReceipt } from "react-icons/md";

export default function ExpenseDetails() {
  const { id } = useParams();
  const { setGlobalLoader } = loadingStore();

  const [expense, setExpense] = useState(null);

  const fetchExpenseDetails = async () => {
    try {
      setGlobalLoader(true);
      const res = await api.get(`/ExpenseByID/${id}`);
      if (res.data.status === "success") {
        setExpense(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const businessDetails = getBusinessDetails();

  useEffect(() => {
    fetchExpenseDetails();
  }, [id]);

  const formatDate = (date) => {
    try {
      return format(new Date(date), "dd-MM-yyyy hh:mm a");
    } catch {
      return date;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!expense) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expense details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Print Button */}
        <div className="text-right mb-4 no-print">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <FaPrint />
            <span>Print Receipt</span>
          </button>
        </div>

        {/* Main Receipt Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden print_area">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {businessDetails.logo ? (
                  <img
                    src={businessDetails.logo}
                    height={70}
                    width={70}
                    alt="Business Logo"
                    className="h-16 w-16 rounded-xl bg-white p-2 shadow-lg object-contain"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-white/20 flex items-center justify-center">
                    <FaStore className="text-3xl text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold">{businessDetails.businessName || "Business Name"}</h1>
                  {businessDetails.address && (
                    <p className="text-sm text-blue-100 flex items-center gap-1 mt-1">
                      <FaMapMarkerAlt size={12} />
                      {businessDetails.address}
                    </p>
                  )}
                </div>
              </div>
              <div className="bg-white/20 rounded-xl px-4 py-2">
                <MdReceipt className="text-2xl inline-block mr-2" />
                <span className="font-semibold">Expense Receipt</span>
              </div>
            </div>
          </div>

          {/* Title Section */}
          <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 text-center flex items-center justify-center gap-2">
              Expense Details
            </h2>
          </div>

          {/* Details Section */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Expense Type */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <FaTag />
                  <span className="font-semibold">Expense Type</span>
                </div>
                <p className="text-lg font-medium text-gray-800">{expense.type}</p>
              </div>

              {/* Amount */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-xl border border-red-100">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <span className="font-semibold">Amount</span>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  ৳{parseFloat(expense.amount).toFixed(2)}
                </p>
              </div>

              {/* User */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 text-purple-700 mb-2">
                  <FaUser />
                  <span className="font-semibold">Processed By</span>
                </div>
                <p className="text-lg font-medium text-gray-800">{expense.User}</p>
              </div>

              {/* Date */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <FaCalendarAlt />
                  <span className="font-semibold">Transaction Date</span>
                </div>
                <p className="text-lg font-medium text-gray-800">{formatDate(expense.CreatedDate)}</p>
              </div>
            </div>

            {/* Note Section */}
            {expense.note && (
              <div className="mt-4 bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-100">
                <div className="flex items-center gap-2 text-yellow-700 mb-2">
                  <FaStickyNote />
                  <span className="font-semibold">Note</span>
                </div>
                <p className="text-gray-700">{expense.note}</p>
              </div>
            )}
          </div>

        </div>

        {/* Signature Section */}
        <div className="signature_section mt-12 flex justify-between text-center px-4">
          <div className="flex-1">
            <div className="border-t-2 border-gray-300 w-40 mx-auto"></div>
            <p className="mt-2 text-sm font-medium text-gray-600">Prepared By</p>
          </div>
          <div className="flex-1">
            <div className="border-t-2 border-gray-300 w-40 mx-auto"></div>
            <p className="mt-2 text-sm font-medium text-gray-600">Approved By</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6 text-xs text-gray-400">
          <p>Software Developed by Bseba.com</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print_area {
            box-shadow: none !important;
            border: 1px solid #ddd;
          }
        }
      `}</style>
    </div>
  );
}