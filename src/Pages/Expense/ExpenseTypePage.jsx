import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const ExpenseType = lazy(() => import("../../Components/Expense/ExpenseType"));

const ExpenseTypePage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <ExpenseType />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ExpenseTypePage;
