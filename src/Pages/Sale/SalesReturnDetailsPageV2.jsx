import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const SaleReturnDetailsV2 = lazy(() =>
  import("../../Components/Sale/SaleReturnDetailsV2")
);
const SalesReturnDetailsPageV2 = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <SaleReturnDetailsV2 />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default SalesReturnDetailsPageV2;
