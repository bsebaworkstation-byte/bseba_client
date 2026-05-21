import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Transaction = lazy(() =>
  import("../../Components/Transaction/Transaction")
);
const TransactionPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Transaction />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default TransactionPage;
