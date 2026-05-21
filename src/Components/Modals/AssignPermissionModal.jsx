import { useEffect, useState } from "react";

import openCloseStore from "../../Zustand/OpenCloseStore";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import toast from "react-hot-toast";

const AssignPermissionModal = ({ permissions, roleID }) => {
  const { assignPermissionModal, setAssignPermissionModal } = openCloseStore();
  const { setGlobalLoader } = loadingStore();
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const fetchAssignPermissions = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/getAssignPermissions/${roleID}`);
      if (res.data.success === true) {
        const assignendPermissionID = res.data.data.map((p) => p.permissionID);
        // Basic fallback
        setSelectedPermissions(assignendPermissionID);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const togglePermission = (permissionID) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionID)
        ? prev.filter((id) => id !== permissionID)
        : [...prev, permissionID]
    );
  };

  useEffect(() => {
    (async () => {
      if (assignPermissionModal) {
        document.body.classList.add("overflow-hidden");
        await fetchAssignPermissions();
      } else {
        document.body.classList.remove("overflow-hidden");
      }
    })();
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [assignPermissionModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      roleID,
      Permissions: selectedPermissions,
    };

    try {
      setGlobalLoader(true);
      const res = await api.post(`/assignPermissions`, payload);

      if (res.data.success === true) {
        toast.success(res.data.message);
        setSelectedPermissions([]);
        setAssignPermissionModal(false);
      } else {
        ErrorToast(res.data.message || "Failed to Assign Permission");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  if (!assignPermissionModal) return null;
  return (
    <div
      onClick={() => {
        setAssignPermissionModal(false);
      }}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center overflow-y-auto pt-10 px-3"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-black dark:text-white dark:bg-[#1E2939] p-6 rounded-lg w-full sm:w-[90%] max-w-2xl max-h-[90vh] min-h-[70vh] overflow-y-auto shadow-lg"
      >
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-3"
        >
          {permissions?.map((permission) => (
            <label
              key={permission?._id}
              className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 shadow rounded-md p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <input
                type="checkbox"
                checked={selectedPermissions?.includes(permission?._id)}
                onChange={() => togglePermission(permission?._id)}
              />
              <span>{permission?.name}</span>
            </label>
          ))}
          <div className="col-span-2 flex gap-2">
            <button
              type="button"
              className="global_button_red w-full"
              onClick={() => setAssignPermissionModal(false)}
            >
              Close
            </button>
            <button type="submit" className="global_button w-full">
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignPermissionModal;
