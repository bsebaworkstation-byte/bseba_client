import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const SaleReturn = lazy(() => import("../../Components/Sale/SaleReturn"));
const SaleReturnPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <SaleReturn />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default SaleReturnPage;
