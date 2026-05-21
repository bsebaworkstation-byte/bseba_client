import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const StockList = lazy(() => import("../../Components/Report/StockList"));
const StockListPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <StockList />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default StockListPage;
