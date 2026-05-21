import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const StockProduct = lazy(() =>
  import("../../Components/Product/StockProduct")
);

const StockProductPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <StockProduct />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default StockProductPage;
