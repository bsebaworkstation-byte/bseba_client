import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const SaleOrderList = lazy(() =>
  import("../../Components/SaleOrder/SaleOrderList")
);
const SaleOrderListPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <SaleOrderList />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default SaleOrderListPage;
