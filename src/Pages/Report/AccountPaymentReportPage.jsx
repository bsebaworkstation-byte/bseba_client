import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const AccountPaymentReport = lazy(() =>
  import("../../Components/Report/AccountPaymentReport")
);

const AccountPaymentReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <AccountPaymentReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default AccountPaymentReportPage;
