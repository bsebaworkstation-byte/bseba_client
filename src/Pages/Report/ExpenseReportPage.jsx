import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const ExpenseReport = lazy(() =>
  import("../../Components/Report/ExpenseReport")
);
const ExpenseReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <ExpenseReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ExpenseReportPage;
