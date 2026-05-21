import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const CoustomerSalesReport = lazy(() => import("../../Components/Contact/CoustomerSalesReport"));

const CoustomerSalesReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <CoustomerSalesReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default CoustomerSalesReportPage;
