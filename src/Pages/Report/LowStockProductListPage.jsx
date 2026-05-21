import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const LowStockProductList = lazy(() =>
  import("../../Components/Report/LowStockProductList")
);

const LowStockProductListPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <LowStockProductList />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default LowStockProductListPage;
