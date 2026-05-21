import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const SaleReturnDetails = lazy(() =>
  import("../../Components/Sale/SaleReturnDetails")
);
const SaleReturnDetailsPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <SaleReturnDetails />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default SaleReturnDetailsPage;
