import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const BusinessReport = lazy(() =>
  import("../../Components/Report/BusinessReport")
);
const BusinessReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <BusinessReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default BusinessReportPage;
