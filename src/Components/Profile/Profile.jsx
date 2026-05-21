import React, { useEffect, useState } from "react";
import {  removeSessions } from "../../Helper/SessionHelper";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { removeImage, uploadImage } from "../../Helper/uploadImage";
import {
  FaUser,
  FaMapMarkerAlt,
  FaLanguage,
  FaCamera,
  FaTrash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../Helper/axios_resonse_interceptor";

const Profile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    Language: "",
    photo: "",
    mobile: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalPhoto, setOriginalPhoto] = useState("");

  // Get profile data
  const getProfileDetails = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/getProfileDetails`);
      if (res.data.status === "Success") {
        setForm({ ...res.data.data });
        setOriginalPhoto(res.data.data.photo || "");
      } else {
        ErrorToast(res.data.error);
      }
    } catch (error) {
      console.log(error);
      ErrorToast(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProfileDetails();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setForm({ ...form, photo: URL.createObjectURL(file) });
    }
  };

  const handleRemovePhoto = async () => {
    try {
      if (originalPhoto) {
        const success = await removeImage(originalPhoto);
        if (success) {
          setForm((prev) => ({ ...prev, photo: "" }));
          setSelectedFile(null);
          setOriginalPhoto("");
          SuccessToast("Profile photo removed successfully");
        } else {
          ErrorToast("Failed to remove photo");
        }
      } else {
        setForm((prev) => ({ ...prev, photo: "" }));
        setSelectedFile(null);
        SuccessToast("Profile photo removed");
      }
    } catch (error) {
      ErrorToast("Error removing photo");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      let photoUrl = originalPhoto;

      // Replace with actual mobile number for naming
      const userMobile = form.mobile;

      if (selectedFile) {
        photoUrl = await uploadImage(selectedFile, originalPhoto, userMobile);
      }

      const submitData = { ...form, photo: photoUrl };

      const res = await api.post(`/updateProfile`, submitData);

      if (res.data.status === "Success") {
        SuccessToast("Profile updated successfully");
        removeSessions();
      } else {
        ErrorToast(res.data.error);
      }
    } catch (error) {
      console.log(error);
      ErrorToast(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">
              Personal Information
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Photo Upload Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 overflow-hidden shadow-lg border-4 border-white flex items-center justify-center">
                    {form.photo ? (
                      <img
                        src={form.photo}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUser className="text-gray-400 w-12 h-12" />
                    )}
                  </div>

                  {/* Upload Button */}
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
                    <FaCamera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>

                  {/* Remove Photo */}
                  {form.photo && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute top-0 right-0 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-colors"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm text-gray-500 font-medium">
                    {form.photo
                      ? "Click camera to change or trash to remove"
                      : "Click camera icon to upload photo"}
                  </span>
                  <span className="text-xs text-gray-400">
                    Supported formats: PNG, JPG, JPEG, BMP (Max 2MB)
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Address
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <FaMapMarkerAlt className="w-5 h-5 text-gray-400" />
                    </div>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Enter your complete address"
                      rows="3"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 resize-none transition-colors"
                    ></textarea>
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Preferred Language
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLanguage className="w-5 h-5 text-gray-400" />
                    </div>
                    <select
                      name="Language"
                      value={form.Language}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 appearance-none transition-colors"
                    >
                      <option value="">Select your preferred language</option>
                      <option value="English">English</option>
                      <option value="Bangla">Bangla</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-800 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
