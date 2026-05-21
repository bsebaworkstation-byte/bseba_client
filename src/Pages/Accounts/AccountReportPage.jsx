import React, { Fragment, Suspense, lazy } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const AccountReport = lazy(() => import("../../Components/Accounts/AccountReport"));

const AccountReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <AccountReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default AccountReportPage;
