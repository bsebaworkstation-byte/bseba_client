import React, { Fragment, Suspense, lazy } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
import { removeSessions } from "../../Helper/SessionHelper";
const UserDashboard = lazy(() =>
  import("../../Components/Dashboard/UserDashboard")
);

const UserDashboardPage = () => {
  return (
    <Fragment>
      <Suspense fallback={<LazyLoader />}>
        {/* <div className="flex items-end justify-end ">
          <button
            onClick={() => {
              removeSessions();
            }}
            className="global_button"
          >
            Logout
          </button>
        </div> */}
        <UserDashboard />
      </Suspense>
    </Fragment>
  );
};

export default UserDashboardPage;
