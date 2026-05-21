import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const PurchaseDetails = lazy(() =>
  import("../../Components/Purchase/PurchaseDetails")
);
const PurchaseDetailsPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <PurchaseDetails />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default PurchaseDetailsPage;
