import React, { Fragment, useEffect, useRef, useState } from "react";
import { ErrorToast } from "../../Helper/FormHelper";
import {
  getName,
  getUserDetails,
  removeSessions,
  setAdmin,
  setBusinessDetails,
  setPermissionDetails,
  setToken,
} from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { Link } from "react-router-dom";
import { fetchBusinessDetails } from "../../BusinessApi/businessService";
import api from "../../Helper/axios_resonse_interceptor";

const UserDashboard = () => {
  const [totalInvoice, setTotalInvoice] = useState();
  const { setGlobalLoader } = loadingStore();
  const [ownBusinessData, setOwnBusinessData] = useState([]);
  const [userBusinessData, setUserBusinessData] = useState([]);
  // const [business, setBusiness] = useState(null);
  const [showProfileToolTip, setShowProfileToolTip] = useState(false);
  const tooltipRef = useRef(null); // tooltip + button wrapper ref

  const fetchOwnBusiness = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/getOwnBusiness`);
      if (res.data.status === "Success") {
        setOwnBusinessData(res.data.data);
      }
    } catch (error) {
      console.log(error);
      ErrorToast(error.message);
    } finally {
      setGlobalLoader(false);
    }
  };

  // bissiness details
  useEffect(() => {
    const loadBusiness = async () => {
      const businessID = localStorage.getItem("businessID"); // ✅ previously saved
      if (!businessID) return;

      const details = await fetchBusinessDetails(businessID);
      setBusiness(details); // reactive state
    };

    loadBusiness();
  }, []);
  // bissiness details

  const redirectToDashboardWithBusinessID = async (id) => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/getBusinessDetails/${id}`);
      if (res.data.status === "Success") {
        setToken(res.data.token);
        setPermissionDetails(res.data.data.permissions);
        setAdmin(res.data.data.admin);
        setBusinessDetails(res.data.data.businessDetails);
        window.location.href = "/Dashboard";
      } else {
        ErrorToast(res.data.error);
      }
    } catch (error) {
      console.log(error);
      ErrorToast(error.message);
    } finally {
      setGlobalLoader(false);
    }
  };

  const fetchUserBusiness = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/getUserBusiness`);
      if (res.data.status === "Success") {
        setUserBusinessData(res.data.data);
      } else {
      }
    } catch (error) {
      console.log(error);
    } finally {
      setGlobalLoader(false);
    }
  };
  useEffect(() => {
    const getAllData = async () => {
      await Promise.all([fetchOwnBusiness(), fetchUserBusiness()]);
    };
    getAllData();
  }, []);

  // 🔹 Handle click outside only
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowProfileToolTip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Fragment>
      <div className="bg-[#0E6641] text-white fixed top-0 w-full py-2">
        <div className="flex gap-2 justify-end px-5 items-center">
          <div className="relative" ref={tooltipRef}>
            <button
              onClick={() => setShowProfileToolTip(!showProfileToolTip)}
              className="rounded-full bg-white text-black w-8 h-8 flex items-center"
            >
              {getUserDetails()?.photo ? (
                <img
                  className="rounded-full object-contain"
                  src={getUserDetails().photo}
                />
              ) : (
                <span className="flex items-center justify-center w-full h-full">
                  {getName()[0]}
                </span>
              )}
            </button>

            <div
              className={`fixed top-15 right-5
        ${
          showProfileToolTip
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }
        bg-white text-black rounded-xl shadow-lg px-4 py-3`}
            >
              <div className="w-[250px] flex flex-col gap-2 items-center text-sm">
                {/* Profile header */}
                <div className="flex flex-col items-center w-full">
                  <div className="w-12 h-12 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-semibold text-lg">
                    {getUserDetails()?.photo ? (
                      <img
                        className="rounded-full object-contain"
                        src={getUserDetails()?.photo}
                      />
                    ) : (
                      <span>{getName()[0]}</span>
                    )}
                  </div>
                  <h1 className="font-semibold mt-2 text-gray-800 text-xl">
                    {getName()}
                  </h1>
                </div>

                {/* Action buttons */}
                <Link
                  to="/Profile"
                  className="w-full text-center py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  View Profile
                </Link>

                <button
                  onClick={() => removeSessions()}
                  className="w-full text-center py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-5 py-15 dark:bg-gray-800 dark:text-white h-screen flex gap-5">
        <div className=" w-full">
          {/* -----------  */}
          <div className="overflow-x-auto">
            <table className="global_table">
              <thead className="global_thead">
                <tr className="">
                  <th className="global_th">#</th>
                  <th className="global_th">Business Name</th>
                  <th className="global_th">Action</th>
                </tr>
              </thead>
              <tbody className="global_tbody">
                {ownBusinessData?.map((b, index) => (
                  <tr className="global_tr" key={b?._id}>
                    <td className="global_td">{index + 1}</td>
                    <td className="global_td">
                 
                        <span> {b?.businessName}</span>
                        <br />
                        <span className="text-xs"> {b?.address}</span>
                   
                    </td>
                    <td className="global_td">
                      <button
                        onClick={() => redirectToDashboardWithBusinessID(b._id)}
                        className="global_button"
                      >
                        Go to DashBoard
                      </button>
                    </td>
                  </tr>
                ))}
                {userBusinessData?.map((b, index) => (
                  <tr className="global_tr" key={b?._id}>
                    <td className="global_td">{index + 1}</td>
                    <td className="global_td">{b?.businessName}</td>
                    <td className="global_td">
                      <button
                        onClick={() => redirectToDashboardWithBusinessID(b._id)}
                        className="global_button"
                      >
                        Go to DashBoard
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default UserDashboard;
