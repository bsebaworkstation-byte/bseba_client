import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const TransactionDetails = lazy(() =>
  import("../../Components/Transaction/TransactionDetails")
);
const TransactionDetailsPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <TransactionDetails />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default TransactionDetailsPage;
