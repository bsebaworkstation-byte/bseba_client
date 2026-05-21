import React, { Fragment, Suspense, lazy } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const BankAccount = lazy(() => import("../../Components/Accounts/BankAccount"));

const AccountPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <BankAccount />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default AccountPage;
