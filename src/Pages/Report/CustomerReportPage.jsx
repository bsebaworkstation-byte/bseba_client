import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const CustomerReport = lazy(() =>
  import("../../Components/Report/CustomerReport"),
);
const CustomerReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <CustomerReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default CustomerReportPage;
