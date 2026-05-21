import React, { useEffect, useState } from "react";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/axios_resonse_interceptor";
import { Link } from "react-router-dom";

const BankAccount = () => {
  const [form, setForm] = useState({ name: "", branch: "", AccountNumber: "" });
  const { setGlobalLoader } = loadingStore();

  // account state
  const [allAccount, setAllAccount] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "AccountNumber") {
      if (/^\d*$/.test(value)) {
        // শুধু digit allow করবে
        setForm({ ...form, [name]: value });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Save Account (Create/Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalLoader(true);

    try {
      // Create Mode
      await api.post(`/CreateAccount`, form);
      SuccessToast("Account created successfully!");
      resetForm();
      fetchAllAccounts();
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Failed to save account");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({ name: "", AccountNumber: "", branch: "" });
  };

  // fetch allAccount
  const fetchAllAccounts = async () => {
    setGlobalLoader(true);
    try {
      const { data } = await api.get(`/AllAccount`);
      if (data.status === "Success") {
        setAllAccount(data.data);
      } else {
        setAllAccount([]);
      }
    } catch (error) {
      ErrorToast(error.message);
      setAllAccount([]);
    } finally {
      setGlobalLoader(false);
    }
  };

  // all account er useEffect
  useEffect(() => {
    fetchAllAccounts();
  }, []);

  let value = searchValue.trim();

  const filteredData =
    searchValue === ""
      ? allAccount
      : allAccount.filter((item) =>
        item.name.toLowerCase().includes(searchValue.toLowerCase())
      );

  return (
    <div className="global_container">
      <div className="">
        {/* Form Section */}
        <div className="global_sub_container">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Create New Account
          </h2>

          <form onSubmit={handleSubmit} className="global_container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g., Chase Savings"
                  className="global_input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Number
                </label>

                <input
                  type="number"
                  name="AccountNumber"
                  value={form.AccountNumber}
                  onChange={handleChange}
                  placeholder="Account Number"
                  className="global_input"
                  required
                />
              </div>
            </div>

            <div className="">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Branch
              </label>
              <div className="flex flex-col lg:flex-row gap-5 items-center">
                <input
                  type="text"
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  placeholder="Branch Name"
                  className="global_input"
                />
                <div className="flex gap-3 w-full">
                  <button type="submit" className="global_button w-full">
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="global_sub_container">
          <div className="flex flex-col justify-between md:flex-row mb-4">
            <h4 className="global_heading">All Accounts</h4>
            <div className="w-full md:max-w-xs">
              <input
                onChange={(e) => setSearchValue(e.target.value)}
                className="global_input"
                placeholder="Search Your account for name"
                type="search"
              />
            </div>
          </div>

          <div className="w-full overflow-auto">
            <table className="global_table">
              <thead className="global_thead">
                <tr className="global_tr">
                  <th className="global_th">#</th>
                  <th className="global_th">Name</th>
                  <th className="global_th">Balance</th>
                  {/* <th className="global_th">Main Balance</th> */}
                  <th className="global_th">Acction</th>

                </tr>
              </thead>
              <tbody className="global_tbody">
                {filteredData.map((d, i) => (
                  <tr key={i} className="global_tr">
                    <td className="global_td">{i + 1}</td>
                    <td className="global_td">{d?.name ? d.name : "N/A"}</td>
                    <td className="global_td">{d?.balance?.toFixed(2)}</td>
                    {/* <td className="global_td">{d?.MainBalance?.toFixed(2)}</td> */}
                    <td className="global_td">
                      <Link
                        to={`/AccountReport/${d._id}`}
                        className="global_button"
                      >
                        Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="global_tfoot">
                <tr className="global_tr">
                  <td className="global_td">Total</td>
                  <td className="global_td"></td>
                  <td className="global_td">
                    {filteredData
                      .reduce((acc, a) => acc + (a?.balance || 0), 0)
                      .toFixed(2)}
                  </td>
                  {/* <td className="global_td">
                    {filteredData
                      .reduce((acc, a) => acc + (a?.MainBalance || 0), 0)
                      .toFixed(2)}
                  </td> */}
                  <td className="global_td"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankAccount;
