import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Invoice6 = lazy(() => import("../../Components/Sale/Invoice/6"));
const Invoice6Page = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Invoice6 />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default Invoice6Page;
