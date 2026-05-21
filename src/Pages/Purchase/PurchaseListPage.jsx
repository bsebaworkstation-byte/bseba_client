import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const PurchaseList = lazy(() =>
  import("../../Components/Purchase/PurchaseList")
);
const PurchaseListPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <PurchaseList />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default PurchaseListPage;
