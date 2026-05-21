import React, { useEffect, useRef, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { removeImage, uploadProductImage } from "../uploadImage";

const ProductImageUploaderInput = ({ formData, setFormData, title }) => {
  const [preview, setPreview] = useState(formData.image || null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreview(formData.image || null);
  }, [formData.image]);

  const handleFile = async (file) => {
    setLoading(true);
    try {
      const uploadedUrl = await uploadProductImage(file, formData.image);
      if (uploadedUrl) {
        setFormData((prev) => ({
          ...prev,

          image: uploadedUrl,
        }));
        setPreview(uploadedUrl);
      } else {
        setPreview(null);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // যদি logo না থাকে, directly clear করো
    // if (formData.image) {
    //   setPreview(null);
    //   setFormData((prev) => ({
    //     ...prev,
    //     image: "",
    //   }));
    //   if (fileInputRef.current) {
    //     fileInputRef.current.value = "";
    //   }
    // }

    setLoading(true);

    try {
      await removeImage(formData.image);

      // Server response যাই হোক, UI clear করো
      setPreview(null);
      setFormData((prev) => ({
        ...prev,
        image: "",
      }));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Remove error:", error);
      // Error হলেও UI clear করো
      setPreview(null);
      setFormData((prev) => ({
        ...prev,
        image: "",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{title}</label>

      <div
        className={`relative flex flex-col items-center justify-center w-44 h-44 border-2 border-dashed  cursor-pointer transition ${
          isDragging
            ? "border-red-500 bg-red-50"
            : "border-gray-300 hover:bg-gray-50"
        }`}
        onClick={() => {
          if (!preview && fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => {
          setIsDragging(false);
        }}
        onDrop={(e) => {
          handleDrop(e);
        }}
      >
        {preview ? (
          <div className="relative h-44 w-44 flex items-center justify-center">
            <img
              src={preview}
              alt="Uploaded"
              className="h-full object-contain "
              style={{ maxHeight: "100%", maxWidth: "100%" }}
            />

            <button
              type="button"
              className="absolute top-2 right-2 text-red-500 bg-white rounded-full shadow p-1 hover:bg-gray-100 transition"
              onClick={handleRemove}
            >
              <IoCloseCircle size={24} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-4 4h-4a1 1 0 01-1-1v-4h6v4a1 1 0 01-1 1z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500 w-[100px]">
              <span className="font-semibold">Click to upload</span> or drag &
              drop
            </p>
            <p className="text-xs text-gray-400 w-[100px]">
              PNG, JPG, JPEG, BMP (max 3MB)
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />
      </div>

      {loading && (
        <p className="text-xs text-gray-400 animate-pulse">Processing...</p>
      )}
    </div>
  );
};

export default ProductImageUploaderInput;
