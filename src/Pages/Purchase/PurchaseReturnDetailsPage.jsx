import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const PurchaseReturnDetails = lazy(() =>
  import("../../Components/Purchase/PurchaseReturnDetails")
);
const PurchaseReturnDetailsPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <PurchaseReturnDetails />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default PurchaseReturnDetailsPage;
