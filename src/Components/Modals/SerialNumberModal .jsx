import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const SerialNumberModal = ({ open, onClose, serials, saveSerials }) => {
  const [serialInputs, setSerialInputs] = useState(serials || [""]);

  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  const handleSerialChange = (index, value) => {
    const updated = [...serialInputs];
    updated[index] = value;
    setSerialInputs(updated);
  };

  const addSerialInput = () => {
    setSerialInputs([...serialInputs, ""]);
  };

  const removeSerialInput = (index) => {
    const updated = serialInputs.filter((_, i) => i !== index);
    setSerialInputs(updated);
  };

  const handleSave = () => {
    saveSerials(serialInputs.filter((s) => s.trim() !== ""));
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white dark:bg-[#1E2939] text-black dark:text-white rounded-lg p-6 max-w-md w-full mx-2 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Add Serial Numbers</h2>

        {serialInputs.map((s, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row items-center gap-2 mb-2"
          >
            <input
              type="text"
              value={s}
              placeholder={`Serial #${i + 1}`}
              onChange={(e) => handleSerialChange(i, e.target.value)}
              className="global_input flex-1"
            />
            {serialInputs.length > 1 && (
              <button
                onClick={() => removeSerialInput(i)}
                className="text-red-500 font-semibold mt-2 sm:mt-0 px-2 py-1 border border-red-300 rounded-md hover:bg-red-50 transition"
              >
                X
              </button>
            )}
          </div>
        ))}

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={addSerialInput}
            className="text-blue-500 underline font-medium"
          >
            Add More
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="global_button_red">
            Cancel
          </button>
          <button onClick={handleSave} className="global_button">
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SerialNumberModal;
