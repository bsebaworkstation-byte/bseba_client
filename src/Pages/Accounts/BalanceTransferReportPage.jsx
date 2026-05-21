import React, { Fragment, Suspense, lazy } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const BalanceTransferReport = lazy(() =>
  import("../../Components/Accounts/BalanceTransferReport")
);

const BalanceTransferReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <BalanceTransferReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default BalanceTransferReportPage;
