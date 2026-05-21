import React, { useEffect } from "react";
import { CheckCircle, Home, LayoutDashboard, Receipt } from "lucide-react";

const PaymentSuccess = () => {
  useEffect(() => {
    // Add a class to trigger animations after component mounts
    document.body.classList.add("loaded");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 px-4 py-8 transition-all duration-500">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-100 dark:bg-green-900/20 rounded-full blur-3xl opacity-50 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 max-w-md w-full text-center border border-white/40 dark:border-zinc-700/50 transform transition-all duration-500 animate-in slide-in-from-bottom-10 fade-in">
        {/* Success Icon with animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Outer glow effect */}
            <div className="absolute inset-0 bg-green-400/30 dark:bg-green-500/20 rounded-full blur-xl animate-ping opacity-75"></div>
            {/* Pulsing ring */}
            <div className="absolute inset-0 border-4 border-green-200 dark:border-green-900/30 rounded-full animate-pulse"></div>
            {/* Icon container */}
            <div className="relative transform transition-all duration-700 hover:scale-110">
              <CheckCircle className="text-green-500 w-24 h-24 animate-in zoom-in duration-700" />
              {/* Checkmark animation effect */}
              <div className="absolute inset-0 border-2 border-green-500 rounded-full animate-in spin-in-90 duration-1000"></div>
            </div>
          </div>
        </div>

        {/* Confetti effect */}
        <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                animation: `confetti 1s ease-out ${i * 0.2}s forwards`,
              }}
            ></div>
          ))}
        </div>

        {/* Title with animation */}
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent mb-3 animate-in slide-in-from-top duration-700">
          Payment Successful!
        </h1>

        {/* Buttons with enhanced design */}
        <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-bottom duration-700 delay-700">
          <button
            onClick={() => (window.location.href = "/Dashboard")}
            className="group flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-xl"
          >
            <LayoutDashboard className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Go to Dashboard
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="group flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-zinc-700 dark:to-zinc-800 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white py-3.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-95 border border-gray-200 dark:border-zinc-700"
          >
            <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            Back to Home
          </button>
        </div>
      </div>

      {/* Add custom CSS for confetti animation */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-in {
          animation: slideIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;
