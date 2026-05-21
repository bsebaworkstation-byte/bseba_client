import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const PurchaseReturnList = lazy(() =>
  import("../../Components/Purchase/PurchaseReturnList")
);
const PurchaseReturnListPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <PurchaseReturnList />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default PurchaseReturnListPage;
