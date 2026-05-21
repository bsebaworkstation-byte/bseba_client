import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const PayableReport = lazy(() =>
  import("../../Components/Report/PayableReport")
);
const PayableReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <PayableReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default PayableReportPage;
