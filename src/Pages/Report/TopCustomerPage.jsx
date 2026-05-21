import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const TopCustomer = lazy(() => import("../../Components/Report/TopCustomer"));
const TopCustomerPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <TopCustomer />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default TopCustomerPage;
