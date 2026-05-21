import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const SaleProductReport = lazy(() =>
  import("../../Components/Report/SaleProductReport")
);

const SaleProductReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <SaleProductReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default SaleProductReportPage;
