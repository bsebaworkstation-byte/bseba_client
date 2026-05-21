import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const DalyReport = lazy(() => import("../../Components/Report/DalyReport"));
const DalyReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <DalyReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default DalyReportPage;
