import { useState, useEffect } from "react";
import loadingStore from "../../Zustand/LoadingStore";
import { ErrorToast, IsMobile, SuccessToast } from "../../Helper/FormHelper";
import { Link, useNavigate } from "react-router-dom";

import GlobalPhoneInput from "../../Helper/GlobalPhoneInput";
import api from "../../Helper/axios_resonse_interceptor";
import toast from "react-hot-toast";

const NewMember = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    salary: "",
    sr: 0,
    manageBusiness: 0,
    salaryDate: "",
    active: 1,
  });
  const [roles, setRoles] = useState([]);
  const [members, setMembers] = useState([]);
  const salaryDates = Array.from({ length: 28 }, (_, i) => i + 1);
  // hello
  const { setGlobalLoader } = loadingStore();
  const resetForm = () => {
    setForm({
      name: "",
      mobile: "",
      salary: "",
      salaryDate: "",
      sr: 0,
      manageBusiness: 0,
      active: 0,
    });
  };
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
  const fetchMembers = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/TeamList`);
      if (res.data.status === "Success") {
        let data = res.data.data;
        setMembers(data);
      } else {
        ErrorToast("Failed to fetch Members");
      }
    } catch (err) {
      console.error(err);
      ErrorToast("Something went wrong while fetching Members");
    } finally {
      setGlobalLoader(false);
    }
  };
  useEffect(() => {
    Promise.all([fetchRoles(), fetchMembers()]);
  }, []);

  const handleSelectRole = async (roleID, name, mobile) => {
    setGlobalLoader(true);
    try {
      const payload = { roleID, name, mobile };
      const res = await api.post(`/AddUserRole`, payload);
      if (res.data.success === true) {
        toast.success(res.data.message);
        fetchMembers();
      } else {
        ErrorToast(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while assigning role");
    } finally {
      setGlobalLoader(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value, // এখানে আর Number করবে না
    });
  };

  const toggleSwitch = (name) => {
    setForm((prev) => ({
      ...prev,
      [name]: prev[name] === 1 ? 0 : 1,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.manageBusiness === 1 && !IsMobile(form.mobile)) {
      return toast.error("Mobile Number Must be Valid");
    }
    // If validation passes → continue with API call
    setGlobalLoader(true);

    const payload = {
      ...form,
      salary: Number(form.salary || 0),
      salaryDate: Number(form.salaryDate),
    };
    try {
      const res = await api.post(`/AddTeam`, payload);
      if (res.data.status === "Success") {
        toast.success("Member created successfully");
        fetchMembers();
        resetForm();
      } else {
        ErrorToast(res.data.message || "Failed to create Customer");
      }
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      {/* Form */}
      <div className={`global_sub_container`}>
        <div className="mb-4">
          <h1 className="text-xl font-semibold mb-3">Add New Team Member</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Name */}
          <div className="flex flex-col col-span-2">
            <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="global_input"
              placeholder="member Name"
              required
            />
          </div>

          {/* Mobile */}
          <div className="flex flex-col col-span-2">
            <GlobalPhoneInput
              label="Mobile"
              required
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
            />
          </div>
          {/* Salary */}
          <div className="flex flex-col col-span-2">
            <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Salary
            </label>
            <input
              type="number"
              name="salary"
              value={form.salary}
              onChange={handleChange}
              className="global_input"
              placeholder="salary"
            />
          </div>
          {/* Salary Days */}
          <div className="col-span-2">
            <label htmlFor="salaryDate">Salary Date</label>
            <select
              className="global_dropdown h-fit"
              name="salaryDate"
              value={form.salaryDate}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select
              </option>

              {salaryDates.map((d) => (
                <option value={d}>{d}</option>
              ))}
            </select>
          </div>
          {/* Active */}
          <div className="flex items-center gap-2 col-span-1">
            <label className="text-sm font-medium">Active</label>

            <button
              type="button"
              name="active"
              onClick={() => toggleSwitch("active")}
              className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-300 ${
                form.active === 1 ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform duration-300 ${
                  form.active === 1 ? "translate-x-4" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {/* Manage Business */}
          <div className="flex items-center gap-2 col-span-1">
            <label className="text-sm font-medium">Manage Business</label>

            <button
              type="button"
              name="manageBusiness"
              onClick={() => toggleSwitch("manageBusiness")}
              className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-300 ${
                form.manageBusiness === 1 ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform duration-300 ${
                  form.manageBusiness === 1 ? "translate-x-4" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {/* SR */}
          <div className="flex items-center gap-2 col-span-1">
            <label className="text-sm font-medium">Is SR?</label>

            <button
              type="button"
              name="sr"
              onClick={() => toggleSwitch("sr")}
              className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-300 ${
                form.sr === 1 ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform duration-300 ${
                  form.sr === 1 ? "translate-x-4" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="col-span-1">
            <button type="submit" className="global_button w-full">
              Add Team
            </button>
          </div>
        </form>
      </div>
      <div className="global_sub_container">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          Team List
        </h1>

        {/* Table */}
        {members.length === 0 ? (
          <div className="text-center">No Member found</div>
        ) : (
          <div className="overflow-auto">
            <table className="global_table w-full">
              <thead className="global_thead">
                <tr>
                  <th className="global_th">No</th>
                  <th className="global_th">Name</th>
                  <th className="global_th">Mobile</th>
                  <th className="global_th">Salary</th>
                  <th className="global_th">Salary Balance</th>
                  <th className="global_th">Salary Date</th>
                  <th className="global_th">Active</th>
                  <th className="global_th">Manage Business</th>
                  <th className="global_th">SR</th>
                  <th className="global_th">Salary Report</th>
                </tr>
              </thead>
              <tbody className="global_tbody">
                {members.map((member, index) => (
                  <tr key={member._id} className="global_tr">
                    <td className="global_td">{index + 1}</td>
                    <td className="global_td">{member.name || ""}</td>
                    <td className="global_td">{member.mobile}</td>
                    <td className="global_td">{member.salary}</td>
                    <td className="global_td">{member.balance}</td>
                    <td className="global_td">{member.salaryDate}</td>
                    <td className="global_td">
                      <div className="flex justify-center">
                        {member.active === 1 ? (
                          <h1 className="global_button">Yes</h1>
                        ) : (
                          <h1 className="global_button_red">No</h1>
                        )}
                      </div>
                    </td>
                    <td className="global_td">
                      <div className="flex justify-center">
                        {member.manageBusiness === 1 ? (
                          <select
                            className="global_dropdown"
                            defaultValue=""
                            value={member.roles?.map((r) => r.roleID)}
                            onChange={(e) => {
                              const roleID = e.target.value;
                              if (!roleID) return;

                              handleSelectRole(
                                roleID,
                                member.name,
                                member.mobile
                              );

                              e.target.value = ""; // reset select
                            }}
                          >
                            <option value="" disabled>
                              Select
                            </option>

                            {roles.map((r) => (
                              <option key={r._id} value={r._id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <h1 className="global_button_red">No</h1>
                        )}
                      </div>
                    </td>
                    <td className="global_td">
                      <div className="flex justify-center">
                        {member.sr === 1 ? (
                          <h1 className="global_button">Yes</h1>
                        ) : (
                          <h1 className="global_button_red">No</h1>
                        )}
                      </div>
                    </td>
                    <td className="global_td">
                      <Link
                        className="global_button"
                        to={`/MemberReport/${member._id}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewMember;
