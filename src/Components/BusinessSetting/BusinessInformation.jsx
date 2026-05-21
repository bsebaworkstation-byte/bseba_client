import React, { useEffect, useState } from "react";

const BusinessInformation = () => {
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem("businessDetails");
    if (storedData) {
      setBusiness(JSON.parse(storedData));
    }
  }, []);

  if (!business) {
    return (
      <p className="text-gray-500 text-center mt-5">
        Loading business information...
      </p>
    );
  }

  return (
    <div className="text-center   dark:bg-gray-800  rounded-lg w-full max-w-sm mx-auto">
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
        {business.businessName || "N/A"}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        {business.contactNumber || "N/A"}
      </p>
      <p className="text-gray-700 dark:text-gray-300 text-sm mb-1">
        {business.address || "N/A"}
      </p>
      <hr className="border-gray-300 dark:border-gray-600 my-1" />
    </div>
  );
};

export default BusinessInformation;
