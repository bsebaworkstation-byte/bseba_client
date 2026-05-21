import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const StockReport = lazy(() => import("../../Components/Report/StockReport"));
const StockReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <StockReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default StockReportPage;
