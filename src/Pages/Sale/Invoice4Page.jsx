import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Invoice4 = lazy(() => import("../../Components/Sale/Invoice/4"));
const Invoice4Page = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Invoice4 />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default Invoice4Page;
