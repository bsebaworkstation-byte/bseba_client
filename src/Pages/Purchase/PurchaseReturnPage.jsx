import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const PurchaseReturn = lazy(() =>
  import("../../Components/Purchase/PurchaseReturn")
);
const PurchaseReturnPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <PurchaseReturn />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default PurchaseReturnPage;
