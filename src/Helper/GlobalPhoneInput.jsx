import React from "react";

export default function GlobalPhoneInput({
  label = "Mobile",
  required = false,
  name = "mobile",
  value,
  onChange,
}) {
  //  Bangladesh mobile regex
  const isValidBDNumber = /^01[0-9]{9}$/.test(value);

  const handleInputChange = (e) => {
    // শুধু সংখ্যা রাখব
    const onlyNumbers = e.target.value.replace(/\D/g, "");
    if (onChange) {
      onChange({
        target: { name, value: onlyNumbers },
      });
    }
  };

  return (
    <div className="flex flex-col">
      {label && (
        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <input
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        maxLength={11}
        placeholder="01XXXXXXXXX"
        required={required}
        className={`global_input border transition-colors duration-200 ${
          value.length === 0
            ? "border-gray-300"
            : isValidBDNumber
            ? "border-green-500 focus:ring-1 focus:ring-green-500"
            : "border-red-500 focus:ring-1 focus:ring-red-500"
        }`}
      />

      {value && !isValidBDNumber && (
        <p className="text-xs text-red-500 mt-1">
          {/* Please enter a valid Bangladeshi mobile number (e.g. 01XXXXXXXXX) */}
        </p>
      )}
    </div>
  );
}
