import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const ExpenseByID = lazy(() => import("../../Components/Expense/ExpenseByID"));

const ExpenseByIDPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <ExpenseByID />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ExpenseByIDPage;
