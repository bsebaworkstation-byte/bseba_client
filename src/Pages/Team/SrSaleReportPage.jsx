import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const SrSaleReport = lazy(() => import("../../Components/Team/SrSaleReport"));
const SrSaleReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
         <SrSaleReport/>
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default SrSaleReportPage;
