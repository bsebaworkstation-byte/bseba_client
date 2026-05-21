import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const SaleOrderDetails = lazy(() =>
  import("../../Components/SaleOrder/SaleOrderDetails")
);
const SaleOrderDetailsPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
        <SaleOrderDetails/>
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default SaleOrderDetailsPage;
