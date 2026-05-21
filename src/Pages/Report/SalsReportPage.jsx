import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const SelsReport = lazy(() => import("../../Components/Report/SalsReport"));
const SalsReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <SelsReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default SalsReportPage;
