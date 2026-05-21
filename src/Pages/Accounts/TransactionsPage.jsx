import React, { Fragment, Suspense, lazy } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Transactions = lazy(() => import("../../Components/Accounts/Transactions"));

const TransactionsPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Transactions />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default TransactionsPage;
