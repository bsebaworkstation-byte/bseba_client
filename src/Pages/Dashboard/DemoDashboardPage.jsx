import React, { Fragment, Suspense, lazy } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const DemoDashboard = lazy(() =>
  import("../../Components/Dashboard/DemoDashboard")
);

const DemoDashboardPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <DemoDashboard />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default DemoDashboardPage;
