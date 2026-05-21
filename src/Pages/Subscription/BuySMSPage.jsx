import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const BuySMS = lazy(() => import("../../Components/Payment/BuySMS"));
const BuySMSPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <BuySMS />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default BuySMSPage;
