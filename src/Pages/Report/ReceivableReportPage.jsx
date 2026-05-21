import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const ReceivableReport = lazy(() =>
  import("../../Components/Report/ReceivableReport")
);
const ReceivableReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <ReceivableReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ReceivableReportPage;
