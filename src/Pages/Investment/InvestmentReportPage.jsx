import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const InvestmentReport = lazy(
  () => import("../../Components/Investment/InvestmentReport"),
);

const InvestmentReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <InvestmentReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default InvestmentReportPage;
