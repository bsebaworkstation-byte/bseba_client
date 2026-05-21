import React, { Fragment, Suspense, lazy } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
import AlertProductList from "../../Components/Report/AlertProductList";
import LowStockProductList from "../../Components/Report/LowStockProductList";
const Dashboard = lazy(() => import("../../Components/Dashboard/Dashboard"));

const DashboardPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Dashboard />
          <AlertProductList />
      <LowStockProductList/>
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default DashboardPage;
