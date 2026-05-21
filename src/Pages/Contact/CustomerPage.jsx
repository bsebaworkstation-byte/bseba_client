import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Customer = lazy(() => import("../../Components/Contact/Customer"));

const CustomerPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Customer />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default CustomerPage;
