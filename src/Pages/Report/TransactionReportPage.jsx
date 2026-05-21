import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const TransactionReport = lazy(() =>
  import("../../Components/Report/TransactionReport")
);
const TransactionReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <TransactionReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default TransactionReportPage;
