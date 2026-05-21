import { useEffect, useRef, useState } from "react";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import Swal from "sweetalert2";
import api from "../../Helper/axios_resonse_interceptor";
import AssignPermissionModal from "../Modals/AssignPermissionModal";
import openCloseStore from "../../Zustand/OpenCloseStore";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [form, setForm] = useState({ name: "" });
  const [editId, setEditId] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const { setAssignPermissionModal } = openCloseStore();
  const formRef = useRef(null);
  const [roleKeyWord, setRoleKeyWord] = useState("");
  const [permissionRoleID, setPermissionRoleID] = useState(null);
  //  Fetch Brands
  const fetchRoles = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/RolesByBusinessID`);

      // Basic fallback
      setRoles(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };
  // hello
  const fetchAllPermissions = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/GetAllPermission`);

      // Basic fallback
      setPermissions(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchRoles(), fetchAllPermissions()]);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalLoader(true);
    try {
      if (editId) {
        const res = await api.post(`/UpdateRole/${editId}`, form);
        if (res.data.status === "Success") {
          SuccessToast("Role updated successfully!");
          clearForm();
          fetchRoles();
        } else {
          ErrorToast(res.data.message || "Failed to update Role");
        }
      } else {
        const res = await api.post(`/CreateRole`, form);
        if (res.data.status === "Success") {
          SuccessToast("Role created successfully!");
          clearForm();
          fetchRoles();
        } else {
          ErrorToast(res.data.message || "Failed to create Brand");
        }
      }
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  const clearForm = () => {
    setForm({ name: "" });
    setEditId(null);
  };
  const handleEdit = (Role) => {
    setEditId(Role._id);
    setForm({ name: Role.name });
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: '<span class="text-gray-900 dark:text-white">Are you sure?</span>',
      html: '<p class="text-gray-600 dark:text-gray-300">This action cannot be undone!</p>',
      icon: "warning",
      showCancelButton: true,
      background: "rgba(255, 255, 255, 0.2)",
      backdrop: `
        rgba(0,0,0,0.4)
        url("/images/nyan-cat.gif")
        left top
        no-repeat
      `,
      customClass: {
        popup:
          "rounded-lg border border-white/20 dark:border-gray-700/50 shadow-xl backdrop-blur-lg bg-white/80 dark:bg-gray-800/80",
        confirmButton:
          "px-4 py-2 bg-red-600/90 hover:bg-red-700/90 text-white rounded-md font-medium transition-colors backdrop-blur-sm ml-3",
        cancelButton:
          "px-4 py-2 bg-white/90 dark:bg-gray-700/90 hover:bg-gray-100/90 dark:hover:bg-gray-600/90 text-gray-800 dark:text-gray-200 border border-white/20 dark:border-gray-600/50 rounded-md font-medium transition-colors ml-2 backdrop-blur-sm",
      },
      buttonsStyling: false,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setGlobalLoader(true);
          const response = await api.get(`/DeleteRole/${id}`);
          if (response.data.status === "Success") {
            SuccessToast(response.data.message);
            fetchRoles();
          } else {
            ErrorToast(response.data.message);
          }
        } catch (error) {
          ErrorToast(error.response?.data?.message || "Failed to delete Role");
        } finally {
          setGlobalLoader(false);
        }
      }
    });
  };

  //  Filter by search keyword
  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(roleKeyWord.toLowerCase())
  );

  return (
    <div ref={formRef} className="global_container">
      <div className="global_sub_container">
        <h1 className="text-xl font-semibold mb-3">Role Management</h1>

        {/*  Form + Search Row */}
        <form
          onSubmit={handleSubmit}
          className=" md:space-y-4 space-y-0 flex flex-col lg:flex-row justify-between gap-5"
        >
          <div className="flex flex-col lg:flex-row gap-5 w-full">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Role Name"
              className="global_input"
              required
            />
          </div>
          {!editId && (
            <button
              type="submit"
              className="global_button"
              disabled={!form.name.trim()}
            >
              Create Role
            </button>
          )}
          {editId && (
            <button type="submit" className="global_edit">
              Update
            </button>
          )}
          {editId && (
            <button
              type="button"
              onClick={clearForm}
              className="global_button_red"
            >
              Cancel
            </button>
          )}
          {/*  Search Input beside form */}
          <input
            type="text"
            placeholder="Search Role"
            value={roleKeyWord}
            onChange={(e) => setRoleKeyWord(e.target.value)}
            className="global_input h-fit w-full lg:w-lg"
          />
        </form>
      </div>

      {/*  Brand List */}
      <div className="global_sub_container space-y-3">
        {filteredRoles.reverse().map((Role) => (
          <div
            key={Role._id}
            className="global_list_item flex items-center justify-between"
          >
            <h2>{Role.name}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPermissionRoleID(Role._id);
                  setTimeout(() => {
                    setAssignPermissionModal(true);
                  }, 50);
                }}
                className="global_button"
              >
                Assign Permisson
              </button>

              <button onClick={() => handleEdit(Role)} className="global_edit">
                Edit
              </button>
              <button
                onClick={() => handleDelete(Role._id)}
                className="global_button_red"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/*  No results message */}
        {filteredRoles.length === 0 && (
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No Roles found.
          </p>
        )}
      </div>
      <AssignPermissionModal
        permissions={permissions}
        roleID={permissionRoleID}
      />
    </div>
  );
};

export default Roles;
