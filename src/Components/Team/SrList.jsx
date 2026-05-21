import React, { useEffect, useState } from "react";
import api from "../../Helper/axios_resonse_interceptor";
import loadingStore from "../../Zustand/LoadingStore";
import { ErrorToast } from "../../Helper/FormHelper";
import { Link } from "react-router-dom";

export default function SrList() {
  const { setGlobalLoader } = loadingStore();
  // state
  const [srList, setSrList] = useState([]);

  const fetchSrlist = async () => {
    setGlobalLoader(true);
    try {
      const { data } = await api.get("/GetAllSRs");
      if (data.status === "Success") {
        setSrList(data.data || []);
      }
    } catch (error) {
      ErrorToast(error.message);
      setSrList([]);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchSrlist();
  }, []);

  return (
    <div className="global_container">
      <div className="global_sub_container">
        <h4 className="global_heading">Sr List</h4>
        <div className="w-full overflow-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">#</th>
                <th className="global_th">name</th>
                <th className="global_th">UserMobile</th>
                <th className="global_th">mobile</th>
                <th className="global_th">salary</th>
                <th className="global_th">salary Date</th>
                <th className="global_th">balance</th>
                <th className="global_th">active</th>
                <th className="global_th">action</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {srList.map((item, index) => (
                <tr className="global_tr">
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">{item?.name || "N/A"}</td>
                  <td className="global_td">{item?.UserMobile || "N/A"}</td>
                  <td className="global_td">{item?.mobile || "N/A"}</td>
                  <td className="global_td">
                    {item?.salary.toFixed(2) || "N/A"}
                  </td>
                  <td className="global_td">{item?.salaryDate || "N/A"}</td>
                  <td className="global_td">
                    {item?.balance.toFixed(2) || "N/A"}
                  </td>
                  <td className="global_td">
                    {item?.active === 1 ? (
                      <span className="text-green-600 font-bold">YES</span>
                    ) : (
                      <span>NO</span>
                    )}
                  </td>
                  <td className="global_td">
                    <Link
                      className="global_button"
                      to={`/srSaleReport/${item._id}`}
                    >
                      Sale Report
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
