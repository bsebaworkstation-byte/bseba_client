import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const ExpensesDetails = lazy(() => import("../../Components/Expense/ExpensesDetails"));

const ExpensesDetailsPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <ExpensesDetails />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ExpensesDetailsPage;
