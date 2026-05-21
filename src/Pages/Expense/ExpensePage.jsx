import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Expense = lazy(() => import("../../Components/Expense/Expense"));

const ExpensePage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Expense />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ExpensePage;
